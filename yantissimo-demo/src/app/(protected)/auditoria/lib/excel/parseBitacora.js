/**
 * Parser del Excel de Bitácora (notificaciones PV).
 * Puerto del HTML líneas 3200–3481.
 * Signatura adaptada: toma `rd` + `ventas` en vez de usar globales.
 * Filtra eliminaciones/modificaciones cruzando contra ventas del día.
 */
import { rxl, gc } from "../utils/cells";
import { exD, exH, nm } from "../utils/format";

const BIT_TIPOS_UTILES = new Set([
  "PV_O_MODIF_PRECI",
  "PV_V_MODIF_PRECI",
  "PV_O_ELIMINACION_",
  "PV_O_MODIF_UNIDA",
  "PV_V_MODIF_UNIDA",
]);

export const BIT_PESOS = {
  PV_O_MODIF_PRECI: 3,
  PV_V_MODIF_PRECI: 3,
  PV_O_ELIMINACION_: 4,
  PV_O_MODIF_UNIDA: 2,
  PV_V_MODIF_UNIDA: 2,
};

export const BIT_LABELS = {
  PV_O_MODIF_PRECI: "Modif. precio",
  PV_V_MODIF_PRECI: "Modif. precio VM",
  PV_O_ELIMINACION_: "Elim. partida OV",
  PV_O_MODIF_UNIDA: "Cambio cantidad OV",
  PV_V_MODIF_UNIDA: "Cambio cantidad VM",
};

export function normFolio(f) {
  if (!f) return "";
  const m = String(f).trim().match(/^([A-Za-z]+)0*(\d+)$/);
  return m ? m[1].toUpperCase() + m[2] : "";
}

export function folioTipo(folio) {
  if (!folio) return { label: "—", cls: "bm", short: "—" };
  const f = folio.toUpperCase();
  const m = f.match(/([A-Z])\d/);
  if (!m) return { label: folio, cls: "bm", short: "?" };
  const t = m[1];
  if (t === "O") return { label: "Orden de venta", cls: "bi", short: "OV" };
  if (t === "V") return { label: "Venta mostrador", cls: "bp", short: "VM" };
  if (t === "F") return { label: "Factura", cls: "bo", short: "FAC" };
  return { label: "Documento", cls: "bm", short: t };
}

export async function parseBitacora(file, ventas = []) {
  const rd = await rxl(file);
  return parseBitacoraRd(rd, ventas);
}

