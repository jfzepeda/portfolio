"use client";
import { useMemo } from "react";
import { useAuditoria } from "../state/AuditoriaContext";
import SectionTitle from "../components/SectionTitle";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import StatusBanner from "../components/StatusBanner";
import { buildCruce } from "../lib/calc/compras";
import { fp } from "../lib/utils/format";

const ESTADO_BADGE = {
  ok: { variant: "ok", label: "OK" },
  alerta: { variant: "critical", label: "Venta > Compra" },
  excedente: { variant: "warn", label: "Compra > Venta" },
  sin_venta: { variant: "info", label: "Sin venta" },
};

export default function ComprasPanel() {
  const { resultado } = useAuditoria();

  const { cruce, sinVenta, bannerCount } = useMemo(
    () =>
      buildCruce({
        ventas: resultado?.ventas ?? [],
        comprasIntegradas: resultado?.comprasIntegradas ?? [],
        ovPendientes: resultado?.ovPendientes ?? [],
      }),
    [resultado],
  );

  const cruceRows = cruce.filter((c) => c.estado !== "sin_venta");

  const cruceCols = [
    { key: "art", header: "Artículo" },
    {
      key: "provs",
      header: "Proveedor(es)",
      render: (r) => r.provs.join(", "),
    },
    {
      key: "folios",
      header: "Folio(s) compra",
      render: (r) => r.folios.join(", "),
    },
    { key: "udsC", header: "Uds comp.", align: "right" },
    {
      key: "foliosV",
      header: "Folio(s) venta",
      render: (r) => r.foliosV.join(", "),
    },
    { key: "udsV", header: "Uds vend.", align: "right" },
    {
      key: "ventaV",
      header: "Venta total",
      align: "right",
      render: (r) => fp(r.ventaV),
    },
    {
      key: "dif",
      header: "Dif. uds",
      align: "right",
      render: (r) => r.udsV - r.udsC,
    },
    {
      key: "estado",
      header: "Estado",
      render: (r) => {
        const cfg = ESTADO_BADGE[r.estado] || ESTADO_BADGE.ok;
        return (
          <Badge variant={r.enOV ? "info" : cfg.variant}>
            {r.enOV ? "En OV" : cfg.label}
          </Badge>
        );
      },
    },
  ];

  const svCols = [
    { key: "art", header: "Artículo" },
    {
      key: "provs",
      header: "Proveedor",
      render: (r) => r.provs.join(", "),
    },
    {
      key: "folios",
      header: "Folio",
      render: (r) => r.folios.join(", "),
    },
    { key: "udsC", header: "Uds", align: "right" },
    {
      key: "importeC",
      header: "Total",
      align: "right",
      render: (r) => fp(r.importeC),
    },
  ];

  return (
    <div>
      {bannerCount > 0 ? (
        <StatusBanner variant="warn">
          {bannerCount} cruce(s) requieren revisión.
        </StatusBanner>
      ) : (
        <StatusBanner variant="ok">
          ✓ Sin desviaciones en el cruce compras/ventas del día.
        </StatusBanner>
      )}

      <SectionTitle>
        Cruce compras vs ventas · por artículo (SKU) · ventana 3 días
      </SectionTitle>
      <DataTable
        columns={cruceCols}
        rows={cruceRows}
        getRowClassName={(r) =>
          r.enOV ? "ri" : r.estado === "alerta" ? "rc" : r.estado === "excedente" ? "rw" : ""
        }
        emptyMessage="Sin cruces con incidencia."
      />

      <SectionTitle>Comprados SIN venta del día</SectionTitle>
      <DataTable
        columns={svCols}
        rows={sinVenta}
        emptyMessage="Todos los artículos comprados se vendieron o están en OV."
      />
    </div>
  );
}
