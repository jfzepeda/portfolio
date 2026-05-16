"use client";
import React from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { Card, CardContent } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import SuperTable from "~/components/tables/SuperTable";
import { splitName, trimName } from "~/utils/formaters.js";

const columns = [
  { key: "id", label: "ID" },
  {
    key: "company",
    label: "Nombre",
    minWidth: 200,
    render: (value) => <span style={{ fontWeight: 600 }}>{trimName(value, 25)}</span>,
  },
  {
    key: "seller_name",
    label: "Vendedor",
    render: (value) => splitName(value) || "\u2014",
  },
  { key: "client_type", label: "Tipo", render: (v) => v || "\u2014" },
  { key: "zone", label: "Zona", render: (v) => v || "\u2014" },
  {
    key: "location",
    label: "Ubicacion",
    render: (value) =>
      value ? (
        <Link href={value} target="_blank" rel="noopener noreferrer">
          {value}
        </Link>
      ) : (
        "\u2014"
      ),
  },
  {
    key: "created_at",
    label: "Creado",
    render: (value) => (value ? dayjs(value).format("DD MMM HH:mm") : "\u2014"),
  },
];

export default function ProspeccionTable({
  rows,
  loading,
  onEdit,
  onDelete,
  onConvert,
}) {
  const actionColumn = {
    key: "__actions__",
    label: "Acciones",
    align: "right",
    sortable: false,
    filterable: false,
    actions: [
      {
        id: "edit",
        icon: EditIcon,
        label: "Editar",
        onClick: (row) => onEdit?.(row),
      },
      {
        id: "delete",
        icon: DeleteIcon,
        label: "Eliminar",
        color: "error",
        onClick: (row) => onDelete?.(row),
      },
      {
        id: "convert",
        icon: HowToRegIcon,
        label: "Convertir a distribuidor sin acceso",
        color: "success",
        onClick: (row) => onConvert?.(row),
      },
    ],
  };

  const allColumns = [...columns, actionColumn];

  return (
    <Card variant="outlined">
      <CardContent>
        <SuperTable
          rows={rows}
          columns={allColumns}
          rowKey="id"
          loading={loading}
          paperProps={{ variant: "elevation", elevation: 0 }}
        />
      </CardContent>
    </Card>
  );
}
