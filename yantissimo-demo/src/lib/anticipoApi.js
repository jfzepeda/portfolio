import { put } from "~/lib/api";
import { showLoadingOverlay } from "~/resources/loadigOverlay.jsx";
// router.put("/anticipo", async (req, res) => {
//     const { id, importe, pay_method, folio_ms } = req.body;

export const generateAnticipo = async ({
  cotId,
  importe,
  pay_method,
  folio_ms,
}) => {
  const removeOverlay = showLoadingOverlay();
  try {
    const res = await put(`/api/ventas/anticipo`, {
      id: cotId,
      importe,
      pay_method,
      folio_ms,
    });
    if (res?.ok) {
      window.showToast("Anticipo generado");
      return true;
    } else {
      window.showToast("No se pudo generar el anticipo", "error");
      return false;
    }
  } catch (err) {
    console.error("Error generando anticipo:", err);
    return false;
  } finally {
    try {
      removeOverlay();
    } catch {}
  }
};
