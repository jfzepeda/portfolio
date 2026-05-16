/**
 * Lector del JSON de Resultados Admin.
 * Sustituye `importarResultadosAdmin()` del HTML.
 */
export async function parseResultadosAdmin(file) {
  const text = await file.text();
  return JSON.parse(text);
}
