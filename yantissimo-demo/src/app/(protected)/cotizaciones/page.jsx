// src/pages/Cotizaciones.jsx
"use client";
import api from "~/lib/api";
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
import dayjs from "dayjs";

import { getUserProfile, getSucursal, getCotiFilter } from "~/utils/session";
import { ROLES, SUCS } from "~/utils/global";

import QuoteSummaryModal from "~/components/modal/modal.jsx";
import CreatePrequoteDialog from "./components/CreatePrequote.jsx";
import AssignSeller from "./components/AssignSeller.jsx";
import QuotesTable from "./components/table";
import fetchQuotes from "~/lib/fetchAllQuotes.js";
import { archiveEvent, unarchiveEvent } from "~/lib/archive.js";
import Header from "~/components/header";

// Crear una copia local del array
const sucursales = [...SUCS, "Todas"];
const quoteStage = [
  { key: "Todas", label: "Todas" },
  { key: "prequote", label: "Pre-coti" },
  { key: "quote", label: "Abierta" },
  { key: "followup", label: "Seguimiento" },
  { key: "event", label: "Programada" },
  { key: "archived", label: "Archivada" },
];

const SearchPage = () => {
  // Estados principales
  const [mounted, setMounted] = useState(false);
  const [curSuc, setCurSuc] = useState(null);
  const [curRole, setCurRole] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [typeFilter, setTypeFilter] = useState("Todas"); // 'activas' o 'archivadas'
  const [sucFilter, setSucFilter] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  // const [newDate, setNewDate] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newQuoteData, setNewQuoteData] = useState(null);
  const [openAssignSeller, setOpenAssignSeller] = useState(false);

  // Leer perfil y sucursal solo en cliente para evitar mismatch
  useEffect(() => {
    const profile = getUserProfile();
    setCurSuc(profile?.sucursal ?? null);
    setCurRole(profile?.role ?? null);
    setSucFilter(getSucursal() ?? profile?.sucursal ?? "Todas");
    setTypeFilter(getCotiFilter() ?? "Todas");
    setMounted(true);
  }, []);

  // Cargar cotizaciones desde el backend
  useEffect(() => {
    let active = true;
    (async () => {
      const quotesMapped = await fetchQuotes(
        sucFilter,
        curSuc,
        typeFilter,
        searchTerm,
        api,
        dayjs
      );
      console.log("Cotizaciones cargadas:", quotesMapped);
      if (active) setQuotes(quotesMapped || []);
    })();
    return () => {
      active = false;
    };
  }, [sucFilter, typeFilter, searchTerm, curSuc]);

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

  const handleSaveNewQuote = (quoteData) => {
    const formattedQuote = {
      ...quoteData,
      items:
        typeof quoteData.items === "string"
          ? JSON.parse(quoteData.items)
          : quoteData.items,
    };

    setQuotes((prevEvents) => {
      const exists = prevEvents.some((ev) => ev.id === formattedQuote.id);
      const updatedEvents = exists
        ? prevEvents.map((ev) =>
            ev.id === formattedQuote.id ? formattedQuote : ev
          )
        : [...prevEvents, formattedQuote];
      return updatedEvents;
    });
    setNewQuoteData(null);
  };

  // Función que se invoca desde el modal al hacer clic en editar
  const router = useRouter();
  const handleOpenSuite = (quoteData) => {
    router.push(`/cotizaciones/${quoteData.id}/pre`);
  };

  const handleArchive = async (quote) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta cotización?")) {
      const updatedQuote = await archiveEvent(quote);
      const updatedQuotes = quotes.filter((q) => q.id !== updatedQuote.id);
      setQuotes(updatedQuotes);
    }
  };

  const handleRecover = async (quote) => {
    await unarchiveEvent(quote);
    window.location.reload();
  };

  const handleAssignSeller = (quoteData) => {
    setOpenAssignSeller(true);
    setNewQuoteData(quoteData);
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
        title="Módulo de Cotizaciones"
        subtitle="Busca, edita y crea cotizaciones"
        actions={
          <Button
            variant="contained"
            onClick={() => {
              setNewQuoteData({ channel: "Online", items: [] });
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
            InputLabelProps={{ shrink: true }}
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
          {(curRole ?? 0) >= ROLES.MARKETING ? (
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
              value={curSuc ?? ""}
              disabled
              sx={{ width: 200 }}
              variant="standard"
            />
          )}
        </Box>
      </Box>
      <QuotesTable
        quotes={quotes}
        handleRowClick={handleRowClick}
        handleOpenSuite={handleOpenSuite}
        handleArchive={handleArchive}
        handleRecover={handleRecover}
        handleAssignSeller={handleAssignSeller}
        curRole={curRole}
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
      <CreatePrequoteDialog
        open={openCreateDialog}
        handleClose={() => {
          setOpenCreateDialog(false);
          setNewQuoteData(null);
        }}
        initialData={newQuoteData}
        onQuoteSaved={() => {
          setOpenCreateDialog(false);
        }}
      />
      <AssignSeller
        open={openAssignSeller}
        handleClose={() => {
          setOpenAssignSeller(false);
        }}
        initialData={newQuoteData}
        onQuoteSaved={(savedQuote) => {
          setOpenAssignSeller(false);
          handleSaveNewQuote(savedQuote);
        }}
      />
    </Box>
  );
};

export default SearchPage;
