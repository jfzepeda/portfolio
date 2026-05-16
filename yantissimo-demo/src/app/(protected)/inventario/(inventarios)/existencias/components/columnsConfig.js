// src/components/ExistenciasTable.jsx
import { TableCell } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledTableCell = styled(TableCell)(() => ({
  whiteSpace: "nowrap",
  padding: 8,
  width: 60,
}));

export const IdTableCell = styled(TableCell)(() => ({
  paddingTop: 0,
  paddingBottom: 0,
  margin: 0,
  width: 80,
  minWidth: 80,
  maxWidth: 80,
}));

export const ExisTableCell = styled(TableCell)({
  whiteSpace: "nowrap",
  padding: "0.5rem", // 8px
  width: 30,
});

export const columns = [
  {
    key: "id",
    label: "Id",
    comp: IdTableCell,
    sx: { width: 40, paddingLeft: "8px" },
  },
  {
    key: "articulo",
    label: "Artículo",
    comp: StyledTableCell,
    sx: { width: 350, overflow: "hidden", textOverflow: "ellipsis" },
  },
  { key: "tec", label: "TEC", comp: ExisTableCell },
  { key: "bjz", label: "BJZ", comp: ExisTableCell },
  { key: "nhs", label: "NHS", comp: ExisTableCell },
  { key: "con", label: "CON", comp: ExisTableCell },
  { key: "mor", label: "MOR", comp: ExisTableCell },
  { key: "rey", label: "REY", comp: ExisTableCell },
  { key: "blv", label: "BLV", comp: ExisTableCell },
  { key: "mmz", label: "MMZ", comp: ExisTableCell },
  { key: "mzo", label: "MZO", comp: ExisTableCell },
  { key: "cds", label: "CDS", comp: ExisTableCell },
  { key: "llr", label: "LLR", comp: ExisTableCell },
  { key: "trs", label: "TRS", comp: ExisTableCell },
  { key: "dlg", label: "DLG", comp: ExisTableCell },

  {
    key: "manzanillo",
    label: "Manza",
    comp: ExisTableCell,
    sx: { width: 35 },
  },
  {
    key: "colima",
    label: "Colima",
    comp: ExisTableCell,
    sx: { width: 35 },
  },
  {
    key: "exis",
    label: "Suma",
    comp: ExisTableCell,
  },
  {
    key: "costo",
    label: "Costo",
    comp: StyledTableCell,
    sx: { width: 50 },
  },
  {
    key: "total_exis",
    label: "Total global",
    comp: StyledTableCell,
    // sx: { width: 50 },
  },
];
