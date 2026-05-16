// src/components/MICHTable.jsx
import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { keyframes } from "@emotion/react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { currencyFormatter, calcDescuento } from "~/utils/formaters";
import { ROLES } from "~/utils/global";
import SuperTable from "~/components/tables/SuperTable";

const fade = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

/* ---------- helpers ---------- */
const renderPercentCell = (key, item) => (
  <Typography color="red" fontSize={14}>
    {calcDescuento(item[key.replace("desc", "")], item["precioLista"])}%
  </Typography>
);

const _currencyKeysSet = new Set([
  "precioLista",
  "precioContado",
  "contadoDist",
  "creditoDist",
  "promo_2pz",
  "promo_4pz",
]);

const _percentKeysSet = new Set([
  "descprecioContado",
  "desccontadoDist",
  "desccreditoDist",
]);

/* ---------- columnas ---------- */
const headerColumnsLeft = [
  {
    key: "id",
    label: "Id",
    width: "2rem",
    sticky: true,
    stickyOffset: 0,
  },
  {
    key: "claveProveedor",
    label: "MSPN",
    width: "2.5rem",
    sticky: true,
    stickyOffset: "2.375rem",
  },
  {
    key: "articulo",
    label: "Art\u00edculo",
    width: 420,
    sticky: true,
    stickyOffset: "calc(2.375rem + 2.5rem)",
    sx: { overflow: "hidden", textOverflow: "ellipsis" },
  },
];

const getColumnsRight = (curRole) => [
  {
    key: "precioLista",
    label: "Precio lista",
    width: "4rem",
    render: (value) => currencyFormatter(value, 2),
  },
  ...(curRole >= ROLES.MYR_HELPER
    ? [
        {
          key: "precioContado",
          label: "Promoci\u00f3n",
          render: (value) => currencyFormatter(value, 2),
        },
        {
          key: "descprecioContado",
          label: "",
          width: "1.5rem",
          render: (_, row) => renderPercentCell("descprecioContado", row),
        },
      ]
    : []),
  {
    key: "contadoDist",
    label: "Ctdo Dist",
    render: (value) => currencyFormatter(value, 2),
  },
  {
    key: "desccontadoDist",
    label: "",
    width: "1.5rem",
    render: (_, row) => renderPercentCell("desccontadoDist", row),
  },
  {
    key: "creditoDist",
    label: "Cred Dist",
    render: (value) => currencyFormatter(value, 2),
  },
  {
    key: "desccreditoDist",
    label: "",
    width: "1.5rem",
    render: (_, row) => renderPercentCell("desccreditoDist", row),
  },
];

/* ---------- componente principal ---------- */
const MICHTable = ({
  items = [],
  onRowClick,
  onDetailClick,
  selectedIds,
  onCheckboxChange,
  showCopyIcon,
  copyIconPosition,
  sortColumn,
  sortOrder,
  onSort,
  _visibleColumns,
  curRole = 0,
}) => {
  const allColumns = useMemo(
    () => [...headerColumnsLeft, ...getColumnsRight(curRole)],
    [curRole]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "row" }}>
      <Box sx={{ width: "90vw" }}>
        <SuperTable
          rows={items}
          columns={allColumns}
          rowKey="id"
          selectable
          selectedIds={selectedIds}
          onSelectionChange={(newIds) => {
            const added = newIds.filter((id) => !selectedIds.includes(id));
            const removed = selectedIds.filter((id) => !newIds.includes(id));
            added.forEach((id) => onCheckboxChange(id, true));
            removed.forEach((id) => onCheckboxChange(id, false));
          }}
          sortColumn={sortColumn}
          sortOrder={sortOrder}
          onSortChange={(col) => onSort(col)}
          onRowClick={(item, e) => {
            onRowClick?.(e, item);
            onDetailClick?.(item);
          }}
          userRole={curRole}
          dense
          tableProps={{ sx: { tableLayout: "fixed", minWidth: 1000 } }}
          containerProps={{ sx: { overflowX: "auto" } }}
        />
      </Box>
      {showCopyIcon && (
        <ContentCopyIcon
          sx={{
            position: "fixed",
            top: copyIconPosition.y,
            left: copyIconPosition.x,
            transform: "translate(-120%, -30%)",
            zIndex: 1300,
            animation: `${fade} 0.3s`,
            backgroundColor: "white",
          }}
        />
      )}
    </Box>
  );
};

export default MICHTable;
