"use client";
import { useEffect, useState } from "react";
import { useAuditoria } from "../state/AuditoriaContext";
import { SUCURSALES, IMPORT_KINDS } from "../lib/constants";
import Dropzone from "../components/Dropzone";
import ImportModal from "../modals/ImportModal";
import CatalogExtras, { readCatalogCount } from "../components/CatalogExtras";
import { parseAuditoria } from "../lib/excel/parseAuditoria";
import { parseBitacora } from "../lib/excel/parseBitacora";

export default function UploadView() {
  const { sucursal, setSucursal, files, setFile, setView, setResultado } =
    useAuditoria();
  const [importOpen, setImportOpen] = useState(false);
  const [error, setError] = useState("");
  const [catCount, setCatCount] = useState(0);

  useEffect(() => { setCatCount(readCatalogCount()); }, []);

  const canAnalyze = Boolean(files.auditoria);

  const onAnalyze = async () => {
    setError("");
    setView("processing");
    try {
      const audit = await parseAuditoria(files.auditoria, sucursal);
      let bitacora = [];
      if (files.bitacora) {
        try {
          bitacora = await parseBitacora(files.bitacora, audit.ventas);
        } catch (e) {
          console.warn("parseBitacora falló", e);
        }
      }
      setResultado({
        sucursal,
        fechaDoc: audit.fechaDoc,
        diasCubiertos: audit.diasCubiertos,
        numClientes: audit.numClientes,
        ventas: audit.ventas,
        prodData: audit.prodData,
        ovPendientes: audit.ovPendientes,
        cobranzas: audit.cobranzas,
        cargosCP: audit.cargosCP,
        comprasIntegradas: audit.comprasIntegradas,
        recepciones: audit.recepciones,
        bitacora,
        counts: {
          ov: audit.ovPendientes.length,
          bit: bitacora.length,
        },
      });
      setView("dashboard");
    } catch (e) {
      console.error("Error al analizar", e);
      setError(e.message || "Error al leer el archivo.");
      setView("upload");
    }
  };

  return (
    <div className="upload-screen">
      <div className="utop">
        <h1>Auditoría Diaria</h1>
        <p>Importa los reportes del día para el análisis completo</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <label style={{ fontSize: 11, color: "var(--t2)", fontWeight: 600 }}>
          🏢 Sucursal:
        </label>
        <select
          className="aud-select"
          value={sucursal}
          onChange={(e) => setSucursal(e.target.value)}
        >
          {SUCURSALES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ width: "100%", maxWidth: 580 }}>
        <button
          onClick={() => setImportOpen(true)}
          style={{
            background:
              "linear-gradient(135deg,rgba(var(--accent-rgb),.12),rgba(var(--accent-rgb),.04))",
            border: "1.5px dashed rgba(var(--accent-rgb),.4)",
            borderRadius: 10,
            padding: "18px 20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            color: "var(--text)",
            width: "100%",
            fontFamily: "inherit",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
            <span style={{ fontSize: 24 }}>📤</span>
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--accent)",
                  marginBottom: 2,
                }}
              >
                Importar reportes
              </div>
              <div style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.4 }}>
                Carga Auditoría (obligatorio) · Bitácora y Resultados Admin
                opcionales
              </div>
            </div>
          </div>
          <span style={{ fontSize: 18, color: "var(--accent)" }}>→</span>
        </button>
      </div>

      <div className="ugrid">
        <Dropzone
          wide
          icon={IMPORT_KINDS.auditoria.icon}
          title={IMPORT_KINDS.auditoria.label}
          description={IMPORT_KINDS.auditoria.description}
          fileName={files.auditoria?.name}
          accept={IMPORT_KINDS.auditoria.accept}
          onFile={(f) => setFile("auditoria", f)}
        />
        <Dropzone
          icon={IMPORT_KINDS.bitacora.icon}
          title={IMPORT_KINDS.bitacora.label}
          description={IMPORT_KINDS.bitacora.description}
          fileName={files.bitacora?.name}
          optional
          accept={IMPORT_KINDS.bitacora.accept}
          onFile={(f) => setFile("bitacora", f)}
        />
        <Dropzone
          icon={IMPORT_KINDS.resultadosAdmin.icon}
          title={IMPORT_KINDS.resultadosAdmin.label}
          description={IMPORT_KINDS.resultadosAdmin.description}
          fileName={files.resultadosAdmin?.name}
          optional
          accept={IMPORT_KINDS.resultadosAdmin.accept}
          onFile={(f) => setFile("resultadosAdmin", f)}
        />
      </div>

      {error ? (
        <div
          style={{
            background: "var(--danger-bg)",
            color: "var(--danger-2)",
            border: "1px solid var(--danger)",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12,
            maxWidth: 580,
          }}
        >
          {error}
        </div>
      ) : null}

      <button className="abtn" disabled={!canAnalyze} onClick={onAnalyze}>
        Analizar →
      </button>

      <CatalogExtras catCount={catCount} setCatCount={setCatCount} />

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
