"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Stack,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { toLocalWallDate, MX_TZ } from "~/utils/formaters";
import api from "~/lib/api";
import BigCalendar from "./BigCalendar";
import CreateQuoteDialog from "~/components/CreateQuoteDialog";
import QuoteSummaryModal from "~/components/modal/modal";
import "~/styles/App.css";
import { ROLES, SUCS, debugLog, getRamps } from "~/utils/global";
import { getUserProfile, getSucursal } from "~/utils/session";
import Header from "~/components/header";

const sucursales = SUCS;

const LEGEND_ITEMS = [
  { name: "No iniciado", color: "#6366F1" },
  { name: "En proceso", color: "#2E7D52" },
  { name: "Terminado", color: "#9E9A92" },
];

const CalendarPage = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    try {
      const p = getUserProfile();
      setProfile(p || null);
    } catch (_e) {
      setProfile(null);
    }
  }, []);

  const curSuc = profile?.sucursal ?? null;
  const curRole = profile?.role ?? null;
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [initialEventData, setInitialEventData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [sucFilter, setSucFilter] = useState(getSucursal());
  const [isEditing, setIsEditing] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      setEventsError("");
      const currentSucursal = curRole >= ROLES.MARKETING ? sucFilter : curSuc;
      const query = currentSucursal
        ? `?sucursal=${encodeURIComponent(currentSucursal)}`
        : "";
      console.log("Query:", query);
      const response = await api(`/api/events/get/all${query}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Error al obtener eventos");
      }
      const data = await response.json();
      debugLog("Eventos:", data);
      const eventsWithDayjs = data.map((event) => ({
        ...event,
        start_at: toLocalWallDate(event.start_at),
        end_at: toLocalWallDate(event.end_at),
        resourceId: event.ramp,
        extendedProps: {
          id: event.id,
          channel: event.channel,
          client_name: event.client_name,
          additional_notes: event.additional_notes,
          client_type: event.client_type,
          phone: event.phone,
          car_model: event.car_model,
          year: event.year,
          mileage: event.mileage,
          sucursal: event.sucursal,
          seller: event.seller,
          ramp: event.ramp,
          technician: event.technician,
          type: event.type,
          anticipo: event.anticipo,
          services:
            typeof event.services === "string"
              ? JSON.parse(event.services)
              : event.services,
          items:
            typeof event.items === "string"
              ? JSON.parse(event.items)
              : event.items,
          check_out: event.check_out,
          check_in: event.check_in,
        },
      }));
      setEvents(eventsWithDayjs);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
      setEvents([]);
      setEventsError("No fue posible cargar los eventos de esta sucursal.");
    } finally {
      setLoadingEvents(false);
    }
  }, [sucFilter, curRole, curSuc]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleOpenDialog = (eventData = null) => {
    setInitialEventData(eventData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setInitialEventData(null);
    setIsEditing(false);
  };

  const handleSaveEvent = (savedEvent) => {
    const newEvent = {
      ...savedEvent,
      start_at: toLocalWallDate(savedEvent.start_at),
      end_at: toLocalWallDate(savedEvent.end_at),
      resourceId: savedEvent.ramp,
      extendedProps: {
        channel: savedEvent.channel,
        client_name: savedEvent.client_name,
        additional_notes: savedEvent.additional_notes,
        client_type: savedEvent.client_type,
        phone: savedEvent.phone,
        car_model: savedEvent.car_model,
        year: savedEvent.year,
        mileage: savedEvent.mileage,
        sucursal: savedEvent.sucursal,
        seller: savedEvent.seller,
        ramp: savedEvent.ramp,
        technician: savedEvent.technician,
        type: savedEvent.type,
        services:
          typeof savedEvent.services === "string"
            ? JSON.parse(savedEvent.services)
            : savedEvent.services,
        items:
          typeof savedEvent.items === "string"
            ? JSON.parse(savedEvent.items)
            : savedEvent.items,
      },
    };
    setEvents((prev) => [...prev, newEvent]);
    handleCloseDialog();
  };

  const handleDateClick = (selectedDate, selectedRamp) => {
    const dayjsSelectedDate = dayjs(selectedDate);
    handleOpenDialog({
      channel: "",
      start_at: dayjsSelectedDate,
      end_at: dayjsSelectedDate.add(1, "hour"),
      sucursal: curRole >= ROLES.MARKETING ? sucFilter : curSuc,
      ramp: selectedRamp,
      technician: "",
      client_name: "",
      additional_notes: "",
      client_type: "",
      phone: "",
      car_model: "",
      year: "",
      mileage: "",
      services: [],
      items: [],
    });
  };

  const handleEventClick = (clickInfo) => {
    const ext = clickInfo.event.extendedProps;
    const details = {
      id: ext.id,
      channel: ext.channel,
      client_name: ext.client_name,
      additional_notes: ext.additional_notes,
      client_type: ext.client_type,
      phone: ext.phone,
      car_model: ext.car_model,
      year: ext.year,
      mileage: ext.mileage,
      sucursal: ext.sucursal,
      seller: ext.seller,
      ramp: ext.ramp,
      technician: ext.technician,
      type: ext.type,
      services: ext.services,
      items: ext.items,
      start_at: dayjs(clickInfo.event.start_at),
      end_at: dayjs(clickInfo.event.end_at),
      check_out: ext.check_out,
      check_in: ext.check_in,
      anticipo: ext.anticipo,
    };
    console.log("Detalles del evento:", details);
    setModalData(details);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalData(null);
  };

  const activeSuc = curRole >= ROLES.MARKETING ? sucFilter : curSuc;

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          pt: 1,
          border: "1px solid",
          borderColor: "transparent",
          backgroundColor: "transparent",
        }}
      >
        <Header
          title="Agenda"
          titleSx={{ typography: "h5", fontWeight: 700, lineHeight: 1 }}
          sx={{ pt: 1, mb: 0 }}
          actions={
            <Stack direction="row" alignItems="flex-end" spacing={2}>
              {curRole >= ROLES.MARKETING ? (
                <FormControl
                  sx={{ minWidth: 160 }}
                  variant="standard"
                  size="small"
                >
                  <InputLabel>Sucursal</InputLabel>
                  <Select
                    label="Sucursal"
                    value={sucFilter || ""}
                    onChange={(e) => {
                      const suc = e.target.value;
                      setSucFilter(suc);
                      if (suc !== "Todas") {
                        localStorage.setItem("sucursal", suc);
                      }
                    }}
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
                  value={curSuc || ""}
                  disabled
                  sx={{ minWidth: 160 }}
                  variant="standard"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ whiteSpace: "nowrap", fontWeight: 600 }}
              >
                Crear Evento
              </Button>
            </Stack>
          }
        ></Header>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          flexWrap="wrap"
          sx={{ ml: 1 }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ mr: 0.5 }}
          >
            Leyenda:
          </Typography>
          {LEGEND_ITEMS.map((item) => (
            <Chip
              key={item.name}
              size="small"
              label={item.name}
              sx={{
                backgroundColor: item.color + "22",
                color: item.color,
                fontWeight: 600,
                fontSize: "0.72rem",
                border: `1px solid ${item.color}44`,
                "& .MuiChip-icon": { color: item.color },
              }}
              icon={
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: item.color,
                    display: "inline-block",
                    ml: "6px !important",
                  }}
                />
              }
            />
          ))}
        </Stack>
      </Paper>

      {/* Alertas */}
      {eventsError ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {eventsError}
        </Alert>
      ) : null}

      {loadingEvents ? (
        <Box
          sx={{
            position: "relative",
            top: "100px",
            display: "grid",
            placeItems: "center",
            py: 8,
          }}
        >
          <CircularProgress size={56} />
          <Typography variant="h6" color="text.secondary" mt={1.5}>
            Cargando eventos…
          </Typography>
        </Box>
      ) : null}

      {!loadingEvents && events.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No hay eventos para{" "}
          <strong>{activeSuc || "la sucursal actual"}</strong>. Puedes crear uno
          nuevo o cambiar de sucursal para revisar otra agenda.
        </Alert>
      ) : null}

      {/* Calendario */}
      {loadingEvents ? null : (
        <BigCalendar
          events={events}
          handleDateClick={handleDateClick}
          handleEventClick={handleEventClick}
          ramps={getRamps(activeSuc) || []}
        />
      )}
      <CreateQuoteDialog
        open={openDialog}
        handleClose={handleCloseDialog}
        onRecordSaved={handleSaveEvent}
        initialData={initialEventData}
        onCalendar={true}
        isEditing={isEditing}
      />

      {showModal && modalData && (
        <QuoteSummaryModal
          data={modalData}
          onClose={handleModalClose}
          // onRecordSaved={handleSaveEvent} MFI Proximos cambios
        />
      )}
    </Box>
  );
};

dayjs.extend(utc);
dayjs.extend(timezone);
try {
  dayjs.tz.setDefault(MX_TZ);
} catch {}
export default CalendarPage;
