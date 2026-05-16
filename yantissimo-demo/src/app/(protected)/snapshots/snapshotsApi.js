import { getJson } from "~/lib/api";

const BASE_URL = "/api/snapshots/prices";

const PRICE_FIELD_CANDIDATES = {
  costo: ["costo", "cost"],
  prev_costo: ["prev_costo", "previous_cost"],
  precio_lista: ["precio_lista", "precioLista", "list_price"],
  precio_contado: ["precio_contado", "precioContado", "cash_price"],
  prev_contado: ["prev_contado", "previous_cash_price"],
  precio_credito: ["precio_credito", "precioCredito", "credit_price"],
  precio_dist_contado: ["precio_dist_contado", "precioDistContado", "dist_cash_price"],
  precio_dist_credito: ["precio_dist_credito", "precioDistCredito", "dist_credit_price"],
  precio_promo: ["precio_promo", "precioPromo", "promo_price"],
  precio_convenio: ["precio_convenio", "precioConvenio", "agreement_price"],
  precio_6: ["precio_6", "precio6", "seisMeses", "price_6"],
  precio_12: ["precio_12", "precio12", "doceMeses", "price_12"],
  seis_meses: ["seis_meses", "seisMeses"],
  doce_meses: ["doce_meses", "doceMeses"],
  contado_dist: ["contado_dist"],
  credito_dist: ["credito_dist"],
  precio_marina: ["precio_marina"],
  promo_2pz: ["promo_2pz"],
  promo_4pz: ["promo_4pz"],
  credito: ["credito"],
  volumen_10: ["volumen_10"],
  vol_10_cred: ["vol_10_cred"],
};

const firstDefined = (obj, keys, fallback = null) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== "") {
      return obj[key];
    }
  }
  return fallback;
};

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const normalized =
    typeof value === "string" ? value.replace(/[$,\s]/g, "") : value;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
};

const inferPriceFields = (row) => {
  const values = Object.entries(PRICE_FIELD_CANDIDATES).reduce(
    (acc, [canonical, keys]) => {
      acc[canonical] = toNumberOrNull(firstDefined(row, keys));
      return acc;
    },
    {}
  );

  Object.entries(row || {}).forEach(([key, value]) => {
    if (values[key] !== undefined) return;
    const normalizedKey = String(key || "").toLowerCase();
    const looksLikePriceField =
      normalizedKey.includes("precio") ||
      normalizedKey.includes("costo") ||
      normalizedKey.includes("contado") ||
      normalizedKey.includes("credito") ||
      normalizedKey.includes("lista") ||
      normalizedKey.includes("promo") ||
      normalizedKey.includes("meses") ||
      normalizedKey.includes("convenio") ||
      normalizedKey.includes("dist") ||
      normalizedKey.includes("marina") ||
      normalizedKey.includes("volumen") ||
      normalizedKey.includes("vol_");

    if (!looksLikePriceField) return;

    const number = toNumberOrNull(value);
    if (number === null) return;

    values[key] = number;
  });

  return values;
};

const getItemId = (row) =>
  firstDefined(row, [
    "item_id",
    "articulo_id",
    "product_id",
    "producto_id",
    "inventory_id",
    "id_articulo",
    "sku_id",
    "id",
  ]);

const getSnapshotId = (row) =>
  firstDefined(row, ["snapshot_id", "id_snapshot", "id"]);

export const normalizeSnapshot = (row, index = 0) => {
  const priceFields = inferPriceFields(row);
  const precioContado = priceFields.precio_contado;
  const prevContado = priceFields.prev_contado;
  const deltaContadoPct =
    prevContado && Number.isFinite(precioContado)
      ? ((precioContado - prevContado) / prevContado) * 100
      : null;

  return {
    id: getSnapshotId(row) ?? `snapshot-${index}`,
    itemId: getItemId(row),
    snapshotDate: firstDefined(row, [
      "snapshot_date",
      "fecha",
      "created_at",
      "createdAt",
      "date",
    ]),
    articulo: firstDefined(row, ["articulo", "nombre", "descripcion"], "—"),
    size: firstDefined(row, ["size", "medida", "tamano"], ""),
    marca: firstDefined(row, ["marca", "brand"], "—"),
    categoria: firstDefined(row, ["categoria", "category"], "—"),
    rin: firstDefined(row, ["rin", "rim"], "—"),
    proveedor: firstDefined(row, ["proveedor", "provider"], "—"),
    costo: priceFields.costo,
    precioContado,
    precioLista: priceFields.precio_lista,
    prevContado,
    prevCosto: priceFields.prev_costo,
    deltaContadoPct,
    priceFields,
    raw: row,
  };
};

export const fetchSnapshotItem = async ({ itemId, days }) => {
  if (!itemId) return [];
  const data = await getJson(`${BASE_URL}/item/${itemId}`, { days });
  const rows = Array.isArray(data) ? data : data?.rows || data?.data || [];
  return rows.map(normalizeSnapshot);
};

export const fetchInvList = async (searchTerm) => {
  const data = await getJson("/api/inv/list", { searchTerm });
  return Array.isArray(data) ? data : data?.rows || data?.data || [];
};
