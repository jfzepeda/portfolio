// src/components/TablaClientes.jsx
import React from "react";
import { keyframes } from "@emotion/react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { currencyFormatter } from "~/utils/formaters";
import SuperTable from "~/components/tables/SuperTable";

const fade = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

const currencyKeys = [
  "precioContado",
  "credito",
  "volumen10",
  "vol10Cred",
  "contadoDist",
  "creditoDist",
  "contadoVenta",
  "creditoVenta",
];

const _formatCellValue = (key, item) => {
  if (currencyKeys.includes(key)) return currencyFormatter(item[key]);
  if (key === "precioLista") return currencyFormatter(item[key], 2);
  if (key === "costo") return currencyFormatter(item[key] * 1.16, 2);
  return item[key];
};

const columns = [
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
  {
    key: "colima",
    label: "Colima",
    width: 50,
    align: "center",
  },
  {
    key: "manzanillo",
    label: "Manza",
    width: 50,
    align: "center",
  },
  { key: "exis", label: "Exis", width: 40 },
  {
    key: "precioLista",
    label: "Precio lista",
    width: 80,
    render: (value, _row) => currencyFormatter(value, 2),
  },
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
  { key: "actualizado", label: "Actualizado", width: 90 },
];

/* ---------- componente principal ---------- */
const TablaClientes = ({
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
}) => (
  <>
    <SuperTable
      rows={items}
      columns={columns}
      rowKey="id"
      selectable
      selectedIds={selectedIds}
      onSelectionChange={(newIds) => {
        // Adapter: compute diff to call legacy onCheckboxChange
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

export default TablaClientes;
