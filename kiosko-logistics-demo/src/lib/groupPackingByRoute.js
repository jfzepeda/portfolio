'use client';

/**
 * Une el output del VRP con el output de packing por `id_tienda` (normalizado a string).
 * El packing es por tienda; el VRP agrupa tiendas en rutas. El join vive en el cliente
 * para mantener desacoplados los dos servicios.
 */
export function buildStoreToRouteMap(vrpResult) {
  const map = new Map();
  if (!vrpResult) return map;
  // Soporta canónico Solution (routes[].sequence[].store_id) y legacy (rutas[].tiendas[].id_tienda)
  const routes = vrpResult.routes || vrpResult.rutas || [];
  for (const r of routes) {
    const routeId = r.route_id || r.ruta_id;
    const stops = r.sequence || r.tiendas || [];
    for (const s of stops) {
      const sid = String(s.store_id ?? s.id_tienda);
      map.set(sid, routeId);
    }
  }
  return map;
}

export function groupPackingByRoute(vrpResult, packingResult) {
  const storeToRoute = buildStoreToRouteMap(vrpResult);
  const groups = new Map();
  for (const shipment of packingResult?.shipments || []) {
    const sid = String(shipment.id_tienda);
    const routeId = storeToRoute.get(sid) || '_sin_ruta';
    if (!groups.has(routeId)) {
      groups.set(routeId, { routeId, shipments: [], totalBoxes: 0, sumFill: 0 });
    }
    const g = groups.get(routeId);
    g.shipments.push(shipment);
    g.totalBoxes += shipment.boxes?.length || 0;
    g.sumFill += (shipment.boxes || []).reduce((s, b) => s + (b.fill_pct || 0), 0);
  }
  return [...groups.values()].map((g) => ({
    ...g,
    avgFill: g.totalBoxes ? g.sumFill / g.totalBoxes : 0,
  }));
}
