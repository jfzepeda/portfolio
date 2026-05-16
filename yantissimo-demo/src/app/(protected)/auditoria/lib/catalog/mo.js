/**
 * Catálogo MO, configuración de promos y `moGetEsperado`.
 * Puerto del HTML (líneas 11972–13085).
 *
 * Incluye:
 *   - MO_CATALOG fallback (servicios con precio de lista base).
 *   - moIndexBuild / moLookup: búsqueda por descripción normalizada.
 *   - cvPreciosPorEsquema: precios contado / 6MSI / 12MSI.
 *   - moGetEsperado: calcula precio esperado y descuento máximo permitido.
 *
 * MO_INDEX por defecto se hidrata con MO_CATALOG; al cargar una Lista de
 * Precios vía moListaPreciosParse + setMoIndex el cálculo se actualiza.
 */

export const MO_CATALOG = [
  { linea: "FRENOS", desc: "M.O FRENOS", precio: 570 },
  { linea: "FRENOS", desc: "M.O  FRENOS CON BALERO", precio: 1400 },
  { linea: "FRENOS", desc: "M.O  FRENO CON SENSOR ELECTRICO", precio: 930 },
  { linea: "FRENOS", desc: "M.O LIMPIEZA Y AJUSTE DE FRENOS", precio: 400 },
  { linea: "FRENOS", desc: "M.O CAMBIO DE SENSOR ABS Y /O SENSOR DE BALATA", precio: 350 },
  { linea: "FRENOS", desc: "M.O CAMBIO DE PISTON Y REPUESTO", precio: 180 },
  { linea: "FRENOS", desc: "M.O DE CAMBIO DE BOMBA DE FRENOS", precio: 990 },
  { linea: "FRENOS", desc: "M.O DE CAMBIO DE BOMBA DE FRENOS ESPECIAL", precio: 1500 },
  { linea: "FRENOS", desc: "M.O CAMBIO DE CHICOTE DE FRENO EXTERNO", precio: 570 },
  { linea: "FRENOS", desc: "SERVICIO DE PURGADO(INCLUYE LIQUIDO DE FRENOS)", precio: 700 },
  { linea: "SUSPENSION", desc: "M.O SUSPENSION", precio: 300 },
  { linea: "SUSPENSION", desc: "M.O BUJE CON SOPORTE", precio: 770 },
  { linea: "SUSPENSION", desc: "M.O BUJE EJE TRASERO CON PURGADO", precio: 1390 },
  { linea: "SUSPENSION", desc: "M.O HORQUILLA", precio: 630 },
  { linea: "SUSPENSION", desc: "M.O HORQUILLA CON BARRA", precio: 1260 },
  { linea: "SUSPENSION", desc: "M.O HORQUILLA CON PUENTE", precio: 1160 },
  { linea: "SUSPENSION", desc: "M.O CAMBIO DE CREMALLERA", precio: 1730 },
  { linea: "SUSPENSION", desc: "M.O JUNTA HOMOCINETICA O CUBRE POLVO X LADO", precio: 980 },
  { linea: "SUSPENSION", desc: "M.O JUNTA HOMOCINETICA O CUBRE POLVO X LADO 4X4", precio: 1560 },
  { linea: "SUSPENSION", desc: "M.O BALERO CARDAN O CRUCETA", precio: 450 },
  { linea: "SUSPENSION", desc: "M.O BUJES DE MUELLE POR LADO", precio: 740 },
  { linea: "SUSPENSION", desc: "M.O HULES DE BARRA PAR", precio: 460 },
  { linea: "SUSPENSION", desc: "M.O HULES DE BARRA PAR CON PUENTE", precio: 1050 },
  { linea: "SUSPENSION", desc: "M.O SOPORTES MOTOR", precio: 550 },
  { linea: "SUSPENSION", desc: "M.O BALERO DOBLE, MAZA BALERO", precio: 520 },
  { linea: "AMORTIGUADORES", desc: "M.O AMORTIGUADORES MACHPERSHON", precio: 440 },
  { linea: "AMORTIGUADORES", desc: "M.O CAMBIO AMORTIGUADORES MACHPERSHON DE BASTAGO", precio: 570 },
  { linea: "AMORTIGUADORES", desc: "M.O CAMBIO AMORTIGUADORES NORMAL", precio: 290 },
  { linea: "AMORTIGUADORES", desc: "M.O DESARME DELANTERO O TRASERO", precio: 400 },
  { linea: "AFINACION", desc: "AFINACION MAYOR (CARBUCLEAN,BOYA, AFLOJATODO) 4CILINDROS", precio: 1300 },
  { linea: "AFINACION", desc: "AFINACION MAYOR (CARBUCLEAN,BOYA, AFLOJATODO) 6 U 8 CILINDROS", precio: 1700 },
  { linea: "AFINACION", desc: "AFINACION MENOR (CAMBIO DE FILTROS Y ACEITE)", precio: 550 },
  { linea: "AFINACION", desc: "CAMBIO DE ACEITE MOTOR", precio: 350 },
  { linea: "AFINACION", desc: "CAMBIO DE ACIETE MOTOR CON TOLVA O SKIDPLATE", precio: 570 },
  { linea: "AFINACION", desc: "CAMBIO DE ACEITE TRANSMISION ESTANDAR", precio: 400 },
  { linea: "AFINACION", desc: "CAMBIO DE ACEITE DIFERENCIAL", precio: 530 },
  { linea: "AFINACION", desc: "MANO DE OBRA ANTICONGELANTE", precio: 400 },
  { linea: "MONTAJE", desc: "MONTAJE, BALANCEO, VALVULA Y NITROGENO (13-18) PASAJERO", precio: 280 },
  { linea: "MONTAJE", desc: "MONTAJE, BALANCEO, VALVULA Y NITROGENO (19-22) PASAJERO", precio: 290 },
  { linea: "MONTAJE", desc: "MONTAJE, BALANCEO, VALVULA Y NITROGENO PERFIL BAJO", precio: 400 },
  { linea: "MONTAJE", desc: "MONTAJE, BALANCEO, VALVULA Y NITROGENO AT", precio: 400 },
  { linea: "MONTAJE", desc: "MONTAJE, BALANCEO, VALVULA Y NITROGENO MUD", precio: 460 },
  { linea: "MONTAJE", desc: "BALANCEO RIN ACERO", precio: 180 },
  { linea: "MONTAJE", desc: "BALANCEO RIN OFF ROAD", precio: 300 },
  { linea: "MONTAJE", desc: "BALANCEO RIN DEPORTIVO", precio: 300 },
  { linea: "VARIOS", desc: "ROTACION", precio: 350 },
  { linea: "VARIOS", desc: "REVISION DE VEHICULO", precio: 280 },
  { linea: "VARIOS", desc: "PARCHE NORMAL", precio: 250 },
  { linea: "VARIOS", desc: "CAMBIO DE BIRLO POR RUEDA SIN DESARMAR", precio: 230 },
  { linea: "VARIOS", desc: "CAMBIO DE BIRLO POR RUEDA DESARMANDO", precio: 400 },
  { linea: "VARIOS", desc: "CAMBIO EMPAQUE PUNTERIAS", precio: 690 },
  { linea: "VARIOS", desc: "CAMBIO DE BOMBA DE AGUA", precio: 690 },
  { linea: "VARIOS", desc: "CAMBIO BANDAS DE ACCESORIOS", precio: 460 },
  { linea: "VARIOS", desc: "CAMBIO DE POLEAS O TENSOR", precio: 690 },
  { linea: "VARIOS", desc: "TRABAJOS ESPECIALES ES POR HORA", precio: 570 },
  { linea: "PAQUETES", desc: "REVISION VEHÍCULAR YANTISSIMO (30 MIN)", precio: 300 },
  { linea: "PAQUETES", desc: "PAQUETE 1 (REVISION, ROTACION, NITROGENO)", precio: 350 },
  { linea: "PAQUETES", desc: "PAQUETE 2 (REVISION,ROTACION, NITROGENO Y BALANCEO)", precio: 530 },
  { linea: "PAQUETES", desc: "PAQUETE 3 (REVISION,ROTACION, NITROGENO Y BALANCEO, ALINEACION)", precio: 990 },
  { linea: "PAQUETES", desc: "2 MONTAJES Y ALINEACION", precio: 850 },
  { linea: "PAQUETES", desc: "4 MONTAJES Y ALINEACION", precio: 1400 },
  { linea: "ALINEACION", desc: "ALINEACION ESCANTILLON", precio: 400 },
  { linea: "ALINEACION", desc: "ALINEACION ESCANTILLON CON CAIDA", precio: 800 },
  { linea: "ALINEACION", desc: "ALINEACION 3D", precio: 600 },
  { linea: "ALINEACION", desc: "ALINEACION 3D 2 EJES", precio: 1150 },
  { linea: "ALINEACION", desc: "ALINEACION 3D  CON CAIDA DE AMORTIGUADOR", precio: 1270 },
];

