// src/pages/Inventory/Page.jsx
"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CreateQuoteDialog from "~/components/CreateQuoteDialog.jsx";
import MICHTable from "./tables/MICHTable.jsx";
import ColSelector from "./components/colSelector.jsx";

import ItemModal from "~/components/ItemModal/Auto.jsx";
import ItemModalCAI from "~/components/ItemModal/CAI.jsx";
import { keyframes } from "@emotion/react";
import { getUserProfile, ROLES } from "~/utils/session.js";
import { currencyFormatter, percentFormatter } from "~/utils/formaters.js";
import api from "~/lib/api";
import Header from "~/components/header";

// Simple debounce hook to avoid running expensive filters on every keystroke
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const fade = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

const MichelinPage = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    try {
      const p = getUserProfile();
      setProfile(p || null);
    } catch (_e) {
      setProfile(null);
    }
  }, []);

  const curRole = profile?.role ?? null;
  const curSuc = profile?.sucursal ?? null;
  const [rawData, setRawData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Debounced version of the search term (300 ms)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [tableFilter, setTableFilter] = useState("inv_michelin");
  const [showCopyIcon, setShowCopyIcon] = useState(false);
  // const [showToast, setShowToast] = useState(false);
  const [copyIconPosition, setCopyIconPosition] = useState({ x: 0, y: 0 });
  const [selectedIds, setSelectedIds] = useState([]);
  // Persist full item data for every selected checkbox so the selection survives new searches
  const [selectedItems, setSelectedItems] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openColDialog, setOpenColDialog] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);

  // Column options for each inventory table
  const columnOptions = {
    inv_auto: [
      { key: "cedis", label: "CDS" },
      { key: "tec", label: "TEC" },
      { key: "bjz", label: "BJZ" },
      { key: "mzo", label: "MZO" },
      { key: "cons", label: "CON" },
      { key: "nh", label: "NHS" },
      { key: "llntr", label: "LLR" },
      { key: "blvd", label: "BLV" },
      { key: "tersa", label: "TRS" },
      { key: "morales", label: "MOR" },
      { key: "colinas", label: "REY" },
    ],
    inv_cai: [
      { key: "cedis", label: "CDS" },
      { key: "morales", label: "MOR" },
      { key: "llantrac", label: "LLR" },
      { key: "benitoJuarez", label: "BJZ" },
      { key: "blvd", label: "BLV" },
      { key: "mzo", label: "MZO" },
      { key: "moralesMzo", label: "MMZ" },
    ],
    inv_michelin: [],
  };

  const initialVisible = Object.fromEntries(
    Object.entries(columnOptions).map(([k, cols]) => [
      k,
      cols
        .filter((c) => c.label === curSuc || c.label === "CDS")
        .map((c) => c.key),
    ])
  );
  const [visibleColumns, setVisibleColumns] = useState(initialVisible);

  useEffect(() => {
    async function fetchInventory() {
      try {
        const response = await api(
          `/api/inv/${tableFilter}?searchTerm=${debouncedSearchTerm}`
        );
        if (!response.ok) {
          throw new Error("Error al obtener inventario");
        }
        const data = await response.json();
        setRawData(data);
      } catch (error) {
        console.error("Error al cargar inventario:", error);
      }
    }
    fetchInventory();
  }, [tableFilter, debouncedSearchTerm]);

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

  const processedData = useMemo(() => {
    return Array.isArray(rawData) ? rawData : [];
  }, [rawData]);

  const sortedItems = useMemo(() => {
    return processedData.slice().sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
        : String(bVal).localeCompare(String(aVal), undefined, {
            numeric: true,
          });
    });
  }, [processedData, sortColumn, sortOrder]);

  const handleRowClick = useCallback((event, item) => {
    const articleText = `${item.articulo}`;
    setCopyIconPosition({ x: event.clientX, y: event.clientY });
    setShowCopyIcon(true);
    // setShowToast(true);
    setTimeout(() => setShowCopyIcon(false), 300);
    // setTimeout(() => setShowToast(false), 2000);
    navigator.clipboard
      .writeText(articleText)
      .then(() => {
        console.log(`Artículo copiado: ${articleText}`);
      })
      .catch((err) => {
        console.error("Error al copiar el artículo: ", err);
      });
  }, []);

  const handleDetailRowClick = useCallback(
    (item) => {
      if (tableFilter === "inv_cai") {
        setDetailItem(item);
      } else {
        setDetailItem({
          ...item,
          precioLista: item.precioLista || item.preciolista || item.precio,
          promo_2pz: item.promo_2pz || item.precioContado * 2,
          promo_4pz: item.promo_4pz || item.precioContado * 4,
          envio: item.extras.envio || 0,
        });
      }
      setOpenDetailModal(true);
    },
    [tableFilter]
  );

  const handleCheckboxChange = (id, checked) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((existingId) => existingId !== id)
    );
    setSelectedItems((prev) => {
      if (checked) {
        const item = processedData.find((itm) => itm.id === id);
        return item ? { ...prev, [id]: item } : prev;
      }
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleQuickQuote = () => {
    // Extract artículo and precio de lista for each selected ID
    const selectedItemsData = selectedIds
      .map((id) => selectedItems[id])
      .filter(Boolean)
      .map((rawItem) => ({
        article: rawItem.articulo,
        price: Number(
          rawItem.precioLista ?? rawItem.preciolista ?? rawItem.precio
        ),
        units: 1,
        precios: {
          precioContado: rawItem.precioContado,
          seisMeses: rawItem.seisMeses,
          doceMeses: rawItem.doceMeses,
          promo_2pz: rawItem.promo_2pz / 2 || rawItem.preciocontado,
          promo_4pz: rawItem.promo_4pz / 4 || rawItem.preciocontado,
          precioconvenio: rawItem.precioconvenio || rawItem.preciocontado,
          contadoDist: rawItem.contadoDist,
          creditoDist: rawItem.creditoDist,
        },
        promo: "",
      }));
    setSelectedEvent({ channel: "Online", items: selectedItemsData });
    setOpenCreateDialog(true);
  };

  const handleUnselectAll = () => {
    setSelectedIds([]);
    setSelectedItems({});
  };

  const handleTable = (e) => {
    setTableFilter(e.target.value);
    setSelectedIds([]);
    setSelectedItems({});
  };

  return (
    <Box>
      <Box>
        <Header
          title="Inventario Michelin"
          subtitle="Verifique los precios y promociones antes de cotizar."
          subtitleSx={{ typography: "h6" }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <FormControl sx={{ mt: 2, width: 200 }} variant="standard">
            <InputLabel>Tabla</InputLabel>
            <Select label="Tabla" value={tableFilter} onChange={handleTable}>
              <MenuItem key={"MICH"} value={"inv_michelin"}>
                Michelin
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Buscar"
            variant="standard"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ej: 255/55R18; michelin"
            sx={{ mr: 10, width: 300, mt: 2 }}
          />
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ my: 2 }}>
              {selectedIds.length}
            </Typography>
            <IconButton
              variant="contained"
              color="bleus"
              onClick={handleUnselectAll}
            >
              <DeleteOutlineIcon />
            </IconButton>
            {curRole >= ROLES.MYR_SELLER && (
              <>
                <Button
                  variant="contained"
                  sx={{ my: 2 }}
                  onClick={handleQuickQuote}
                >
                  Crear Cotización
                </Button>
              </>
            )}
          </Box>
        </Box>
        {/* Antiguo condicional de tablas */}
        <MICHTable
          items={sortedItems}
          onRowClick={handleRowClick}
          onDetailClick={handleDetailRowClick}
          selectedIds={selectedIds}
          onCheckboxChange={handleCheckboxChange}
          currencyFormatter={currencyFormatter}
          percentFormatter={percentFormatter}
          showCopyIcon={showCopyIcon}
          copyIconPosition={copyIconPosition}
          sortColumn={sortColumn}
          sortOrder={sortOrder}
          onSort={handleSort}
          visibleColumns={visibleColumns["inv_michelin"]}
          curRole={curRole}
        />
        <CreateQuoteDialog
          open={openCreateDialog}
          handleClose={() => {
            setOpenCreateDialog(false);
            setSelectedEvent(null);
          }}
          initialData={selectedEvent}
          onQuoteSaved={() => {
            setOpenCreateDialog(false);
          }}
          isEditing={false}
          isQuickQuote={true}
        />
      </Box>
      {showCopyIcon && (
        <ContentCopyIcon
          sx={{
            position: "fixed",
            top: copyIconPosition.y,
            left: copyIconPosition.x,
            transform: "translate(-120%, -30%)",
            zIndex: 1300,
            animation: `${fade} 0.3s`,
            backgroundColor: "white",
          }}
        />
      )}
      <ColSelector
        open={openColDialog}
        onClose={() => setOpenColDialog(false)}
        columns={columnOptions[tableFilter]}
        visibleColumns={visibleColumns[tableFilter]}
        setVisibleColumns={(cols) =>
          setVisibleColumns((prev) => ({ ...prev, [tableFilter]: cols }))
        }
        curRole={curRole}
      />
      {tableFilter === "inv_cai" ? (
        <ItemModalCAI
          open={openDetailModal}
          item={detailItem}
          onClose={() => setOpenDetailModal(false)}
          curRole={curRole}
        />
      ) : (
        <ItemModal
          open={openDetailModal}
          item={detailItem}
          onClose={() => setOpenDetailModal(false)}
          curRole={curRole}
        />
      )}
    </Box>
  );
};

export default MichelinPage;
