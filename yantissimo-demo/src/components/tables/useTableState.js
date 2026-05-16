"use client";

import { useState, useMemo, useCallback } from "react";
import { applyClientFilters, buildStructuredFilters } from "./filterModel";

/**
 * Central hook that owns sorting, filtering and pagination state for SuperTable.
 *
 * Supports both **internal** (uncontrolled) and **controlled** modes per feature.
 * When the corresponding controlled prop is not `undefined` the internal state
 * is bypassed and the parent is considered the source of truth.
 */
export default function useTableState({
  rows,
  columns,
  // sorting
  sortable = true,
  defaultSortColumn,
  defaultSortOrder = "asc",
  sortColumnProp,
  sortOrderProp,
  onSortChange,
  // filtering
  filtersProp,
  onFiltersChange,
  setQueryFilters,
  // pagination
  paginated = false,
  pageSize: pageSizeProp = 50,
  // selection
  _selectable = false,
  selectedIdsProp,
  onSelectionChange,
  // role
  userRole,
  // column preferences
  hiddenByUser = EMPTY_SET,
}) {
  // ── Sorting ──────────────────────────────────────────────────────────
  const sortControlled = sortColumnProp !== undefined;
  const [internalSortCol, setInternalSortCol] = useState(
    defaultSortColumn ?? null
  );
  const [internalSortOrd, setInternalSortOrd] = useState(defaultSortOrder);

  const sortColumn = sortControlled ? sortColumnProp : internalSortCol;
  const sortOrder = sortControlled ? sortOrderProp : internalSortOrd;

  const handleSort = useCallback(
    (colKey) => {
      if (!sortable) return;
      const newOrder =
        sortColumn === colKey && sortOrder === "asc" ? "desc" : "asc";
      if (!sortControlled) {
        setInternalSortCol(colKey);
        setInternalSortOrd(newOrder);
      }
      onSortChange?.(colKey, newOrder);
    },
    [sortable, sortColumn, sortOrder, sortControlled, onSortChange]
  );

  // ── Filtering ────────────────────────────────────────────────────────
  const filtersControlled = filtersProp !== undefined;
  const [internalFilters, setInternalFilters] = useState({});
  const filters = filtersControlled ? filtersProp : internalFilters;

  const setFilter = useCallback(
    (colKey, operator, value) => {
      const next = { ...filters };
      if (value == null || value === "") {
        delete next[colKey];
      } else {
        next[colKey] = { operator, value };
      }
      if (!filtersControlled) setInternalFilters(next);
      onFiltersChange?.(next);
      if (setQueryFilters) {
        setQueryFilters(buildStructuredFilters(next, columns));
      }
    },
    [filters, filtersControlled, onFiltersChange, setQueryFilters, columns]
  );

  const clearFilters = useCallback(() => {
    if (!filtersControlled) setInternalFilters({});
    onFiltersChange?.({});
    if (setQueryFilters) setQueryFilters(null);
  }, [filtersControlled, onFiltersChange, setQueryFilters]);

  // ── Visible columns ──────────────────────────────────────────────────
  const visibleColumns = useMemo(
    () =>
      columns.filter((col) => {
        if (col.hidden) return false;
        if (col.minRole != null && (userRole == null || userRole < col.minRole))
          return false;
        if (typeof col.visible === "function" && !col.visible(userRole))
          return false;
        if (hiddenByUser.has(col.key)) return false;
        return true;
      }),
    [columns, userRole, hiddenByUser]
  );

  // ── Process rows: sort → filter → paginate ───────────────────────────
  const sortedRows = useMemo(() => {
    if (!sortColumn || !sortable) return rows;
    const col = visibleColumns.find((c) => c.key === sortColumn);
    if (!col || col.sortable === false) return rows;

    return [...rows].sort((a, b) => {
      if (col.sortComparator) return col.sortComparator(a, b, sortOrder);
      const aVal = a?.[col.key];
      const bVal = b?.[col.key];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp =
        typeof aVal === "number" && typeof bVal === "number"
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal), "es", { numeric: true });
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [rows, sortColumn, sortOrder, sortable, visibleColumns]);

  // Skip client-side filtering when backend filtering is active
  const filteredRows = useMemo(() => {
    if (setQueryFilters) return sortedRows;
    return applyClientFilters(sortedRows, filters);
  }, [sortedRows, filters, setQueryFilters]);

  // ── Pagination ───────────────────────────────────────────────────────
  const [page, setPage] = useState(0);
  const totalCount = filteredRows.length;
  const pageCount = paginated
    ? Math.max(1, Math.ceil(totalCount / pageSizeProp))
    : 1;

  // Reset page when data or filters change
  const safePageRef = useMemo(() => {
    if (page >= pageCount) return 0;
    return page;
  }, [page, pageCount]);

  const processedRows = useMemo(() => {
    if (!paginated) return filteredRows;
    const start = safePageRef * pageSizeProp;
    return filteredRows.slice(start, start + pageSizeProp);
  }, [filteredRows, paginated, safePageRef, pageSizeProp]);

  const handlePageChange = useCallback((_e, newPage) => setPage(newPage), []);

  // ── Selection ────────────────────────────────────────────────────────
  const selectionControlled = selectedIdsProp !== undefined;
  const [internalSelected, setInternalSelected] = useState([]);
  const selectedIds = selectionControlled ? selectedIdsProp : internalSelected;

  const toggleSelect = useCallback(
    (id) => {
      const next = selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id];
      if (!selectionControlled) setInternalSelected(next);
      onSelectionChange?.(next);
    },
    [selectedIds, selectionControlled, onSelectionChange]
  );

  const toggleSelectAll = useCallback(
    (rowKey) => {
      const allIds = processedRows.map((r) =>
        typeof rowKey === "function" ? rowKey(r) : r[rowKey]
      );
      const allSelected = allIds.every((id) => selectedIds.includes(id));
      const next = allSelected
        ? selectedIds.filter((id) => !allIds.includes(id))
        : [...new Set([...selectedIds, ...allIds])];
      if (!selectionControlled) setInternalSelected(next);
      onSelectionChange?.(next);
    },
    [processedRows, selectedIds, selectionControlled, onSelectionChange]
  );

  return {
    // sorting
    sortColumn,
    sortOrder,
    handleSort,
    // filtering
    filters,
    setFilter,
    clearFilters,
    // columns
    visibleColumns,
    // rows
    processedRows,
    totalCount,
    // pagination
    page: safePageRef,
    pageCount,
    handlePageChange,
    // selection
    selectedIds,
    toggleSelect,
    toggleSelectAll,
  };
}

const EMPTY_SET = new Set();
