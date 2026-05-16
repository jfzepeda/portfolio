import api, { del, post, put } from "~/lib/api";
import { ROLES } from "~/utils/session";

async function parseResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const msg =
      typeof payload === "string" ? payload : payload?.error || "Error";
    throw new Error(msg);
  }

  return payload;
}

const ENDPOINT = "/api/dist";

export async function fetchDistribuidores(endpoint = ENDPOINT) {
  const res = await api(endpoint);
  return parseResponse(res);
}

export async function createDistribuidor(body, endpoint = ENDPOINT) {
  const res = await post(endpoint, body);
  return parseResponse(res);
}

export async function updateDistribuidor(id, body, endpoint = ENDPOINT) {
  const res = await put(`${endpoint}/${id}`, body);
  return parseResponse(res);
}

export async function grantAccessDist(id, body, endpoint = ENDPOINT) {
  const res = await put(`${endpoint}/${id}/grant-access`, body);
  return parseResponse(res);
}

export async function deleteDistribuidor(id, endpoint = ENDPOINT) {
  const res = await del(`${endpoint}/${id}`);
  return parseResponse(res);
}

export async function blockDistribuidor(
  blockTarget,
  action,
  endpoint = ENDPOINT
) {
  if (!blockTarget?.id) return;

  try {
    if (!window.confirm(`${action} distribuidor ${blockTarget.company}?`)) {
      return;
    }
    const res = await put(`${endpoint}/${blockTarget.id}/block`, {
      action,
    });
    const data = await parseResponse(res);
    if (!res.ok) {
      throw new Error("Error al obtener vendedores");
    }
    window.showToast(action + " exitósamente");
    return data;
  } catch (e) {
    window.showToast("Error al bloquear", "error");
  }
}

export const fetchSellers = async (setSellers, sucursal) => {
  try {
    const res = await api(
      `/api/users?role=${ROLES.MYR_SELLER}&sucursal=${sucursal}`
    );
    if (!res.ok) throw new Error("Error al obtener vendedores");
    const data = await res.json();
    setSellers(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Error al obtener vendedores:", err);
    setSellers([]);
  }
};

export const fetchRutas = async (setRutas) => {
  try {
    const res = await api(`/api/rutas`);
    if (!res.ok) throw new Error("Error al obtener rutas");
    const data = await res.json();
    setRutas(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Error al obtener rutas:", err);
    setRutas([]);
  }
};

export const fetchClients = async (setClients) => {
  try {
    const res = await api("/api/dist/list");
    if (!res.ok) throw new Error("Error al obtener clientes myr");
    const data = await res.json();
    setClients(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Error al obtener clientes myr:", err);
    setClients([]);
  }
};
