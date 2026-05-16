import { fp, nm } from "../utils/format";

export const LS_OBJETIVOS = "tec_obj_v1";
export const LS_HISTORIAL = "tec_hist_v1";

export const OBJETIVOS_DEFAULT = {
  dias: 26,
  diaAct: 1,
  lineas: [
    { k: "venta", l: "Venta total", b1: 1000000, b2: 1300000, isVenta: true },
    { k: "ll", l: "Llantas", b1: 490, b2: 490 },
    { k: "alin", l: "Alineación", b1: 100, b2: 130 },
    { k: "fren", l: "Frenos", b1: 70, b2: 90 },
    { k: "susp", l: "Suspensión", b1: 100, b2: 130 },
    { k: "amort", l: "Amortiguadores", b1: 24, b2: 30 },
    { k: "paq", l: "Paquetes", b1: 24, b2: 30 },
    { k: "club", l: "Club Yantissimo", b1: 80, b2: 100 },
    { k: "afin", l: "Afinación", b1: 16, b2: 20 },
    { k: "purga", l: "Purgado", b1: 12, b2: 20 },
  ],
};

export function readObjetivos() {
  if (typeof window === "undefined") return OBJETIVOS_DEFAULT;
  try {
    return JSON.parse(window.localStorage.getItem(LS_OBJETIVOS) || "null") || OBJETIVOS_DEFAULT;
  } catch {
    return OBJETIVOS_DEFAULT;
  }
}

export function readHistorial() {
  if (typeof window === "undefined") return [];
  try {
    const rows = JSON.parse(window.localStorage.getItem(LS_HISTORIAL) || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

export function getHoyLinea(k, ventas = []) {
  const rows = Array.isArray(ventas) ? ventas : [];
  const countUds = (fn) => rows.filter(fn).reduce((s, v) => s + (v.uds || 0), 0);

  const m = {
    ll: countUds((v) => v.esLL),
    alin: countUds((v) => v.lin === "ALINEACION" && v.cuentaConv),
    fren: countUds((v) => v.lin === "FRENOS" && v.cuentaConv),
    susp: countUds((v) => v.lin === "SUSPENSION" && v.cuentaConv),
    amort: countUds((v) => v.lin === "AMORTIGUADORES" && v.cuentaConv),
    paq: countUds((v) => v.lin === "PAQUETES" && v.cuentaConv),
    club: countUds((v) => v.lin === "CLUB YANTISSIMO" && v.cuentaConv),
    afin: countUds((v) => v.lin === "AFINACION" && v.cuentaConv),
    purga: countUds((v) => nm(v.desc).includes("PURG")),
    venta: rows.reduce((s, v) => s + (v.venta || 0), 0),
  };

  return m[k] || 0;
}

export function acumularObjetivosHistorial(historial = [], date = new Date(), sucursal) {
  const mes = date.getMonth() + 1;
  const anio = date.getFullYear();
  const acum = {};

  (Array.isArray(historial) ? historial : [])
    .filter((h) => Number(h.mes) === mes && Number(h.anio) === anio)
    .filter((h) => !sucursal || !h.sucursal || h.sucursal === sucursal)
    .forEach((h) => {
      Object.entries(h.lineas || {}).forEach(([k, v]) => {
        acum[k] = (acum[k] || 0) + (Number(v) || 0);
      });
    });

  return acum;
}

export function calcularObjetivos({
  objetivos = OBJETIVOS_DEFAULT,
  ventas = [],
  historial = [],
  date = new Date(),
  sucursal,
} = {}) {
  const cfg = objetivos && Array.isArray(objetivos.lineas) ? objetivos : OBJETIVOS_DEFAULT;
  const lineas = cfg.lineas;
  const dias = Number(cfg.dias) || OBJETIVOS_DEFAULT.dias;
  const diaAct = Number(cfg.diaAct) || OBJETIVOS_DEFAULT.diaAct;
  const rest = Math.max(dias - diaAct, 1);
  const acumHist = acumularObjetivosHistorial(historial, date, sucursal);

  let b1alcanzadas = 0;
  const rows = lineas.map((l) => {
    const real = (acumHist[l.k] || 0) + getHoyLinea(l.k, ventas);
    const b1 = Number(l.b1) || 0;
    const b2 = Number(l.b2) || 0;
    const alcB1 = b1 > 0 && real >= b1;
    const alcB2 = b2 > 0 && real >= b2;
    if (alcB1) b1alcanzadas += 1;

    const pctBar = b2 > 0 ? Math.min((real / b2) * 100, 100) : 0;
    const marcaPct = b2 > 0 ? Math.min((b1 / b2) * 100, 100) : null;
    const falta = Math.max((alcB1 ? b2 : b1) - real, 0);
    const faltaPorDia = rest > 0 ? falta / rest : 0;
    const faltaDia =
      falta === 0
        ? "✓"
        : l.isVenta
          ? "$" + Math.round(faltaPorDia).toLocaleString("es-MX")
          : (Math.round(faltaPorDia * 10) / 10).toLocaleString("es-MX") + "/día";

    return {
      id: l.k,
      linea: l.l,
      realizado: l.isVenta ? fp(real) : real.toLocaleString("es-MX"),
      bono1: l.isVenta ? fp(b1) : b1.toLocaleString("es-MX"),
      bono2: l.isVenta ? fp(b2) : b2.toLocaleString("es-MX"),
      pctBar,
      marcaPct,
      faltaDia,
      faltaCompleta: falta === 0,
      estado: alcB2 ? "B2 ✓" : alcB1 ? "B1 ✓ →B2" : "Hacia B1",
      estadoClass: alcB2 ? "bw" : alcB1 ? "bi" : "bo",
      rowClass: alcB2 ? "bono-row-b2" : alcB1 ? "bono-row-b1" : "",
      progressTone: alcB2 ? "warn" : alcB1 ? "accent" : "ok",
    };
  });

  return {
    rows,
    resumen: `${b1alcanzadas}/${lineas.length} líneas en Bono 1 · día ${diaAct} de ${dias}`,
  };
}
