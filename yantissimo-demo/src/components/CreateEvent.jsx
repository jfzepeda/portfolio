"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Autocomplete,
} from "@mui/material";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { getUserProfile } from "../utils/session";
import { getRamps, ROLES, SUCS } from "../utils/global";
import serviciosTiempos from "../utils/servicios_tiempos.json";
import articulos from "../utils/articulos.json";
import ItemsSection from "./ItemsSection";
import dayjs from "dayjs";
import api from "~/lib/api";
import { toISO_MX } from "~/utils/formaters.js";
const sucursales = [...SUCS];

// Elimina ADMIN de la lista de sucursales
sucursales.splice(sucursales.indexOf("ADMIN"), 1);
sucursales.splice(sucursales.indexOf("MYR"), 1);

// URL global del backend

// Constantes fijas para el formulario
const saleTypes = ["De Piso", "Online", "Teléfono"];
const client_types = ["PUBLICO", "CONVENIO", "DISTRIBUIDOR"];
const durationOptions = [
  30, 60, 90, 120, 150, 180, 210, 240, 300, 360, 420, 480, 540, 600, 720,
]; // Duraciones en minutos
// const ramps = ['Rampa A', 'Rampa B', 'Rampa C', 'Rampa D'];

// Constantes dinamicas para sucursal y vendedor
const userProfile = getUserProfile();
const curSuc = userProfile ? userProfile.sucursal : null;
const curRole = userProfile ? userProfile.role : null;
const currentSeller = userProfile ? userProfile.username : null;
let ramps;

const isDayjs = (obj) => dayjs.isDayjs(obj);
const shouldDisableTimeStart = (value, view) => {
  if (!isDayjs(value)) return false;
  const hour = value.hour();
  if (view === "hours") {
    return hour < 9 || hour > 18;
  }
  if (view === "minutes") {
    const minute = value.minute();
    return minute % 30 !== 0;
  }
  return false;
};

const SDFT = (start, duration) => {
  if (!dayjs.isDayjs(start) || !dayjs.isDayjs(start)) return false;
  const finishTime = start.add(duration, "minute");
  if (finishTime.hour() >= 19 && finishTime.minute() > 0) {
    return true;
  } else if (finishTime.hour() > 19) {
    return true;
  }
  return false;
};

