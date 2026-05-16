/**
 * Cálculo de conversión por línea. Puerto de `renderConv()` + `sem()`
 * del HTML líneas 5059–5110. Versión pura: consume ventas[] + clientes
 * atendidos y devuelve datos para `<ConversionCard>`.
 */
import { LINEAS_ORD, LBL, OX10 } from "../catalog/lineas";
import { fn } from "../utils/format";

function sem(pct) {
  if (pct === null || pct === undefined) return { tone: "neutral", s: "—" };
  if (pct >= 1) return { tone: "green", s: Math.round(pct * 100) + "%" };
  if (pct >= 0.7) return { tone: "yellow", s: Math.round(pct * 100) + "%" };
  return { tone: "red", s: Math.round(pct * 100) + "%" };
}

/**
 * @param ventas Array<venta>  (del parseAuditoria)
 * @param clientes number
 * @returns { cards: Array<ConversionCardProps>, resumen: string, totales: {...} }
 */
export function calcularConversion(ventas = [], clientes = 0) {
  const sxl = {};
  let tS = 0;
  let tL = 0;
  let tV = 0;
  let tU = 0;
  ventas.forEach((v) => {
    tV += v.venta;
    tU += v.utilidad;
    if (v.esLL) {
      tL += v.uds;
      return;
    }
    if (v.cuentaConv) {
      sxl[v.lin] = (sxl[v.lin] || 0) + v.uds;
      tS += v.uds;
    }
  });

  const c10 = clientes > 0 ? (tS / clientes) * 10 : null;
  const l10 = clientes > 0 ? (tL / clientes) * 10 : null;

  const resumen =
    clientes > 0
      ? `${fn(c10, 2)} serv/10 cli · ${fn(l10, 2)} ll/10 cli`
      : "Ingresa el número de clientes";

  const cards = LINEAS_ORD.map((key) => {
    const cnt = sxl[key] || 0;
    const x10 = clientes > 0 ? (cnt / clientes) * 10 : null;
    const obj = OX10[key] || null;
    const pct = x10 !== null && obj ? x10 / obj : null;
    const { tone, s } = sem(cnt === 0 && clientes > 0 ? 0 : pct);
    const toneFinal = cnt === 0 && clientes > 0 ? "red" : tone;
    return {
      line: LBL[key] || key,
      tone: toneFinal,
      value: String(cnt),
      unit: obj ? `/ ${fn(obj, 1)}` : "",
      objective: clientes > 0 ? `${fn(x10 ?? 0, 2)} x10 cli` : "",
      percent: s,
    };
  });

  return {
    cards,
    resumen,
    totales: { ventaTotal: tV, utilidad: tU, serviciosUds: tS, llantasUds: tL },
  };
}
