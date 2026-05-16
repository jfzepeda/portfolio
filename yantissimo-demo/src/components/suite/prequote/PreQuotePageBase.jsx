"use client";
import api, { put } from "~/lib/api";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button,
  Box,
  Toolbar,
  TextField,
  Dialog,
  Typography,
  DialogActions,
  DialogContent,
  DialogTitle,
  Autocomplete,
} from "@mui/material";
import SaveSelection from "~/lib/saveItemsSelection";
import { useQuickQuote } from "~/lib/QuickQuoteContext.jsx";
import {
  clear as clearSelected,
  count as getSelectedCount,
} from "~/lib/quickQuoteStorage.js";
import RenderTables from "./tables/RenderTables.jsx";
import PreQuoteTable from "./PreQuoteTable.jsx";
import ServicesList from "./ServicesList.jsx";
import SearchBar from "./SearchBar.jsx";
import { doctypeOptions as defaultDoctypeOptions } from "~/utils/global.js";

/**
 * Objetivo del refactor:
 * - Centralizar lógica condicional en variables derivadas
 * - Evitar ternarios anidados dentro del JSX
 * - Separar secciones de UI en funciones auxiliares de render
 * - Mantener funcionalidad existente sin cambios de comportamiento
 */

const extractLatestYear = (value) => {
  if (!value) return "";
  const parts = String(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts[parts.length - 1] || "";
};

const normalizePhone10 = (value) => {
  const digits = String(value || "").replace(/[^0-9]/g, "");
  return digits.slice(0, 10);
};

export default function PreQuotePageBase({
  profile,
  clearOnMount = true,
  cotId,
  quote,
  setQuote,
  enableServices = true,
  enableVehicleDialog = false,
  enableSaveButtons = true,
  saveSelectionPath,
  doctypeOptions = defaultDoctypeOptions,
  defaultType = "prequote",
  isSearchDisabled,
  availabilityLabel,
  availabilityValue,
  priceMode = "default",
}) {
  const { items } = useQuickQuote();
  const allowVehicleDialog = enableServices && enableVehicleDialog;
  // -----------------
  // Estado
  // -----------------
  const [searchTerm, setSearchTerm] = useState("");
  const [_selectedCount, setSelectedCount] = useState(0);
  const [preUnits, _setPreUnits] = useState(1);
  const [paso, setPaso] = useState("llantas"); // "llantas" -> guardar -> pregunta -> "servicios"
  const [vehDialogOpen, setVehDialogOpen] = useState(false);

  const [carOptions, setCarOptions] = useState([]);
  const [carMap, setCarMap] = useState([]);

  // Estado local para datos del vehículo (se confirma en handleConfirmVehiculo)
  const [vehiculoDraft, setVehiculoDraft] = useState({
    model: quote?.vehicle?.model || "",
    year: quote?.vehicle?.year || "",
  });

  const fetchClientData = useCallback(
    async (phone10) => {
      if (!allowVehicleDialog) return;
      if (!phone10 || phone10.length !== 10) return;
      try {
        const res = await api(`/api/clients/get?phone=${phone10}`);
        if (!res.ok) return;
        const data = await res.json();
        const car = data?.car && typeof data.car === "object" ? data.car : {};
        setCarOptions(Object.keys(car));
        setCarMap(car);

        // Si ya hay modelo en el borrador y existe en el mapa, completa año
        setVehiculoDraft((prev) => {
          const next = { ...prev };
          if (next.model && car[next.model] && !next.year) {
            next.year = extractLatestYear(car[next.model]);
          }
          return next;
        });
      } catch (err) {
        console.error("Fetch client data error:", err);
      }
    },
    [allowVehicleDialog]
  );

  // -----------------
  // Efectos
  // -----------------
  useEffect(() => {
    if (!clearOnMount) return;
    clearSelected();
    setSelectedCount(0);
  }, [clearOnMount, cotId]);

  // Escucha limpieza desde el panel derecho
  useEffect(() => {
    const handler = () => setSelectedCount(0);
    if (typeof window !== "undefined") {
      window.addEventListener("yssm:quickquote:cleared", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("yssm:quickquote:cleared", handler);
      }
    };
  }, []);

  // Sincroniza el borrador cuando se abre el diálogo o cambia el quote externo
  useEffect(() => {
    if (!allowVehicleDialog) return;
    if (vehDialogOpen) {
      setVehiculoDraft({
        model: quote?.vehicle?.model || "",
        year: quote?.vehicle?.year || "",
      });

      const phoneCandidate =
        quote?.phone ||
        quote?.client?.phone ||
        quote?.client_phone ||
        quote?.clientPhone ||
        "";
      const phone10 = normalizePhone10(phoneCandidate);
      if (phone10.length === 10) {
        fetchClientData(phone10);
      }
    } else {
      setCarOptions([]);
      setCarMap({});
    }
  }, [
    allowVehicleDialog,
    vehDialogOpen,
    quote?.vehicle?.model,
    quote?.vehicle?.year,
    quote?.phone,
    quote?.client?.phone,
    quote?.client_phone,
    quote?.clientPhone,
    fetchClientData,
  ]);

  useEffect(() => {
    if (!enableServices && paso !== "llantas") {
      setPaso("llantas");
    }
  }, [enableServices, paso]);

  // -----------------
  // Derivados y banderas
  // -----------------
  const isSearching = Boolean(searchTerm && searchTerm.trim() !== "");
  const isPasoLlantas = paso === "llantas";
  const hasVehicle = Boolean(quote?.vehicle);
  const disabled =
    typeof isSearchDisabled === "function"
      ? isSearchDisabled(quote)
      : doctypeOptions[quote?.type || defaultType]?.idx > 2;

  // -----------------
  // Handlers
  // -----------------
  const handleSave = useCallback(() => {
    if (!enableSaveButtons) return;
    setSearchTerm("");
    const saveOptions = {};
    if (priceMode === "distContado") {
      saveOptions.priceMode = "distContado";
    } else if (priceMode === "byClientType") {
      saveOptions.priceMode = "byClientType";
      saveOptions.clientType = quote?.client_type || "PUBLICO";
    }
    const normalizedOptions =
      Object.keys(saveOptions).length > 0 ? saveOptions : undefined;
    if (saveSelectionPath) {
      SaveSelection(cotId, saveSelectionPath, normalizedOptions);
      return;
    }
    SaveSelection(cotId, undefined, normalizedOptions);
  }, [
    cotId,
    saveSelectionPath,
    enableSaveButtons,
    priceMode,
    quote?.client_type,
  ]);

  const handleToggleTables = useCallback(
    (nextPaso) => {
      if (!enableServices) return;
      if (nextPaso === "servicios" && allowVehicleDialog && !hasVehicle) {
        setVehDialogOpen(true);
        return;
      } else {
        setPaso(nextPaso);
      }
    },
    [enableServices, allowVehicleDialog, hasVehicle]
  );

  const handleConfirmVehiculo = useCallback(async () => {
    if (!allowVehicleDialog) return;
    try {
      // Actualiza el quote sólo al confirmar
      if (typeof setQuote === "function") {
        setQuote((prev) => ({ ...prev, vehicle: vehiculoDraft }));
      }

      const idNum = Number(cotId);
      const vehicle = vehiculoDraft;
      if (idNum && vehicle?.model && vehicle?.year) {
        const payload = { id: idNum, vehicle };
        const response = await put(`/api/prequotes/${idNum}`, payload);
        if (!response.ok) throw new Error("No se pudo guardar el vehículo");
        window.showToast("Vehículo guardado");
      }
      setVehDialogOpen(false);
      setPaso("servicios");
    } catch (e) {
      console.error("No se pudo guardar el vehículo:", e);
      setVehDialogOpen(false);
      setPaso("servicios");
    }
  }, [allowVehicleDialog, cotId, vehiculoDraft, setQuote]);

  // -----------------
  // Render helpers
  // -----------------
  const searchControls = useMemo(
    () => (
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}
      >
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          disabled={disabled}
        />
      </Box>
    ),
    [searchTerm, setSearchTerm, disabled]
  );

  const Results = useMemo(() => {
    if (!isSearching) {
      return (
        <PreQuoteTable
          items={items}
          clientType={quote?.client_type || "PUBLICO"}
          priceMode={priceMode}
          onRemove={() => setSelectedCount(getSelectedCount())}
          onToggleTables={enableServices ? handleToggleTables : undefined}
          showServiceToggle={enableServices}
          paso={paso}
          availabilityLabel={availabilityLabel}
          availabilityValue={availabilityValue}
        />
      );
    }

    const commonProps = {
      searchTerm,
      onSelectionChange: () => setSelectedCount(getSelectedCount()),
    };

    return (
      <Box
        sx={{
          width: "100%",
          height: "calc(100vh - 260px)",
          overflow: "auto",
          mt: 4,
          mb: 3,
        }}
      >
        {isPasoLlantas ? (
          <RenderTables
            {...commonProps}
            profile={profile}
            preselectedUnits={preUnits}
            priceMode={priceMode}
          />
        ) : (
          <ServicesList {...commonProps} preUnits={preUnits} />
        )}
      </Box>
    );
  }, [
    isSearching,
    items,
    paso,
    isPasoLlantas,
    searchTerm,
    preUnits,
    profile,
    quote?.client_type,
    handleToggleTables,
    enableServices,
    availabilityLabel,
    availabilityValue,
    priceMode,
  ]);

  const actionButtons = useMemo(() => {
    if (!enableSaveButtons || !isSearching) return null;

    return (
      <Box px={2} direction={{ xs: "column", sm: "row", gap: 1 }}>
        {isPasoLlantas ? (
          <Button variant="contained" onClick={handleSave} fullWidth={false}>
            Guardar selección de llantas
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSave} fullWidth={false}>
            Guardar selección de servicios
          </Button>
        )}
        <Button
          variant="text"
          onClick={() => {
            setSearchTerm("");
          }}
        >
          Ver pre-cotización
        </Button>
      </Box>
    );
  }, [
    enableSaveButtons,
    isSearching,
    isPasoLlantas,
    handleSave,
    setSearchTerm,
  ]);

  const vehicleDialog = useMemo(() => {
    if (!allowVehicleDialog) return null;
    return (
      <Dialog
        open={vehDialogOpen}
        onClose={() => setVehDialogOpen(false)}
        fullWidth
      >
        <DialogTitle>Datos del vehículo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Ingresa el modelo del vehículo para buscar servicios.
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Autocomplete
              freeSolo
              fullWidth
              sx={{ mt: 2 }}
              options={carOptions}
              value={vehiculoDraft.model}
              onChange={(_event, newValue) => {
                const nextModel = newValue || "";
                const nextYear =
                  nextModel && carMap[nextModel]
                    ? extractLatestYear(carMap[nextModel])
                    : vehiculoDraft.year || "";

                setVehiculoDraft((prev) => ({
                  ...prev,
                  model: nextModel,
                  year: nextYear,
                }));
              }}
              onInputChange={(_event, newInputValue, reason) => {
                if (reason === "reset") return;
                setVehiculoDraft((prev) => ({
                  ...prev,
                  model: newInputValue || "",
                  year: "",
                }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Modelo del vehículo" fullWidth />
              )}
            />
            <TextField
              label="Año del vehículo"
              fullWidth
              sx={{ mt: 2 }}
              value={vehiculoDraft.year}
              onChange={(e) =>
                setVehiculoDraft({ ...vehiculoDraft, year: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVehDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleConfirmVehiculo}
            disabled={!vehiculoDraft.model || vehiculoDraft.model.trim() === ""}
          >
            Continuar
          </Button>
        </DialogActions>
      </Dialog>
    );
  }, [
    allowVehicleDialog,
    vehDialogOpen,
    vehiculoDraft,
    carOptions,
    carMap,
    handleConfirmVehiculo,
  ]);

  // -----------------
  // Render principal
  // -----------------
  return (
    <Box sx={{ flexGrow: 1, m: 1.5 }}>
      <Toolbar />

      {/* Controles de búsqueda y filtros */}
      {searchControls}

      {/* Resultados o tabla de pre-cotización según el estado */}
      {Results}

      {/* Botonera contextual */}
      {actionButtons}

      {/* Diálogo para capturar vehículo si falta */}
      {vehicleDialog}
    </Box>
  );
}
