'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Tween numérico con easeOut. Devuelve el número actual interpolado.
 * Respeta prefers-reduced-motion.
 */
export function useAnimatedNumber(target, { duration = 700 } = {}) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const startRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !Number.isFinite(target)) {
      setValue(target);
      return undefined;
    }
    fromRef.current = value;
    startRef.current = performance.now();
    cancelAnimationFrame(rafRef.current);

    const tick = (now) => {
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(fromRef.current + (target - fromRef.current) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}
