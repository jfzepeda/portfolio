"use client";
import { useMemo } from "react";
import { useAuditoria } from "../state/AuditoriaContext";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import StatusBanner from "../components/StatusBanner";
import { fp } from "../lib/utils/format";

const ALERT_LABEL = {
  pl: { variant: "critical", label: "PL bajo" },
  dto: { variant: "critical", label: "Dto excede máx" },
  ambos: { variant: "critical", label: "PL + Dto" },
  posibleConvenio: { variant: "warn", label: "Posible convenio" },
  posibleClub: { variant: "warn", label: "Posible club" },
  posibleAmbos: { variant: "warn", label: "Convenio / Club" },
};

function montoNoJustMO(v) {
  if (!v || !v.moEsp) return 0;
  const dtoMax = v.moEsp.dtoMax || 0;
  const plCat = v.moEsp.pl_sinIVA || 0;
  const plCap = v.precioLista || 0;
  const cobrado = v.ventaCobradaU || 0;
  const uds = v.uds || 0;
  const plBase = Math.max(plCat, plCap);
  if (plBase <= 0 || uds <= 0) return 0;
  const debioCobrar = plBase * (1 - dtoMax / 100);
  return Math.max(0, (debioCobrar - cobrado) * uds);
}

export default function MoPanel() {
  const { resultado, conveniosAdminLL, addConvenioAdmin, removeConvenioAdmin } = useAuditoria();

  const rows = useMemo(
    () => (resultado?.ventas ?? []).filter((v) => v.moAlerta && v.moEsp),
    [resultado],
  );

  const yaConvenio = useMemo(
    () => new Set(conveniosAdminLL.map((c) => c.folio + "|" + c.desc)),
    [conveniosAdminLL],
  );

  const confirmarConvenio = (v) => {
    addConvenioAdmin({
      folio: v.folio || "—",
      cliente: v.cliente || "—",
      vendedor: v.vendedor || "—",
      desc: v.desc || "—",
      dscto: v.dscto || 0,
      fecha: v.fecha || "—",
      tipo: "MO",
      monto: montoNoJustMO(v),
      uds: v.uds || 1,
    });
  };

  if (rows.length === 0) {
    return (
      <StatusBanner variant="ok">
        ✓ Sin desviaciones de precio ni descuento en Mano de Obra.
      </StatusBanner>
    );
  }

  const reales = rows.filter((r) => !r.moAlerta.startsWith("posible"));
  const posibles = rows.filter((r) => r.moAlerta.startsWith("posible"));

  const columns = [
    { key: "fecha", header: "Fecha" },
    {
      key: "folio",
      header: "Folio / Cliente",
      render: (r) => (
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{r.folio}</div>
          <div style={{ fontSize: 10, color: "var(--t3)" }}>{r.cliente}</div>
        </div>
      ),
    },
    { key: "desc", header: "Artículo" },
    {
      key: "cobrado",
      header: "Cobrado",
      className: "mo",
      align: "right",
      render: (r) => fp(r.ventaCobradaU),
    },
    {
      key: "pl",
      header: "PL catálogo",
      className: "mo",
      align: "right",
      render: (r) =>
        r.moEsp?.pl_catalogo != null ? fp(r.moEsp.pl_catalogo) : "—",
    },
    {
      key: "esperado",
      header: "Esperado",
      className: "mo",
      align: "right",
      render: (r) =>
        r.moEsp?.precioBase != null ? fp(r.moEsp.precioBase) : "—",
    },
    {
      key: "dto",
      header: "Dto %",
      className: "mo",
      align: "right",
      render: (r) => (r.dscto ? r.dscto.toFixed(1) + "%" : "—"),
    },
    {
      key: "dtoMax",
      header: "Dto Máx",
      className: "mo",
      align: "right",
      render: (r) =>
        r.moEsp?.dtoMax != null ? r.moEsp.dtoMax.toFixed(1) + "%" : "—",
    },
    {
      key: "etiqueta",
      header: "Etiqueta",
      render: (r) => {
        const cfg = ALERT_LABEL[r.moAlerta] || { variant: "warn", label: r.moAlerta };
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: "contexto",
      header: "Contexto",
      render: (r) => r.moEsp?.label || "—",
    },
  ];

  return (
    <div>
      {reales.length > 0 ? (
        <StatusBanner variant="warn">
          {reales.length} incidencia(s) real(es) en MO.
        </StatusBanner>
      ) : (
        <StatusBanner variant="ok">✓ Sin incidencias reales de MO.</StatusBanner>
      )}

      {reales.length > 0 && (
        <>
          <div className="stit">Incidencias reales</div>
          <DataTable
            columns={columns}
            rows={reales}
            getRowClassName={() => "rc"}
          />
        </>
      )}
      {posibles.length > 0 && (
        <>
          <div className="stit">Por confirmar (convenio / club)</div>
          <DataTable
            columns={[
              ...columns,
              {
                key: "convenio",
                header: "Convenio",
                render: (r) => {
                  const k = (r.folio || "") + "|" + (r.desc || "");
                  const marcado = yaConvenio.has(k);
                  return marcado ? (
                    <button
                      type="button"
                      onClick={() => removeConvenioAdmin(r.folio, r.desc)}
                      style={{
                        fontSize: 9,
                        padding: "2px 7px",
                        borderRadius: 4,
                        cursor: "pointer",
                        border: "1px solid rgba(var(--ok-rgb),.3)",
                        background: "rgba(var(--ok-rgb),.12)",
                        color: "var(--ok)",
                        fontWeight: 600,
                      }}
                    >
                      ✓ Marcado
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => confirmarConvenio(r)}
                      style={{
                        fontSize: 9,
                        padding: "2px 7px",
                        borderRadius: 4,
                        cursor: "pointer",
                        border: "1px solid var(--b2)",
                        background: "var(--s3)",
                        color: "var(--t2)",
                      }}
                    >
                      Confirmar convenio
                    </button>
                  );
                },
              },
            ]}
            rows={posibles}
            getRowClassName={() => "rw"}
          />
        </>
      )}
    </div>
  );
}
