import api, { getJson, normalizeError, postJson } from "~/lib/api";
import fetchOrders from "~/lib/fetchOrders.js";
import { ROLES } from "~/utils/session";

const buildUrl = (path, params = {}) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    sp.append(key, String(value));
  });
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
};

export const fetchFilters = () => getJson(`/api/dist-insights/filters`);

export const fetchTable = (params) =>
  getJson(`/api/dist-insights/table`, params);

export const exportTable = async (params = {}) => {
  try {
    const res = await api(buildUrl(`/api/dist-insights/export`, params), {
      method: "GET",
    });

    const blob = await res.blob();
    if (!res.ok) {
      throw { status: res.status, message: "Error al exportar" };
    }
    return { blob, headers: res.headers };
  } catch (err) {
    throw normalizeError(err);
  }
};

export async function fetchOrdersFromClient({ company, type = "invoiced" }) {
  try {
    const orders = await fetchOrders({
      profile: { role: ROLES.ADMIN },
      type,
      company,
      searchTerm: null,
      sucursal: null,
    });
    return orders;
  } catch (error) {
    console.error("Error al cargar órdenes para la compañía:", company, error);
    return [];
  }
}

export async function fetchOpenInvoicesByCustomer(customerId) {
  if (!customerId) return [];
  const data = await getJson("/api/invoices", {
    customer_id: customerId,
    only_open: true,
  });

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.invoices)) return data.invoices;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function createPaymentComplement({
  customer_id,
  status = "draft",
  folio_microsip,
}) {
  const payload = {
    customer_id: Number(customer_id),
    status,
  };
  if (folio_microsip?.trim()) payload.folio_microsip = folio_microsip.trim();

  return postJson("/api/invoices/payment-complements", payload);
}

export async function createPaymentComplementApply(complementId, payload) {
  return postJson(
    `/api/invoices/payment-complements/${complementId}/apply`,
    payload
  );
}
