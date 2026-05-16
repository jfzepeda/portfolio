/**
 * Parser de "Lista de precios MO" (catálogo por sucursal).
 * Puerto del HTML `moListaPreciosParse()` (líneas 12093–12240).
 * Retorna { ok, items, advertencia } o { ok:false, msg }.
 */
import { rxl } from "../utils/cells";

const LINEA_ALIAS = {
  AMORTIGUADOR: "AMORTIGUADORES",
  MBVYN: "MONTAJE",
  CLUB: "CLUB YANTISSIMO",
  SERVICIOS: "VARIOS",
};
const LINEAS_VALIDAS = [
  "FRENOS",
  "SUSPENSION",
  "AMORTIGUADORES",
  "AFINACION",
  "ALINEACION",
  "MONTAJE",
  "PAQUETES",
  "VARIOS",
  "RECTIFICADOS",
  "CLUB YANTISSIMO",
];
const LINEA_RULES = [
  { re: /alinea/i, linea: "ALINEACION" },
  {
    re: /freno|balero|abs|bomba.freno|purgado|chicote|piston.*rep|sensor.bala/i,
    linea: "FRENOS",
  },
  {
    re: /suspen|buje|horquilla|cremallera|homocine|cubre.polvo|cardan|cruceta|muelle|hules.*barra|soportes.*motor|balero.doble|maza/i,
    linea: "SUSPENSION",
  },
  { re: /amortiguad|machpershon|bastago|desarme/i, linea: "AMORTIGUADORES" },
  {
    re: /afina|aceite|cambio.aceite|transmision|diferencial|anticongelante|filtro|empaque|bomba.agua|bandas|poleas|tensor|scanneo/i,
    linea: "AFINACION",
  },
  { re: /montaje|balanceo|valvula|nitrogeno|parche|birlo/i, linea: "MONTAJE" },
  { re: /paquete|revision.*yantis|rotacion/i, linea: "PAQUETES" },
  { re: /club.yantissimo/i, linea: "CLUB YANTISSIMO" },
  { re: /rectificado/i, linea: "RECTIFICADOS" },
];

function inferLinea(desc) {
  const d = (desc || "").toUpperCase();
  for (const r of LINEA_RULES) if (r.re.test(d)) return r.linea;
  return "VARIOS";
}

function normalizaLinea(raw) {
  if (!raw) return "";
  const u = raw.toString().trim().toUpperCase();
  if (LINEA_ALIAS[u]) return LINEA_ALIAS[u];
  if (LINEAS_VALIDAS.includes(u)) return u;
  return "";
}

export async function parseMoLista(file) {
  const rd = await rxl(file);
  return parseMoListaRd(rd);
}

export function parseMoListaRd(rd) {
  const rows = Object.keys(rd).map(Number).sort((a, b) => a - b);
  if (!rows.length) return { ok: false, msg: "Archivo vacío." };

  const kwDesc = /desc|articul|nombre/i;
  const kwPrecio = /precio|importe|tarifa|monto/i;
  const kwLinea = /^linea|^línea|categoria/i;
  const kwClave = /^clave|^codigo|^código|^cve/i;
  const kwUnidad = /uni\.?med|unidad|tipo/i;
  let hRow = -1;
  let colDesc = -1;
  let colPrecio = -1;
  let colLinea = -1;
  let colClave = -1;
  let colUnidad = -1;

  for (const rn of rows) {
    const cols = rd[rn] ? Object.keys(rd[rn]).map(Number) : [];
    let fD = -1;
    let fP = -1;
    let fL = -1;
    let fC = -1;
    let fU = -1;
    for (const ci of cols) {
      const v = String(rd[rn][ci]?.val || "").trim();
      if (kwDesc.test(v) && fD < 0) fD = ci;
      if (kwPrecio.test(v) && fP < 0) fP = ci;
      if (kwLinea.test(v) && fL < 0) fL = ci;
      if (kwClave.test(v) && fC < 0) fC = ci;
      if (kwUnidad.test(v) && fU < 0) fU = ci;
    }
    if (fD >= 0 && fP >= 0) {
      hRow = rn;
      colDesc = fD;
      colPrecio = fP;
      colLinea = fL;
      colClave = fC;
      colUnidad = fU;
      break;
    }
  }

  if (hRow < 0) {
    for (const rn of rows) {
      const cols = rd[rn] ? Object.keys(rd[rn]).map(Number).sort((a, b) => a - b) : [];
      if (cols.length < 2) continue;
      for (let ci = 0; ci < cols.length - 1; ci++) {
        const vA = rd[rn][cols[ci]]?.val;
        const vB = rd[rn][cols[ci + 1]]?.val;
        const aEsTexto =
          typeof vA === "string" && vA.trim().length > 3 && Number.isNaN(parseFloat(vA));
        const bEsNumero =
          !Number.isNaN(parseFloat(String(vB || ""))) && parseFloat(String(vB || "")) > 0;
        if (aEsTexto && bEsNumero) {
          hRow = rn - 1;
          colDesc = cols[ci];
          colPrecio = cols[ci + 1];
          colLinea = cols[ci + 2] !== undefined ? cols[ci + 2] : -1;
          break;
        }
      }
      if (hRow >= 0) break;
    }
  }

  if (hRow < 0 || colDesc < 0 || colPrecio < 0)
    return { ok: false, msg: "No se pudo detectar la estructura del archivo." };

  const items = [];
  const omitidosPorTipo = { piezas: 0, total: 0 };
  for (const rn of rows) {
    if (rn <= hRow) continue;
    const desc = String(rd[rn]?.[colDesc]?.val || "").trim();
    if (!desc) continue;

    if (colUnidad >= 0) {
      const uni = String(rd[rn]?.[colUnidad]?.val || "").trim().toUpperCase();
      if (uni && !["SERVICIO", "T.O.T", "TOT", "MANO DE OBRA", "M.O.", "MO", "SVC"].includes(uni)) {
        omitidosPorTipo.total++;
        if (["PIEZA", "PZA", "PZ", "KG", "LT", "LITRO", "METRO", "M"].includes(uni))
          omitidosPorTipo.piezas++;
        continue;
      }
    }

    const rawPrecio = rd[rn]?.[colPrecio]?.val;
    const precio = parseFloat(String(rawPrecio || ""));
    if (Number.isNaN(precio) || precio <= 0) {
      if (String(rawPrecio || "").startsWith("=")) continue;
      continue;
    }

    let linea = "";
    if (colLinea >= 0) {
      const rawLin = String(rd[rn]?.[colLinea]?.val || "").trim();
      linea = normalizaLinea(rawLin);
      if (!linea) linea = inferLinea(rawLin) || inferLinea(desc) || "VARIOS";
    }
    if (!linea) linea = inferLinea(desc);
    const clave = colClave >= 0 ? String(rd[rn]?.[colClave]?.val || "").trim() : "";
    items.push({ desc, precio, linea, clave });
  }

  if (!items.length)
    return { ok: false, msg: "No se encontraron servicios con precio válido." };

  const advertencias = [];
  if (omitidosPorTipo.piezas > 0)
    advertencias.push(
      `${omitidosPorTipo.piezas} piezas/refacciones omitidas (solo se cargan servicios de M.O.).`,
    );

  return { ok: true, items, advertencia: advertencias.join(" · ") || null };
}
