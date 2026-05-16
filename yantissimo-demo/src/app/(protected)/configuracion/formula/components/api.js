import api, { post, put, del } from "~/lib/api";
export const API_BASE = "/api/formula";

export const fetchList = async (endp, params = null) => {
  try {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    console.log(`Fetching from ${API_BASE}/get/${endp}${qs}`);
    const res = await api(`${API_BASE}/get/${endp}${qs}`);
    if (res.status === 404) return [];
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
};

export const createItem = async (endp, body) => {
  const res = await post(`${API_BASE}/admin/${endp}`, body);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
};

export const updateItem = async (endp, id, body) => {
  const res = await put(`${API_BASE}/admin/${endp}/${id}`, body);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
};

export const deleteItem = async (endp, id) => {
  const res = await del(`${API_BASE}/admin/${endp}/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return true;
};

// --- Rules helpers (promo_set_rules) ---
export const createRule = (setId, body) =>
  post(`${API_BASE}/admin/promos-sets/${setId}/rule`, body).then(
    async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }
  );

export const deleteRule = async (ruleId) => {
  const res = await del(`${API_BASE}/admin/promos-sets/rule/${ruleId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return true;
};
