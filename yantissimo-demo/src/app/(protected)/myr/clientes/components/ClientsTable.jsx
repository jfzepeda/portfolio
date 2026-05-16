import React from "react";
import { Box, Stack } from "@mui/material";
import SuperTable from "~/components/tables/SuperTable";
import { creditColors, headerColumns, marginColors } from "../constants";

const colorDot = (hex) => (
  <Box
    component="span"
    sx={{
      display: "inline-block",
      width: 12,
      height: 12,
      borderRadius: "50%",
      bgcolor: hex || creditColors.gris,
      mr: 1,
    }}
  />
);

const StatusCell = ({ color, value }) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    {colorDot(color)}
    <span style={{ textTransform: "capitalize" }}>{value || ""}</span>
  </Stack>
);

const columns = headerColumns.map((col) => {
  if (col.key === "semaforo_credito") {
    return {
      ...col,
      render: (value) => (
        <StatusCell
          color={creditColors[value] || creditColors.gris}
          value={value}
        />
      ),
    };
  }
  if (col.key === "semaforo_margen") {
    return {
      ...col,
      render: (value) => (
        <StatusCell
          color={marginColors[value] || marginColors.gris}
          value={value}
        />
      ),
    };
  }
  return col;
});

const ClientsTable = ({ rows, loading, onRowClick }) => (
  <SuperTable
    tableId="tabla-clientes-op"
    rows={rows}
    columns={columns}
    rowKey="dist_id"
    loading={loading}
    onRowClick={onRowClick}
    stickyHeader
    emptyMessage="Sin datos para el rango seleccionado."
    paperProps={{ sx: { overflow: "auto", width: "90vw" } }}
  />
);

export default ClientsTable;
