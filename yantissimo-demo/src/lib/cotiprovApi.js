import api, { post, put } from "~/lib/api";

// Normaliza filas del backend a un objeto consistente en FE
const normalizeCotiprov = (row = {}) => {
  const parseItems = (raw) => {
    let arr = [];
    if (Array.isArray(raw)) arr = raw;
    else if (typeof raw === "string") {
      try {
        const j = JSON.parse(raw);
        arr = Array.isArray(j) ? j : [];
      } catch (_e) {
        arr = [];
      }
    } else if (raw && typeof raw === "object") {
      // soporta que venga como objeto serializado
      const maybeArr = raw.items ?? raw.rows ?? raw.values;
      arr = Array.isArray(maybeArr) ? maybeArr : [];
    }
    return arr.map((it) => ({
      service_id: it?.service_id ?? it?.serviceId ?? null,
      price: Number(it?.price) || 0,
      articulo: it?.articulo ?? it?.article ?? "",
    }));
  };

  return {
    id: Number(row.id) || null,
    quote_id: Number(row.quote_id) || null,
    provider: String(row.provider ?? "").trim(),
    items: parseItems(row.items),
    group_id: row.group_id != null ? Number(row.group_id) : null,
    accepted: Boolean(row.accepted),
  };
};

export async function getCotiprov(quoteId) {
  const qid = Number(quoteId);
  if (!qid || Number.isNaN(qid)) return [];
  const res = await api(`/api/cotiprov/get?quote_id=${qid}`);
  if (!res.ok) return [];
  const json = await res.json();
  const rows = Array.isArray(json) ? json : json?.rows || [];
  return rows.map(normalizeCotiprov);
}

export async function saveCotiprov({ quote_id, provider, items }) {
  const payload = {
    quote_id: Number(quote_id),
    provider: String(provider || "").trim(),
    items: Array.isArray(items) ? items : [],
  };
  if (!payload.quote_id) throw new Error("quote_id inválido");
  if (!payload.provider) throw new Error("provider requerido");
  const res = await post(`/api/cotiprov/save`, payload);
  if (res.status === 409) {
    throw new Error("El cotiprov ya existe para este proveedor");
  }
  if (!res.ok) throw new Error("No se pudo guardar el cotiprov");
  const json = await res.json();
  const row = Array.isArray(json?.rows) ? json.rows[0] : json;
  return normalizeCotiprov(row);
}

export async function updateCotiprov({ id, items }) {
  const payload = { id: Number(id), items: Array.isArray(items) ? items : [] };
  if (!payload.id) throw new Error("id requerido para update");
  const res = await put(`/api/cotiprov/update`, payload);
  if (!res.ok) throw new Error("No se pudo actualizar el cotiprov");
  const json = await res.json();
  return normalizeCotiprov(json);
}

export async function duplicateCotiprov({ id, provider }) {
  const payload = { id: Number(id), provider: String(provider || "").trim() };
  if (!payload.id) throw new Error("id requerido para duplicar");
  const res = await post(`/api/cotiprov/duplicate`, payload);
  if (!res.ok) throw new Error("No se pudo duplicar el cotiprov");
  const json = await res.json();
  return normalizeCotiprov(json);
}

export async function acceptCotiprov({ id, group_id, car_model_year }) {
  const payload = {
    id: Number(id),
    group_id: Number(group_id),
    car_model_year: Number(car_model_year) || null,
  };
  if (!payload.id || !payload.group_id)
    throw new Error("id y group_id son requeridos para aceptar");
  const res = await put(`/api/cotiprov/accept`, payload);
  if (!res.ok) throw new Error("No se pudo aceptar el cotiprov");
  const json = await res.json();
  return normalizeCotiprov(json);
}

export async function deleteProveedor({ id }) {
  const payload = {
    id: Number(id),
  };
  if (!payload.id) throw new Error("id son requeridos");
  const res = await put(`/api/cotiprov/prov/delete`, payload);
  if (!res.ok) throw new Error("No se pudo eliminar el proveedor");
  const json = await res.json();
  return normalizeCotiprov(json);
}

export async function deleteItem({ id, itemIdx }) {
  const payload = {
    id: Number(id),
    itemIdx: itemIdx,
  };
  // if (!payload.id || !payload.itemIdx)
  //   throw new Error("id, itemIdx son requeridos para eliminar item");
  const res = await put(`/api/cotiprov/item/remove`, payload);
  if (!res.ok) throw new Error("No se pudo eliminar el item");
  const json = await res.json();
  return normalizeCotiprov(json);
}

// Compat: exportar alias para minimizar cambios si se usan en otros lados
export const getOffers = getCotiprov;
export const saveOffer = saveCotiprov;
export const acceptOfferApi = acceptCotiprov;
