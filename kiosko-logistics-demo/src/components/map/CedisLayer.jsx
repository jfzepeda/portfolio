'use client';

import { memo, useMemo } from 'react';
import { MarkerF } from '@react-google-maps/api';
import { cedisIcon } from '@/lib/iconCache';

function CedisLayer({ cedis = [], cedisColorMap = {}, onSelect }) {
  const iconByColor = useMemo(() => {
    const map = new Map();
    for (const c of cedis) {
      const color = cedisColorMap[c.id] || '#FF6B1A';
      if (!map.has(color)) map.set(color, cedisIcon({ color, scale: 9 }));
    }
    return map;
  }, [cedis, cedisColorMap]);

  return (
    <>
      {cedis.map((c) => {
        const color = cedisColorMap[c.id] || '#FF6B1A';
        return (
          <MarkerF
            key={c.id}
            position={{ lat: c.la, lng: c.ln }}
            icon={iconByColor.get(color)}
            title={c.nm}
            onClick={onSelect ? () => onSelect(c) : undefined}
          />
        );
      })}
    </>
  );
}

export default memo(CedisLayer);
