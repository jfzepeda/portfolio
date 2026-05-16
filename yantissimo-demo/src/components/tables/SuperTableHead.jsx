"use client";

import React from "react";
import {
  TableHead,
  TableRow,
  TableCell,
  Checkbox,
  Box,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const baseCellSx = {
  py: 0.75,
  whiteSpace: "nowrap",
  fontWeight: 600,
};

function SuperTableHead({
  columns,
  sortable,
  sortColumn,
  sortOrder,
  selectable,
  allSelected,
  onToggleSelectAll,
  headerSx,
  dense,
  // click menu
  onHeaderClick,
  // column visibility
  onHeaderContextMenu,
}) {
  return (
    <TableHead>
      <TableRow sx={headerSx}>
        {selectable && (
          <TableCell
            padding="checkbox"
            sx={dense ? baseCellSx : { fontWeight: 600 }}
          >
            <Checkbox
              size="small"
              checked={allSelected}
              onChange={onToggleSelectAll}
              inputProps={{ "aria-label": "Seleccionar todos" }}
            />
          </TableCell>
        )}
        {columns.map((col) => {
          const isClickable =
            col.key !== "__actions__" &&
            (sortable && col.sortable !== false || col.filterable !== false);
          const isActive = sortColumn === col.key;

          const cellSx = {
            ...(dense ? baseCellSx : { fontWeight: 600 }),
            ...(col.sx || {}),
            ...(col.headerSx || {}),
            ...(col.width ? { width: col.width, minWidth: col.width } : {}),
            ...(col.minWidth ? { minWidth: col.minWidth } : {}),
            ...(col.maxWidth ? { maxWidth: col.maxWidth } : {}),
            ...(col.sticky
              ? {
                  position: "sticky",
                  left: col.stickyOffset ?? 0,
                  bgcolor: "background.paper",
                  zIndex: 3,
                }
              : {}),
            ...(isClickable
              ? { cursor: "pointer", userSelect: "none" }
              : {}),
          };

          return (
            <TableCell
              key={col.key}
              align={col.align || "left"}
              sx={cellSx}
              tabIndex={isClickable ? 0 : undefined}
              onClick={
                isClickable
                  ? (e) => onHeaderClick?.(col.key, e)
                  : undefined
              }
              onContextMenu={(e) => {
                e.preventDefault();
                onHeaderContextMenu?.(e);
              }}
              onKeyDown={
                isClickable
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onHeaderClick?.(col.key, e);
                      }
                    }
                  : undefined
              }
            >
              {col.headerRender ? (
                col.headerRender(col)
              ) : (
                <Box
                  component="span"
                  sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
                >
                  {col.label}
                  {isActive &&
                    (sortOrder === "asc" ? (
                      <ArrowUpwardIcon sx={{ fontSize: "0.85em", opacity: 0.6 }} />
                    ) : (
                      <ArrowDownwardIcon sx={{ fontSize: "0.85em", opacity: 0.6 }} />
                    ))}
                </Box>
              )}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
}

export default React.memo(SuperTableHead);
