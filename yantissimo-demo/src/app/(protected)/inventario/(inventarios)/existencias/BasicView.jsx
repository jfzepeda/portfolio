"use client";
import React from "react";
import api from "~/lib/api";
import {
  Alert,
  Box,
  CircularProgress,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useAppTheme } from "~/theme";
import { getUserProfile } from "~/utils/session.js";
import { TestBadge } from "~/resources/badges.jsx";
import ItemModal from "~/components/ItemModal/Auto.jsx";
import ItemModalCAI from "~/components/ItemModal/CAI.jsx";
import Header from "~/components/header";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const userProfile = getUserProfile();
const curRole = userProfile ? userProfile.role : null;
const curSuc = userProfile ? userProfile.sucursal : null;

const BasicExistenciasView = () => {
  const theme = useAppTheme();
  const [rawData, setRawData] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedTerm = useDebounce(searchTerm, 300);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [openDetailModal, setOpenDetailModal] = React.useState(false);
  const [openDetailModalCAI, setOpenDetailModalCAI] = React.useState(false);
  const [detailItem, setDetailItem] = React.useState(null);

  React.useEffect(() => {
    async function fetchBranchStock() {
      try {
        setLoading(true);
        setError("");
        const encoded = encodeURIComponent(debouncedTerm);
        const suc = encodeURIComponent(curSuc ?? "");
        const endpoint = `/api/inv/exis-basic?searchTerm=${encoded}&sucursal=${suc}`;
        const response = await api(endpoint);
        if (!response.ok)
          throw new Error("Error al obtener existencias por sucursal");
        const data = await response.json();
        setRawData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar existencias por sucursal:", err);
        setRawData([]);
        setError("No fue posible obtener existencias para tu sucursal.");
      } finally {
        setLoading(false);
      }
    }
    fetchBranchStock();
  }, [debouncedTerm]);

  const [sortColumn, setSortColumn] = React.useState("id");
  const [sortOrder, setSortOrder] = React.useState("asc");
  const handleSort = (column) => {
    if (sortColumn !== column) {
      setSortColumn(column);
      setSortOrder("asc");
    } else if (sortOrder === "asc") {
      setSortOrder("desc");
    } else {
      setSortColumn("id");
      setSortOrder("asc");
    }
  };

  const items = React.useMemo(() => rawData, [rawData]);
  const sortedItems = React.useMemo(() => {
    const arr = items.slice();
    return arr.sort((a, b) => {
      const aVal = a?.[sortColumn];
      const bVal = b?.[sortColumn];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "number" && typeof bVal === "number")
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
        : String(bVal).localeCompare(String(aVal), undefined, {
            numeric: true,
          });
    });
  }, [items, sortColumn, sortOrder]);

  const handleRowClick = (item) => {
    setDetailItem(item);
    if (item.categoria === "camion") setOpenDetailModalCAI(true);
    else setOpenDetailModal(true);
  };

  const columns = [
    { key: "id", label: "Id", width: 50 },
    { key: "articulo", label: "Artículo", width: "auto" },
    { key: "exis", label: "exis", width: 50 },
    { key: "lock", label: "lock", width: 50 },
    { key: "sold", label: "sold", width: 50 },
    { key: "yaol", label: "yaol", width: 50 },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Header
          title={
            <>
              Existencias
              <TestBadge />
            </>
          }
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            columnGap: 2,
            mb: 2,
          }}
        >
          <span />
          <TextField
            label="Buscar"
            variant="standard"
            InputLabelProps={{ shrink: true }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ej: 255/55R18; michelin"
            sx={{ mr: 10, width: 300 }}
          />
          <span />
        </Box>
        {error ? <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert> : null}
        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
            <CircularProgress size={28} />
          </Box>
        ) : null}
        {!loading && sortedItems.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Sin registros para esta búsqueda o para tu sucursal actual. Prueba con
            otra medida o limpia el filtro.
          </Alert>
        ) : null}
        <TableContainer component={Paper}>
          <Table sx={{ tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                {columns.map((c) => (
                  <TableCell
                    key={c.key}
                    sortDirection={sortColumn === c.key ? sortOrder : false}
                    sx={{
                      cursor: "pointer",
                      width: c.width,
                      maxWidth: c.width,
                      whiteSpace: c.key === "articulo" ? "nowrap" : "normal",
                    }}
                  >
                    <TableSortLabel
                      active={sortColumn === c.key}
                      direction={sortOrder}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSort(c.key);
                      }}
                    >
                      {c.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedItems.map((item) => (
                <TableRow
                  key={item.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleRowClick(item)}
                >
                  {columns.map((c) => (
                    <TableCell
                      key={c.key}
                      sx={{
                        width: c.width,
                        maxWidth: c.width,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: c.key === "articulo" ? "nowrap" : "normal",
                        py: 0,
                        height: 43,
                      }}
                    >
                      {item?.[c.key] ??
                        (typeof item?.[c.key] === "number" ? 0 : "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <ItemModal
        open={openDetailModal}
        item={detailItem}
        onClose={() => setOpenDetailModal(false)}
        curRole={curRole}
      />
      <ItemModalCAI
        open={openDetailModalCAI}
        item={detailItem}
        onClose={() => setOpenDetailModalCAI(false)}
        curRole={curRole}
      />
    </ThemeProvider>
  );
};

export default BasicExistenciasView;