let MO_INDEX = {};
(function init() {
  MO_INDEX = {};
  MO_CATALOG.forEach((e) => {
    const key = e.desc.toUpperCase().replace(/\s+/g, " ").trim();
    MO_INDEX[key] = e;
  });
})();

export function getMoIndex() {
  return MO_INDEX;
}

export function setMoIndex(items) {
  MO_INDEX = {};
  items.forEach((e) => {
    const key = e.desc.toUpperCase().replace(/\s+/g, " ").trim();
    MO_INDEX[key] = e;
  });
}

export function moLookup(desc) {
  const key = desc.toUpperCase().replace(/\s+/g, " ").trim();
  if (MO_INDEX[key]) return MO_INDEX[key];
  for (const k of Object.keys(MO_INDEX)) {
    if (key.includes(k) || k.includes(key)) return MO_INDEX[k];
  }
  return null;
}

export const LINEAS_CFG_DEF = [
  { k: "FRENOS", l: "Frenos", promoActiva: false, dtoMaxMO: 0, margenPiezas: 30, articulos: [] },
  { k: "SUSPENSION", l: "Suspensión", promoActiva: false, dtoMaxMO: 0, margenPiezas: 30, articulos: [] },
  { k: "AMORTIGUADORES", l: "Amortiguadores", promoActiva: false, dtoMaxMO: 0, margenPiezas: 30, articulos: [] },
  { k: "AFINACION", l: "Afinación", promoActiva: false, dtoMaxMO: 0, margenPiezas: 30, articulos: [] },
  { k: "ALINEACION", l: "Alineación", promoActiva: false, dtoMaxMO: 0, margenPiezas: 30, articulos: [] },
  { k: "PAQUETES", l: "Paquetes", promoActiva: false, dtoMaxMO: 0, margenPiezas: 30, articulos: [] },
];

