import api from "~/lib/api";
import { showLoadingOverlay } from "~/resources/loadigOverlay.jsx";

export async function createCart({ quote_id }) {
  const removeOverlay = showLoadingOverlay();
  try {
    const res = await api(`/api/yaol/cart/${quote_id}`);
    if (!res?.ok) {
      throw new Error("No se pudo crear el carrito");
    }
    const data = await res.json();
    window.showToast("Carrito creado");
    return data;
  } catch (err) {
    console.error("Error creando carrito:", err);
    window.showToast("No se pudo crear el carrito", "error");
    return null;
  } finally {
    removeOverlay();
  }
}

export async function createCartByPhone({ phone }) {
  const removeOverlay = showLoadingOverlay();
  try {
    const res = await api(`/api/yaol/cart-by-phone/${phone}`);
    if (!res?.ok) {
      throw new Error("No se pudo crear el carrito");
    }
    const data = await res.json();
    window.showToast("Carrito creado");
    return data;
  } catch (err) {
    console.error("Error creando carrito:", err);
    window.showToast("No se pudo crear el carrito", "error");
    return null;
  } finally {
    removeOverlay();
  }
}
