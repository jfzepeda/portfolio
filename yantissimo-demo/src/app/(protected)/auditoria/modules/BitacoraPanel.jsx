"use client";
import { useAuditoria } from "../state/AuditoriaContext";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import { BIT_LABELS, BIT_PESOS } from "../lib/excel/parseBitacora";

export default function BitacoraPanel() {
  const { resultado } = useAuditoria();
  const data = resultado?.bitacora;
  if (!data || data.length === 0) {
    return <div className="aud-empty">No se importó la bitácora o no hay eventos.</div>;
  }

  const columns = [
    { key: "fecha", header: "Fecha" },
    { key: "hora", header: "Hora" },
    { key: "usuario", header: "Usuario" },
    {
      key: "tipo",
      header: "Tipo",
      render: (r) => {
        const peso = BIT_PESOS[r.tipo] || 1;
        const variant = peso >= 4 ? "critical" : peso >= 3 ? "warn" : "info";
        return <Badge variant={variant}>{BIT_LABELS[r.tipo] || r.tipo}</Badge>;
      },
    },
    { key: "folio", header: "Folio" },
    { key: "articulo", header: "Artículo" },
    { key: "precio_ant", header: "Precio ant." },
    { key: "precio_nvo", header: "Precio nvo." },
    { key: "cant_ant", header: "Cant. ant." },
    { key: "cant_nva", header: "Cant. nva." },
  ];

  return <DataTable columns={columns} rows={data} />;
}
