import { FILTER_OPERATORS } from "./constants";

/**
 * Build a structured filter object from the internal filters state.
 *
 * @param {Object} filters  – { [columnKey]: { operator, value } }
 * @param {Array}  columns  – ColumnDef array (used as whitelist)
 * @returns {{ combinator: "AND", conditions: Array<{ column: string, operator: string, value: * }> } | null}
 */
export function buildStructuredFilters(filters, columns) {
  if (!filters || typeof filters !== "object") return null;

  const allowedKeys = new Set(columns.map((c) => c.key));
  const conditions = [];

  for (const [key, entry] of Object.entries(filters)) {
    if (!allowedKeys.has(key)) continue;
    if (!entry || entry.value == null || entry.value === "") continue;
    if (Array.isArray(entry.value) && entry.value.length === 0) continue;
    if (!FILTER_OPERATORS[entry.operator]) continue;

    const col = columns.find((c) => c.key === key);
    conditions.push({
      column: key,
      operator: entry.operator,
      value: coerceValue(entry.value, col),
    });
  }

  return conditions.length > 0 ? { combinator: "AND", conditions } : null;
}

/**
 * Coerce a filter value to the correct JS type based on the column definition.
 */
function coerceValue(value, col) {
  if (!col) return value;
  const type = col.type || "text";

  if (type === "currency" || type === "percent") {
    if (Array.isArray(value)) return value.map(Number);
    const num = Number(value);
    return Number.isNaN(num) ? value : num;
  }

  return value;
}

/**
 * Apply client-side filters to a rows array.
 *
 * @param {Array}  rows    – data rows
 * @param {Object} filters – { [columnKey]: { operator, value } }
 * @returns {Array} filtered rows
 */
export function applyClientFilters(rows, filters) {
  if (!filters || typeof filters !== "object") return rows;

  const activeEntries = Object.entries(filters).filter(
    ([, entry]) => entry && entry.value != null && entry.value !== "",
  );

  if (activeEntries.length === 0) return rows;

  return rows.filter((row) =>
    activeEntries.every(([key, { operator, value }]) =>
      matchesFilter(row[key], operator, value),
    ),
  );
}

function matchesFilter(cellValue, operator, filterValue) {
  switch (operator) {
    case "eq":
      return String(cellValue) === String(filterValue);
    case "neq":
      return String(cellValue) !== String(filterValue);
    case "gt":
      return Number(cellValue) > Number(filterValue);
    case "gte":
      return Number(cellValue) >= Number(filterValue);
    case "lt":
      return Number(cellValue) < Number(filterValue);
    case "lte":
      return Number(cellValue) <= Number(filterValue);
    case "contains":
      return String(cellValue ?? "")
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
    case "in":
      if (!Array.isArray(filterValue)) return false;
      return filterValue.map(String).includes(String(cellValue));
    case "between": {
      if (!Array.isArray(filterValue) || filterValue.length < 2) return false;
      const n = Number(cellValue);
      return n >= Number(filterValue[0]) && n <= Number(filterValue[1]);
    }
    default:
      return true;
  }
}

/**
 * Get distinct (non-null) values for a column key from a rows array.
 *
 * @param {Array}  rows
 * @param {string} key
 * @returns {Array} sorted distinct values
 */
export function getDistinctValues(rows, key) {
  const set = new Set();
  for (const row of rows) {
    const val = row[key];
    if (val != null && val !== "") set.add(val);
  }
  return Array.from(set).sort((a, b) => {
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b), "es", { numeric: true });
  });
}
