import api, { put, del } from "~/lib/api";

export const fetchLines = async () => {
  const response = await api("/api/services/get/lines");
  if (!response.ok) {
    throw new Error("Failed to fetch lines");
  }
  const data = await response.json();
  // console.debug("Fetched lines:", data);
  return data;
};

export const fetchServices = async () => {
  const response = await api("/api/services/get/services");
  if (!response.ok) {
    throw new Error("Failed to fetch lines");
  }
  const data = await response.json();
  // console.debug("Fetched services:", data);
  return data;
};

export async function saveDiscount(
  line,
  editedDiscounts,
  setSavingLineId,
  setLines,
  setEditedDiscounts
) {
  try {
    const descuentoRaw = editedDiscounts[line.id];
    const descuento =
      descuentoRaw === undefined || descuentoRaw === null
        ? line.descuento
        : descuentoRaw;
    setSavingLineId(line.id);

    const res = await put(`/api/services/admin/lines/${line.id}`, {
      descuento: descuento !== "" ? Number(descuento) : null,
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "No se pudo guardar el descuento");
    }

    // Sincroniza el estado local de líneas
    setLines((prev) =>
      prev.map((l) => (l.id === line.id ? { ...l, descuento } : l))
    );

    // Limpia el borrador para esa línea
    setEditedDiscounts((prev) => {
      const { [line.id]: _omit, ...rest } = prev;
      return rest;
    });

    window.showToast("Descuento guardado");
  } catch (err) {
    window.showToast(err.message || "Error al guardar descuento", "error");
  } finally {
    setSavingLineId(null);
  }
}

export async function saveService(
  service,
  editedPrices,
  editedDiscounts,
  editedIsMo,
  setSavingServiceId,
  setServices,
  setEditedPrices,
  setEditedDiscounts,
  setEditedIsMo
) {
  try {
    const isMoRaw = editedIsMo[service.id];
    const precioRaw = editedPrices[service.id];
    const descuentoRaw = editedDiscounts[service.id];
    const is_mo = isMoRaw === undefined ? Boolean(service.is_mo) : isMoRaw;
    const precio =
      precioRaw === undefined || precioRaw === null
        ? service.precio
        : precioRaw;
    const descuento =
      descuentoRaw === undefined || descuentoRaw === null
        ? service.descuento
        : descuentoRaw;
    setSavingServiceId(service.id);

    const res = await put(`/api/services/admin/services/${service.id}`, {
      is_mo,
      precio: is_mo ? (precio !== "" ? Number(precio) : null) : null,
      descuento: is_mo ? (descuento !== "" ? Number(descuento) : null) : null,
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "No se pudo guardar el precio");
    }

    // Actualiza el estado local de services dentro del mapa por línea
    setServices((prev) => {
      const updated = { ...prev };
      const list = updated[service.linea] || updated[service.line] || [];
      updated[service.linea] = list.map((s) =>
        s.id === service.id ? { ...s, precio, descuento, is_mo } : s
      );
      return updated;
    });

    setEditedPrices((prev) => {
      const { [service.id]: _omit, ...rest } = prev;
      return rest;
    });

    setEditedDiscounts((prev) => {
      const { [service.id]: _omit, ...rest } = prev;
      return rest;
    });

    setEditedIsMo((prev) => {
      const { [service.id]: _omit, ...rest } = prev;
      return rest;
    });

    window.showToast("Servicio actualizado");
  } catch (err) {
    window.showToast(err.message || "Error al guardar servicio", "error");
  } finally {
    setSavingServiceId(null);
  }
}

// router.delete("/admin/services/:id", async (r, s) => {
//   try {
//     await q("DELETE FROM servicios WHERE id=$1", [r.params.id]);
//     s.json({ message: "Servicio eliminado correctamente" });
//   } catch (error) {
//     console.error("Error al eliminar servicio:", error);
//     s.status(500).send("Error al eliminar servicio");
//   }
// });

// funcion para eliminar un servicio
export async function deleteService(serviceId) {
  try {
    const res = await del(`/api/services/admin/services/${serviceId}`);

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "No se pudo eliminar el servicio");
    }

    window.showToast("Servicio eliminado correctamente");
  } catch (err) {
    window.showToast(err.message || "Error al eliminar servicio", "error");
  }
}
