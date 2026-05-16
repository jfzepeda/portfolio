import { VARIANTS } from "./constants";

export const isSkuPromo = (row) => {
  if (!row) return false;
  const cond = row.conditions;
  const list = Array.isArray(cond) ? cond : cond ? [cond] : [];
  return list.some((c) => (c?.column ?? c?.col) === "sku");
};

export const filterRowsByVariant = (rows, variant) =>
  rows.filter((r) =>
    variant === VARIANTS.SKU_ONLY ? isSkuPromo(r) : !isSkuPromo(r)
  );

export const availableColumnsForVariant = (variant) =>
  variant === VARIANTS.SKU_ONLY
    ? ["sku"]
    : ["articulo", "marca", "proveedor"];

export const suggestNextPriority = (rows) => {
  const used = new Set(
    rows.map((r) => Number(r.priority) || 0)
  );
  let p = 1;
  while (used.has(p)) p++;
  return p;
};

