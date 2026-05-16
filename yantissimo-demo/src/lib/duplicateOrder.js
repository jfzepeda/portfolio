import api from "~/lib/api";
import { showLoadingOverlay } from "~/resources/loadigOverlay.jsx";

async function duplicateOrder({ quote_id }) {
  const removeOverlay = showLoadingOverlay();
  try {
    const res = await api(`/api/orders/duplicate/${quote_id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const id = data?.id || data?._id;
    // abrir nueva ventana con la cotización duplicada
    window.open(`/pedidos/${id}/cartdraft`, "_blank");

    return data;
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error("Error duplicando cotización:", err);
      return null;
    }
  } finally {
    try {
      removeOverlay();
    } catch {}
  }
}

export default duplicateOrder;
