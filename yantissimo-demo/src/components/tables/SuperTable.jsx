"use client";

import React, { useCallback, useState } from "react";
import { Paper, Table, TableContainer } from "@mui/material";
import useTableState from "./useTableState";
import useColumnHover from "./useColumnHover";
import SuperTableHead from "./SuperTableHead";
import SuperTableBody from "./SuperTableBody";
import SuperTablePagination from "./SuperTablePagination";
import ColumnHoverMenu from "./ColumnHoverMenu";
import ColumnVisibilityMenu from "./ColumnVisibilityMenu";
import useColumnPreferences from "./useColumnPreferences";
import { PAGE_SIZE_OPTIONS } from "./constants";

/**
 * SuperTable — universal, config-driven table component for the ERP.
 *
 * Wraps MUI Table primitives and centralises sorting, filtering, pagination,
 * selection, role-based column visibility, and Excel-style hover column tools.
 */
function SuperTable({
  // data
  rows = [],
  columns = [],
  rowKey = "id",
  // sorting
  sortable = true,
  defaultSortColumn,
  defaultSortOrder = "asc",
  sortColumn: sortColumnProp,
  sortOrder: sortOrderProp,
  onSortChange,
  // filtering
  filters: filtersProp,
  onFiltersChange,
  setQueryFilters,
  // pagination
  paginated = false,
  pageSize: pageSizeProp = 50,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  // selection
  selectable = false,
  selectedIds: selectedIdsProp,
  onSelectionChange,
  // row interaction
  onRowClick,
  // appearance
  size = "small",
  stickyHeader = false,
  headerSx,
  striped = false,
  maxHeight,
  dense = true,
  // states
  loading = false,
  emptyMessage = "Sin registros",
  emptySlot,
  loadingSlot,
  // role
  userRole,
  // column preferences
  tableId,
  // escape hatches
  tableProps = {},
  containerProps = {},
  paperProps = {},
  rowProps,
}) {
  // ── Column preferences (localStorage-backed) ───────────────────────
  const {
    hiddenByUser,
    toggleColumn,
    moveColumn,
    resetToDefaults,
    availableColumns,
    orderedColumns,
  } = useColumnPreferences(tableId, columns, userRole);

  // ── Core state hook ──────────────────────────────────────────────────
  const state = useTableState({
    rows,
    columns: orderedColumns,
    sortable,
    defaultSortColumn,
    defaultSortOrder,
    sortColumnProp,
    sortOrderProp,
    onSortChange,
    filtersProp,
    onFiltersChange,
    setQueryFilters,
    paginated,
    pageSize: pageSizeProp,
    selectable,
    selectedIdsProp,
    onSelectionChange,
    userRole,
    hiddenByUser,
  });

  // ── Column visibility context menu ──────────────────────────────────
  const [contextMenuPos, setContextMenuPos] = useState(null);

  const handleHeaderContextMenu = useCallback(
    (e) => {
      if (!tableId) return;
      setContextMenuPos({ top: e.clientY, left: e.clientX });
    },
    [tableId],
  );

  // ── Hover menu ───────────────────────────────────────────────────────
  const hover = useColumnHover();

  const handleSortFromMenu = useCallback(
    (colKey, direction) => {
      // Direct sort with explicit direction (not toggle)
      if (sortColumnProp === undefined) {
        // Internal mode — we need to set both column and order
        state.handleSort(colKey);
        // If the current sort doesn't match what we want, toggle again
        if (
          state.sortColumn === colKey &&
          state.sortOrder === direction
        ) {
          return; // already correct
        }
        if (state.sortColumn !== colKey) {
          // handleSort just set it to asc — if we want desc, toggle again
          if (direction === "desc") state.handleSort(colKey);
        } else if (state.sortOrder !== direction) {
          state.handleSort(colKey);
        }
      }
      onSortChange?.(colKey, direction);
    },
    [sortColumnProp, state, onSortChange],
  );

  const handleFilterFromMenu = useCallback(
    (colKey, value) => {
      const col = state.visibleColumns.find((c) => c.key === colKey);
      const colType = col?.type || "text";
      const isNumeric = colType === "currency" || colType === "percent";

      if (value == null) {
        state.setFilter(colKey, "eq", null);
      } else if (isNumeric) {
        state.setFilter(colKey, "eq", value);
      } else {
        // For text columns via autocomplete: use "contains" for free-typed, "eq" for selected
        state.setFilter(colKey, "eq", value);
      }
    },
    [state],
  );

  // ── Pagination ───────────────────────────────────────────────────────
  const [pageSize, setPageSize] = useState(pageSizeProp);

  const handleRowsPerPageChange = useCallback(
    (e) => {
      setPageSize(parseInt(e.target.value, 10));
      state.handlePageChange(null, 0);
    },
    [state],
  );

  // ── Selection ────────────────────────────────────────────────────────
  const allSelected =
    selectable &&
    state.processedRows.length > 0 &&
    state.processedRows.every((r) => {
      const key =
        typeof rowKey === "function" ? rowKey(r) : String(r?.[rowKey] ?? "");
      return state.selectedIds.includes(key);
    });

  const handleToggleSelectAll = useCallback(() => {
    state.toggleSelectAll(rowKey);
  }, [state, rowKey]);

  // ── Active hover column ──────────────────────────────────────────────
  const hoverColumn = state.visibleColumns.find(
    (c) => c.key === hover.openColumn,
  );
  const hoverFilterValue = hoverColumn
    ? state.filters[hoverColumn.key]?.value ?? null
    : null;

  // ── Container style ──────────────────────────────────────────────────
  const containerSx = {
    ...(maxHeight ? { maxHeight, overflow: "auto" } : {}),
    ...(containerProps.sx || {}),
  };

  return (
    <Paper variant="outlined" {...paperProps}>
      <TableContainer {...containerProps} sx={containerSx}>
        <Table
          size={size}
          stickyHeader={stickyHeader}
          {...tableProps}
        >
          <SuperTableHead
            columns={state.visibleColumns}
            sortable={sortable}
            sortColumn={state.sortColumn}
            sortOrder={state.sortOrder}
            selectable={selectable}
            allSelected={allSelected}
            onToggleSelectAll={handleToggleSelectAll}
            headerSx={headerSx}
            dense={dense}
            onHeaderClick={hover.onHeaderClick}
            onHeaderContextMenu={handleHeaderContextMenu}
          />
          <SuperTableBody
            rows={state.processedRows}
            columns={state.visibleColumns}
            rowKey={rowKey}
            loading={loading}
            emptyMessage={emptyMessage}
            emptySlot={emptySlot}
            loadingSlot={loadingSlot}
            selectable={selectable}
            selectedIds={state.selectedIds}
            onToggleSelect={state.toggleSelect}
            onRowClick={onRowClick}
            dense={dense}
            striped={striped}
            userRole={userRole}
            rowProps={rowProps}
          />
        </Table>
      </TableContainer>

      {paginated && !loading && (
        <SuperTablePagination
          totalCount={state.totalCount}
          page={state.page}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageChange={state.handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}

      <ColumnHoverMenu
        column={hoverColumn}
        anchorEl={hover.anchorEl}
        open={hover.isMenuOpen}
        rows={rows}
        sortColumn={state.sortColumn}
        sortOrder={state.sortOrder}
        onSort={handleSortFromMenu}
        filterValue={hoverFilterValue}
        onFilterChange={handleFilterFromMenu}
        onClose={hover.closeMenu}
      />

      {tableId && (
        <ColumnVisibilityMenu
          open={contextMenuPos !== null}
          position={contextMenuPos}
          onClose={() => setContextMenuPos(null)}
          availableColumns={availableColumns}
          hiddenByUser={hiddenByUser}
          onToggleColumn={toggleColumn}
          onMoveColumn={moveColumn}
          onResetToDefaults={resetToDefaults}
        />
      )}
    </Paper>
  );
}

export default React.memo(SuperTable);
