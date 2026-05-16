"use client";
import { useAuditoria } from "../state/AuditoriaContext";
import DataTable from "../components/DataTable";
import { fp } from "../lib/utils/format";

export default function OvPanel() {
  const { resultado } = useAuditoria();
  const ovs = resultado?.ovPendientes ?? [];

  if (ovs.length === 0) {
    return <div className="aud-empty">Sin OV pendientes.</div>;
  }

  const columns = [
    { key: "fecha", header: "Fecha" },
    { key: "folio", header: "Folio" },
    { key: "cliente", header: "Cliente" },
    { key: "modelo", header: "Modelo" },
    { key: "vendedor", header: "Vendedor" },
    { key: "desc", header: "Artículo" },
    { key: "uds", header: "Uds", align: "right" },
    {
      key: "total",
      header: "Total",
      align: "right",
      render: (r) => fp(r.total || r.importe || 0),
    },
  ];

  return <DataTable columns={columns} rows={ovs} />;
}