export const MO_CFG = {
  convenio: 15,
  club: 5,
  alin2: 15,
  alin4: 30,
  promos: {
    FRENOS: { activo: false, dto: 0 },
    SUSPENSION: { activo: false, dto: 0 },
    AMORTIGUADORES: { activo: false, dto: 0 },
    AFINACION: { activo: false, dto: 0 },
    ALINEACION: { activo: false, dto: 0 },
    MONTAJE: { activo: false, dto: 0 },
    VARIOS: { activo: false, dto: 0 },
    PAQUETES: { activo: false, dto: 0 },
  },
};

export function lcfgGetFactor(lin, cfgList = LINEAS_CFG_DEF) {
  const lc = cfgList.find((c) => c.k === lin);
  if (!lc || !lc.promoActiva) return 30;
  return lc.margenPiezas != null ? lc.margenPiezas : 30;
}

export function lcfgGetDtoMaxArt(desc, lin, cfgList = LINEAS_CFG_DEF) {
  const lc = cfgList.find((c) => c.k === lin);
  if (!lc) return null;
  const descNorm = (desc || "").toUpperCase().replace(/\s+/g, " ").trim();
  const art = (lc.articulos || []).find(
    (a) => (a.desc || "").toUpperCase().replace(/\s+/g, " ").trim() === descNorm,
  );
  if (art) return { dtoMax: art.dtoMaxMO, source: "art", artDesc: art.desc };
  if (lc.promoActiva && lc.dtoMaxMO > 0)
    return { dtoMax: lc.dtoMaxMO, source: "linea" };
  return null;
}

const CV_DTO_CONTADO = 0.20;
const CV_DTO_6MSI = 0.09;
const CV_DTO_12MSI = 0.03;

