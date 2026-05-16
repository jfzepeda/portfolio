import api from "~/lib/api";
import { showLoadingOverlay } from "~/resources/loadigOverlay.jsx";

async function duplicateQuote({ quote_id }) {
  const removeOverlay = showLoadingOverlay();
  try {
    const res = await api(`/api/prequotes/duplicate?quote_id=${quote_id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const id = data?.id || data?._id;
    // abrir nueva ventana con la cotización duplicada
    window.open(`/cotizaciones/${id}/pre`, "_blank");

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

export default duplicateQuote;
