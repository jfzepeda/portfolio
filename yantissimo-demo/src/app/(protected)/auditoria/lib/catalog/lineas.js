/**
 * Catálogo de líneas y labels. Puerto de HTML líneas 4997–5003 + `mapL` 3131–3139.
 */
import { nm } from "../utils/format";

/** Objetivo de servicios por cada 10 clientes atendidos. */
export const OX10 = {
  ALINEACION: 5,
  FRENOS: 2,
  SUSPENSION: 5,
  AFINACION: 2,
  PAQUETES: 1.5,
  AMORTIGUADORES: 2,
  "CLUB YANTISSIMO": 4,
};

export const LBL = {
  ALINEACION: "Alineación",
  FRENOS: "Frenos",
  SUSPENSION: "Suspensión",
  AFINACION: "Afinación",
  PAQUETES: "Paquetes",
  AMORTIGUADORES: "Amortiguadores",
  "CLUB YANTISSIMO": "Club Yantissimo",
  MBVYN: "MBVYN",
  VARIOS: "Otros",
  LLANTAS: "Llantas",
};

export const LINEAS_ORD = [
  "ALINEACION",
  "FRENOS",
  "SUSPENSION",
  "AFINACION",
  "PAQUETES",
  "AMORTIGUADORES",
  "CLUB YANTISSIMO",
  "VARIOS",
];

export const LINEAS_ORD_PROD = [
  "ALINEACION",
  "FRENOS",
  "SUSPENSION",
  "AFINACION",
  "PAQUETES",
  "AMORTIGUADORES",
  "CLUB YANTISSIMO",
  "LLANTAS",
];

export const LINEAS_ORD_TEC = [
  "ALINEACION",
  "FRENOS",
  "SUSPENSION",
  "AFINACION",
  "PAQUETES",
  "AMORTIGUADORES",
  "LLANTAS",
];

/** Normaliza texto de línea de Microsip a clave canónica. */
export function mapL(l) {
  const x = nm(l);
  if (
    x.includes("LLANTA") ||
    x.includes("AUTO") ||
    x.includes("CAMIONETA") ||
    x.includes("SUV") ||
    x.includes("CAMION") ||
    x.includes("MOTO")
  )
    return "LLANTAS";
  if (x.includes("ALINEAC")) return "ALINEACION";
  if (x.includes("FRENO")) return "FRENOS";
  if (x.includes("SUSPEN")) return "SUSPENSION";
  if (x.includes("AFINA")) return "AFINACION";
  if (x.includes("PAQUETE")) return "PAQUETES";
  if (x.includes("AMORTI")) return "AMORTIGUADORES";
  if (x.includes("CLUB") || x.includes("YANTIS")) return "CLUB YANTISSIMO";
  if (x.includes("MBVYN")) return "MBVYN";
  return "VARIOS";
}
