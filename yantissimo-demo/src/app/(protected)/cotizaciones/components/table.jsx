import React from "react";
import dayjs from "dayjs";
import { Chip, Button } from "@mui/material";
import { splitName, trimName, currencyFormatter } from "~/utils/formaters";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SensorOccupiedIcon from "@mui/icons-material/SensorOccupied";
import HistoryIcon from "@mui/icons-material/History";
import { ROLES, doctypeOptions } from "~/utils/global";
import SuperTable from "~/components/tables/SuperTable";

const columns = [
  {
    key: "created_at",
    label: "Fecha",
    render: (value) => dayjs(value).format("DDMMM"),
  },
  {
    key: "id",
    label: "FOLIO",
    render: (_, row) => `${row.sucursal}-${row.id}`,
  },
  {
    key: "client_name",
    label: "Cliente",
    render: (value) => trimName(value),
  },
  {
    key: "seller",
    label: "Vendedor",
    render: (value) => splitName(value),
  },
  { key: "phone", label: "Telefono" },
  {
    key: "total",
    label: "Total",
    render: (value) => currencyFormatter(value),
  },
  { key: "channel", label: "Tipo de venta" },
  {
    key: "type",
    label: "Fase",
    render: (value) => {
      const opt = doctypeOptions[value];
      return (
        <Chip
          size="small"
          label={opt ? opt.text : value}
          sx={{
            backgroundColor: opt
              ? `color-mix(in srgb, ${opt.color} 18%, white)`
              : "transparent",
            color: opt ? opt.color : "#000",
            border: `1px solid ${opt ? opt.color : "#000"}`,
            fontWeight: 500,
          }}
        />
      );
    },
  },
];

const QuotesTable = ({
  quotes,
  handleRowClick,
  handleOpenSuite,
  handleArchive,
  handleRecover,
  handleAssignSeller,
  curRole,
}) => {
  const actionColumn = {
    key: "__actions__",
    label: "Acciones",
    align: "right",
    sortable: false,
    filterable: false,
    actions: (row, userRole) => [
      {
        id: "open_suite",
        label: "Abrir suite",
        render: (r) => (
          <Button
            variant="contained"
            size="small"
            color="primary"
            sx={{ px: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenSuite(r);
            }}
          >
            <DriveFileMoveIcon />
          </Button>
        ),
      },
      {
        id: "assign_seller",
        icon: SensorOccupiedIcon,
        label: "Asignar vendedor",
        color: "contrast",
        show: () => userRole >= ROLES.MANAGER,
        onClick: (r) => handleAssignSeller(r),
      },
      {
        id: "archive",
        icon: DeleteOutlineIcon,
        label: "Archivar",
        color: "error",
        show: (r) => r.type !== "archived",
        onClick: (r) => handleArchive(r),
      },
      {
        id: "recover",
        icon: HistoryIcon,
        label: "Recuperar",
        show: (r) => r.type === "archived",
        onClick: (r) => handleRecover(r),
      },
    ],
  };

  const allColumns = [...columns, actionColumn];

  return (
    <SuperTable
      rows={quotes || []}
      columns={allColumns}
      rowKey="id"
      defaultSortColumn="id"
      defaultSortOrder="desc"
      onRowClick={handleRowClick}
      userRole={curRole}
      emptyMessage="No hay cotizaciones para los filtros actuales. Revisa estatus, sucursal o búsqueda."
    />
  );
};

export default QuotesTable;
