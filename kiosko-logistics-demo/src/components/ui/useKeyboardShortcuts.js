'use client';

import { useEffect, useRef } from 'react';

/**
 * Registra atajos de teclado globales. `bindings` es un objeto
 * `{ 'd': () => {...}, '?': () => {...} }` con keys en lowercase.
 *
 * Ignora teclas si el foco está en un input/textarea/contenteditable.
 *
 * Usa un ref para los bindings para que no necesite array de deps:
 * cualquier callback nuevo se aplica en el siguiente keydown.
 */
export function useKeyboardShortcuts(bindings) {
  const ref = useRef(bindings);
  ref.current = bindings;

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handler = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      const tag = (target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;
      const key = event.key.toLowerCase();
      const fn = ref.current?.[key];
      if (fn) {
        event.preventDefault();
        fn(event);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
