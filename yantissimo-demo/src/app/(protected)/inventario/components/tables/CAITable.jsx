// src/components/CAITable.jsx
import React, { useMemo } from "react";
import { keyframes } from "@emotion/react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { currencyFormatter } from "~/utils/formaters";
import { ROLES } from "~/utils/global";
import SuperTable from "~/components/tables/SuperTable";

const fade = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

const _currencyKeys = [
  "precioContado",
  "credito",
  "volumen10",
  "vol10Cred",
  "contadoDist",
  "creditoDist",
];

const baseColumnsLeft = [
  {
    key: "id",
    label: "Id",
    width: 38,
    sx: { paddingLeft: "8px" },
  },
  {
    key: "articulo",
    label: "Articulo",
    width: 400,
    sx: { overflow: "hidden", textOverflow: "ellipsis" },
  },
];

const getColumnsRight = (curRole) => [
  ...(curRole >= ROLES.MARKETING || curRole <= ROLES.MYR_MANAGER
    ? [
        { key: "colima", label: "Colima", width: 50, align: "center" },
        { key: "manzanillo", label: "Manza", width: 50, align: "center" },
      ]
    : []),
  { key: "exis", label: "Exis", width: 40 },
  ...(curRole >= ROLES.MARKETING
    ? [
        {
          key: "costo",
          label: "Costo neto",
          width: 80,
          render: (value) => currencyFormatter(value * 1.16, 2),
        },
        {
          key: "precioContado",
          label: "Contado",
          render: (value) => currencyFormatter(value),
        },
        {
          key: "credito",
          label: "Credito",
          render: (value) => currencyFormatter(value),
        },
        {
          key: "volumen10",
          label: "Vol 10",
          render: (value) => currencyFormatter(value),
        },
        {
          key: "vol10Cred",
          label: "Cred 10",
          render: (value) => currencyFormatter(value),
        },
      ]
    : curRole >= ROLES.SELLER
    ? [
        {
          key: "precioContado",
          label: "Contado",
          render: (value) => currencyFormatter(value),
        },
        {
          key: "volumen10",
          label: "Volumen 10",
          render: (value) => currencyFormatter(value),
        },
      ]
    : curRole >= ROLES.CLIENT
    ? [
        {
          key: "contadoDist",
          label: "Contado dist",
          width: 70,
          render: (value) => currencyFormatter(value),
        },
        {
          key: "creditoDist",
          label: "Credito dist",
          width: 70,
          render: (value) => currencyFormatter(value),
        },
      ]
    : []),
  ...(curRole >= ROLES.MYR_HELPER
    ? [
        { key: "proveedor", label: "Proveedor", width: 90 },
        { key: "disponibilidad", label: "Entrega", width: 90 },
      ]
    : []),
  { key: "actualizado", label: "Actualizado", width: 90 },
  { key: "rin", label: "RIN", width: 40 },
];

/* ---------- componente principal ---------- */
const CAITable = ({
  items = [],
  onRowClick,
  selectedIds,
  onCheckboxChange,
  showCopyIcon,
  copyIconPosition,
  sortColumn,
  sortOrder,
  onSort,
  headerColor,
  curRole = 0,
}) => {
  const allColumns = useMemo(
    () => [...baseColumnsLeft, ...getColumnsRight(curRole)],
    [curRole]
  );

  return (
    <>
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
        onRowClick={(item) => {
          onRowClick(item);
        }}
        userRole={curRole}
        headerSx={{ backgroundColor: headerColor }}
        dense
        tableProps={{ sx: { tableLayout: "fixed", width: "100%" } }}
        containerProps={{ sx: { width: "90vw" } }}
      />
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
    </>
  );
};

export default CAITable;
