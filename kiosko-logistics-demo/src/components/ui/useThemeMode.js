'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'kiosko_theme';
const DEFAULT_MODE = 'dark';

const ThemeModeContext = createContext(null);

function readInitialMode() {
  if (typeof document === 'undefined') return DEFAULT_MODE;
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark' || attr === 'light') return attr;
  return DEFAULT_MODE;
}

export function ThemeModeProvider({ children }) {
  const [mode, setModeState] = useState(DEFAULT_MODE);

  useEffect(() => {
    setModeState(readInitialMode());
  }, []);

  const apply = useCallback((next) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
    }
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* localStorage bloqueado: ignorar */
      }
    }
    setModeState(next);
  }, []);

  const setMode = useCallback(
    (next) => {
      if (next !== 'dark' && next !== 'light') return;
      apply(next);
    },
    [apply],
  );

  const toggle = useCallback(() => {
    apply(mode === 'dark' ? 'light' : 'dark');
  }, [apply, mode]);

  const value = useMemo(() => ({ mode, setMode, toggle }), [mode, setMode, toggle]);

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const value = useContext(ThemeModeContext);
  if (!value) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return value;
}
