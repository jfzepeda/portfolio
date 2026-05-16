import api from "~/lib/api";

export async function saveChecks(id, data) {
  /// MFM - Cotejar con el backend
  try {
    const headers = { "Content-Type": "application/json" };
    const response = await api("/api/events/check_out", {
      method: "POST",
      headers,
      body: JSON.stringify({ id, check_out: data }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const result = await response.json();
    console.log("Data saved to check_out:", result);
    window.showToast("Postcheck guardado correctamente");
  } catch (error) {
    console.error("Error saving data to check_out:", error);
  }
  window.location.reload(); // MFM usar el estado de eventos
}
