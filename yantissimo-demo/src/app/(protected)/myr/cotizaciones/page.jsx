// src/pages/Cotizaciones.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  TextField,
} from "@mui/material";

import {
  getUserProfile,
  getSucursal,
  getCotiFilter,
  ROLES,
} from "~/utils/session";

import QuoteSummaryModal from "~/components/modal/modal.jsx";
import CreateOrderDialog from "./components/CreateOrder.jsx";
import PedidosTable from "~/components/mayoreo/ordersTable.jsx";
import fetchPreorders from "./functions/fetchPreorders.js";
import { archiveEvent, unarchiveEvent } from "~/lib/archive.js";
import Header from "~/components/header";

// Crear una copia local del array
const sucursales = ["MYRMZO", "MYRCOL", "Todas"];
const quoteStage = [
  { key: "Todas", label: "Todas" },
  { key: "prequote", label: "Pre-coti" },
  { key: "archived", label: "Archivada" },
];

const SearchPage = () => {
  // Estados principales
  const [mounted, setMounted] = useState(false);
  const [curProfile, setCurProfile] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [typeFilter, setTypeFilter] = useState("Todas"); // 'activas' o 'archivadas'
  const [sucFilter, setSucFilter] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  // const [newDate, setNewDate] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  // Leer perfil y sucursal solo en cliente para evitar mismatch
  useEffect(() => {
    const profile = getUserProfile();
    setCurProfile(profile ?? null);
    setSucFilter(getSucursal() ?? profile?.sucursal ?? "Todas");
    setTypeFilter(getCotiFilter ?? "Todas");
    setMounted(true);
  }, []);

  // Cargar cotizaciones desde el backend
  useEffect(() => {
    let active = true;
    (async () => {
      const quotesMapped = await fetchPreorders({
        profile: curProfile,
        type: typeFilter,
        searchTerm,
      });
      if (active) setQuotes(quotesMapped || []);
    })();
    return () => {
      active = false;
    };
  }, [sucFilter, typeFilter, searchTerm, curProfile]);

  // Abrir diálogo de detalle (y en caso de cotizaciones sin fecha se podrá asignar)
  const handleRowClick = (quote) => {
    setModalData({
      // Al hacer click en una fila se abre el modal de resumen
      ...quote,
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalData(null);
  };

  // Propagar cambios de tipo desde el modal hacia la tabla y el propio modal
  const handleTypeUpdate = (quoteId, newType) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, type: newType } : q))
    );
    setModalData((prev) =>
      prev && prev.id === quoteId ? { ...prev, type: newType } : prev
    );
  };

  // Función que se invoca desde el modal al hacer clic en editar
  const router = useRouter();
  const handleOpenSuite = (quoteData) => {
    router.push(`/myr/pedidos/${quoteData.id}/preorder`);
  };

  const handleArchive = async (quote) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta cotización?")) {
      const updatedQuote = await archiveEvent(quote, "orders");
      const updatedQuotes = quotes.filter((q) => q.id !== updatedQuote.id);
      setQuotes(updatedQuotes);
    }
  };

  const handleRecover = async (quote) => {
    await unarchiveEvent(quote, "orders");
    window.location.reload();
  };

  const handleSucChange = (e) => {
    const suc = e.target.value;
    setSucFilter(suc);
    if (suc !== "Todas") {
      localStorage.setItem("sucursal", suc);
    } else {
      localStorage.removeItem("sucursal");
    }
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setTypeFilter(type);
    localStorage.setItem("cotifilter", type);
  };

  if (!mounted) return null; // evitar contenido distinto entre SSR y cliente

  return (
    <Box>
      <Header
        title="Cotizaciones de MYR"
        subtitle="Busca, edita y crea cotizaciones de MYR"
        actions={
          <Button
            variant="contained"
            onClick={() => {
              setOpenCreateDialog(true);
            }}
          >
            Crear Cotización
          </Button>
        }
      />
      <Box
        sx={{
          display: "flex",
          mb: 2,
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <FormControl sx={{ width: 200 }} variant="standard">
            <InputLabel>Estatus</InputLabel>
            <Select
              label="Sucursal"
              value={typeFilter}
              onChange={handleTypeChange}
            >
              {quoteStage.map(({ key, label }) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
          <TextField
            label="Buscar"
            variant="standard"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Teléfono, nombre, vendedor o vehículo"
            sx={{ width: 300 }}
          />
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {(curProfile?.role ?? 0) >= ROLES.MARKETING ? (
            <FormControl sx={{ width: 200 }} variant="standard">
              <InputLabel>Sucursal</InputLabel>
              <Select
                label="Sucursal"
                value={sucFilter || ""}
                onChange={handleSucChange}
              >
                {sucursales.map((suc) => (
                  <MenuItem key={suc} value={suc}>
                    {suc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              label="Sucursal"
              fullWidth
              value={curProfile?.sucursal ?? ""}
              disabled
              sx={{ width: 200 }}
              variant="standard"
            />
          )}
        </Box>
      </Box>
      <PedidosTable
        quotes={quotes}
        handleRowClick={handleRowClick}
        handleOpenSuite={handleOpenSuite}
        handleArchive={handleArchive}
        handleRecover={handleRecover}
        curRole={curProfile?.role}
      />

      {/* Modal de resumen de cotización */}
      {showModal && modalData && (
        <QuoteSummaryModal
          data={modalData}
          onClose={handleModalClose}
          onTypeChange={handleTypeUpdate}
        />
      )}

      {/* Diálogo para crear cotización directamente en /search */}
      <CreateOrderDialog
        open={openCreateDialog}
        handleClose={() => {
          setOpenCreateDialog(false);
        }}
        onQuoteSaved={() => {
          setOpenCreateDialog(false);
        }}
        profile={curProfile}
      />
    </Box>
  );
};

export default SearchPage;
