import { setAll as setQuickItems } from "~/lib/quickQuoteStorage.js";
import api from "~/lib/api";

export default async function fetchAndSetOrderItems(cotId) {
  const idNum = Number(cotId);
  if (!idNum || Number.isNaN(idNum)) return;
  console.debug("Fetching quote items for ID:", idNum);
  try {
    const res = await api(`/api/orders/${idNum}`);
    if (!res.ok) throw new Error("Error al obtener el pedido");
    const order = await res.json();
    const items = order.items;
    if (Array.isArray(items) && items.length > 0) {
      setQuickItems(items);
      return { ...order, items };
    }
    return order;
  } catch (e) {
    console.error("No se pudieron cargar los items del pedido:", e);
    window.showToast("Error cargando los items del pedido", "error");
    return null;
  }
}
