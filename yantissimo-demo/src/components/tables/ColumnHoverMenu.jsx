"use client";

import React from "react";
import {
  Box,
  ClickAwayListener,
  Divider,
  IconButton,
  Paper,
  Popper,
  Tooltip,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SearchIcon from "@mui/icons-material/Search";
import FilterPanel from "./FilterPanel";

/**
 * Floating menu shown when clicking a column header.
 *
 * Contains sort-ascending, sort-descending, and a filter control.
 * Closes when the user clicks outside the menu.
 */
function ColumnHoverMenu({
  column,
  anchorEl,
  open,
  rows,
  sortColumn,
  sortOrder,
  onSort,
  filterValue,
  onFilterChange,
  onClose,
}) {
  if (!open || !anchorEl || !column) return null;

  const isSortable = column.sortable !== false;
  const isFilterable = column.filterable !== false;
  const isActiveAsc = sortColumn === column.key && sortOrder === "asc";
  const isActiveDesc = sortColumn === column.key && sortOrder === "desc";

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      sx={{ zIndex: 1400 }}
      modifiers={[{ name: "offset", options: { offset: [0, 4] } }]}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper elevation={4} sx={{ p: 1, minWidth: 160 }}>
          {isSortable && (
            <Box sx={{ display: "flex", gap: 0.5, mb: isFilterable ? 0.5 : 0 }}>
              <Tooltip title="Ordenar ascendente" arrow>
                <IconButton
                  size="small"
                  color={isActiveAsc ? "primary" : "default"}
                  onClick={() => onSort(column.key, "asc")}
                  aria-label="Ordenar ascendente"
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Ordenar descendente" arrow>
                <IconButton
                  size="small"
                  color={isActiveDesc ? "primary" : "default"}
                  onClick={() => onSort(column.key, "desc")}
                  aria-label="Ordenar descendente"
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {isSortable && isFilterable && <Divider sx={{ my: 0.5 }} />}

          {isFilterable && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <FilterPanel
                column={column}
                rows={rows}
                value={filterValue}
                onChange={(val) => onFilterChange(column.key, val)}
              />
            </Box>
          )}
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}

export default React.memo(ColumnHoverMenu);
