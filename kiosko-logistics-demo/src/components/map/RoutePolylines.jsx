'use client';

import { memo, useMemo } from 'react';
import { PolylineF } from '@react-google-maps/api';

/**
 * Renderiza polylines de rutas con `options` cacheado por color para evitar
 * que el wrapper invoque `setOptions` en cada render.
 */
function RoutePolylines({ routes = [], selectedRouteId, onSelectRoute }) {
  // Cache de options por (color, isSelected)
  const optionsByKey = useMemo(() => {
    const cache = new Map();
    for (const r of routes) {
      const isSel = selectedRouteId === r.id;
      const key = `${r.color}|${isSel}`;
      if (!cache.has(key)) {
        cache.set(key, {
          strokeColor: r.color,
          strokeOpacity: isSel ? 0.95 : 0.6,
          strokeWeight: isSel ? 3.5 : 2,
          zIndex: isSel ? 50 : 10,
          clickable: true,
        });
      }
    }
    return cache;
  }, [routes, selectedRouteId]);

  return (
    <>
      {routes.map((r) => (
        <PolylineF
          key={r.id}
          path={r.path}
          options={optionsByKey.get(`${r.color}|${selectedRouteId === r.id}`)}
          onClick={onSelectRoute ? () => onSelectRoute(r.id) : undefined}
        />
      ))}
    </>
  );
}

export default memo(RoutePolylines);
