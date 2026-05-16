'use client';

/**
 * Cache de objetos `icon` para Google Maps. La librería `@react-google-maps/api`
 * compara los props de MarkerF por referencia y reinstancia el overlay nativo
 * si el `icon` cambia. Devolviendo la MISMA referencia (cacheada por color/scale)
 * evitamos cientos de `setIcon` en cada render.
 *
 * Nota: solo se llena al montar el wrapper de Google Maps (window.google existe).
 */

const _cache = new Map();

function _key(parts) {
  return parts.join('|');
}

/** Icon de tienda (círculo). */
export function circleIcon({ color = '#FF6B1A', scale = 6, strokeColor = '#0b0b13' } = {}) {
  if (typeof window === 'undefined' || !window.google?.maps) return undefined;
  const key = _key(['circle', color, scale, strokeColor]);
  let icon = _cache.get(key);
  if (icon) return icon;
  icon = {
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeWeight: 1.2,
    strokeColor,
    scale,
  };
  _cache.set(key, icon);
  return icon;
}

/** Icon de CEDIS (cuadrado grande con borde). */
export function cedisIcon({ color = '#FF6B1A', scale = 9 } = {}) {
  if (typeof window === 'undefined' || !window.google?.maps) return undefined;
  const key = _key(['cedis', color, scale]);
  let icon = _cache.get(key);
  if (icon) return icon;
  icon = {
    path: 'M -1 -1 L 1 -1 L 1 1 L -1 1 Z',
    fillColor: color,
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: '#fff',
    scale,
  };
  _cache.set(key, icon);
  return icon;
}

export function clearIconCache() {
  _cache.clear();
}
