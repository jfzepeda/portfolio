import api, { put } from "~/lib/api";
import { showLoadingOverlay } from "~/resources/loadigOverlay.jsx";

export async function updateStatus({ order_id, newType }) {
  const payload = {
    type: String(newType || "").trim(),
  };
  const res = await put(`/api/orders/${order_id}`, payload);
  if (!res.ok) {
    window.showToast("No se pudo actualizar el estado de la cotización");
    return null;
  }
  window.showToast("Estado actualizado");
  const json = await res.json();
  const type = json?.type || "unknown";
  return type;
}

export async function fetchCotizar(cotId, ac) {
  const removeOverlay = showLoadingOverlay();
  try {
    const res = await api(`/api/orders/cotizar/${cotId}`, {
      signal: ac.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.debug("Quote data:", data);
    // admite {items:[...]} o directamente [...]
    return data;
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error("Error cargando cotización:", err);
      return [];
    }
  } finally {
    try {
      removeOverlay();
    } catch {}
  }
}

export async function sendOrder(cotId) {
  const removeOverlay = showLoadingOverlay();
  try {
    const res = await api(`/api/orders/send/${cotId}`);
    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : await res.text();
    if (res?.ok) {
      return { allowed: true, data };
    }
    return {
      allowed: false,
      message:
        data?.error ||
        data?.message ||
        (typeof data === "string" ? data : "No se pudo enviar"),
    };
  } catch (err) {
    console.error("Error actualizando cartdraft-cotización:", err);
    return { allowed: false, message: err?.message || "Error al enviar" };
  } finally {
    removeOverlay();
  }
}

export async function confirmOrder(cotId, options = {}) {
  const removeOverlay = showLoadingOverlay();
  try {
    const normalizedItems = Array.isArray(options?.items)
      ? options.items
      : [];
    const hasPayload = normalizedItems.length > 0;
    const payload = hasPayload
      ? {
          ...options,
          items: normalizedItems,
        }
      : null;

    let res = null;
    if (payload) {
      res = await put(`/api/orders/confirm/${cotId}`, payload);
      if (res?.status === 404 || res?.status === 405) {
        // Compatibilidad con backend legado que confirmaba por GET.
        res = await api(`/api/orders/confirm/${cotId}`);
      }
    } else {
      res = await api(`/api/orders/confirm/${cotId}`);
    }

    if (!res?.ok) {
      const contentType = res?.headers?.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json().catch(() => null)
        : await res.text().catch(() => "");
      throw new Error(
        data?.error ||
          data?.message ||
          (typeof data === "string" && data.trim()) ||
          "No se pudo confirmar la orden"
      );
    }

    const contentType = res.headers?.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => "");
    window.showToast("Orden confirmada!");
    return { ok: true, data };
  } catch (err) {
    console.error("Error actualizando pre-cotización:", err);
    window.showToast(
      err?.message || "No se pudo confirmar la orden",
      "error"
    );
    return { ok: false, error: err?.message || "No se pudo confirmar la orden" };
  } finally {
    removeOverlay();
  }
}

// Aqui hay que poner que se actualice el descuento localmente sin recargar la pagina
export async function overwriteDiscount({ quote_id, itemName, discountHard }) {
  const removeOverlay = showLoadingOverlay();
  try {
    const res = await put(`/api/orders/overwrite-discount`, {
      quote_id,
      itemName,
      discountHard,
    });
    if (res?.ok) {
      window.showToast("Descuento sobrescrito");
      setTimeout(() => {
        window.location.reload();
      }, 500);
      return true;
    } else {
      window.showToast("No se pudo sobrescribir el descuento", "error");
      return false;
    }
  } catch (err) {
    console.error("Error sobrescribiendo descuento:", err);
    return { allowed: false };
  } finally {
    removeOverlay();
  }
}

export async function verifyAvailability({ quote_id }) {
  const removeOverlay = showLoadingOverlay();
  try {
    const res = await api(
      `/api/orders/verify-availability?quote_id=${quote_id}`
    );
    if (res?.ok) {
      const data = await res.json().catch(() => null);
      window.showToast("Disponibilidad verificada");
      return { ok: true, data };
    } else {
      window.showToast("No se pudo verificar la disponibilidad", "error");
      return { ok: false, error: "No se pudo verificar la disponibilidad" };
    }
  } catch (err) {
    console.error("Error verificando disponibilidad:", err);
    return { ok: false, error: err?.message || "Error verificando disponibilidad" };
  } finally {
    try {
      removeOverlay();
    } catch {}
  }
}
