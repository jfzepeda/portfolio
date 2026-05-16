/**
 * Helpers de lectura del workbook Excel.
 * Puerto de `cn`, `gc`, `rxl` del HTML (líneas 1077–1113).
 *
 * `rxl(file)` retorna un dict { [row]: { [col]: { col, val } } } para facilitar
 * el puerto 1:1 del parser. Requiere `xlsx` como dependencia NPM.
 */
import * as XLSX from "xlsx";

/** "A" → 1, "Z" → 26, "AA" → 27. */
export function cn(c) {
  let n = 0;
  for (const x of c) n = n * 26 + (x.charCodeAt(0) - 64);
  return n;
}

/** Lee celda por letra de columna. */
export function gc(rd, r, c) {
  return rd[r]?.[cn(c)]?.val || "";
}

/** Excel → dict indexado por fila/columna. */
export async function rxl(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(buf), { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rd = {};
  for (const ref in ws) {
    if (ref[0] === "!") continue;
    const m = ref.match(/^([A-Z]+)(\d+)$/);
    if (!m) continue;
    const col = cn(m[1]);
    const row = parseInt(m[2], 10);
    const cell = ws[ref];
    let val = "";
    if (cell.t === "n") val = String(cell.v);
    else if (cell.t === "s") val = cell.v;
    else if (cell.v !== undefined) val = String(cell.v);
    if (!rd[row]) rd[row] = {};
    rd[row][col] = { col: m[1], val };
  }
  return rd;
}
