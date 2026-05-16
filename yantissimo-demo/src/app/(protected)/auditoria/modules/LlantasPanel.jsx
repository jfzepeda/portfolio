"use client";
import { useMemo } from "react";
import { useAuditoria } from "../state/AuditoriaContext";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import SectionTitle from "../components/SectionTitle";
import { fp } from "../lib/utils/format";

const MG_UMBRAL_POSIBLE_CONVENIO = 24;

function montoNoJustLlanta(v) {
  const costoU = v.ultCosto || (v.uds > 0 ? v.costo / v.uds : 0);
  const cobrado = v.ventaCobradaU || 0;
  const uds = v.uds || 0;
  if (costoU <= 0 || uds <= 0) return 0;
  const ventaMin = costoU / (1 - MG_UMBRAL_POSIBLE_CONVENIO / 100);
  return Math.max(0, (ventaMin - cobrado) * uds);
}

function margenReal(v) {
  const costoU = v.ultCosto || (v.uds > 0 ? v.costo / v.uds : 0);
  if (!(v.ventaCobradaU > 0) || !(costoU > 0)) return null;
  return ((v.ventaCobradaU - costoU) / v.ventaCobradaU) * 100;
}

function esPosibleConvenioLL(v) {
  if (v.esConvenioDoc) return false;
  const mg = margenReal(v);
  if (mg == null) return false;
  return mg < MG_UMBRAL_POSIBLE_CONVENIO && (v.dscto || 0) > 0;
}

/**
 * Puerto parcial: lista de llantas del día con margen real y dto.
 * La lógica de `renderLLTab()` del HTML (líneas 13635–13830) incluye análisis
 * Michelin / BFG / promos por RIN + apoyos set + convenios — se porta en
 * una iteración dedicada (requiere el bloque llCfg/llRecalc ~500 líneas).
 */

function detectaMarca(desc) {
  const d = (desc || "").toUpperCase();
  if (d.includes("MICHELIN")) return { label: "MICHELIN", variant: "critical" };
  if (d.includes("BFG") || d.includes("BF GOODRICH"))
    return { label: "BFG", variant: "info" };
  if (d.includes("GOODYEAR")) return { label: "GOODYEAR", variant: "muted" };
  if (d.includes("PIRELLI")) return { label: "PIRELLI", variant: "muted" };
  if (d.includes("CONTINENTAL")) return { label: "CONTINENTAL", variant: "muted" };
  if (d.includes("HANKOOK")) return { label: "HANKOOK", variant: "muted" };
  if (d.includes("YOKOHAMA")) return { label: "YOKOHAMA", variant: "muted" };
  return null;
}

function extraeRin(desc) {
  const m = (desc || "").match(/R\s?(\d{2})/i);
  return m ? parseInt(m[1], 10) : null;
}

