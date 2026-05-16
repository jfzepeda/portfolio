import api from "~/lib/api";

export default async function refreshScrappers() {
  const result = await api(`/api/scrapper/run`);
  if (result.ok) {
    window.showToast("Scrapper iniciado");
  } else {
    window.showToast("Error al iniciar el scrapper", "error");
  }
}
