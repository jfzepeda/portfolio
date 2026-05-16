// src/app/(protected)/inventario/(inventarios)/existencias/AdminView.jsx
"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import { useAppTheme } from "~/theme";
import { ThemeProvider } from "@mui/material/styles";
import { getUserProfile } from "~/utils/session.js";
import SettingsIcon from "@mui/icons-material/Settings";
import { TestBadge } from "~/resources/badges.jsx";

import InventoryTable from "./components/table.jsx";
import ColSelector from "./components/colSelector.jsx";
import { fetchExis, updateItem } from "./exisApi.js";
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

const AdminExistenciasView = () => {
  const theme = useAppTheme();
  const [rawData, setRawData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedTerm = useDebounce(searchTerm, 300);
  const [stockType, setStockType] = useState("exis");
  const [openColDialog, setOpenColDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const columnOptions = {
    default: [
      { key: "tec", label: "TEC" },
      { key: "bjz", label: "BJZ" },
      { key: "nhs", label: "NHS" },
      { key: "con", label: "CON" },
      { key: "mor", label: "MOR" },
      { key: "rey", label: "REY" },
      { key: "blv", label: "BLV" },
      { key: "mmz", label: "MMZ" },
      { key: "mzo", label: "MZO" },
      { key: "cds", label: "CDS" },
      { key: "llr", label: "LLR" },
      { key: "trs", label: "TRS" },
      { key: "dlg", label: "DLG" },
    ],
  };

  const initialVisible = Object.fromEntries(
    Object.entries(columnOptions).map(([k, cols]) => [
      k,
      cols
        .filter((c) => c.label === curSuc || c.label === "TEC")
        .map((c) => c.key),
    ])
  );
  const [visibleColumns, setVisibleColumns] = useState(initialVisible);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchExis(debouncedTerm, stockType)
      .then((data) => {
        if (!active) return;
        setRawData(data);
      })
      .catch((err) => {
        console.error("Error al cargar existencias:", err);
        if (!active) return;
        setRawData([]);
        setError("No fue posible cargar existencias para este filtro.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [debouncedTerm, stockType]);

  const [sortColumn, setSortColumn] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const handleSort = useCallback(
    (column) => {
      if (sortColumn !== column) {
        setSortColumn(column);
        setSortOrder("asc");
      } else if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortColumn("id");
        setSortOrder("asc");
      }
    },
    [sortColumn, sortOrder]
  );

  const processedData = useMemo(
    () => (Array.isArray(rawData) ? rawData : []),
    [rawData]
  );

  const sortedItems = useMemo(() => {
    return processedData.slice().sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
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
  }, [processedData, sortColumn, sortOrder]);

  const handleRowClick = (item) => {
    console.log("Artículo seleccionado:", item);
    const newCost = window.prompt(
      `Costo actual: $${item.costo}\nIngresa el nuevo costo para: \n ${item.articulo}:`,
      String(item.costo)
    );
    updateItem(item.id, newCost).then((updated) => {
      console.log("Artículo actualizado:", updated);
      setRawData((prev) =>
        prev.map((it) =>
          it.id === updated.id ? { ...it, costo: updated.costo } : it
        )
      );
    });
  };

  const handleColumns = () => setOpenColDialog(!openColDialog);
  const handleStockTypeChange = (e) => setStockType(e.target.value);

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
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              variant="contained"
              color="bleus"
              sx={{ my: 2, mr: 2 }}
              onClick={handleColumns}
            >
              <SettingsIcon />
            </IconButton>
          </Box>
          <TextField
            label="Buscar"
            variant="standard"
            InputLabelProps={{ shrink: true }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ej: 255/55R18; michelin"
            sx={{ mr: 10, width: 300 }}
          />
          <Box
            sx={{ display: "flex", alignItems: "center", justifySelf: "end" }}
          >
            <FormControl sx={{ width: 200 }} variant="standard">
              <InputLabel>Tipo de stock</InputLabel>
              <Select
                label="Tipo de stock"
                value={stockType}
                onChange={handleStockTypeChange}
              >
                <MenuItem value="exis">Disponible</MenuItem>
                <MenuItem value="lock">Bloqueadas</MenuItem>
                <MenuItem value="sold">Vendidas</MenuItem>
                <MenuItem value="yaol">Yaol</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        {error ? <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert> : null}
        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
            <CircularProgress size={28} />
          </Box>
        ) : null}
        {!loading && sortedItems.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No hay registros para el tipo de stock seleccionado. Ajusta la búsqueda
            o cambia el filtro para ver existencias.
          </Alert>
        ) : null}
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          <InventoryTable
            items={sortedItems}
            onRowClick={handleRowClick}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={handleSort}
            visibleColumns={visibleColumns["default"]}
            sufix={stockType}
          />
        </Box>
      </Box>
      <ColSelector
        open={openColDialog}
        onClose={() => setOpenColDialog(false)}
        columns={columnOptions["default"]}
        visibleColumns={visibleColumns["default"]}
        setVisibleColumns={(cols) =>
          setVisibleColumns((prev) => ({ ...prev, ["default"]: cols }))
        }
        curRole={curRole}
      />
    </ThemeProvider>
  );
};

export default AdminExistenciasView;
