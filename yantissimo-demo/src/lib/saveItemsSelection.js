import { getAll as getSelected } from "~/lib/quickQuoteStorage.js";
import { put } from "~/lib/api";
import { showLoadingOverlay } from "~/resources/loadigOverlay.jsx";
import { getOrigin } from "~/lib/getOrigin";
// example = { articulo: 'Pirelli P7 205/55R16 91V', price: 1200, exis: 4, id: 123, categoria: 'automovi', almacenes: {sucursal1: 4, sucursal2: 0}, proveedor: 'Yantissimo' }

export default async function SaveSelection(
  cotId,
  route = "/prequotes",
  options = {}
) {
  const idNum = Number(cotId);
  if (!idNum || Number.isNaN(idNum)) return;
  // Coloca un overlay de carga hasta que responda el backend
  const removeOverlay = showLoadingOverlay();
  try {
    const raw = getSelected();
    const normalizedClientType = String(options?.clientType || "")
      .trim()
      .toUpperCase();
    const mappedItems = (raw || []).map((it) => {
      const isDistContado = options?.priceMode === "distContado";
      const isByClientType = options?.priceMode === "byClientType";
      const isService =
        String(it?.categoria || "").toLowerCase() === "servicios";

      let price = Number(it?.price ?? 0);
      if (isDistContado) {
        price = Number(
          it?.contadoDist ??
            it?.contadoVenta ??
            it?.precioContado ??
            it?.price ??
            0
        );
      } else if (isByClientType && !isService) {
        price =
          normalizedClientType === "CONVENIO"
            ? Number(
                it?.precioConvenio ??
                  it?.precioconvenio ??
                  it?.precioContado ??
                  it?.preciocontado ??
                  it?.price ??
                  0
              )
            : Number(it?.precioContado ?? it?.preciocontado ?? it?.price ?? 0);
      }

      const base = {
        article: it.articulo,
        // Precio guardado según el modo de guardado configurado
        price,
        units: Number(it.units ?? 1),
        inventory_id: Number(it.inventory_id ?? it.id ?? 0) || 0,
        categoria: it.categoria || "servicios",
        origin: it.origin ?? getOrigin(it),
        disponibilidad: it.disponibilidad ?? { tiempo: "desconocido" },
      };
      const brand = String(it?.marca ?? it?.brand ?? "").trim();
      if (brand) {
        // Compatibilidad: algunos flujos consumen `marca` y otros `brand`.
        base.marca = brand;
      }
      // Adjuntar service_id si existe (para trazabilidad de servicios)
      if (it.service_id != null) base.service_id = Number(it.service_id);
      return base;
    });
    const payload = { items: mappedItems };
    console.log("Guardando selección de items:", payload);
    const res = await put(`/api${route}/${idNum}`, payload);
    console.log("Respuesta al guardar selección:", res);
    if (!res.ok) throw new Error("No se pudo guardar la selección");
  } catch (e) {
    console.error(e);
    window.showToast("Error al guardar la selección", "error");
  } finally {
    // Quita el overlay independientemente del resultado
    try {
      removeOverlay();
    } catch {}
  }
}
