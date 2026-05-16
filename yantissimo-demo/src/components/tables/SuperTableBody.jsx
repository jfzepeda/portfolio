"use client";

import React, { useMemo } from "react";
import { TableBody, TableRow, TableCell, CircularProgress, Typography } from "@mui/material";
import SuperTableRow from "./SuperTableRow";

function SuperTableBody({
  rows,
  columns,
  rowKey,
  loading,
  emptyMessage,
  emptySlot,
  loadingSlot,
  selectable,
  selectedIds,
  onToggleSelect,
  onRowClick,
  dense,
  striped,
  userRole,
  rowProps: rowPropsFn,
}) {
  const colSpan = columns.length + (selectable ? 1 : 0);

  const getRowKeyFn = useMemo(() => {
    if (typeof rowKey === "function") return rowKey;
    return (row, index) => {
      const val = row?.[rowKey];
      if (val != null) return String(val);
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[SuperTable] Row at index ${index} has no "${rowKey}" property. ` +
            "Using index as fallback key — this may cause rendering issues.",
        );
      }
      return `__row_${index}`;
    };
  }, [rowKey]);

  if (loading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={colSpan} align="center" sx={{ py: 4 }}>
            {loadingSlot || <CircularProgress size={28} />}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={colSpan} align="center" sx={{ py: 4 }}>
            {emptySlot || (
              <Typography variant="body2" color="text.secondary">
                {emptyMessage || "Sin registros"}
              </Typography>
            )}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {rows.map((row, idx) => {
        const key = getRowKeyFn(row, idx);
        const isSelected = selectable && selectedIds.includes(key);

        return (
          <SuperTableRow
            key={key}
            row={row}
            rowIndex={idx}
            columns={columns}
            rowKey={key}
            isSelected={isSelected}
            selectable={selectable}
            onRowClick={onRowClick}
            onToggleSelect={onToggleSelect}
            dense={dense}
            striped={striped}
            userRole={userRole}
            rowPropsFn={rowPropsFn}
          />
        );
      })}
    </TableBody>
  );
}

export default React.memo(SuperTableBody);