const CreateEventDialog = ({
  open,
  handleClose,
  initialData,
  onQuoteSaved,
  isEditing = false,
}) => {
  // Estado interno del formulario
  const [activeStep, setActiveStep] = useState(1);
  const [missingFields, setMissingFields] = useState(false);
  const [technicians, setTechnicians] = useState(["Tecnico 1", "Tecnico 2"]);
  const [carOptions, setCarOptions] = useState([]);
  const [carMap, setCarMap] = useState({});
  // Estado inicial en CreateEventDialog
  const [quoteData, setQuoteData] = useState({
    channel: "Online",
    ramp: "",
    technician: "",
    seller: "",
    client_name: "",
    additional_notes: "",
    plate: "",
    client_type: "PUBLICO",
    phone: "",
    car_model: "",
    year: "",
    mileage: "",
    sucursal: "",
    items: [],
    // Si se agenda, inicializamos "start" y "duration"
    start: dayjs(),
    duration: null,
  });

  // ---------------------------
  //        USE EFFECT'S
  // ---------------------------
  useEffect(() => {
    if (open) {
      const now = dayjs();
      const roundedMinutes = Math.ceil(now.minute() / 30) * 30;
      const startDefault = now.minute(roundedMinutes).second(0);
      const nineam = now.hour(9).minute(0).second(0);
      if (initialData) {
        const validSucursal =
          initialData.sucursal && sucursales.includes(initialData.sucursal)
            ? initialData.sucursal
            : "";
        setQuoteData({
          channel: initialData.channel || "Online",
          ramp: initialData.ramp || "",
          technician: initialData.technician || "",
          seller: initialData.seller || "",
          client_name: initialData.client_name || "",
          additional_notes: initialData.additional_notes || "",
          plate: initialData.plate || "",
          client_type: initialData.client_type || "PUBLICO",
          phone: initialData.phone || "",
          car_model: initialData.car_model || "",
          year: initialData.year || "",
          mileage: initialData.mileage || "",
          sucursal: validSucursal,
          items: Array.isArray(initialData.items) ? initialData.items : [],
          start: initialData.start || nineam,
          duration: initialData.duration || null,
        });
        fetchClient(initialData.phone);
      } else {
        setQuoteData({
          channel: "Online",
          ramp: "",
          technician: "",
          seller: currentSeller,
          client_name: "",
          additional_notes: "",
          plate: "",
          client_type: "PUBLICO",
          phone: "",
          car_model: "",
          year: "",
          mileage: "",
          sucursal: "",
          items: [],
          start: startDefault,
          duration: null,
        });
      }
      if (initialData?.items) {
        // Si hay items de type "servicio", asignamos la duración (el mas largo)
        const serviciosTiemposMap = Object.fromEntries(
          Object.entries(serviciosTiempos).map(([key, value]) => [
            key,
            Number(value) || 0,
          ])
        );
        const maxDuration = initialData.items.reduce((max, item) => {
          if (item.type === "servicio" && serviciosTiemposMap[item.article]) {
            return Math.max(max, serviciosTiemposMap[item.article]);
          }
          return max;
        }, 0);
        if (maxDuration > 0) {
          setQuoteData((prev) => ({
            ...prev,
            duration: maxDuration,
          }));
        }
      }
    }
    setMissingFields(false);
    setActiveStep(1);

    // eslint-disable-next-line
  }, [open, initialData, isEditing]);

  useEffect(() => {
    async function fetchTechnicians() {
      try {
        const technicianRes = await api(
          `/api/users/technician/get?sucursal=${quoteData.sucursal}`
        );
        if (!technicianRes.ok) {
          console.log("Error al obtener vendedores");
          return;
        }

        const technicianData = await technicianRes.json();
        setTechnicians(technicianData);
        // console.debug("Vendedores:", technicianData);
      } catch (error) {
        console.error("Error al obtener vendedores:", error);
      }
    }
    fetchTechnicians();
  }, [quoteData.sucursal]);

  // useEffect(() => {
  async function fetchClient(value) {
    try {
      const clientRes = await api(`/api/clients/get?phone=${value}`);
      if (!clientRes.ok) throw new Error("Error al obtener datos del cliente");

      const clientData = await clientRes.json();
      console.debug("Cliente:", clientData);

      handleAutocomplete(clientData);
      console.log("Datos del cliente:", clientData);
    } catch (error) {
      console.error("Error al obtener datos del cliente:", error);
    }
  }
  // fetchClient();
  // }, [quoteData.phone]);

  const resetForm = () => {
    setQuoteData({
      channel: "",
      start: dayjs(),
      end: dayjs().add(1, "hour"),
      ramp: "",
      technician: "",
      client_name: "",
      additional_notes: "",
      plate: "",
      client_type: "",
      phone: "",
      car_model: "",
      year: "",
      mileage: "",
      sucursal: "",
      items: [],
      duration: null,
    });
    setActiveStep(1);
    setMissingFields(false);
  };

  // --------------------------------------
  // Handlers de cambios en el formulario
  // --------------------------------------
  const handleChange = (field) => (e) => {
    setQuoteData({ ...quoteData, [field]: e.target.value });
  };

  const handleNumericPhone = (e) => {
    let value = e.target.value;
    // Elimina todo excepto dígitos
    value = value.replace(/[^0-9]/g, "");
    // Limita a 10 dígitos
    value = value.slice(0, 10);
    setQuoteData({ ...quoteData, phone: value });
    // Si el número tiene 10 dígitos, buscamos datos del cliente
    if (value.length === 10) {
      fetchClient(value);
    }
  };

  const handleNumericYear = (e) => {
    let value = e.target.value;
    // Elimina todo excepto dígitos
    value = value.replace(/[^0-9]/g, "");
    // Limita a 10 dígitos
    value = value.slice(0, 4);
    setQuoteData({ ...quoteData, year: value });
  };

  const handleNext = () => {
    setActiveStep(2);
  };

  // -----------------------------------------
  // Handlers de comunicacion con el beckend
  // -----------------------------------------
  const handleAssignDate = async () => {
    if (!quoteData.start || !quoteData.duration) {
      window.showToast("Por favor seleccione fecha de inicio y duración.");
      setMissingFields(true);
      return;
    }
    if (SDFT(quoteData.start, quoteData.duration)) {
      window.showToast("La hora seleccionada excede el horario de atención.");
      return;
    }
    if (!quoteData.ramp || !quoteData.sucursal || !quoteData.car_model) {
      setMissingFields(true);
      return;
    }

    const payload = {
      client_name: quoteData.client_name,
      client_type: quoteData.client_type,
      phone: quoteData.phone,
      sucursal: quoteData.sucursal,
      channel: quoteData.channel,
      seller: quoteData.seller,
      additional_notes: quoteData.additional_notes,
      items: quoteData.items,
      // ISO 8601 desde hora local de CDMX → UTC (Z)
      start: toISO_MX(quoteData.start),
      end: toISO_MX(
        quoteData.start.add(Number(quoteData.duration) || 0, "minute")
      ),
      ramp: quoteData.ramp,
      car_model: quoteData.car_model,
      year: quoteData.year,
      mileage: quoteData.mileage,
      duration: quoteData.duration,
      plate: quoteData.plate,
      technician: quoteData.technician,
    };
    try {
      // console.log('Endpoint:', `/api/events/schedule`);
      const response = await api(`/api/events/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, quote_id: initialData?.id }),
      });
      // Manejo de rampas ocupadas
      if (response.status === 409) {
        const errorData = await response.json();
        window.showToast(errorData.error || response.statusText);
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al asignar fecha");
      }
      const savedQuote = await response.json();
      window.showToast("Cotizacion agendada exitosamente");
      if (onQuoteSaved) onQuoteSaved(savedQuote);
      resetForm();
      handleClose();
    } catch (error) {
      console.error("Error al agendar cotizacion:", error);
    }
  };

  // ----------------------------------------
  // Funciones modificadoras de estado en UI
  // ----------------------------------------
  if (curRole >= ROLES.MARKETING) {
    ramps = getRamps(quoteData.sucursal);
  } else {
    ramps = getRamps(curSuc);
    // console.log('ramps', ramps);
  }

  useEffect(() => {
    if (quoteData.car_model && carMap && carMap[quoteData.car_model]) {
      const yearsArray = String(carMap[quoteData.car_model]).split(",");
      const lastYear = yearsArray[yearsArray.length - 1];
      setQuoteData((prev) => ({
        ...prev,
        year: lastYear,
      }));
    }
  }, [quoteData.car_model, carMap]);

  const handleAutocomplete = (data) => {
    if (!data || data.length === 0) return;

    const { nombre, car } = data;

    // Gather all vehicle models for Autocomplete options
    let modelsList = [];
    if (car && typeof car === "object") {
      modelsList = Object.keys(car);
    }
    setCarOptions(modelsList);
    setCarMap(car || {});

    // Extraer el primer modelo y año disponibles del JSONB `car`
    let modelo = "";
    let anio = "";
    if (car && typeof car === "object") {
      const [firstKey, firstValue] = Object.entries(car)[0] || [];
      if (firstKey) {
        modelo = firstKey;
        // El valor puede ser "2018" o "2018,2021"; tomamos el último año
        if (firstValue) {
          const years = String(firstValue).split(",");
          anio = years[years.length - 1];
        }
      }
    }

    console.debug("handleAutocomplete data (adapted):", data);
    setQuoteData((prev) => ({
      ...prev,
      client_name: nombre || "",
      car_model: modelo,
      year: anio,
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={activeStep === 1 ? "md" : "lg"}
    >
      <DialogTitle>
        {isEditing
          ? "Agendar Cotización"
          : "Nueva Cotización " +
            (quoteData.channel === "Postcheck" ? "Postcheck" : curSuc)}
      </DialogTitle>
      <DialogContent dividers>
        {activeStep === 1 ? (
          <Box>
            <Box
              component="form"
              sx={{ mt: 2, display: "flex", flexDirection: "row", gap: 3 }}
            >
              <Box component="div">
                {quoteData.channel === "Postcheck" ? (
                  <TextField
                    label="Tipo de Venta"
                    fullWidth
                    value={quoteData.channel}
                    disabled
                    sx={{ mb: 2 }}
                  />
                ) : (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Tipo de Venta</InputLabel>
                    <Select
                      label="Tipo de Venta"
                      value={quoteData.channel || ""}
                      onChange={handleChange("channel")}
                      required
                      error={missingFields && !quoteData.channel}
                      disabled={isEditing}
                    >
                      {saleTypes.map((channel) => (
                        <MenuItem key={channel} value={channel}>
                          {channel}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <TextField
                  label="Vendedor"
                  fullWidth
                  value={quoteData.seller || currentSeller}
                  disabled
                  sx={{ mb: 2 }}
                />
                {curRole >= ROLES.MARKETING ? (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Sucursal</InputLabel>
                    <Select
                      label="Sucursal"
                      value={quoteData.sucursal || ""}
                      onChange={(e) => {
                        handleChange("sucursal")(e);
                      }}
                      required
                      error={missingFields && !quoteData.sucursal}
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
                    value={curSuc}
                    disabled
                    sx={{ mb: 2 }}
                  />
                )}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Rampa</InputLabel>
                  <Select
                    label="Rampa"
                    value={quoteData.ramp}
                    onChange={handleChange("ramp")}
                    error={missingFields && !quoteData.ramp}
                  >
                    {/* <MenuItem value="">Auto</MenuItem> MFM ASIGNAR AUTOMATICAMENTE CON EL ALGORITMO */}
                    {curRole === ROLES.MANAGER && (
                      <MenuItem value={currentSeller}>{currentSeller}</MenuItem>
                    )}
                    {ramps?.map((plat) => (
                      <MenuItem key={plat} value={plat}>
                        {plat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Técnico (auto)</InputLabel>
                  <Select
                    label="Técnico"
                    value={quoteData.technician}
                    onChange={handleChange("technician")}
                  >
                    <MenuItem value="">Auto</MenuItem>
                    {technicians &&
                      technicians.map((tech) => (
                        <MenuItem key={tech.id} value={tech.name}>
                          {tech.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                {/* )} */}
              </Box>
              <Box>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Tipo de cliente</InputLabel>
                  <Select
                    label="Tipo de cliente"
                    value={quoteData.client_type || ""}
                    onChange={handleChange("client_type")}
                    disabled={isEditing}
                    required
                    error={missingFields && !quoteData.client_type}
                  >
                    {client_types.map((client) => (
                      <MenuItem key={client} value={client}>
                        {client}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Teléfono"
                  fullWidth
                  value={quoteData.phone}
                  onChange={handleNumericPhone}
                  disabled={isEditing}
                  required
                  error={
                    (missingFields && !quoteData.phone) ||
                    (quoteData.phone?.length < 10 &&
                      quoteData.phone?.length > 0)
                  }
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Nombre del Cliente"
                  fullWidth
                  value={quoteData.client_name}
                  onChange={handleChange("client_name")}
                  disabled={isEditing}
                  error={missingFields && !quoteData.client_name}
                  required
                  sx={{ mb: 2 }}
                />
                <Autocomplete
                  freeSolo
                  options={carOptions}
                  value={quoteData.car_model}
                  error={missingFields && !quoteData.car_model}
                  onChange={(event, newValue) => {
                    let yearValue = "";
                    if (newValue && carMap && carMap[newValue]) {
                      const years = String(carMap[newValue]).split(",");
                      yearValue = years[years.length - 1];
                    }
                    setQuoteData({
                      ...quoteData,
                      car_model: newValue,
                      year: yearValue,
                    });
                  }}
                  onInputChange={(event, newInputValue) => {
                    setQuoteData({
                      ...quoteData,
                      car_model: newInputValue,
                      year: "",
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Marca y Modelo"
                      fullWidth
                      required
                      error={missingFields && !quoteData.car_model}
                      sx={{ mb: 2 }}
                    />
                  )}
                />
                <TextField
                  label="Año"
                  fullWidth
                  value={quoteData.year}
                  onChange={handleNumericYear}
                  error={
                    missingFields && !quoteData.year && curRole === ROLES.SELLER
                  }
                />
                {/* <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  
                  <TextField
                    label="Kilometraje"
                    fullWidth
                    value={quoteData.mileage}
                    onChange={handleChange("mileage")}
                  />
                </Box>
                <TextField
                  label="Placa"
                  fullWidth
                  value={quoteData.plate}
                  onChange={handleChange("plate")}
                  sx={{ mb: 2 }}
                /> */}
              </Box>
            </Box>
            <Box
              sx={{
                width: "100%",
                borderBottom: 1,
                borderColor: "#FFC600",
                mt: 2,
              }}
            />

            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 2,
                mt: 3,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Hora de Inicio"
                  fullWidth
                  value={quoteData.start}
                  onChange={(newValue) =>
                    setQuoteData({ ...quoteData, start: newValue })
                  }
                  error={missingFields && !quoteData.start}
                  timeSteps={{ minutes: 30 }}
                  skipDisabled
                  shouldDisableTime={shouldDisableTimeStart}
                  ampm={false}
                />
                <FormControl>
                  <InputLabel>Duración</InputLabel>
                  <Select
                    sx={{ width: 200 }}
                    label="Duración"
                    value={quoteData.duration || ""}
                    error={missingFields && !quoteData.duration}
                    onChange={(e) =>
                      setQuoteData({
                        ...quoteData,
                        duration: Number(e.target.value),
                        end: quoteData.start.add(
                          Number(e.target.value),
                          "minute"
                        ),
                      })
                    }
                  >
                    {durationOptions.map((option) => {
                      const isDisabled =
                        quoteData.start && SDFT(quoteData.start, option);
                      return isDisabled ? null : (
                        <MenuItem key={option} value={option}>
                          {option === 30
                            ? `${option} minutos`
                            : option === 60
                            ? `1 hora`
                            : option === 90
                            ? `1 hr 30 min`
                            : option === 120
                            ? `2 horas`
                            : option === 150
                            ? `2 hrs 30 min`
                            : option === 180
                            ? `3 horas`
                            : option === 210
                            ? `3 hrs 30 min`
                            : option === 240
                            ? `4 horas`
                            : option === 300
                            ? `5 horas`
                            : option === 360
                            ? `6 horas`
                            : option === 420
                            ? `7 horas`
                            : option === 480
                            ? `8 horas`
                            : option === 540
                            ? `9 horas`
                            : option === 600
                            ? `10 horas`
                            : option === 720
                            ? `12 horas`
                            : `${option} minutos`}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                <DatePicker
                  fullWidth
                  value={quoteData.start}
                  disablePast
                  onChange={(newDate) => {
                    // Al cambiar la fecha, se actualiza "start" manteniendo la hora
                    setQuoteData({
                      ...quoteData,
                      start: quoteData.start
                        .set("year", newDate.year())
                        .set("month", newDate.month())
                        .set("date", newDate.date()),
                    });
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Box>
        ) : (
          <Box sx={{ minHeight: 400 }}>
            {/* --- Sección Artículos --- */}
            <ItemsSection
              title="Articulos"
              entryKey="article"
              entries={quoteData.items}
              setEntries={(arr) => setQuoteData({ ...quoteData, items: arr })}
              autoOptions={articulos}
              missingFields={missingFields}
            />

            {/* Notas adicionales */}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {activeStep === 1 ? (
          <>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleNext} variant="contained" color="primary">
              Siguiente
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setActiveStep(1)}>Volver</Button>
            <Button
              onClick={handleAssignDate}
              variant="contained"
              color="primary"
            >
              Agendar
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateEventDialog;
