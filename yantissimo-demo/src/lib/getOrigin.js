import { BRANCH_LABELS } from "~/utils/global.js";
import { getUserProfile } from "~/utils/session.js";

export const getOrigin = (item) => {
  // Servicios: por defecto "Faltante"; si ya se eligió proveedor, usarlo
  if (item?.categoria === "servicios") {
    return item?.proveedor || "Faltante";
  }
  // Normaliza almacenes para evitar accesos a undefined
  const almacenes =
    item && typeof item.almacenes === "object" && item.almacenes
      ? item.almacenes
      : {};

  if (item?.proveedor === "Yantissimo") {
    const curSuc = getUserProfile()?.sucursal;
    const needed = Math.max(1, Number(item?.units) || 1);
    const hasCur = Number(almacenes?.[curSuc]) || 0;
    if (hasCur >= needed) return curSuc;

    // Para cada sucursal, ver si hay stock suficiente en otra
    for (const suc of Object.keys(BRANCH_LABELS)) {
      if (suc === curSuc) continue;
      const have = Number(almacenes?.[suc]) || 0;
      if (have >= needed) return suc;
    }

    // Fallback razonable si no hay stock suficiente identificado
    return curSuc || "Yantissimo";
  } else if (item?.proveedor) {
    return item.proveedor;
  }
  return "desconocido";
};