export default function LlantasPanel() {
  const { resultado, conveniosAdminLL, addConvenioAdmin, removeConvenioAdmin } =
    useAuditoria();

  const llantas = useMemo(
    () => (resultado?.ventas ?? []).filter((v) => v.esLL),
    [resultado],
  );

  const yaConvenio = useMemo(
    () =>
      new Set(
        conveniosAdminLL
          .filter((c) => c.tipo === "LL")
          .map((c) => c.folio + "|" + c.desc),
      ),
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
      tipo: "LL",
      monto: montoNoJustLlanta(v),
      uds: v.uds || 1,
    });
  };

  if (llantas.length === 0) {
    return (
      <div className="aud-empty">
        Sin llantas en este reporte.
      </div>
    );
  }

  const totalUds = llantas.reduce((s, v) => s + v.uds, 0);
  const totalVenta = llantas.reduce((s, v) => s + v.venta, 0);
  const totalCosto = llantas.reduce(
    (s, v) => s + (v.ultCosto > 0 ? v.ultCosto * v.uds : v.costo),
    0,
  );
  const margenGlobal =
    totalVenta > 0 ? ((totalVenta - totalCosto) / totalVenta) * 100 : null;

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
      key: "desc",
      header: "Descripción",
      render: (r) => (
        <div>
          <div>{r.desc}</div>
          <div style={{ fontSize: 10, color: "var(--t3)" }}>{r.clave}</div>
        </div>
      ),
    },
    {
      key: "marca",
      header: "Marca",
      render: (r) => {
        const m = detectaMarca(r.desc);
        return m ? <Badge variant={m.variant}>{m.label}</Badge> : <span style={{ color: "var(--t3)", fontSize: 10 }}>—</span>;
      },
    },
    {
      key: "rin",
      header: "Rin",
      className: "mo",
      align: "right",
      render: (r) => {
        const rin = extraeRin(r.desc);
        return rin ? `R${rin}` : "—";
      },
    },
    { key: "uds", header: "Cant", className: "mo", align: "center" },
    {
      key: "ventaU",
      header: "Venta Unit",
      align: "right",
      render: (r) => fp(r.ventaCobradaU),
    },
    {
      key: "costoU",
      header: "Costo Unit",
      align: "right",
      render: (r) => fp(r.ultCosto || (r.uds > 0 ? r.costo / r.uds : 0)),
    },
    {
      key: "dscto",
      header: "Dto %",
      align: "right",
      render: (r) => (r.dscto ? r.dscto.toFixed(1) + "%" : "—"),
    },
    {
      key: "margen",
      header: "Margen",
      align: "right",
      render: (r) => {
        const costoU = r.ultCosto || (r.uds > 0 ? r.costo / r.uds : 0);
        const mg =
          r.ventaCobradaU > 0 && costoU > 0
            ? ((r.ventaCobradaU - costoU) / r.ventaCobradaU) * 100
            : null;
        if (mg == null) return "—";
        const color =
          mg < 23 ? "var(--danger)" : mg < 24 ? "var(--warn)" : "var(--ok)";
        return (
          <span style={{ color, fontWeight: 700 }}>{mg.toFixed(1)}%</span>
        );
      },
    },
    { key: "vendedor", header: "Vendedor" },
    {
      key: "convenio",
      header: "Convenio",
      render: (r) => {
        if (!esPosibleConvenioLL(r)) {
          return <span style={{ color: "var(--t3)", fontSize: 10 }}>—</span>;
        }
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
              border: "1px solid rgba(var(--warn-rgb),.5)",
              background: "rgba(var(--warn-rgb),.1)",
              color: "var(--warn)",
              fontWeight: 600,
            }}
          >
            🏷 Confirmar convenio
          </button>
        );
      },
    },
  ];

  return (
    <div>
      <SectionTitle>Llantas del día</SectionTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <div className="scard sa">
          <div className="sv">{totalUds}</div>
          <div className="sl">Piezas</div>
        </div>
        <div className="scard so">
          <div className="sv">{fp(totalVenta)}</div>
          <div className="sl">Venta total</div>
        </div>
        <div className="scard sw">
          <div className="sv">{fp(totalCosto)}</div>
          <div className="sl">Costo</div>
        </div>
        <div
          className={`scard ${
            margenGlobal != null && margenGlobal < 23
              ? "sc"
              : margenGlobal != null && margenGlobal < 24
              ? "sw"
              : "so"
          }`}
        >
          <div className="sv">
            {margenGlobal != null ? margenGlobal.toFixed(1) + "%" : "—"}
          </div>
          <div className="sl">Margen global</div>
        </div>
      </div>
      <DataTable columns={columns} rows={llantas} />
      <div
        style={{
          marginTop: 14,
          fontSize: 10,
          color: "var(--t3)",
          fontStyle: "italic",
        }}
      >
        ℹ Análisis completo Michelin/BFG/promos por RIN + apoyos set pendiente
        de puerto — ver HTML `renderLLTab()`.
      </div>
    </div>
  );
}
