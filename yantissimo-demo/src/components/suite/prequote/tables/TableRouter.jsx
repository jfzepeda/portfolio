// src/app/(protected)/inventario/tables/TableRouter.jsx
import React, { useMemo } from "react";
import { TableCell } from "@mui/material";
import { styled } from "@mui/material/styles";
import GenericTable from "~/components/suite/prequote/tables/GenericTable.jsx";
import { ROLES } from "~/utils/session.js";

const StyledTableCell = styled(TableCell)(() => ({
  whiteSpace: "nowrap",
  padding: 8,
  width: 60,
}));

const IdTableCell = styled(TableCell)(() => ({
  paddingTop: 0,
  paddingBottom: 0,
  width: 80,
  minWidth: 80,
  maxWidth: 80,
}));

const buildINVColumns = (roleNum) => {
  const base = [
    {
      key: "id",
      label: "Id",
      component: IdTableCell,
      sx: { width: 80, paddingLeft: "8px" },
    },
    {
      key: "rin",
      label: "Rin",
      component: StyledTableCell,
      sx: { width: 20 },
    },
    {
      key: "articulo",
      label: "Articulo",
      component: StyledTableCell,
      sx: { width: 400, overflow: "hidden", textOverflow: "ellipsis" },
    },
    {
      key: "colima",
      label: "Col",
      component: StyledTableCell,
      sx: { width: 30, textAlign: "center" },
    },
    {
      key: "manzanillo",
      label: "Man",
      component: StyledTableCell,
      sx: { width: 30, textAlign: "center" },
    },
    {
      key: "exis",
      label: "Exis",
      component: StyledTableCell,
      sx: { width: 30, textAlign: "center" },
    },
    {
      key: "precioLista",
      label: "Precio lista",
      component: StyledTableCell,
    },
  ];
  if (roleNum >= ROLES.MARKETING) {
    base.push(
      { key: "precioContado", label: "Contado", component: StyledTableCell },
      {
        key: "costo",
        label: "Costo neto",
        component: StyledTableCell,
      }
    );
  } else if (roleNum >= ROLES.SELLER) {
    base.push(
      { key: "precioContado", label: "Contado", component: StyledTableCell },
      { key: "precioConvenio", label: "Convenio", component: StyledTableCell }
    );
  } else if (roleNum >= ROLES.CLIENT) {
    base.push(
      {
        key: "contadoDist",
        label: "Contado dist",
        component: StyledTableCell,
        sx: { width: 70 },
      },
      {
        key: "creditoDist",
        label: "Credito dist",
        component: StyledTableCell,
        sx: { width: 70 },
      }
    );
  }
  if (roleNum >= ROLES.MYR_HELPER) {
    base.push({
      key: "proveedor",
      label: "Proveedor",
      component: StyledTableCell,
    });
    base.push({
      key: "disponibilidad.tiempo",
      label: "Entrega",
      component: StyledTableCell,
      sx: { width: 70 },
    });
  }
  base.push({
    key: "actualizado",
    label: "Fecha",
    component: StyledTableCell,
    sx: { width: 40 },
  });
  return base;
};

const buildCAIColumns = (roleNum) => {
  const base = [
    {
      key: "id",
      label: "Id",
      component: IdTableCell,
      sx: { width: 80, paddingLeft: "8px" },
    },
    {
      key: "rin",
      label: "Rin",
      component: StyledTableCell,
      sx: { width: 20 },
    },
    {
      key: "articulo",
      label: "Articulo",
      component: StyledTableCell,
      sx: { width: 400, overflow: "hidden", textOverflow: "ellipsis" },
    },
  ];
  if (roleNum >= ROLES.MARKETING || roleNum <= ROLES.MYR_HELPER) {
    base.push(
      {
        key: "colima",
        label: "Colima",
        component: StyledTableCell,
        sx: { width: 30, textAlign: "center" },
      },
      {
        key: "manzanillo",
        label: "Manza",
        component: StyledTableCell,
        sx: { width: 30, textAlign: "center" },
      }
    );
  }
  base.push(
    {
      key: "exis",
      label: "Exis",
      component: StyledTableCell,
      sx: { width: 30, textAlign: "center" },
    }
    // Nota: En el componente original CAI, esta columna usa key "precioContado" con label "Precio lista".
  );
  if (roleNum >= ROLES.MARKETING) {
    base.push(
      { key: "precioContado", label: "Contado", component: StyledTableCell },
      { key: "credito", label: "Credito", component: StyledTableCell },
      {
        key: "costo",
        label: "Costo neto",
        component: StyledTableCell,
      }
    );
  } else if (roleNum >= ROLES.SELLER) {
    base.push(
      { key: "precioContado", label: "Contado", component: StyledTableCell },
      { key: "volumen10", label: "Volumen 10", component: StyledTableCell }
    );
  } else if (roleNum >= ROLES.CLIENT) {
    base.push(
      {
        key: "contadoDist",
        label: "Contado dist",
        component: StyledTableCell,
        sx: { width: 70 },
      },
      {
        key: "creditoDist",
        label: "Credito dist",
        component: StyledTableCell,
        sx: { width: 70 },
      }
    );
  }
  if (roleNum >= ROLES.MYR_HELPER) {
    base.push({
      key: "proveedor",
      label: "Proveedor",
      component: StyledTableCell,
      sx: { width: 90 },
    });
    base.push({
      key: "disponibilidad.tiempo",
      label: "Entrega",
      component: StyledTableCell,
      sx: { width: 90 },
    });
  }
  base.push({
    key: "actualizado",
    label: "Fecha",
    component: StyledTableCell,
    sx: { width: 40 },
  });
  return base;
};