export function cvPreciosPorEsquema(plConIVA) {
  if (!plConIVA || plConIVA <= 0) return null;
  const r = (v) => Math.round(v / 5) * 5;
  return {
    contado: r(plConIVA * (1 - CV_DTO_CONTADO)),
    msi6: r(plConIVA * (1 - CV_DTO_6MSI)),
    msi12: r(plConIVA * (1 - CV_DTO_12MSI)),
  };
}

/**
 * @returns { pl_catalogo, pl_sinIVA, dtoMax, label, cls, preciosEsquema } | null
 */
export function moGetEsperado(desc, linea, esConvenio, esClub, esEspecial, llantasFolio) {
  const entry = moLookup(desc);
  const linKey = entry ? entry.linea : linea;
  const pl_catalogo = entry ? entry.precio : null;
  const pl_sinIVA = pl_catalogo ? Math.round((pl_catalogo / 1.16) * 100) / 100 : null;

  const promo = MO_CFG.promos[linKey] || MO_CFG.promos[linea];
  const promoActiva = promo && promo.activo && promo.dto > 0;
  const esAlin = linKey === "ALINEACION" || linea === "ALINEACION";

  let dtoMax;
  let label;
  let cls;

  if (esEspecial) {
    dtoMax = 50 + (esClub ? MO_CFG.club : 0);
    label = (esEspecial === "yantissimo" ? "Yantissimo" : "Taller aliado") + (esClub ? " + Club" : "");
    cls = "bp";
  } else {
    const artCfg = lcfgGetDtoMaxArt(desc, linKey || linea);
    if (artCfg) {
      dtoMax = artCfg.dtoMax + (esClub ? MO_CFG.club : 0);
      label = (artCfg.source === "art" ? "Promo artículo" : "Promo línea") + (esClub ? " + Club" : "");
      cls = "promo";
      const preciosEsquema = cvPreciosPorEsquema(pl_catalogo);
      return { pl_catalogo, pl_sinIVA, dtoMax, label, cls, preciosEsquema };
    }
  }
  if (!esEspecial) {
    if (esAlin && llantasFolio >= 4) {
      const base = MO_CFG.alin4;
      const baseEfectivo = promoActiva && promo.dto > base ? promo.dto : base;
      dtoMax = baseEfectivo;
      const fuePromo = promoActiva && promo.dto > base;
      label = fuePromo ? "PROMO " + promo.dto + "%" : "4 Llantas " + base + "%";
      cls = "bo";
    } else if (esAlin && llantasFolio >= 2) {
      const base = MO_CFG.alin2;
      const baseConv = esConvenio ? MO_CFG.convenio : 0;
      const baseEfectivo =
        promoActiva && promo.dto > Math.max(base, baseConv)
          ? promo.dto
          : Math.max(base, baseConv);
      dtoMax = baseEfectivo + (esClub ? MO_CFG.club : 0);
      const fuePromo2 = promoActiva && promo.dto > Math.max(base, baseConv);
      label =
        (fuePromo2
          ? "PROMO " + promo.dto + "%"
          : baseEfectivo === MO_CFG.convenio && esConvenio
          ? "Convenio " + MO_CFG.convenio + "%"
          : "2 Llantas " + base + "%") + (esClub ? " + Club" : "");
      cls = "bo";
    } else if (promoActiva) {
      dtoMax = promo.dto + (esClub ? MO_CFG.club : 0);
      label = "PROMO " + promo.dto + "%" + (esClub ? " + Club" : "");
      cls = "promo";
    } else if (esConvenio) {
      dtoMax = MO_CFG.convenio + (esClub ? MO_CFG.club : 0);
      label = "Convenio" + (esClub ? " + Club" : "");
      cls = "convenio";
    } else if (esClub) {
      dtoMax = MO_CFG.club;
      label = "Club";
      cls = "bi";
    } else {
      dtoMax = 0;
      label = "Precio lista";
      cls = "";
    }
  }

  const preciosEsquema = cvPreciosPorEsquema(pl_catalogo);
  return { pl_catalogo, pl_sinIVA, dtoMax, label, cls, preciosEsquema };
}

export function especGetCategoria() {
  // Placeholder — requiere catálogo especiales. Ver HTML línea 12906.
  return null;
}
