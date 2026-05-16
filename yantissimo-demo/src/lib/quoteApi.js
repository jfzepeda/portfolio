import api, { put } from "~/lib/api";
import { showLoadingOverlay } from "~/resources/loadigOverlay.jsx";

export async function updateStatus({ quote_id, newType }) {
  const payload = {
    id: Number(quote_id),
    type: String(newType || "").trim(),
  };
  const res = await put(`/api/quotes/update`, payload);
  if (!res.ok) {
    window.showToast("No se pudo actualizar el estado de la cotización");
    return null;
  }
  window.showToast("Estado actualizado");
  const json = await res.json();
  const type = json?.type || "unknown";
  return type;
}

export async function fetchCotizar(cotId, ac, clubYantissimo = false) {
  const removeOverlay = showLoadingOverlay();
  try {
    const res = await api(
      `/api/quotes/cotizar?id=${cotId}&clubYantissimo=${clubYantissimo}`,
      {
        signal: ac.signal,
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // console.debug("Quote data:", data);
    // admite {items:[...]} o directamente [...]
    return data;
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error("Error cargando cotización:", err);
      return [];
    }
  } finally {
    removeOverlay();
  }
}

export async function upgradeToQuote(cotId) {
  const removeOverlay = showLoadingOverlay();
  try {
    const res = await api(`/api/prequotes/to-quote?id=${cotId}`);
    if (!res?.ok) {
      throw new Error("No se pudo actualizar la pre-cotización");
    }
    window.showToast("Orden confirmada");
    return true;
  } catch (err) {
    console.error("Error actualizando pre-cotización:", err);
    window.showToast("No se pudo actualizar la pre-cotización", "error");
  } finally {
    removeOverlay();
  }
}

// Aqui hay que poner que se actualice el descuento localmente sin recargar la pagina
export async function overwriteDiscount({ quote_id, itemName, discountHard }) {
  const removeOverlay = showLoadingOverlay();
  try {
    const res = await put(`/api/quotes/overwrite-discount`, {
      quote_id,
      itemName,
      discountHard,
    });
    if (res?.ok) {
      window.showToast("Descuento sobrescrito");
      const data = await res.json().catch(() => null);
      return { ok: true, data };
    } else {
      window.showToast("No se pudo sobrescribir el descuento", "error");
      return { ok: false, error: "No se pudo sobrescribir el descuento" };
    }
  } catch (err) {
    console.error("Error sobrescribiendo descuento:", err);
    return { ok: false, error: err?.message || "Error sobrescribiendo descuento" };
  } finally {
    try {
      removeOverlay();
    } catch {}
  }
}

export async function verifyAvailability({ quote_id }) {
  const removeOverlay = showLoadingOverlay();
  try {
    const res = await api(
      `/api/quotes/verify-availability?quote_id=${quote_id}`
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
