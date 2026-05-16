'use client';

/**
 * Genera Blobs PDF/ZIP del armado de cajas (por ruta, por tienda, o ZIP por tienda).
 * Lazy import de @react-pdf/renderer y jszip para no inflar el bundle inicial.
 */
export async function buildRoutePackingPdf({ ruta, shipments, storeName }) {
  const [{ pdf }, { default: RoutePackingDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./RoutePackingDocument.jsx'),
  ]);
  const doc = pdf(
    <RoutePackingDocument ruta={ruta} shipments={shipments} storeName={storeName} />,
  );
  return doc.toBlob();
}

/** Sanitiza un nombre para usarlo como archivo: quita acentos, espacios y caracteres reservados. */
export function safeFilename(name) {
  if (!name) return 'sin_nombre';
  return String(name)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'sin_nombre';
}

/**
 * Genera un ZIP con un PDF por tienda en `shipments`.
 * `storeNames` es un Map<string, string> con id_tienda → nombre legible (opcional).
 * `onProgress(done, total)` es opcional para reportar avance al UI.
 */
export async function buildStoresZip({ ruta, shipments, storeNames, onProgress }) {
  const [{ pdf }, { default: RoutePackingDocument }, JSZipMod] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./RoutePackingDocument.jsx'),
    import('jszip'),
  ]);
  const JSZip = JSZipMod.default || JSZipMod;
  const zip = new JSZip();

  const total = shipments.length;
  let done = 0;
  for (const shipment of shipments) {
    const id = String(shipment.id_tienda ?? 'sin_id');
    const nombre = storeNames?.get(id) || storeNames?.get(shipment.id_tienda) || '';
    const baseName = nombre ? `${safeFilename(nombre)}_${id}` : `tienda_${id}`;
    const blob = await pdf(
      <RoutePackingDocument ruta={ruta} shipments={shipment} storeName={nombre || id} />,
    ).toBlob();
    zip.file(`${baseName}.pdf`, blob);
    done += 1;
    onProgress?.(done, total);
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
