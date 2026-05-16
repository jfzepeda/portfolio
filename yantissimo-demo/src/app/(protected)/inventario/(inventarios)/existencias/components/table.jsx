// src/components/ExistenciasTable.jsx
import React, { useMemo } from "react";
import { Box } from "@mui/material";
import SuperTable from "~/components/tables/SuperTable";

// Keys that the user can hide/show
const BRANCH_COLUMN_KEYS = [
  "tec",
  "bjz",
  "nhs",
  "con",
  "mor",
  "rey",
  "blv",
  "mmz",
  "mzo",
  "cds",
  "llr",
  "trs",
  "dlg",
];

const allColumns = [
  {
    key: "id",
    label: "Id",
    width: 80,
    sx: { paddingLeft: "8px" },
  },
  {
    key: "articulo",
    label: "Art\u00edculo",
    width: 350,
    sx: { overflow: "hidden", textOverflow: "ellipsis" },
  },
  { key: "tec", label: "TEC", width: 52, align: "center" },
  { key: "bjz", label: "BJZ", width: 52, align: "center" },
  { key: "nhs", label: "NHS", width: 52, align: "center" },
  { key: "con", label: "CON", width: 52, align: "center" },
  { key: "mor", label: "MOR", width: 52, align: "center" },
  { key: "rey", label: "REY", width: 52, align: "center" },
  { key: "blv", label: "BLV", width: 52, align: "center" },
  { key: "mmz", label: "MMZ", width: 52, align: "center" },
  { key: "mzo", label: "MZO", width: 52, align: "center" },
  { key: "cds", label: "CDS", width: 52, align: "center" },
  { key: "llr", label: "LLR", width: 52, align: "center" },
  { key: "trs", label: "TRS", width: 52, align: "center" },
  { key: "dlg", label: "DLG", width: 52, align: "center" },
  { key: "manzanillo", label: "Manza", width: 60, align: "center" },
  { key: "colima", label: "Colima", width: 65, align: "center" },
  { key: "exis", label: "Suma", width: 65, align: "center" },
  { key: "costo", label: "Costo", width: 80 },
  { key: "total_exis", label: "Total global", width: 100 },
];

/* ---------- componente principal ---------- */
const ExistenciasTable = ({
  items = [],
  onRowClick,
  sortColumn,
  sortOrder,
  onSort,
  visibleColumns,
  _sufix,
}) => {
  const filteredColumns = useMemo(
    () =>
      allColumns.filter(
        (col) =>
          !BRANCH_COLUMN_KEYS.includes(col.key) ||
          visibleColumns?.includes(col.key)
      ),
    [visibleColumns]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "row" }}>
      <Box sx={{ width: "90vw", overflowX: "auto" }}>
        <SuperTable
          rows={items}
          columns={filteredColumns}
          rowKey="id"
          sortColumn={sortColumn}
          sortOrder={sortOrder}
          onSortChange={(col) => onSort(col)}
          onRowClick={onRowClick}
          dense
          tableProps={{ sx: { tableLayout: "fixed" } }}
        />
      </Box>
    </Box>
  );
};

export default ExistenciasTable;
