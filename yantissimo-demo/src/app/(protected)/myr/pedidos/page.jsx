// src/pages/Cotizaciones.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  TextField,
} from "@mui/material";

import { getUserProfile, getCotiFilter, ROLES } from "~/utils/session";

import QuoteSummaryModal from "~/components/modal/modal-myr";
import PedidosTable from "~/components/mayoreo/ordersTable.jsx";
import fetchOrders, { fetchDistribuidores } from "~/lib/fetchOrders.js";
import { archiveEvent, unarchiveEvent } from "~/lib/archive.js";
import Header from "~/components/header";

// Crear una copia local del array
const quoteStage = [
  { key: "Todas", label: "Todas" },
  { key: "sentorder", label: "Pedidos" },
  { key: "counteroffer", label: "Revision" },
  { key: "confirmed", label: "Confirmada" },
  { key: "part-invoiced", label: "Parcialmente facturada" },
  { key: "invoiced", label: "Facturada" },
  { key: "ondelivery", label: "En camino" },
  { key: "delivered", label: "Entregada" },
  { key: "archived", label: "Archivada" },
  { key: "canceled", label: "Cancelada" },
];

const PedidosPage = () => {
  // Estados principales
  const [mounted, setMounted] = useState(false);
  const [curProfile, setProfile] = useState({});
  const [quotes, setQuotes] = useState([]);
  const [typeFilter, setTypeFilter] = useState("sentorder"); // 'activas' o 'archivadas'
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [companyFilter, setCompanyFilter] = useState(0);
  const [companies, setCompanies] = useState([]);

  // Leer perfil y sucursal solo en cliente para evitar mismatch
  useEffect(() => {
    const profile = getUserProfile();
    setProfile(profile);
    setTypeFilter(getCotiFilter ?? "Todas");
    setMounted(true);
    fetchDistribuidores().then((data) => {
      const companyList = data.map((d) => d);
      setCompanies(companyList);
    });
  }, []);

  // Cargar cotizaciones desde el backend
  useEffect(() => {
    async function fetchData() {
      const quotesMapped = await fetchOrders({
        profile: curProfile,
        type: typeFilter,
        searchTerm: searchTerm,
        company: companyFilter || "", // companyFilter para admin
      });
      setQuotes(quotesMapped || []);
    }
    if (!curProfile?.role) return;
    fetchData();
  }, [typeFilter, searchTerm, curProfile, companyFilter]);

  // Abrir diálogo de detalle (y en caso de cotizaciones sin fecha se podrá asignar)
  const handleRowClick = (quote) => {
    setModalData(quote);
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
    router.push(`/myr/pedidos/${quoteData.id}/sentorder`);
  };

  const handleArchive = async (quote) => {
    if (confirm("¿Estás seguro de que deseas eliminar este pedido?")) {
      const updatedQuote = await archiveEvent(quote, "orders");
      const updatedQuotes = quotes.filter((q) => q.id !== updatedQuote.id);
      setQuotes(updatedQuotes);
    }
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
      <Header title="Pedidos" subtitle="Pedidos y ordenes de clientes" />
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
              <InputLabel>Empresa</InputLabel>
              <Select
                label="Empresa"
                value={companyFilter || 0}
                onChange={(e) => setCompanyFilter(e.target.value)}
              >
                {companies?.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.company}
                  </MenuItem>
                ))}
                <MenuItem key={0} value={0}>
                  Todas
                </MenuItem>
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
    </Box>
  );
};

export default PedidosPage;
