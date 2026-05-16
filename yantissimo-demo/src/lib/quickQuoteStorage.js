// Utilities to manage selected items for quick quote in sessionStorage
// The storage is cleared on page load by the page component.
import { getOrigin } from "~/lib/getOrigin.js";

const STORAGE_KEY = "inventario:selectedItems";

function emitChanged() {
  if (typeof window === "undefined") return;
  const items = getAll();
  const detail = { items, count: Array.isArray(items) ? items.length : 0 };
  window.dispatchEvent(new CustomEvent("yssm:quickquote:changed", { detail }));
}

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch (_e) {
    return [];
  }
}

export function getAll() {
  if (typeof window === "undefined") return [];
  const raw = sessionStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw) : [];
  return Array.isArray(parsed) ? parsed : [];
}

export function setAll(items) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items ?? []));
  emitChanged();
}

export function clear() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
  emitChanged();
}

export function count() {
  return getAll().length;
}

export function isSelected(id) {
  return Array.isArray(getAll()) && getAll().some((it) => it && it.id === id);
}

export function add(item, units) {
  if (!item || item.id == null) return;
  console.log("Adding item to quick quote storage:", item.id, item);
  const items = getAll();
  if (!items.some((it) => it.id === item.id)) {
    const cleanUnits = Number(units);
    const setU =
      Number.isFinite(cleanUnits) && cleanUnits > 0
        ? Math.floor(cleanUnits)
        : 1;
    // Homogenize stored price in selection:
    // - Prefer explicit `selectionPrice` when a view needs a specific price mode
    // - Fall back to `precioLista`, then `precio`, then `price`
    const price = Number(
      item?.selectionPrice ?? item?.precioLista ?? item?.precio ?? item?.price ?? 0
    );

    let origin = item?.origin;
    if (origin == null || origin === "") {
      origin = getOrigin(item);
    }
    let inventory_id = item?.inventory_id ?? item?.id ?? 0;
    const withUnits = { ...item, units: setU, price, origin, inventory_id };
    items.push(withUnits);
    setAll(items);
  }
}

export function removeById(id) {
  const items = getAll().filter((it) => it.id !== id);
  setAll(items);
}

export function toggle(item, units) {
  if (!item || item.id == null) return;
  if (isSelected(item.id)) {
    removeById(item.id);
  } else {
    add(item, units);
  }
}

export function setUnits(id, units) {
  const u = Math.max(1, Math.floor(Number(units) || 1));
  const items = getAll().map((it) => (it.id === id ? { ...it, units: u } : it));
  setAll(items);
}
