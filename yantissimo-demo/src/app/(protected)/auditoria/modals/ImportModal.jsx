"use client";
import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import Dropzone from "../components/Dropzone";
import { IMPORT_KINDS } from "../lib/constants";
import { useAuditoria } from "../state/AuditoriaContext";
import CatalogExtras, { readCatalogCount } from "../components/CatalogExtras";
import { parseAuditoria } from "../lib/excel/parseAuditoria";
import { parseBitacora } from "../lib/excel/parseBitacora";
import { saveSession } from "../lib/api";
import { toISODate } from "../lib/utils/format";

export default function ImportModal({ open, onClose }) {
  const { files, setFile, sucursal, setView, setResultado } = useAuditoria();
  const [catCount, setCatCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) { setCatCount(readCatalogCount()); setError(""); }
  }, [open]);

  const canAnalyze = Boolean(files.auditoria);

  const onAnalyze = async () => {
    setError("");
    onClose();
    setView("processing");
    try {
      const audit = await parseAuditoria(files.auditoria, sucursal);
      let bitacora = [];
      if (files.bitacora) {
        try { bitacora = await parseBitacora(files.bitacora, audit.ventas); } catch (e) { console.warn("parseBitacora falló", e); }
      }
      const snap = {
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
        counts: { ov: audit.ovPendientes.length, bit: bitacora.length },
      };
      setResultado(snap);
      saveSession({ sucursal, fecha: toISODate(audit.fechaDoc), resultado: snap })
        .catch((e) => console.warn("[auditoria] session save silenced:", e.message));
      setView("dashboard");
    } catch (e) {
      console.error("Error al analizar", e);
      setError(e.message || "Error al leer el archivo.");
      setView("dashboardInicio");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Importar reportes del día"
      maxWidth={560}
    >
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr" }}>
        <Dropzone
          icon={IMPORT_KINDS.auditoria.icon}
          title={IMPORT_KINDS.auditoria.label}
          description={IMPORT_KINDS.auditoria.description}
          fileName={files["auditoria"]?.name}
          optional={!IMPORT_KINDS.auditoria.required}
          accept={IMPORT_KINDS.auditoria.accept}
          onFile={(f) => setFile("auditoria", f)}
        />
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
          <Dropzone
            icon={IMPORT_KINDS.bitacora.icon}
            title={IMPORT_KINDS.bitacora.label}
            description={IMPORT_KINDS.bitacora.description}
            fileName={files["bitacora"]?.name}
            optional={!IMPORT_KINDS.bitacora.required}
            accept={IMPORT_KINDS.bitacora.accept}
            onFile={(f) => setFile("bitacora", f)}
          />
          <Dropzone
            icon={IMPORT_KINDS.resultadosAdmin.icon}
            title={IMPORT_KINDS.resultadosAdmin.label}
            description={IMPORT_KINDS.resultadosAdmin.description}
            fileName={files["resultadosAdmin"]?.name}
            optional={!IMPORT_KINDS.resultadosAdmin.required}
            accept={IMPORT_KINDS.resultadosAdmin.accept}
            onFile={(f) => setFile("resultadosAdmin", f)}
          />
        </div>
      </div>

      <CatalogExtras catCount={catCount} setCatCount={setCatCount} />

      {error && (
        <div style={{ background: "var(--danger-bg)", color: "var(--danger-2)", border: "1px solid var(--danger)", borderRadius: 8, padding: "10px 14px", fontSize: 12, marginTop: 10 }}>
          {error}
        </div>
      )}

      <div className="modal-btns" style={{ marginTop: 14 }}>
        <button className="modal-btn ghost" onClick={onClose}>Cerrar</button>
        <button className="abtn" disabled={!canAnalyze} onClick={onAnalyze}>
          Analizar →
        </button>
      </div>
    </Modal>
  );
}
