import { useCallback, useEffect, useRef, useState } from "react";

export function useQuoteItems({
  cotId,
  quoteType,
  fetchItems,
  onPrequoteUpgrade,
  upgradeTypes = "prequote",
  clubYantissimo,
}) {
  const [items, setItems] = useState([]);
  const acRef = useRef(null);

  const loadItems = useCallback(
    async ({ cotIdOverride, controller, clubYantissimoOverride } = {}) => {
      const effectiveCotId = cotIdOverride ?? cotId;
      const effectiveClub = clubYantissimoOverride ?? clubYantissimo;
      if (!effectiveCotId || typeof fetchItems !== "function") return [];

      const requestController = controller || new AbortController();
      const res = await fetchItems(effectiveCotId, requestController, effectiveClub);
      const nextItems = Array.isArray(res) ? res : res?.items || [];
      setItems(nextItems);
      return nextItems;
    },
    [cotId, clubYantissimo, fetchItems]
  );

  const refreshItems = useCallback(async () => {
    try {
      return await loadItems();
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("Error refrescando cotización:", err);
      }
      return [];
    }
  }, [loadItems]);

  useEffect(() => {
    if (!cotId) return;

    // cancel previous request if cotId / quoteType / clubYantissimo change or unmount
    if (acRef.current) acRef.current.abort();
    const ac = new AbortController();
    acRef.current = ac;

    (async () => {
      if (
        quoteType === upgradeTypes ||
        (Array.isArray(upgradeTypes) && upgradeTypes.includes(quoteType))
      ) {
        if (typeof onPrequoteUpgrade === "function") {
          const success = await onPrequoteUpgrade(cotId);
          if (success) {
            // recargar items después de upgrade
            const nextItems = await loadItems({ controller: ac });
            console.debug("Cotización cargada:", nextItems);
          }
        }
      } else {
        const nextItems = await loadItems({ controller: ac });
        console.debug("Cotización cargada:", nextItems);
      }
    })();

    return () => ac.abort();
  }, [
    cotId,
    quoteType,
    upgradeTypes,
    clubYantissimo,
    loadItems,
    onPrequoteUpgrade,
  ]);

  return { items, setItems, refreshItems };
}