const buildClientesColumns = (showCredit = true) => {
  const left = [
    {
      key: "id",
      label: "Id",
      component: IdTableCell,
      sx: { width: 80, paddingLeft: "8px" },
    },
    {
      key: "articulo",
      label: "Articulo",
      component: StyledTableCell,
      sx: { width: 400, overflow: "hidden", textOverflow: "ellipsis" },
    },
  ];
  const right = [
    {
      key: "exis",
      label: "Exis",
      component: StyledTableCell,
      sx: { width: 40 },
    },
    {
      key: "disponibilidad.tiempo",
      label: "Disponibilidad",
      component: StyledTableCell,
    },
    {
      key: "contadoDist",
      label: "Precio Ctdo",
      component: StyledTableCell,
      sx: { width: 50 },
    },
    {
      key: "contadoVenta",
      label: "Venta Ctdo",
      component: StyledTableCell,
      sx: { width: 50 },
    },
  ];
  if (showCredit) {
    right.splice(
      4,
      0,
      {
        key: "creditoDist",
        label: "Precio Cred",
        component: StyledTableCell,
        sx: { width: 50 },
      },
      {
        key: "creditoVenta",
        label: "Venta Cred",
        component: StyledTableCell,
        sx: { width: 50 },
      }
    );
  }
  return [...left, ...right];
};

const TableRouter = ({
  type, // 'INV' | 'CAI' | 'CLIENTES'
  profile,
  items,
  onRowClick,
  isItemSelected,
  onToggleSelect,
  onSelectionChange,
  sortColumn,
  sortOrder,
  onSort,
  headerColor,
  priceMultiplier = 1,
  showCredit = true,
}) => {
  const roleNum = Number(profile?.role ?? 0);

  const { columns, currencyKeys } = useMemo(() => {
    if (type === "CAI") {
      return {
        columns: buildCAIColumns(roleNum),
        currencyKeys: [
          "precioContado",
          "credito",
          "volumen10",
          "vol10Cred",
          "contadoDist",
          "creditoDist",
        ],
      };
    }
    if (type === "INV") {
      return {
        columns: buildINVColumns(roleNum),
        currencyKeys: [
          "precioContado",
          "seisMeses",
          "doceMeses",
          "precioConvenio",
          "contadoDist",
          "creditoDist",
        ],
      };
    }
    // CLIENTES
    return {
      columns: buildClientesColumns(showCredit),
      currencyKeys: [
        "precioContado",
        "credito",
        "volumen10",
        "vol10Cred",
        "contadoDist",
        "contadoVenta",
        ...(showCredit ? ["creditoDist", "creditoVenta"] : []),
      ],
    };
  }, [type, roleNum, showCredit]);

  // Para el tipo CLIENTES, completar la columna "disponibilidad" usando el proveedor

  return (
    <GenericTable
      items={items}
      columns={columns}
      onRowClick={onRowClick}
      isItemSelected={isItemSelected}
      onToggleSelect={onToggleSelect}
      onSelectionChange={onSelectionChange}
      sortColumn={sortColumn}
      sortOrder={sortOrder}
      onSort={onSort}
      headerColor={headerColor}
      currencyKeys={currencyKeys}
      priceMultiplier={priceMultiplier}
    />
  );
};

export default TableRouter;
