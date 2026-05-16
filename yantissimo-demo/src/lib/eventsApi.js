import api from "~/lib/api";

// Obtiene el evento agendado para una cotización especificando su id
// Devuelve un objeto con: { start_at, end_at, ramp, ... }
export async function fetchEventByQuoteId(quoteId) {
  if (!quoteId) return null;
  try {
    const res = await api(`/api/events/get?id=${encodeURIComponent(quoteId)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res?.ok) return null;
    const data = await res.json();
    return data;
  } catch (_e) {
    return null;
  }
}
