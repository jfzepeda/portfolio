/**
 * Cliente de persistencia contra backend — contrato definido en el plan.
 * Endpoints (asumidos) bajo /api/auditoria/* vía src/lib/api.js.
 *
 * Sustituye las funciones `guardarDia`, `cargarDia`, `historial`, `ciclos`,
 * `cfg*` del HTML original (líneas ~5000–8000), que escribían a localStorage.
 *
 * Las lecturas de sesiones ya van contra backend. Las operaciones que aún no
 * tienen contrato quedan como pendientes para no simular persistencia local.
 */

import { fetchSession, fetchSessions } from "../lib/api";

async function pending() {
  throw new Error(
    "Persistencia de auditoría aún no implementada en backend. Ver plan: /api/auditoria/*",
  );
}

export const listarHistorial = async ({ sucursal, mes, anio } = {}) => {
  const now = new Date();
  const rows = await fetchSessions(
    sucursal,
    mes ?? now.getMonth() + 1,
    anio ?? now.getFullYear(),
  );
  return { dias: rows };
};

export const cargarDia = async ({ sucursal, fecha, resultado }) => {
  if (resultado) return { resultado };
  return fetchSession(sucursal, fecha);
};
export const guardarDia = async (_fecha, _snapshot) => pending();
export const eliminarDia = async (_fecha) => pending();
export const cargarCatalogo = async (_tipo) => ({});
export const guardarCatalogo = async (_tipo, _data) => pending();
export const cargarObjetivos = async (_mes) => ({ lineas: [], diasHabiles: 26, diaActual: 1 });
export const guardarObjetivos = async (_mes, _data) => pending();
export const importarResultadosAdmin = async (_json) => pending();
