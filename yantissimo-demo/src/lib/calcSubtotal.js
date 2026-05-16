const toNumber = (v) => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const cleaned = String(v).replace(/[^0-9.\-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

function getSubtotal(items = []) {
  const subtotal = items?.reduce((acc, it) => {
    const units = Math.max(1, toNumber(it?.units) || 1);
    const price = toNumber(it.precioPromo ?? it.precioContado ?? it.price ?? it.precio);
    return acc + units * price;
  }, 0);

  return subtotal;
}

export { getSubtotal };