export function parseBitacoraRd(rd, ventas = []) {
  const auditIdx = {};
  const ovToVm = {};
  const vmToOv = {};
  ventas.forEach((v) => {
    const fnV = normFolio(v.folio);
    const fnOV = v.folioOV ? normFolio(v.folioOV) : "";
    if (fnOV && fnV && fnOV !== fnV) {
      ovToVm[fnOV] = fnV;
      vmToOv[fnV] = fnOV;
    }
    [fnV, fnOV].filter(Boolean).forEach((fn) => {
      if (!auditIdx[fn]) auditIdx[fn] = new Set();
      if (v.clave) auditIdx[fn].add(String(v.clave).trim().toUpperCase());
    });
  });

  const rows = Object.keys(rd).map(Number).sort((a, b) => a - b);
  const eventRows = [];
  for (const rn of rows) {
    const a = gc(rd, rn, "A");
    const f = gc(rd, rn, "F");
    const h = gc(rd, rn, "H");
    if (
      a &&
      f &&
      !Number.isNaN(parseFloat(a)) &&
      parseFloat(a) > 40000 &&
      h !== "Continuación..."
    )
      eventRows.push(rn);
  }

  const events = [];
  for (let idx = 0; idx < eventRows.length; idx++) {
    const sr = eventRows[idx];
    const nextMain = eventRows[idx + 1] ?? Math.max(...rows) + 1;
    const tipo = gc(rd, sr, "K");
    if (!BIT_TIPOS_UTILES.has(tipo)) continue;

    const detail = {};
    for (let rn = sr + 1; rn < nextMain; rn++) {
      if (!(rn in rd)) continue;
      const b = gc(rd, rn, "B");
      const h = gc(rd, rn, "H");
      if (!b && !h) continue;
      if (b === "Información adicional del evento") continue;
      if (b === "Dirección IP") {
        detail.ip = h;
        continue;
      }
      if (b && h) detail[b] = h;
    }

    const _claveEv = (detail["Clave del artículo"] || "").trim();
    const _nombreEv = nm(detail["Nombre del artículo"] || "");
    const _esMBVYN =
      _claveEv === "00" ||
      _claveEv === "0" ||
      (_nombreEv.includes("MONTAJE") && _nombreEv.includes("BALANCEO"));
    if (_esMBVYN) continue;

    if (tipo === "PV_O_MODIF_PRECI" || tipo === "PV_V_MODIF_PRECI") {
      const pa = parseFloat((detail["Precio anterior"] || "").replace(/[$,]/g, ""));
      const pn = parseFloat((detail["Precio nuevo"] || "").replace(/[$,]/g, ""));
      if (Number.isNaN(pa) || pa === 0) continue;
      if (pn >= pa) continue;
      if (pa - pn < 30) continue;
    }
    if (tipo === "PV_O_MODIF_UNIDA" || tipo === "PV_V_MODIF_UNIDA") {
      const ca = parseFloat(detail["Unidades anteriores"] || 0);
      const cn2 = parseFloat(detail["Unidades nuevas"] || 0);
      if (cn2 >= ca) continue;
    }

    if (tipo === "PV_O_ELIMINACION_") {
      const fElim = detail["Folio del documento"] || "";
      const claveElim = (detail["Clave del artículo"] || "").trim().toUpperCase();
      if (claveElim) {
        const folioNorm = normFolio(fElim);
        const clavesAudit = auditIdx[folioNorm] || new Set();
        if (clavesAudit.has(claveElim)) continue;
      }
    }

    const fnEvt = normFolio(detail["Folio del documento"] || "");
    events.push({
      fecha: exD(gc(rd, sr, "A")),
      hora: exH(gc(rd, sr, "B")),
      usuario: gc(rd, sr, "F"),
      tipo,
      sucursal: gc(rd, sr, "N"),
      cajero: gc(rd, sr, "P"),
      folio: detail["Folio del documento"] || "",
      folioVM: ovToVm[fnEvt] || "",
      folioOVref: vmToOv[fnEvt] || "",
      articulo: detail["Nombre del artículo"] || "",
      precio_ant: detail["Precio anterior"] || "",
      precio_nvo: detail["Precio nuevo"] || "",
      cant_ant: detail["Unidades anteriores"] || "",
      cant_nva: detail["Unidades nuevas"] || "",
      uds_raw: detail.Unidades || "",
      precio_raw: detail.Precio || "",
      total_raw: detail.Total || detail["Importe total del documento"] || "",
      clave: detail["Clave del artículo"] || "",
    });
  }

  // Deduplicar
  const deduped = [];
  const usados = new Set();
  const evKey = (e) => {
    const art = (e.clave || "").trim().toUpperCase() || nm(e.articulo || "");
    return [e.tipo, normFolio(e.folio || ""), (e.usuario || "").trim().toUpperCase(), art].join("|");
  };
  const score = (e) =>
    (e.articulo ? 2 : 0) +
    (e.precio_raw ? 1 : 0) +
    (e.uds_raw ? 1 : 0) +
    (e.total_raw ? 1 : 0) +
    (e.precio_nvo ? 1 : 0) +
    (e.cant_nva ? 1 : 0);
  for (let a = 0; a < events.length; a++) {
    if (usados.has(a)) continue;
    const ka = evKey(events[a]);
    let mejor = a;
    for (let b = a + 1; b < events.length; b++) {
      if (usados.has(b)) continue;
      if (evKey(events[b]) !== ka) continue;
      if (score(events[b]) > score(events[mejor])) mejor = b;
      usados.add(b);
    }
    usados.add(a);
    deduped.push(events[mejor]);
  }
  return deduped;
}
