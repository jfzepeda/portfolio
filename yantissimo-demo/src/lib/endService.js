import api from "./api.js";
export async function endService(id, check_out) {
  if (!check_out) {
    window.showToast(
      "No se puede finalizar el servicio sin haber realizado la revisión final"
    );
    return;
  }
  try {
    const response = await api(`/api/events/finish`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      throw new Error("Error al finalizar evento");
    }
    window.showToast("Servicio finalizado");
    console.log("Finish event:", response);
    window.location.reload(); // MFM usar el estado de eventos
  } catch (error) {
    console.error("Error al finalizar evento:", error);
  }
}
