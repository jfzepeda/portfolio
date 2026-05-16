'use client';

import KioskoMap from '../map/KioskoMap';

/**
 * Wrapper delgado de KioskoMap. La vista Testing pasa props específicas;
 * la lógica del mapa vive en KioskoMap (compartido con /rutas).
 */
export default function TestingMap({ run, cedis, selectedRouteId, hoveredRouteId, onSelectRoute, height = '100%' }) {
  return (
    <KioskoMap
      run={run}
      cedis={cedis}
      selectedRouteId={selectedRouteId}
      hoveredRouteId={hoveredRouteId}
      onSelectRoute={onSelectRoute}
      height={height}
    />
  );
}
