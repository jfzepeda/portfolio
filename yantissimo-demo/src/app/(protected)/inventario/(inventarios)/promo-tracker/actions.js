import api, { post } from "~/lib/api";

export async function fetchPromoBase() {
  const response = await api("/api/liquidaciones/base");
  if (!response.ok) throw new Error("Error al obtener base de promo tracker");
  return response.json();
}

export async function uploadLiquidaciones(rows) {
  const payload = rows
    .filter((row) => row.patioPrice)
    .map((row) => ({
      id: row.inventoryId,
      descripcion: row.desc,
      precio: row.patioPrice.rounded,
      costo: row.costo,
    }));

  if (!payload.length) {
    return { ok: false, empty: true };
  }

  const response = await post("/api/liquidaciones", { data: payload });

  if (!response.ok) {
    throw new Error("Error al subir descuentos");
  }

  return { ok: true, count: payload.length };
}
