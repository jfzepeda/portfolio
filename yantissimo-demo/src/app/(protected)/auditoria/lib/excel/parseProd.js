/**
 * Parser legacy de Productividad. Puerto del HTML líneas 3145–3164.
 */
import { rxl, gc } from "../utils/cells";

export async function parseProd(file) {
  const rd = await rxl(file);
  return parseProdRd(rd);
}

export function parseProdRd(rd) {
  const rows = Object.keys(rd).map(Number).sort((a, b) => a - b);
  const result = { vendedores: [], tecnicos: [] };
  let current = null;
  let tipo = null;
  for (const rn of rows) {
    const a = gc(rd, rn, "A").trim();
    const c = gc(rd, rn, "C").trim();
    const i = parseFloat(gc(rd, rn, "I")) || 0;
    if (a && !c && !a.match(/^\d/)) {
      const isTec = a.startsWith("T ");
      tipo = isTec ? "tecnicos" : "vendedores";
      current = { nombre: a, lineas: [] };
      result[tipo].push(current);
    } else if (c && current) {
      current.lineas.push({ linea: c, uds: i });
    }
  }
  result.vendedores = result.vendedores.filter((v) => v.lineas.some((l) => l.uds > 0));
  result.tecnicos = result.tecnicos.filter((t) => t.lineas.some((l) => l.uds > 0));
  return result;
}
