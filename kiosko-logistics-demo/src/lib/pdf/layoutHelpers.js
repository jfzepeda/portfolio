/**
 * Helpers puros para el layout de los PDFs de packing.
 */

/** Agrupa los placements de una caja por `layer_idx`. */
export function groupByLayer(box) {
  const layers = new Map();
  for (const p of box.placements || []) {
    const idx = Number(p.layer_idx ?? 0);
    if (!layers.has(idx)) layers.set(idx, []);
    layers.get(idx).push(p);
  }
  return [...layers.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([layer_idx, placements]) => ({ layer_idx, placements }));
}

/** Calcula factor de escala para que (w, d) cms entren en (W, H) pts. */
export function scaleToFit(boxDims, canvas) {
  const [w, , d] = boxDims; // length, height, depth → usamos planta (w × d)
  const sx = canvas.width / w;
  const sy = canvas.height / d;
  return Math.min(sx, sy);
}

/** Trunca texto a un número aproximado de caracteres por ancho. */
export function truncateText(text, maxChars) {
  if (!text) return '';
  if (text.length <= maxChars) return text;
  return text.slice(0, Math.max(1, maxChars - 1)) + '…';
}

/** Devuelve color de texto contrastante para un color hex. */
export function colorContrastText(hex) {
  if (!hex || typeof hex !== 'string') return '#000';
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  if (full.length !== 6) return '#000';
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.6 ? '#1a1a1a' : '#ffffff';
}

/** Calcula el font-size de un nombre dentro de un rectángulo. */
export function autoFontSize(rectW, rectH, textLen, base = 9) {
  const byWidth = rectW / Math.max(3, textLen) * 1.6;
  const byHeight = rectH * 0.45;
  const px = Math.min(byWidth, byHeight, 12);
  return Math.max(5, Math.min(base, px));
}

/** Resumen del shipment: nº cajas, fill promedio. */
export function summarizeShipment(shipment) {
  const boxes = shipment.boxes || [];
  if (!boxes.length) return { nBoxes: 0, avgFill: 0 };
  const sumFill = boxes.reduce((s, b) => s + (b.fill_pct || 0), 0);
  return { nBoxes: boxes.length, avgFill: sumFill / boxes.length };
}
