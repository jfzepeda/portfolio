'use client';

/**
 * Lee el valor computado de una CSS variable en runtime.
 * Útil cuando un componente externo (Google Maps, Canvas) necesita
 * un color literal en vez de la string `var(--…)`.
 *
 * Cachea el valor leído para no consultar el DOM en cada llamada.
 * Si el tema cambia (data-theme), llama a `clearCssVarCache()` para refrescar.
 */
const cache = new Map();

export function cssVar(name, fallback = '') {
  if (typeof document === 'undefined') return fallback;
  const key = name;
  if (cache.has(key)) return cache.get(key);
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  cache.set(key, value);
  return value;
}

export function clearCssVarCache() {
  cache.clear();
}
