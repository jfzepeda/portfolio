export const SUCURSALES = [
  { value: "CONSTITUCION", label: "Constitución" },
  { value: "TECNOLOGICO", label: "Tecnológico" },
  { value: "BENITO JUAREZ", label: "Benito Juárez" },
  { value: "NINOS HEROES", label: "Niños Héroes" },
  { value: "COLINAS", label: "Colinas" },
  { value: "MANZANILLO BLV", label: "Manzanillo Blvd." },
];

export const DEFAULT_SUCURSAL = "CONSTITUCION";
export const APP_VERSION_TAG = "v97";

export const TABS = [
  { id: "conv", label: "Conversión" },
  { id: "marg", label: "Márgenes" },
  { id: "mo", label: "MO" },
  { id: "comp", label: "Compras" },
  { id: "prod", label: "Productividad" },
  { id: "admin", label: "Administrativas" },
  { id: "ll", label: "Llantas" },
  { id: "bit", label: "Bitácora" },
  { id: "corte", label: "Corte" },
  { id: "ov", label: "OV" },
];

/**
 * Tipos de archivo que acepta la pantalla de importación.
 * Puerto de las zonas `za`, `zb`, `zra` del HTML original.
 */
export const IMPORT_KINDS = {
  auditoria: {
    label: "Auditoría (Reporte Integrado)",
    description: "Ventas + productividad del día",
    icon: "📊",
    required: true,
    accept: ".xlsx,.xls",
  },
  bitacora: {
    label: "Bitácora",
    description: "Notificaciones PV",
    icon: "📋",
    required: false,
    accept: ".xlsx,.xls",
  },
  resultadosAdmin: {
    label: "Resultados Admin",
    description: "JSON de revisión de administración",
    icon: "📥",
    required: false,
    accept: ".json,application/json",
  },
};
