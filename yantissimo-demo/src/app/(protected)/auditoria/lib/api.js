const BASE = "/api/auditoria";

const HISTORIAL_NUMERIC_FIELDS = [
  "mes",
  "anio",
  "dia",
  "venta",
  "margen",
  "llantas",
  "servicios",
  "clientes",
  "alertasMarg",
  "alertasComp",
  "alertasBit",
];

function normalizeISODate(value) {
  if (!value) return value;
  if (typeof value === "string") {
    const iso = value.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
    return value;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, "0");
    const dd = String(value.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return value;
}

function normalizeHistorialRow(row) {
  const next = { ...row, fecha: normalizeISODate(row.fecha) };
  for (const key of HISTORIAL_NUMERIC_FIELDS) {
    if (next[key] != null) next[key] = Number(next[key]) || 0;
  }
  return next;
}

function getISODateParts(fecha) {
  const iso = normalizeISODate(fecha);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "")) return {};
  const [anio, mes, dia] = iso.split("-").map(Number);
  return { fecha: iso, mes, anio, dia };
}

const LIN_TO_SHORT_KEY = {
  ALINEACION: "alin",
  FRENOS: "fren",
  SUSPENSION: "susp",
  AMORTIGUADORES: "amort",
  PAQUETES: "paq",
  "CLUB YANTISSIMO": "club",
  AFINACION: "afin",
};

function summarizeSession(row) {
  const resultado = row?.resultado || {};
  const ventas = Array.isArray(resultado.ventas) ? resultado.ventas : [];
  const { fecha, mes, anio, dia } = getISODateParts(row.fecha || resultado.fecha);
  const venta = ventas.reduce((s, v) => s + (Number(v.venta) || 0), 0);
  const totalUtilidad = ventas.reduce((s, v) => s + (Number(v.utilidad) || 0), 0);
  const lineas = { venta, ll: 0, alin: 0, fren: 0, susp: 0, amort: 0, paq: 0, club: 0, afin: 0, purga: 0 };
  const resumenVend = {};

  for (const v of ventas) {
    const uds = Number(v.uds) || 0;
    if (v.esLL) lineas.ll += uds;
    if (v.cuentaConv) {
      const shortKey = LIN_TO_SHORT_KEY[v.lin];
      if (shortKey) lineas[shortKey] += uds;
    }
    if (typeof v.desc === "string" && v.desc.trim().toUpperCase().includes("PURG")) {
      lineas.purga += uds;
    }

    const vendedor = v.vendedor || "SIN VENDEDOR";
    if (!resumenVend[vendedor]) resumenVend[vendedor] = { venta: 0, utilidad: 0, ll: 0, srv: 0 };
    resumenVend[vendedor].venta += Number(v.venta) || 0;
    resumenVend[vendedor].utilidad += Number(v.utilidad) || 0;
    if (v.esLL) resumenVend[vendedor].ll += uds;
    if (v.cuentaConv) resumenVend[vendedor].srv += uds;
  }

  return normalizeHistorialRow({
    id: row.id || `${row.sucursal}_${fecha}`,
    sucursal: row.sucursal || resultado.sucursal,
    fecha,
    mes,
    anio,
    dia,
    venta,
    margen: venta > 0 ? Math.round((totalUtilidad / venta) * 10000) / 100 : 0,
    llantas: ventas.filter((v) => v.esLL).reduce((s, v) => s + (Number(v.uds) || 0), 0),
    servicios: ventas.filter((v) => v.cuentaConv).reduce((s, v) => s + (Number(v.uds) || 0), 0),
    clientes: Number(resultado.numClientes) || 0,
    alertasMarg: ventas.filter((v) => v.alerta).length,
    alertasComp: 0,
    alertasBit: Array.isArray(resultado.bitacora) ? resultado.bitacora.length : 0,
    lineas,
    prod: resultado.prodData || null,
    resumenVend,
    resultado,
    updatedAt: row.updatedAt || row.updated_at,
  });
}

/**
 * Fetch full saved audit sessions for a given month + branch.
 * This is the source for the Historial panel.
 */
export async function fetchSessions(sucursal, mes, anio) {
  const params = new URLSearchParams({
    sucursal,
    mes: String(mes),
    anio: String(anio),
  });
  const res = await fetch(`${BASE}/sessions?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status}`);
  }
  const rows = await res.json();
  return Array.isArray(rows) ? rows.map(summarizeSession) : rows;
}

/**
 * Save (upsert) a full audit session.
 * Also writes the auditoria_historial summary row server-side.
 */
export async function saveSession({ sucursal, fecha, resultado }) {
  const res = await fetch(`${BASE}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sucursal, fecha, resultado }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch a previously saved audit session by branch + date.
 */
export async function fetchSession(sucursal, fecha) {
  const params = new URLSearchParams({ sucursal, fecha });
  const res = await fetch(`${BASE}/session?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch all Michelin products from the DB for catalog caching.
 */
export async function fetchMichelinCatalog() {
  const res = await fetch(`${BASE}/michelin-catalog`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.json();
}
