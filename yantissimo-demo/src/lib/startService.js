import api from "./api.js";
export async function startService({ id, check_in, technician, ramp }) {
  try {
    const response = await api(`/api/events/begin`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        mileage_km: check_in?.mileage_km,
        plate: check_in?.plate,
        check_in,
        technician,
        ramp,
      }),
    });
    if (!response.ok) {
      throw new Error("Error al comenzar evento");
    }
    console.log("Begin event:", response);
    window.showToast("Servicio iniciado");
    window.location.reload(); // MFM usar el estado de eventos
  } catch (error) {
    console.error("Error al comenzar evento:", error);
  }
}
