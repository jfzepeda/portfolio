import api from "~/lib/api";
import { ROLES } from "~/utils/global";

function buildEndpoint({ type, searchTerm, role, company, sucursal, user_id }) {
  const q = new URLSearchParams();

  // Always include common filters
  if (type != null) q.set("type", String(type));
  if (searchTerm != null) q.set("searchTerm", String(searchTerm));

  if (role >= ROLES.ADMIN || role === ROLES.MYR_MANAGER) {
    if (company != null) q.set("company", String(company));
    return `/api/orders/admin?${q.toString()}`;
  }

  if (role === ROLES.MYR_HELPER) {
    if (sucursal != null) q.set("sucursal", String(sucursal));
    return `/api/orders/helper?${q.toString()}`;
  }

  if (role === ROLES.MYR_SELLER) {
    if (user_id != null) q.set("seller_id", String(user_id));
    return `/api/orders/myr?${q.toString()}`;
  }

  if (role <= ROLES.CLIENT_ADMIN) {
    if (user_id != null) q.set("client_id", String(user_id));
    return `/api/orders/client?${q.toString()}`;
  }

  return "";
}

async function fetchOrders({
  profile,
  type,
  searchTerm,
  company,
  sucursal: sucursalOverride,
}) {
  try {
    const role = profile?.role || "";
    const sucursal = (sucursalOverride ?? profile?.sucursal) || "";
    const user_id = profile?.id || "";

    const endpoint = buildEndpoint({
      type,
      searchTerm,
      role,
      company,
      sucursal,
      user_id,
    });
    // console.debug("Fetching orders from:", endpoint);
    if (!endpoint) return [];
    const response = await api(endpoint);
    if (!response.ok) throw new Error("Error al obtener pedidos");

    const data = await response.json();
    const ordersMapped = data.map((q) => ({
      ...q,
      seller: q.seller_name || q.seller || "N/A",
      services:
        typeof q.services === "string" ? JSON.parse(q.services) : q.services,
      items: typeof q.items === "string" ? JSON.parse(q.items) : q.items,
    }));
    console.debug("Orders fetched:", ordersMapped);
    return ordersMapped;
  } catch (error) {
    console.error("Error al cargar órdenes:", error);
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

export default fetchOrders;
