"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { COLUMN_PREFS_PREFIX } from "./constants";

/**
 * Reads persisted column preferences from localStorage (once, at mount).
 * Supports legacy visibility-only payloads.
 */
function readFromStorage(tableId) {
  if (!tableId || typeof window === "undefined") return EMPTY_PREFS;
  try {
    const raw = localStorage.getItem(`${COLUMN_PREFS_PREFIX}${tableId}`);
    if (!raw) return EMPTY_PREFS;
    const parsed = JSON.parse(raw);
    if (parsed?.v === 2) {
      return {
        hidden: Array.isArray(parsed.hidden) ? parsed.hidden : [],
        order: Array.isArray(parsed.order) ? parsed.order : [],
      };
    }
    if (parsed?.v === 1 && Array.isArray(parsed.hidden)) {
      return { hidden: parsed.hidden, order: [] };
    }
    return EMPTY_PREFS;
  } catch {
    return EMPTY_PREFS;
  }
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

function getCustomizableColumns(columns, userRole) {
  return columns.filter((col) => {
    if (col.sticky) return false;
    if (col.key === "__actions__") return false;
    if (col.hidden) return false;
    if (col.minRole != null && (userRole == null || userRole < col.minRole))
      return false;
    if (typeof col.visible === "function" && !col.visible(userRole))
      return false;
    return true;
  });
}

function resolveOrder(orderKeys, currentKeys) {
  const currentKeySet = new Set(currentKeys);
  const uniqueKnownKeys = orderKeys.filter(
    (key, index) => currentKeySet.has(key) && orderKeys.indexOf(key) === index,
  );

  return [
    ...uniqueKnownKeys,
    ...currentKeys.filter((key) => !uniqueKnownKeys.includes(key)),
  ];
}

function reorderKeys(keys, sourceKey, targetKey) {
  if (!sourceKey || !targetKey || sourceKey === targetKey) return keys;

  const nextKeys = [...keys];
  const sourceIndex = nextKeys.indexOf(sourceKey);
  const targetIndex = nextKeys.indexOf(targetKey);

  if (sourceIndex === -1 || targetIndex === -1) return keys;

  const [movedKey] = nextKeys.splice(sourceIndex, 1);
  nextKeys.splice(targetIndex, 0, movedKey);
  return nextKeys;
}

/**
 * Hook that manages user column visibility and order preferences backed by
 * localStorage.
 *
 * When `tableId` is falsy the feature is disabled — returns an empty set and no-ops.
 */
export default function useColumnPreferences(tableId, columns, userRole) {
  const [hiddenKeys, setHiddenKeys] = useState(
    () => readFromStorage(tableId).hidden,
  );
  const [orderedKeys, setOrderedKeys] = useState(
    () => readFromStorage(tableId).order,
  );

  const customizableColumns = useMemo(
    () => getCustomizableColumns(columns, userRole),
    [columns, userRole],
  );
  const customizableKeys = useMemo(
    () => customizableColumns.map((col) => col.key),
    [customizableColumns],
  );
  const resolvedOrder = useMemo(
    () => resolveOrder(orderedKeys, customizableKeys),
    [orderedKeys, customizableKeys],
  );

  useEffect(() => {
    const nextPrefs = readFromStorage(tableId);
    setHiddenKeys(nextPrefs.hidden);
    setOrderedKeys(nextPrefs.order);
  }, [tableId]);

  useEffect(() => {
    if (!tableId) return;
    setOrderedKeys((prev) => {
      const next = resolveOrder(prev, customizableKeys);
      return arraysEqual(prev, next) ? prev : next;
    });
  }, [tableId, customizableKeys]);

  // Persist to localStorage whenever preferences change
  useEffect(() => {
    if (!tableId || typeof window === "undefined") return;
    try {
      localStorage.setItem(
        `${COLUMN_PREFS_PREFIX}${tableId}`,
        JSON.stringify({ v: 2, hidden: hiddenKeys, order: resolvedOrder }),
      );
    } catch {
      // quota exceeded or restricted — silent fail
    }
  }, [tableId, hiddenKeys, resolvedOrder]);

  // Stable Set for fast lookups in visibleColumns filter
  const hiddenByUser = useMemo(() => new Set(hiddenKeys), [hiddenKeys]);

  // Columns the user is allowed to customize (excludes sticky, actions, role-blocked)
  const availableColumns = useMemo(
    () => {
      const byKey = new Map(customizableColumns.map((col) => [col.key, col]));
      return resolvedOrder.map((key) => byKey.get(key)).filter(Boolean);
    },
    [customizableColumns, resolvedOrder],
  );

  const orderedColumns = useMemo(() => {
    const orderedQueue = [...availableColumns];
    const customizableKeySet = new Set(customizableKeys);

    return columns.map((col) =>
      customizableKeySet.has(col.key) ? orderedQueue.shift() || col : col,
    );
  }, [columns, availableColumns, customizableKeys]);

  const toggleColumn = useCallback((key) => {
    setHiddenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  const moveColumn = useCallback(
    (sourceKey, targetKey) => {
      setOrderedKeys((prev) =>
        reorderKeys(resolveOrder(prev, customizableKeys), sourceKey, targetKey),
      );
    },
    [customizableKeys],
  );

  const resetToDefaults = useCallback(() => {
    setHiddenKeys([]);
    setOrderedKeys([]);
  }, []);

  // Disabled when no tableId
  if (!tableId) {
    return {
      hiddenByUser: EMPTY_SET,
      toggleColumn: NOOP,
      moveColumn: NOOP,
      resetToDefaults: NOOP,
      availableColumns: [],
      orderedColumns: columns,
    };
  }

  return {
    hiddenByUser,
    toggleColumn,
    moveColumn,
    resetToDefaults,
    availableColumns,
    orderedColumns,
  };
}

const EMPTY_PREFS = { hidden: [], order: [] };
const EMPTY_SET = new Set();
const NOOP = () => {};
