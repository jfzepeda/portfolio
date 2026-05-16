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

import { getUserProfile, getCotiFilter } from "~/utils/session";

import QuoteSummaryModal from "~/components/modal/modal-clientes";
import AssignSeller from "~/app/(protected)/cotizaciones/components/AssignSeller.jsx";
import PedidosTable from "./components/table.jsx";
import fetchOrders from "~/lib/fetchOrders.js";
import { downloadInvoice } from "~/lib/invoiceApi.js";
import { archiveEvent, unarchiveEvent } from "~/lib/archive.js";
import Header from "~/components/header";

// Crear una copia local del array
const quoteStage = [
  { key: "Todas", label: "Todas" },
  { key: "cartdraft", label: "Carrito" },
  { key: "sentorder", label: "Solicitado" },
  { key: "confirmed", label: "Confirmada" },
  { key: "part-invoiced", label: "Parcialmente facturada" },
  { key: "invoiced", label: "Facturada" },
  { key: "archived", label: "Archivada" },
  { key: "canceled", label: "Cancelada" },
];

const SearchPage = () => {
  // Estados principales
  const [mounted, setMounted] = useState(false);
  const [curProfile, setCurProfile] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [typeFilter, setTypeFilter] = useState("Todas"); // 'activas' o 'archivadas'
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [newQuoteData, setNewQuoteData] = useState(null);
  const [openAssignSeller, setOpenAssignSeller] = useState(false);

  // Leer perfil y sucursal solo en cliente para evitar mismatch
  useEffect(() => {
    const profile = getUserProfile();
    setCurProfile(profile ?? null);
    setTypeFilter(getCotiFilter ?? "Todas");
    setMounted(true);
  }, []);

  // Cargar cotizaciones desde el backend
  useEffect(() => {
    async function fetchData() {
      const quotesMapped = await fetchOrders({
        profile: curProfile,
        type: typeFilter,
        searchTerm: searchTerm,
      });
      setQuotes(quotesMapped || []);
    }
    if (!curProfile?.role) return;
    fetchData();
  }, [typeFilter, searchTerm, curProfile]);

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
    const dest =
      quoteData.type === "counteroffer" ? "cartdraft" : quoteData.type;
    router.push(`/clientes/inventario/${quoteData.id}/${dest}`);
  };

  const handleArchive = async (quote) => {
    const updatedQuote = await archiveEvent(quote, "orders");
    const updatedQuotes = quotes.filter((q) => q.id !== updatedQuote.id);
    setQuotes(updatedQuotes);
  };

  const handleRecover = async (quote) => {
    await unarchiveEvent(quote, "orders");
    window.location.reload();
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
        title="Pedidos"
        subtitle="Busca tus Ordenes de Compra"
        actions={
          <Button
            variant="contained"
            onClick={() => {
              router.push("/clientes/inventario");
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
          <TextField
            label="Sucursal"
            fullWidth
            value={curProfile?.sucursal ?? ""}
            disabled
            sx={{ width: 200 }}
            variant="standard"
          />
        </Box>
      </Box>
      <PedidosTable
        quotes={quotes}
        handleRowClick={handleRowClick}
        handleOpenSuite={handleOpenSuite}
        handleArchive={handleArchive}
        handleRecover={handleRecover}
        downloadInvoice={downloadInvoice}
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
