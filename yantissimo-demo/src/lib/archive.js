import { put } from "~/lib/api";

export async function archiveEvent(quote, endpoint = "prequotes") {
  const payload = {
    type: "archived",
  };
  try {
    const response = await put(`/api/${endpoint}/${quote.id}`, payload);

    if (!response.ok) {
      throw new Error("Error al archivar evento");
    }
    const updatedEvent = { ...quote, type: payload.type };
    return updatedEvent;
  } catch (error) {
    console.error("Error al archivar evento:", error);
  }
}

export async function unarchiveEvent(quote, endpoint = "prequotes") {
  const payload = {
    type: endpoint === "prequotes" ? "prequote" : "cartdraft",
  };
  try {
    const response = await put(`/api/${endpoint}/${quote.id}`, payload);

    if (!response.ok) {
      throw new Error("Error al desarchivar evento");
    }
    const updatedEvent = { ...quote, type: payload.type };
    return updatedEvent;
  } catch (error) {
    console.error("Error al archivar evento:", error);
  }
}
