"use client";
import { useMemo } from "react";
import { useAuditoria } from "../state/AuditoriaContext";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import StatusBanner from "../components/StatusBanner";
import { fp } from "../lib/utils/format";

/**
 * Muestra los renglones con alerta de margen detectados por parseAuditoria.
 * Puerto parcial del render `#mbody` del HTML. La configuración fina de
 * markup esperado vive en lib/catalog/mo y lib/calc/margenes.
 */
export default function MargenesPanel() {
  const { resultado } = useAuditoria();
  const rows = useMemo(
    () => (resultado?.ventas ?? []).filter((v) => v.alerta),
    [resultado],
  );

  if (rows.length === 0) {
    return <StatusBanner variant="ok">✓ Sin incidencias de margen detectadas.</StatusBanner>;
  }

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
    {
      key: "articulo",
      header: "Artículo / Línea",
      render: (r) => (
        <div>
          <div>{r.desc}</div>
          <div style={{ fontSize: 10, color: "var(--t3)" }}>{r.linea_raw}</div>
        </div>
      ),
    },
    {
      key: "ultCosto",
      header: "Últ. Costo",
      className: "mo",
      align: "right",
      render: (r) => fp(r.ultCosto || r.costo / Math.max(1, r.uds)),
    },
    {
      key: "ventaCobradaU",
      header: "Precio Vendido",
      className: "mo",
      align: "right",
      render: (r) => fp(r.ventaCobradaU),
    },
    {
      key: "margen",
      header: "Margen real",
      className: "mo",
      align: "right",
      render: (r) => (r.margen != null ? r.margen.toFixed(1) + "%" : "—"),
    },
    {
      key: "factorUsado",
      header: "Objetivo",
      className: "mo",
      align: "right",
      render: (r) => `${r.factorUsado}%`,
    },
    {
      key: "estado",
      header: "Estado",
      render: (r) => (
        <Badge variant={r.alerta === "critica" ? "critical" : "warn"}>
          {r.alerta === "critica" ? "Margen negativo" : "Margen bajo"}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <StatusBanner variant="warn">
        {rows.length} renglón(es) con alerta de margen.
      </StatusBanner>
      <DataTable
        columns={columns}
        rows={rows}
        getRowClassName={(r) => (r.alerta === "critica" ? "rc" : "rw")}
      />
    </div>
  );
}
