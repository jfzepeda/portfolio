/**
 * Parser legacy del reporte de Márgenes (formato anterior al reporte integrado).
 * Puerto pendiente del HTML líneas 3098–3129. No es necesario cuando el cliente
 * carga el reporte integrado `rdA` — la lógica vive en `parseAuditoria`.
 */
export async function parseMargen(/* file */) {
  throw new Error(
    "parseMargen: port pendiente (formato legacy; use parseAuditoria con reporte integrado).",
  );
}
