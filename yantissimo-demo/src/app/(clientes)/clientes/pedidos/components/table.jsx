import React from "react";
import dayjs from "dayjs";
import { Chip, Button } from "@mui/material";
import { splitName, trimName, currencyFormatter } from "~/utils/formaters";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";
import { doctypeOptionsMyr } from "~/utils/global";
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
    render: (_, row) => calculateTotal(row),
  },
  { key: "channel", label: "Tipo de venta" },
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
  _handleRecover,
  downloadInvoice,
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
        show: (r) => doctypeOptionsMyr[r.type]?.idx < 3,
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
        id: "download_invoice",
        label: "Descargar factura",
        show: (r) => ["invoiced", "part-invoiced"].includes(r.type),
        render: (r) => (
          <Button
            variant="contrast"
            size="small"
            color="primary"
            sx={{ px: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              downloadInvoice(r.id);
            }}
          >
            <SimCardDownloadIcon />
          </Button>
        ),
      },
      {
        id: "archive",
        icon: DeleteOutlineIcon,
        label: "Archivar",
        color: "error",
        show: (r) => doctypeOptionsMyr[r.type]?.idx < 2,
        onClick: (r) => handleArchive(r),
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
    />
  );
};

export default PedidosTable;
