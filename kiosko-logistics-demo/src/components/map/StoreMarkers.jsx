'use client';

import { memo, useMemo } from 'react';
import { MarkerF } from '@react-google-maps/api';
import { circleIcon } from '@/lib/iconCache';

/**
 * Renderiza un set de markers de tienda. `React.memo` evita re-render cuando
 * `stores` (referencia) y `dim`/`scale` no cambian. El comparator default
 * (shallow) basta porque el padre estabiliza la referencia con `useMemo`.
 */
function StoreMarkers({ stores = [], dim = false, scale = 5, onSelect }) {
  // Pre-resolvemos todos los icons por color (cacheados)
  const iconByColor = useMemo(() => {
    const map = new Map();
    for (const s of stores) {
      if (!map.has(s.color)) {
        map.set(s.color, circleIcon({
          color: s.color,
          scale: dim ? Math.max(2, scale - 2) : scale,
          strokeColor: dim ? 'rgba(0,0,0,0.4)' : '#0b0b13',
        }));
      }
    }
    return map;
  }, [stores, dim, scale]);

  return (
    <>
      {stores.map((s) => (
        <MarkerF
          key={s.key}
          position={s.position}
          icon={iconByColor.get(s.color)}
          onClick={onSelect ? () => onSelect(s.data) : undefined}
        />
      ))}
    </>
  );
}

export default memo(StoreMarkers);
