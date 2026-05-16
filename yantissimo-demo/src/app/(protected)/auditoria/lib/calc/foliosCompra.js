/**
 * Parser de la columna M del reporte de auditoría (folios de compra/recepción
 * capturados por el vendedor). Puerto de `parsearFoliosCompra` + helpers del
 * HTML (líneas 5499–5596).
 */

export function folioSufijo(folio) {
  if (!folio) return null;
  const m = String(folio).match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

export function parsearFoliosCompra(colM) {
  if (!colM || !String(colM).trim()) return { entradas: [], vacio: true };
  const norm = String(colM)
    .replace(/[\\/|]/g, ",")
    .replace(/RECEPCION/gi, "REC")
    .replace(/RESEP/gi, "REC")
    .replace(/RECEP/gi, "REC")
    .replace(/\s+/g, " ")
    .trim();
  const partes = norm.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
  const entradas = [];
  let prefijoHeredado = "";
  partes.forEach((parte) => {
    const tokens = parte.split(/\s+/).filter(Boolean);
    const cleanTokens = [];
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      const tNext = tokens[i + 1] || "";
      if (/^[A-Za-z]+\.?$/.test(t) && /^\d+$/.test(tNext)) {
        cleanTokens.push(t.replace(/\.$/, "") + tNext);
        i++;
      } else cleanTokens.push(t);
    }
    cleanTokens.forEach((tk) => {
      if (!tk) return;
      if (/^(SI|NO|S|N|\*|-|\?)$/i.test(tk)) return;
      let esRec = false;
      let tkClean = tk
        .replace(/^REC[.\-\s]+/i, () => { esRec = true; return ""; })
        .replace(/^REC$/i, () => { esRec = true; return ""; });
      if (esRec && !tkClean) {
        entradas.push({ tipo: "REC", prefijo: "", sufijo: null });
        return;
      }
      tkClean = tkClean.replace(/^C0(?=[A-Z])/i, "CO").replace(/[.\-]/g, "").trim();
      const m = tkClean.match(/^([A-Za-z]+)(\d+)$/);
      if (m) {
        prefijoHeredado = m[1].toUpperCase();
        entradas.push({
          tipo: esRec ? "REC" : "COMPRA",
          prefijo: prefijoHeredado,
          sufijo: parseInt(m[2], 10),
        });
        return;
      }
      if (/^\d+$/.test(tkClean) && prefijoHeredado) {
        entradas.push({
          tipo: esRec ? "REC" : "COMPRA",
          prefijo: prefijoHeredado,
          sufijo: parseInt(tkClean, 10),
        });
        return;
      }
      if (/^\d+$/.test(tkClean)) {
        entradas.push({
          tipo: esRec ? "REC" : "COMPRA",
          prefijo: "",
          sufijo: parseInt(tkClean, 10),
        });
      }
    });
  });
  return { entradas, vacio: entradas.length === 0 };
}

export function sufijosCompras(comprasIntegradas = []) {
  const s = new Set();
  comprasIntegradas.forEach((c) => {
    const n = folioSufijo(c.folio);
    if (n !== null) s.add(n);
  });
  return s;
}

export function sufijosRecepciones(recepciones = []) {
  const s = new Set();
  recepciones.forEach((r) => {
    const n = folioSufijo(r.folio);
    if (n !== null) s.add(n);
  });
  return s;
}
