/**
 * Cruce compras ↔ ventas del día por SKU (artNorm).
 * Puerto de `buildCruce()` del HTML (líneas 4435–4514).
 * Versión pura: recibe ventas, comprasIntegradas (del parseAuditoria),
 * ovPendientes y el historial reciente (para la ventana de 3 días).
 *
 * Omite el matching contra `ovHistArts` (catálogo de OVs cerradas en días
 * anteriores) porque requiere acceso al backend de historial — se puede
 * extender pasando el parámetro `histArts` desde la capa superior.
 */

const PROVEEDORES_EXCLUIDOS = ["CARLOS EDUARDO PEREZ VARGAS"].map((p) =>
  p.toUpperCase().trim(),
);

function proveedorExcluido(prov) {
  const p = (prov || "").toUpperCase().trim();
  return PROVEEDORES_EXCLUIDOS.some((pe) => p.includes(pe) || pe.includes(p));
}

/** artNorm de artículos en OVs pendientes del día */
function ovArtNorms(ovPendientes = []) {
  const s = new Set();
  ovPendientes.forEach((ov) => {
    if (ov.desc) {
      const norm = String(ov.desc).trim().toUpperCase().replace(/\s+/g, " ");
      s.add(norm);
    }
  });
  return s;
}

/**
 * @param ventas Array (del parseAuditoria)
 * @param comprasIntegradas Array
 * @param ovPendientes Array
 * @param histCompras Array  — compras de los últimos 3 días del historial
 * @param histArts    {folioOV: Array<artNorm>} — OV cerradas históricas
 */
export function buildCruce({
  ventas = [],
  comprasIntegradas = [],
  ovPendientes = [],
  histCompras = [],
  histArts = {},
} = {}) {
  const cm = {};
  const allCompras = [
    ...comprasIntegradas.map((c) => ({ ...c, deHistorial: false })),
    ...histCompras.map((c) => ({ ...c, deHistorial: true })),
  ];

  allCompras.forEach((c) => {
    if (proveedorExcluido(c.prov)) return;
    if (!cm[c.artNorm]) {
      cm[c.artNorm] = {
        art: c.art,
        provs: new Set(),
        folios: new Set(),
        udsC: 0,
        importeC: 0,
        deHistorial: false,
        desgloseC: {},
      };
    }
    cm[c.artNorm].provs.add(c.prov);
    cm[c.artNorm].folios.add(c.folio);
    cm[c.artNorm].udsC += c.uds || 0;
    cm[c.artNorm].importeC += c.importe || 0;
    if (!cm[c.artNorm].desgloseC[c.folio]) {
      cm[c.artNorm].desgloseC[c.folio] = { uds: 0, importe: 0, prov: c.prov };
    }
    cm[c.artNorm].desgloseC[c.folio].uds += c.uds || 0;
    cm[c.artNorm].desgloseC[c.folio].importe += c.importe || 0;
    if (c.deHistorial) cm[c.artNorm].deHistorial = true;
  });

  const vm = {};
  ventas.forEach((v) => {
    if (!vm[v.artNorm]) {
      vm[v.artNorm] = {
        udsV: 0,
        ventaV: 0,
        margen: v.margen,
        foliosV: new Set(),
        foliosOV: new Set(),
        desgloseV: {},
      };
    }
    vm[v.artNorm].udsV += v.uds || 0;
    vm[v.artNorm].ventaV += v.venta || 0;
    if (v.folio) vm[v.artNorm].foliosV.add(v.folio);
    if (v.folioOV) vm[v.artNorm].foliosOV.add(v.folioOV);
    if (v.folio) {
      if (!vm[v.artNorm].desgloseV[v.folio])
        vm[v.artNorm].desgloseV[v.folio] = { uds: 0, venta: 0 };
      vm[v.artNorm].desgloseV[v.folio].uds += v.uds || 0;
      vm[v.artNorm].desgloseV[v.folio].venta += v.venta || 0;
    }
  });

  const ovArts = ovArtNorms(ovPendientes);

  const cruce = Object.entries(cm).map(([key, c]) => {
    const v = vm[key] || null;
    let estado = !v
      ? "sin_venta"
      : v.udsV > c.udsC
      ? "alerta"
      : v.udsV === c.udsC
      ? "ok"
      : "excedente";
    const enOV = estado !== "ok" && ovArts.has(key);
    let enOVHist = false;
    let ovHistFolio = "";
    if (estado === "alerta" && v && v.foliosOV.size > 0) {
      for (const folioOV of v.foliosOV) {
        if (histArts[folioOV] && histArts[folioOV].includes(key)) {
          enOVHist = true;
          ovHistFolio = folioOV;
          break;
        }
      }
    }
    if (enOVHist) estado = "ok";
    return {
      ...c,
      key,
      provs: [...c.provs],
      folios: [...c.folios],
      udsV: v?.udsV || 0,
      ventaV: v?.ventaV || 0,
      foliosV: v ? [...v.foliosV] : [],
      desgloseV: v ? v.desgloseV : {},
      margenV: v?.margen ?? null,
      estado,
      enOV,
      enOVHist,
      ovHistFolio,
    };
  });

  // "Comprados sin venta" es un subset donde estado==='sin_venta' y !enOV
  const sinVenta = cruce.filter((c) => c.estado === "sin_venta" && !c.enOV);
  const alertas = cruce.filter(
    (c) => c.estado === "alerta" || c.estado === "excedente",
  );
  const bannerCount = alertas.filter((a) => !a.enOV).length;

  return {
    cruce,
    sinVenta,
    alertas,
    bannerCount,
  };
}
