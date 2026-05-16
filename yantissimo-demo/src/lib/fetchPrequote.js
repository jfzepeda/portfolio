import { setAll as setQuickItems } from "~/lib/quickQuoteStorage.js";
import api from "~/lib/api";

export default async function fetchAndSetQuoteItems(cotId) {
  const idNum = Number(cotId);
  if (!idNum || Number.isNaN(idNum)) return;
  console.debug("Fetching quote items for ID:", idNum);
  try {
    const res = await api(`/api/prequotes/${idNum}`);
    if (!res.ok) throw new Error("Error al obtener cotización");
    const prequote = await res.json();
    const items = prequote.items;
    if (Array.isArray(items) && items.length > 0) {
      setQuickItems(items);
      return { ...prequote, items };
    }
    return prequote;
  } catch (e) {
    console.error("No se pudieron cargar los items de la cotización:", e);
  }
}
