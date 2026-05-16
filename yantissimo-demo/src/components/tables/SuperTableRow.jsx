"use client";

import React, { useCallback } from "react";
import { TableRow, TableCell, IconButton, Tooltip, Box } from "@mui/material";
import { FORMATTERS } from "./constants";

const baseCellSx = {
  py: 0.75,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

function _formatCellValue(value, col) {
  if (col.render) return col.render(value, null, null);
  if (col.format) return col.format(value, null);
  const formatter = FORMATTERS[col.type || "text"];
  return formatter ? formatter(value, col) : value ?? "";
}

function SuperTableRow({
  row,
  rowIndex,
  columns,
  rowKey,
  isSelected,
  selectable,
  onRowClick,
  onToggleSelect,
  dense,
  striped,
  userRole,
  rowPropsFn,
}) {
  const handleClick = useCallback(
    (e) => onRowClick?.(row, e),
    [onRowClick, row]
  );

  const extraProps = rowPropsFn ? rowPropsFn(row, rowIndex) : {};
  const sxRow = {
    ...(onRowClick ? { cursor: "pointer" } : {}),
    ...(striped && rowIndex % 2 === 1 ? { bgcolor: "action.hover" } : {}),
    ...(extraProps?.sx || {}),
  };

  return (
    <TableRow
      hover={!!onRowClick}
      selected={isSelected}
      onClick={onRowClick ? handleClick : undefined}
      sx={sxRow}
      {...extraProps}
    >
      {selectable && (
        <TableCell padding="checkbox" sx={dense ? baseCellSx : undefined}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect(rowKey);
            }}
            aria-label={`Seleccionar fila ${rowKey}`}
          />
        </TableCell>
      )}
      {columns.map((col) => {
        if (col.key === "__actions__") {
          return (
            <ActionCell
              key="__actions__"
              col={col}
              row={row}
              userRole={userRole}
              dense={dense}
            />
          );
        }

        const value = row?.[col.key];
        const CellComp = col.cellComponent || TableCell;
        const cellSxMerged = {
          ...(dense ? baseCellSx : {}),
          ...(col.sx || {}),
          ...(col.cellSx || {}),
          ...(col.width ? { width: col.width, minWidth: col.width } : {}),
          ...(col.minWidth ? { minWidth: col.minWidth } : {}),
          ...(col.maxWidth ? { maxWidth: col.maxWidth } : {}),
          ...(col.sticky
            ? {
                position: "sticky",
                left: col.stickyOffset ?? 0,
                bgcolor: "background.paper",
                zIndex: 1,
              }
            : {}),
        };

        const rendered = col.render
          ? col.render(value, row, rowIndex)
          : col.format
          ? col.format(value, row)
          : FORMATTERS[col.type || "text"]?.(value, col) ?? value ?? "";

        return (
          <CellComp key={col.key} align={col.align || "left"} sx={cellSxMerged}>
            {rendered}
          </CellComp>
        );
      })}
    </TableRow>
  );
}

function ActionCell({ col, row, userRole, dense }) {
  const actions =
    typeof col.actions === "function"
      ? col.actions(row, userRole)
      : col.actions;

  if (!actions || actions.length === 0) return <TableCell />;

  return (
    <TableCell
      align={col.align || "right"}
      sx={
        dense
          ? { ...baseCellSx, whiteSpace: "nowrap" }
          : { whiteSpace: "nowrap" }
      }
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.25 }}>
        {actions.map((action) => {
          if (action.show && !action.show(row, userRole)) return null;

          if (action.render) {
            return (
              <React.Fragment key={action.id}>
                {action.render(row)}
              </React.Fragment>
            );
          }

          const Icon = action.icon;
          return (
            <Tooltip key={action.id} title={action.label || ""} arrow>
              <IconButton
                size="small"
                color={action.color || "default"}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick?.(row, e);
                }}
                aria-label={action.label}
              >
                {Icon && <Icon fontSize="small" />}
              </IconButton>
            </Tooltip>
          );
        })}
      </Box>
    </TableCell>
  );
}

export default React.memo(SuperTableRow, (prev, next) => {
  return (
    prev.row === next.row &&
    prev.isSelected === next.isSelected &&
    prev.columns === next.columns &&
    prev.rowIndex === next.rowIndex &&
    prev.dense === next.dense &&
    prev.striped === next.striped &&
    prev.userRole === next.userRole
  );
});
