"use client";
import React from "react";
import { Card, CardContent } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import SuperTable from "~/components/tables/SuperTable";
import { splitName, trimName, shortK } from "~/utils/formaters.js";

const baseColumns = [
  { key: "id", label: "ID" },
  {
    key: "company",
    label: "Nombre",
    minWidth: 200,
    render: (value) => (
      <span style={{ fontWeight: 600 }}>{trimName(value, 25)}</span>
    ),
  },
  { key: "admin_phone", label: "Telefono", render: (v) => v || "\u2014" },
  {
    key: "seller_name",
    label: "Vendedor",
    render: (value) => splitName(value) || "\u2014",
  },
  { key: "client_type", label: "Tipo", render: (v) => v || "\u2014" },
  {
    key: "sucursal",
    label: "Suc.",
    render: (v) => v?.slice(3, 6) || "\u2014",
  },
  {
    key: "ruta",
    label: "Ruta",
    render: (v) => v?.split(",")[0] ?? "\u2014",
  },
  {
    key: "credit_days",
    label: "D\u00edas cr\u00e9dito",
    render: (_, row) =>
      row.only_ctdo ? "N / A" : (row.credit_policy?.days ?? "") + " d\u00edas",
  },
  {
    key: "credit_limit",
    label: "L\u00edmite",
    render: (_, row) => "$" + (shortK(row.credit_policy?.limit) || "\u2014"),
  },
  { key: "client_tier", label: "Pot.", render: (v) => v || "\u2014" },
];

export default function ClientesDistribuidoresTable({
  rows,
  loading,
  onEdit,
  onDelete,
  onToggleBlock,
}) {
  const actionColumn = {
    key: "__actions__",
    label: "",
    align: "right",
    sortable: false,
    filterable: false,
    actions: (row) => [
      {
        id: "edit",
        icon: EditIcon,
        label: "Editar",
        onClick: (r) => onEdit?.(r),
      },
      {
        id: "delete",
        icon: DeleteIcon,
        label: "Eliminar",
        color: "error",
        onClick: (r) => onDelete?.(r),
      },
      ...(row.platform_access === false
        ? [
            {
              id: "upload",
              icon: FileUploadIcon,
              label: "Dar acceso a plataforma",
              color: "success",
              onClick: () => {},
            },
          ]
        : row.status === "active"
        ? [
            {
              id: "block",
              icon: BlockIcon,
              label: "Bloquear",
              color: "error",
              onClick: (r) => onToggleBlock?.(r, "suspend"),
            },
          ]
        : [
            {
              id: "activate",
              icon: CheckCircleIcon,
              label: "Desbloquear",
              color: "success",
              onClick: (r) => onToggleBlock?.(r, "activate"),
            },
          ]),
    ],
  };

  const allColumns = [...baseColumns, actionColumn];

  return (
    <Card variant="outlined">
      <CardContent sx={{ width: "90vw", overflow: "auto" }}>
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
