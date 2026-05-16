// src/pages/dashboard.jsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import api from "~/lib/api";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  count as quickCount,
  getAll as getSelectedItems,
  clear as clearSelected,
} from "~/lib/quickQuoteStorage.js";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CalculateIcon from "@mui/icons-material/Calculate";
import CachedIcon from "@mui/icons-material/Cached";

import CreateQuoteDialog from "~/components/CreateQuoteDialog.jsx";
import RenderTables from "~/components/suite/prequote/tables/RenderTables.jsx";
import Header from "~/components/header";

import { keyframes } from "@emotion/react";
import { getUserProfile, ROLES } from "~/utils/session.js";
import { CotizadorContent } from "./(inventarios)/calculadora/page.jsx";

const spin = keyframes`
    from { transform: rotate(0deg); }
    to   { transform: rotate(-360deg); }
  `;

const InventarioPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

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
  const authUser = (curRole ?? 0) >= ROLES.MYR_HELPER;
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("q") ?? ""
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (searchTerm) {
        params.set("q", searchTerm);
      } else {
        params.delete("q");
      }
      router.replace(`${pathname}?${params.toString()}`);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, pathname, router]);
  const [qqCount, setQqCount] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openCalculatorModal, setOpenCalculatorModal] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  // Helper to fetch counts for alternate sources

  const checkStatus = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = api(`/api/scrapper/status`);
      response
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "running") {
            setRefreshing(true);
          } else {
            setRefreshing(false);
          }
        })
        .catch((error) => {
          console.error("Error al obtener el estado del scrapper:", error);
          setRefreshing(false);
        });
    } catch (error) {
      console.error("Error al verificar el estado del scrapper:", error);
      setRefreshing(false);
    }
  }, []);

  // Inicializar contador de selección rápida
  useEffect(() => {
    try {
      // Reiniciar selector rápido
      clearSelected();
      checkStatus();
      setQqCount(quickCount());
    } catch (_e) {
      setQqCount(0);
    }
  }, [checkStatus]);

  // RenderTables maneja los modales de detalle y el ordenamiento

  const handleQuickQuote = () => {
    const items = getSelectedItems();
    setSelectedEvent({ channel: "Online", items });
    setOpenCreateDialog(true);
  };

  const handleUnselectAll = () => {
    clearSelected();
    setQqCount(quickCount());
  };

  return (
    <Box>
      <IconButton
        color="contrast"
        onClick={() => setOpenCalculatorModal(true)}
        sx={{
          position: "fixed",
          top: { xs: 100, md: 40 },
          right: 40,
          zIndex: 1300,
        }}
      >
        <CalculateIcon />
      </IconButton>
      <Dialog
        open={openCalculatorModal}
        onClose={() => setOpenCalculatorModal(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Cotizador</DialogTitle>
        <DialogContent dividers>
          <CotizadorContent showHeader={false} />
        </DialogContent>
      </Dialog>
      <Box>
        <Header title="Inventario" />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr" },
            alignItems: { xs: "stretch", md: "center" },
            columnGap: { xs: 0, md: 2 },
            rowGap: { xs: 1, md: 0 },
            mb: 2,
            position: "sticky",
            top: 0,
            zIndex: 10,
            width: "100%",
            py: { xs: 0.8, md: 0 },
          }}
        >
          {/* Izquierda: selector de proveedor + refresh */}
          <Box
            sx={{
              order: { xs: 2, md: 0 },
              ml: { xs: 1, md: 0 },
              display: { xs: "none", md: "block" },
            }}
          >
            {curRole >= ROLES.ADMIN && (
              <IconButton
                variant="contained"
                color="bleus"
                sx={{ mt: 3.5, ml: 2 }}
                disabled={refreshing}
              >
                <CachedIcon
                  sx={{
                    animation: refreshing
                      ? `${spin} 1s linear infinite`
                      : undefined,
                  }}
                />
              </IconButton>
            )}
          </Box>

          {/* Centro: buscador centrado real */}
          <TextField
            label="Buscar"
            variant="standard"
            InputLabelProps={{ shrink: true }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ej: 255/55R18; michelin"
            sx={{
              width: { xs: "calc(100% - 16px)", md: 300 },
              justifySelf: { xs: "start", md: "center" },
              ml: { xs: 1, md: 0 },
              order: { xs: 1, md: 0 },
            }}
          />

          {/* Derecha: acciones, alineadas al extremo */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifySelf: { xs: "start", md: "end" },
              flexWrap: { xs: "wrap", md: "nowrap" },
              gap: { xs: 0.5, md: 0 },
              ml: { xs: 1, md: 0 },
              order: { xs: 3, md: 0 },
            }}
          >
            <Typography variant="subtitle1" sx={{ my: 2 }}>
              {qqCount}
            </Typography>
            <IconButton
              variant="contained"
              color="bleus"
              sx={{ my: 2, mr: 2 }}
              onClick={handleUnselectAll}
            >
              <DeleteOutlineIcon />
            </IconButton>
            {authUser && (
              <Button variant="contained" onClick={handleQuickQuote}>
                Crear Cotización
              </Button>
            )}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            overflow: "auto",
            height: "calc(100vh - 200px)",
          }}
        >
          <RenderTables
            searchTerm={searchTerm}
            profile={profile}
            onSelectionChange={() => setQqCount(quickCount())}
            preselectedUnits={1}
          />
        </Box>
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
      {/* RenderTables maneja los modales de detalle internamente */}
    </Box>
  );
};

export default dynamic(() => Promise.resolve(InventarioPage), { ssr: false });
