import React from "react";
import dayjs from "dayjs";
import { Chip, Button } from "@mui/material";
import { currencyFormatter, splitName } from "~/utils/formaters";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import HistoryIcon from "@mui/icons-material/History";
import { doctypeOptionsMyr, ROLES } from "~/utils/global";
import SuperTable from "~/components/tables/SuperTable";

const calculateTotal = (quote) => {
  const servicesTotal = (quote.services || []).reduce(
    (acc, service) =>
      acc +
      service.price * service.units * (1 - (service.descuento || 0) / 100),
    0
  );
  const items = Array.isArray(quote.items) ? quote.items : [];
  const itemsTotal = items.reduce(
    (acc, item) =>
      acc + item.price * item.units * (1 - (item.descuento || 0) / 100),
    0
  );
  const strTotal = `${parseFloat(servicesTotal + itemsTotal).toFixed(2)}` || 0;
  return currencyFormatter(strTotal);
};

const baseColumns = [
  {
    key: "created_at",
    label: "Fecha",
    render: (value) => dayjs(value).format("DD MMM HH:mm"),
  },
  {
    key: "id",
    label: "FOLIO",
    render: (_, row) => `${row.sucursal?.slice(3, 6)}-${row.id}`,
  },
  { key: "tta_minutes", label: "Aten" },
  { key: "company", label: "Empresa" },
  { key: "client_type", label: "Tipo" },
  {
    key: "seller",
    label: "Vendedor",
    render: (value) => splitName(value),
    visible: (role) => role !== ROLES.MYR_SELLER,
  },
  {
    key: "total",
    label: "Total",
    render: (_, row) => calculateTotal(row),
  },
  { key: "channel", label: "Canal" },
  {
    key: "type",
    label: "Fase",
    render: (value) => {
      const opt = doctypeOptionsMyr[value];
      return (
        <Chip
          size="small"
          label={opt ? opt.text : value}
          sx={{
            color: opt ? opt.color : "#000",
            borderColor: opt ? opt.color : "#000",
          }}
          variant="outlined"
        />
      );
    },
  },
];

const PedidosTable = ({
  quotes,
  handleRowClick,
  handleOpenSuite,
  handleArchive,
  handleRecover,
  curRole,
}) => {
  const actionColumn = {
    key: "__actions__",
    label: "Acciones",
    align: "right",
    sortable: false,
    filterable: false,
    actions: (_row) => [
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

  const allColumns = [...baseColumns, actionColumn];

  return (
    <SuperTable
      rows={quotes || []}
      columns={allColumns}
      rowKey="id"
      defaultSortColumn="id"
      defaultSortOrder="desc"
      onRowClick={handleRowClick}
      userRole={curRole}
    />
  );
};

export default PedidosTable;
