import api from "~/lib/api";
import dayjs from "dayjs";
import { ROLES } from "~/utils/global";

function buildEndpoint({ type, searchTerm, role, user_id }) {
  const q = new URLSearchParams();

  // Always include common filters
  if (type != null) q.set("type", String(type));
  if (searchTerm != null) q.set("searchTerm", String(searchTerm));

  if (role === ROLES.MYR_SELLER) {
    if (user_id != null) q.set("seller_id", String(user_id));
    return `/api/orders/preorder?${q.toString()}`;
  }

  return "";
}

async function fetchPreorders({ profile, type, searchTerm }) {
  try {
    const role = profile?.role || "";
    const user_id = profile?.id || "";

    const endpoint = buildEndpoint({
      type,
      searchTerm,
      role,
      user_id,
    });
    console.log("Fetching orders from:", endpoint);
    if (!endpoint) return [];
    const response = await api(endpoint);
    if (!response.ok) throw new Error("Error al obtener pedidos");

    const data = await response.json();
    const quotesMapped = data.map((q) => ({
      ...q,
      start: q.start ? dayjs(q.start) : null,
      end: q.end_date ? dayjs(q.end_date) : null,
      seller: q.seller_name || q.seller || "N/A",
      services:
        typeof q.services === "string" ? JSON.parse(q.services) : q.services,
      items: typeof q.items === "string" ? JSON.parse(q.items) : q.items,
    }));
    return quotesMapped;
  } catch (error) {
    console.error("Error al cargar cotizaciones:", error);
    return [];
  }
}

export async function fetchDistribuidores() {
  const res = await api("/api/dist");
  if (!res.ok) {
    throw new Error("Error al obtener cotizaciones");
  }
  const data = await res.json();
  // console.log("Distribuidores fetched:", data);
  return data;
}

export default fetchPreorders;
