"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  getAll as qqGetAll,
  add as qqAdd,
  removeById as qqRemoveById,
  toggle as qqToggle,
  setUnits as qqSetUnits,
  setAll as qqSetAll,
  clear as qqClear,
} from "~/lib/quickQuoteStorage.js";

const QuickQuoteContext = createContext(null);

export function QuickQuoteProvider({ children }) {
  const [items, setItems] = useState([]);

  // sync with sessionStorage and window events
  useEffect(() => {
    // initial load
    setItems(qqGetAll());

    const onChanged = (e) => {
      // prefer payload if provided
      const next = e?.detail?.items ?? qqGetAll();
      setItems(Array.isArray(next) ? next : []);
    };
    const onCleared = () => setItems([]);

    if (typeof window !== "undefined") {
      window.addEventListener("yssm:quickquote:changed", onChanged);
      window.addEventListener("yssm:quickquote:cleared", onCleared);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("yssm:quickquote:changed", onChanged);
        window.removeEventListener("yssm:quickquote:cleared", onCleared);
      }
    };
  }, []);

  // action wrappers
  const add = useCallback((item, units) => qqAdd(item, units), []);
  const removeById = useCallback((id) => qqRemoveById(id), []);
  const toggle = useCallback((item, units) => qqToggle(item, units), []);
  const setUnits = useCallback((id, units) => qqSetUnits(id, units), []);
  const setAll = useCallback((arr) => qqSetAll(arr), []);
  const clear = useCallback(() => {
    qqClear();
    // notify explicit clear listeners
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("yssm:quickquote:cleared"));
    }
  }, []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      add,
      removeById,
      toggle,
      setUnits,
      setAll,
      clear,
    }),
    [items, add, removeById, toggle, setUnits, setAll, clear]
  );

  return (
    <QuickQuoteContext.Provider value={value}>
      {children}
    </QuickQuoteContext.Provider>
  );
}

export function useQuickQuote() {
  const ctx = useContext(QuickQuoteContext);
  if (!ctx)
    throw new Error("useQuickQuote must be used within a QuickQuoteProvider");
  return ctx;
}
