import api, { put } from "~/lib/api";

export async function fetchExis(debouncedTerm, stockType) {
  try {
    const encoded = encodeURIComponent(debouncedTerm);
    const endpoint = `/api/inv/exis?searchTerm=${encoded}&stockType=${stockType}`;
    const response = await api(endpoint);
    if (!response.ok) throw new Error("Error al obtener existencias");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al cargar existencias:", error);
    window.showToast("Error al cargar existencias", "error");
  }
}

export async function updateItem(inv_id, costo) {
  try {
    const endpoint = `/api/inv/cost/${inv_id}`;
    const response = await put(endpoint, { costo });
    if (!response.ok) throw new Error("Error al actualizar existencias");
    window.showToast("Costo actualizado");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al cargar existencias:", error);
    window.showToast("Error al cargar existencias", "error");
  }
}
