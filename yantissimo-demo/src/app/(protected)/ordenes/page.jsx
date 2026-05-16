"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import api from "~/lib/api";
import {
  Box,
  Button,
  ButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { getUserProfile, getSucursal } from "~/utils/session";
import { ROLES, SUCS } from "~/utils/global";
import { saveChecks } from "./savechecks";

// Local imports
import CreateQuoteDialog from "../../../components/CreateQuoteDialog";
import QuoteSummaryModal from "../../../components/modal/modal";
import Header from "~/components/header";

// Crear una copia local del array
const sucursales = [...SUCS];

// Ahora puedes modificar esta copia local sin afectar el original
sucursales.push("Todas");

const OrdersPage = () => {
  const router = useRouter();

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

  // Estados principales
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("enCurso"); // 'enCurso' o 'completadas'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setshowModal] = useState(false);
  const [sucFilter, setSucFilter] = useState(getSucursal());
  const [openChecks, setopenChecks] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  // Cargar eventos desde localStorage al montar
  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await api(`/api/calendar/get`);
        if (!response.ok) {
          throw new Error("Error al obtener eventos");
        }
        const data = await response.json();
        console.log("Eventos:", data);
        const eventsWithDayjs = data.map((event) => ({
          ...event,
          start: dayjs(event.start) || null,
          end: dayjs(event.end_date) || null,
          resourceId: event.ramp,
          // extendedProps: {
          id: event.id,
          channel: event.channel,
          client_name: event.client_name || event.client_name,
          additional_notes: event.additional_notes || event.additional_notes,
          plate: event.plate,
          client_type: event.client_type,
          phone: event.phone,
          car_model: event.car_model || event.car_model,
          year: event.year,
          mileage: event.mileage,
          sucursal: event.sucursal,
          seller: event.seller,
          ramp: event.ramp,
          technician: event.technician,
          type: event.type,
          services:
            typeof event.services === "string"
              ? JSON.parse(event.services)
              : event.services,
          items:
            typeof event.items === "string"
              ? JSON.parse(event.items)
              : event.items,
          check_out: event.check_out,
          checkIn: event.checkIn || event.check_in,
          // },
        }));
        setEvents(eventsWithDayjs);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
      }
    }
    fetchEvents();
  }, []);

  // Actualiza localStorage cuando cambian los eventos
  const updateLocalStorage = (updatedEvents) => {
    localStorage.setItem(
      "events",
      JSON.stringify(
        updatedEvents.map((ev) => ({
          ...ev,
          start: ev.start ? ev.start.toISOString() : null,
          end: ev.end ? ev.end.toISOString() : null,
        }))
      )
    );
  };

  // Cambiar el tipo del evento a 'archived' en la base de datos

  // Unarchive event
  async function finishEvent(event) {
    if (!event.check_out) {
      window.showToast(
        "No se puede finalizar el servicio sin haber realizado la revisión"
      );
      return;
    }
    try {
      const response = await api("/api/events/finish", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: event.id }), // Reemplaza 1 por el id deseado
      });

      if (!response.ok) {
        throw new Error("Error al terminar evento");
      }
      const updatedEvent = { ...event, type: "completed" };
      const updatedEvents = events.map((ev) =>
        ev.id === updatedEvent.id ? updatedEvent : ev
      );
      setEvents(updatedEvents);
      updateLocalStorage(updatedEvents);
    } catch (error) {
      console.error("Error al terminar evento:", error);
    }
  }

  // Filtrado de eventos según si tienen fecha o no
  const currentSucursal = curRole >= ROLES.MARKETING ? sucFilter : curSuc;
  const filteredEvents = events.filter((event) => {
    const typeCondition =
      filter === "enCurso"
        ? event.type === "ongoing"
        : event.type === "completed" || event.type === "archive";
    const sucursalCondition =
      currentSucursal === "Todas" ? true : event.sucursal === currentSucursal;
    return typeCondition && sucursalCondition;
  });

  // Abrir diálogo de detalle (y en caso de cotizaciones sin fecha se podrá asignar)
  const handleRowClick = (event) => {
    setSelectedEvent(event);
    setshowModal(true);
  };

  const handlePostcheck = (event) => {
    setSelectedEvent(event);
    setshowModal(true);
    setopenChecks(true);
  };

  const handleModalClose = () => {
    setshowModal(false);
    setSelectedEvent(null);
    setopenChecks(false);
  };

  const handleOpenCotizaciones = (e, fastOpenId) => {
    e.stopPropagation();
    router.push(`/search?open=${fastOpenId}`);
  };

  const handleCotPostcheck = (event) => {
    setSelectedEvent(event);
    setOpenCreateDialog(true);
  };

  async function handleSavePostcheck(id) {
    const data = {
      ...selectedEvent.check_out,
      cotizacionPCK: id,
    };
    console.log("Data to save:", data);
    saveChecks(selectedEvent.id, data);
  }

  return (
    <Box>
      <Header
        title="Ordenes"
        actions={
          curRole >= ROLES.MARKETING ? (
            <FormControl sx={{ width: 200 }} variant="standard">
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
              fullWidth
              value={curSuc}
              disabled
              sx={{ width: 200 }}
              variant="standard"
            />
          )
        }
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          alignItems: "flex-start",
          pt: 3,
        }}
      >
        <ButtonGroup variant="contained" sx={{ mb: 2 }}>
          <Button
            onClick={() => setFilter("enCurso")}
            color={filter === "enCurso" ? "primary" : "secondary"}
          >
            En curso
          </Button>
          <Button
            onClick={() => setFilter("completadas")}
            color={filter === "completadas" ? "primary" : "secondary"}
          >
            Completadas
          </Button>
        </ButtonGroup>
      </Box>

      {/* Tabla de cotizaciones */}
      <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>FOLIO</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Vehiculo</TableCell>
              <TableCell>Rampa</TableCell>
              <TableCell>Técnico</TableCell>
              <TableCell>Duración</TableCell>
              <TableCell>Revisión</TableCell>
              <TableCell>Cot. Postcheck</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents
              .slice()
              .sort((a, b) => b.id - a.id)
              .map((event) => (
                <TableRow
                  key={event.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleRowClick(event)}
                >
                  <TableCell>
                    {dayjs(event.created_at).format("DDMMM")}
                  </TableCell>
                  <TableCell>
                    {event.sucursal}-{event.id}
                  </TableCell>
                  <TableCell>{event.client_name}</TableCell>
                  <TableCell>{event.car_model}</TableCell>
                  <TableCell>{event.ramp}</TableCell>
                  <TableCell>{event.technician}</TableCell>
                  {/* DIFERENCIAL DE TIEMPO */}
                  <TableCell>
                    {event.start !== null && event.end !== null
                      ? event.end.diff(event.start, "minute") -
                        event.duration +
                        " minutos"
                      : "Sin Fecha"}
                  </TableCell>
                  {/* REVISION */}
                  <TableCell>
                    {event.check_out ? (
                      <Button
                        variant="outlined"
                        size="small"
                        color="contrast"
                        onClick={() => handlePostcheck(true)}
                      >
                        {" "}
                        Hecha
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handlePostcheck(true)}
                      >
                        {" "}
                        NO
                      </Button>
                    )}
                  </TableCell>
                  {/* COTIZACION POSTCHECK */}
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {event.check_out &&
                      typeof event.check_out === "object" &&
                      event.check_out.cotizacionPCK ? (
                        <Button
                          variant="outlined"
                          size="small"
                          color="success"
                          onClick={(e) =>
                            handleOpenCotizaciones(
                              e,
                              event.check_out.cotizacionPCK
                            )
                          }
                        >
                          {" "}
                          {event.check_out.cotizacionPCK}
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCotPostcheck(event);
                          }}
                        >
                          {" "}
                          NO
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "center",
                      }}
                    >
                      {filter === "enCurso" && (
                        <Button
                          variant="contained"
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            finishEvent(event);
                          }}
                        >
                          Finalizar
                        </Button>
                      )}
                      <Button variant="contained" size="small" color="bleus">
                        Enviar
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de detalle de cotización */}
      {showModal && selectedEvent && (
        <QuoteSummaryModal
          data={selectedEvent}
          onClose={handleModalClose}
          checks={openChecks}
        />
      )}

      {/* Diálogo para crear cotización postcheck */}
      <CreateQuoteDialog
        open={openCreateDialog}
        handleClose={() => {
          setOpenCreateDialog(false);
        }}
        initialData={{
          ...selectedEvent,
          channel: "Postcheck",
          items: null,
          services: null,
        }}
        onQuoteSaved={(savedQuote) => {
          setOpenCreateDialog(false);
          handleSavePostcheck(savedQuote.id);
        }}
      />
    </Box>
  );
};

export default OrdersPage;
