import api, { post, put } from "~/lib/api";
import { showLoadingOverlay } from "~/resources/loadigOverlay.jsx";

async function parsePayload(res) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json().catch(() => ({}));
  }
  return res.text().catch(() => "");
}

export const facturarOrder = async ({
  id,
  esquema_precio,
  metodo_pago,
  importe_total,
  folio_venta_microsip,
  url_pdf_factura,
  items,
  item_ids,
}) => {
  const removeOverlay = showLoadingOverlay();
  try {
    const payload = {
      esquema_precio,
      metodo_pago,
      importe_total,
      folio_venta_microsip,
      url_pdf_factura,
    };
    if (Array.isArray(items) && items.length) payload.items = items;
    if (Array.isArray(item_ids) && item_ids.length) payload.item_ids = item_ids;

    const res = await put(`/api/orders/facturar/${id}`, payload);

    const data = await parsePayload(res);
    if (!res.ok) {
      const errorMsg =
        typeof data === "string"
          ? data
          : data?.error || data?.message || "No se pudo facturar";
      window.showToast(errorMsg, "error");
      return { ok: false, error: errorMsg, data, status: res.status };
    }

    window.showToast("Factura guardada");
    return { ok: true, data, status: res.status };
  } catch (err) {
    console.error("Error facturando pedido:", err);
    const errorMsg = err?.message || "Error al guardar facturación";
    window.showToast(errorMsg, "error");
    return { ok: false, error: errorMsg, status: 0 };
  } finally {
    removeOverlay();
  }
};

const normalizeInvoices = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.invoices)) return data.invoices;
  if (Array.isArray(data?.data)) return data.data;
  if (data && typeof data === "object") return [data];
  return [];
};

export async function fetchInvoice(orderId, options = {}) {
  const { showOverlay = true } = options;
  const removeOverlay = showOverlay ? showLoadingOverlay() : () => {};
  try {
    const res = await api(`/api/invoices/${orderId}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error cargando factura:", err);
    window.showToast("Error al cargar factura", "error");
    return null;
  } finally {
    removeOverlay();
  }
}

export async function fetchOrderInvoices(orderId, options = {}) {
  if (!orderId) return [];
  const { showOverlay = true } = options;
  const removeOverlay = showOverlay ? showLoadingOverlay() : () => {};
  try {
    const res = await api(`/api/invoices?quote_id=${orderId}`);
    if (res.status === 404) return [];
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return normalizeInvoices(data);
  } catch (err) {
    console.error("Error cargando facturas del pedido:", err);
    window.showToast("Error al cargar facturas del pedido", "error");
    return [];
  } finally {
    removeOverlay();
  }
}

export async function downloadInvoice(orderId) {
  const removeOverlay = showLoadingOverlay();
  try {
    const res = await api(`/api/backblaze/download/${orderId}/facturas`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // Nombre desde header (si el backend lo manda)
    const dispo = res.headers.get("content-disposition") || "";
    const match = dispo.match(/filename\*?=(?:UTF-8'')?("?)([^";]+)\1/i);
    const filename = match
      ? decodeURIComponent(match[2])
      : `factura-${orderId}`;

    const blob = await res.blob();

    // Dispara descarga
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    return true;
  } catch (err) {
    console.error("Error descargando factura:", err);
    window.showToast("Error al descargar factura", "error");
    return null;
  } finally {
    removeOverlay();
  }
}

const normalizePayments = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.payments)) return data.payments;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export async function fetchInvoicePayments(invoiceId, options = {}) {
  if (!invoiceId) return [];
  const { showOverlay = true } = options;

  const removeOverlay = showOverlay ? showLoadingOverlay() : () => {};
  try {
    const res = await api(`/api/invoices/${invoiceId}/payments`);
    if (res.status === 404) return [];
    const data = await parsePayload(res);

    if (!res.ok) {
      const errorMsg =
        typeof data === "string"
          ? data
          : data?.error || data?.message || "Error al cargar pagos";
      throw new Error(errorMsg);
    }

    return normalizePayments(data);
  } catch (err) {
    console.error("Error cargando pagos de factura:", err);
    window.showToast(err?.message || "Error al cargar pagos", "error");
    return [];
  } finally {
    removeOverlay();
  }
}

export async function createInvoicePayment(invoiceId, payload) {
  if (!invoiceId) {
    return { ok: false, error: "Falta id de factura", status: 0 };
  }

  const removeOverlay = showLoadingOverlay();
  try {
    const res = await post(`/api/invoices/${invoiceId}/payments`, payload);
    const data = await parsePayload(res);

    if (!res.ok) {
      const errorMsg =
        typeof data === "string"
          ? data
          : data?.error || data?.message || "No se pudo registrar el pago";
      window.showToast(errorMsg, "error");
      return { ok: false, error: errorMsg, data, status: res.status };
    }

    window.showToast("Pago registrado");
    return { ok: true, data, status: res.status };
  } catch (err) {
    console.error("Error registrando pago de factura:", err);
    const errorMsg = err?.message || "Error al registrar pago";
    window.showToast(errorMsg, "error");
    return { ok: false, error: errorMsg, status: 0 };
  } finally {
    removeOverlay();
  }
}

export async function reconcileInvoice(invoiceId) {
  if (!invoiceId) {
    return { ok: false, error: "Falta id de factura", status: 0 };
  }

  const removeOverlay = showLoadingOverlay();
  try {
    const res = await post(`/api/invoices/${invoiceId}/reconcile`, {});
    const data = await parsePayload(res);

    if (!res.ok) {
      const errorMsg =
        typeof data === "string"
          ? data
          : data?.error || data?.message || "No se pudo reconciliar factura";
      window.showToast(errorMsg, "error");
      return { ok: false, error: errorMsg, data, status: res.status };
    }

    window.showToast("Factura reconciliada");
    return { ok: true, data, status: res.status };
  } catch (err) {
    console.error("Error reconciliando factura:", err);
    const errorMsg = err?.message || "Error al reconciliar factura";
    window.showToast(errorMsg, "error");
    return { ok: false, error: errorMsg, status: 0 };
  } finally {
    removeOverlay();
  }
}
