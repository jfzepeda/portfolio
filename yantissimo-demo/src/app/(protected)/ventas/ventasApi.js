import api, { postJson } from "~/lib/api";

const TRUE_TOKENS = new Set(["1", "true", "yes", "si", "sí"]);
const FALSE_TOKENS = new Set(["0", "false", "no"]);

const appendBooleanParam = (params, key, value) => {
  if (value === undefined || value === null || value === "") return;

  if (typeof value === "boolean") {
    params.append(key, value ? "true" : "false");
    return;
  }

  const token = String(value).trim().toLowerCase();
  if (TRUE_TOKENS.has(token)) params.append(key, "true");
  if (FALSE_TOKENS.has(token)) params.append(key, "false");
};

const normalizeCustomers = (data) => {
  const rawCustomers = Array.isArray(data?.customers)
    ? data.customers
    : Array.isArray(data?.clientes)
    ? data.clientes
    : [];

  return rawCustomers
    .map((customer) => {
      if (typeof customer === "string") {
        return { id: customer, name: customer };
      }
      if (!customer || typeof customer !== "object") return null;

      const id =
        customer.id ?? customer.customer_id ?? customer.value ?? customer.name;
      const name =
        customer.name ??
        customer.display_name ??
        customer.label ??
        String(id ?? "");

      if (id === undefined || id === null || !String(name).trim()) return null;
      return { id, name: String(name).trim() };
    })
    .filter(Boolean);
};

const normalizeInvoiceFilters = (data = {}) => ({
  ...data,
  sellers: Array.isArray(data?.sellers) ? data.sellers : [],
  customers: normalizeCustomers(data),
});

export async function getInvoices({
  sucursal,
  seller,
  seller_id,
  cliente,
  customer_id,
  quote_id,
  order_id,
  searchTerm,
  status,
  only_open,
  overdue,
} = {}) {
  const params = new URLSearchParams();

  if (sucursal?.trim()) params.append("sucursal", sucursal.trim());
  if (seller_id) params.append("seller_id", String(seller_id));
  if (!seller_id && seller) params.append("seller", String(seller));
  if (customer_id) params.append("customer_id", String(customer_id));
  if (!customer_id && cliente) params.append("cliente", String(cliente));
  if (quote_id) params.append("quote_id", String(quote_id));
  if (order_id) params.append("order_id", String(order_id));
  if (status) params.append("status", String(status));
  appendBooleanParam(params, "only_open", only_open);
  appendBooleanParam(params, "overdue", overdue);
  if (searchTerm?.trim()) params.append("searchTerm", searchTerm.trim());

  const url = `/api/invoices?${params.toString()}`;
  const res = await api(url);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Error al obtener facturas");
  }
  const data = await res.json();

  const normalizedRows = Array.isArray(data)
    ? data
    : Array.isArray(data?.invoices)
    ? data.invoices
    : Array.isArray(data?.data)
    ? data.data
    : [];

  console.log("Fetched invoices:", normalizedRows);
  return normalizedRows;
}

export async function getFilters() {
  const res = await api("/api/invoices/filters");

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Error al obtener facturas");
  }

  const data = await res.json();
  return normalizeInvoiceFilters(data);
}

// Compatibilidad temporal con el nombre anterior.
export const getFilers = getFilters;

export async function getOpenInvoicesByCustomer(customerId) {
  if (!customerId) return [];
  return getInvoices({
    customer_id: customerId,
    only_open: true,
  });
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
