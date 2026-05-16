"use client";
import api, { postJson } from "~/lib/api";
import {
  fetchLines,
  fetchServices,
  saveDiscount,
  saveService,
  deleteService,
} from "./functions/getServices";
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  IconButton,
  Typography,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  FormControl,
  Switch,
  Paper,
  Chip,
  Divider,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckIcon from "@mui/icons-material/Check";
import SearchIcon from "@mui/icons-material/Search";
import Header from "~/components/header";

export default function ServicesPage() {
  const [lines, setLines] = useState([]);
  const [services, setServices] = useState([]);
  const [editedLineDisc, setEditedLineDisc] = useState({});
  const [editedLineMarg, setEditedLineMarg] = useState({});
  const [savingLineId, setSavingLineId] = useState(null);
  const [editedPrices, setEditedPrices] = useState({});
  const [editedDiscounts, setEditedDiscounts] = useState({});
  const [editedIsMo, setEditedIsMo] = useState({});
  const [savingServiceId, setSavingServiceId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [lineDialogOpen, setLineDialogOpen] = useState(false);
  const [newLine, setNewLine] = useState({ linea: "", descuento: 0 });

  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [newService, setNewService] = useState({
    nombre: "",
    precio: 0,
    is_mo: false,
    linea: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const lines = await fetchLines();
    const services = await fetchServices();
    setLines(lines);
    setServices(services);
  }

  const handleSaveDiscount = (line) => {
    saveDiscount(
      line,
      editedLineDisc,
      setSavingLineId,
      setLines,
      setEditedLineDisc
    );
  };
  const handleSaveService = (service) => {
    saveService(
      service,
      editedPrices,
      editedDiscounts,
      editedIsMo,
      setSavingServiceId,
      setServices,
      setEditedPrices,
      setEditedDiscounts,
      setEditedIsMo
    );
  };

  const handleDeleteService = (serviceId, lineId) => {
    deleteService(serviceId);
    setServices((prevServices) => {
      const updatedServices = { ...prevServices };
      if (updatedServices[lineId]) {
        updatedServices[lineId] = updatedServices[lineId].filter(
          (service) => service.id !== serviceId
        );
      }
      return updatedServices;
    });
  };

  const handleAddLine = () => {
    setNewLine({ linea: "", descuento: 0 });
    setLineDialogOpen(true);
  };

  const handleAddService = () => {
    setNewService({ nombre: "", precio: 0, is_mo: false, linea: "" });
    setServiceDialogOpen(true);
  };

  const submitLine = async () => {
    const { linea, descuento } = newLine;
    if (!linea) return alert("Falta el nombre de la línea");
    const d = Number(descuento);
    try {
      const r = await api("/api/services/admin/lines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linea, descuento: isNaN(d) ? 0 : d }),
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      setLineDialogOpen(false);
      await fetchData();
      alert("Línea creada");
    } catch (e) {
      console.error(e);
      alert("Error al crear línea");
    }
  };

  const submitService = async () => {
    const { nombre, precio, linea, is_mo } = newService;
    console.log("Submitting service:", newService);
    if (!nombre) return alert("Falta el nombre del servicio");
    if (!linea) return alert("Falta la línea");
    const payload = {
      nombre,
      precio,
      linea,
      is_mo,
    };
    try {
      await postJson("/api/services/admin/services", payload);
      setServiceDialogOpen(false);
      await fetchData();
      window.showToast("Servicio creado");
    } catch (e) {
      console.error(e);
      window.showToast(e.message || "Error al crear servicio", "error");
    }
  };

  function marginToDiscount(margin) {
    const m = Number(margin);
    if (isNaN(m)) return 0;
    return (1 - (100 + m) / 135) * 100;
  }

  const onMarginChange = (lineId, value) => {
    setEditedLineMarg((prev) => ({
      ...prev,
      [lineId]: value,
    }));
    const discount = marginToDiscount(value);
    setEditedLineDisc((prev) => ({
      ...prev,
      [lineId]: discount,
    }));
  };

  function discountToMargin(discount) {
    const d = Number(discount);
    if (isNaN(d)) return 0;
    // 30 = ((1 - (d /100)) * 135) - 100
    return ((1 - d / 100) * 135 - 100).toFixed(2);
  }

  const onDiscountChange = (lineId, value) => {
    setEditedLineDisc((prev) => ({
      ...prev,
      [lineId]: value,
    }));
    const margin = discountToMargin(value);
    setEditedLineMarg((prev) => ({
      ...prev,
      [lineId]: margin,
    }));
  };

  console.log("Lines:", lines);
  console.log("Services:", services);

  const filteredLinesWithServices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return lines
      .map((line) => {
        const lineServices = services[line.linea] || [];

        if (!normalizedSearch) {
          return { ...line, filteredServices: lineServices };
        }

        const lineMatches = (line.linea || "")
          .toLowerCase()
          .includes(normalizedSearch);

        const matchingServices = lineMatches
          ? lineServices
          : lineServices.filter((service) =>
              (service.nombre || "").toLowerCase().includes(normalizedSearch)
            );

        return { ...line, filteredServices: matchingServices };
      })
      .filter((line) => line.filteredServices.length > 0);
  }, [lines, services, searchTerm]);

  return (
    <Box>
      <Header
        title="Servicios y Líneas"
        titleSx={{ typography: "h5", fontWeight: 700 }}
        startIcon={
          <IconButton
            size="small"
            color="error"
            onClick={() => (window.location.href = "/configuracion")}
          >
            <ArrowBackIcon />
          </IconButton>
        }
        actions={
          <Box display="flex" gap={1}>
            <Button variant="outlined" size="small" onClick={handleAddLine}>
              + Línea
            </Button>
            <Button variant="contained" size="small" onClick={handleAddService}>
              + Servicio
            </Button>
          </Box>
        }
        sx={{ mb: 1 }}
      />
      <Box sx={{ borderBottom: 2, borderColor: "#FFC600", mb: 3 }} />

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Buscar servicio o línea..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3, maxWidth: 440 }}
      />

      {lines && lines.length > 0 ? (
        filteredLinesWithServices.length > 0 ? (
          filteredLinesWithServices.map((line) => (
            <Paper
              key={line.id}
              variant="outlined"
              sx={{ mb: 3, borderRadius: 2, overflow: "hidden" }}
            >
              {/* Line header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  px: 2,
                  py: 1.5,
                  bgcolor: "grey.50",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ flexGrow: 1 }}
                >
                  {line.linea}
                  <Chip
                    label={`${line.filteredServices?.length ?? 0} servicios`}
                    size="small"
                    sx={{ ml: 1.5, fontSize: "0.7rem", height: 20 }}
                  />
                </Typography>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <TextField
                    variant="outlined"
                    label="Descuento %"
                    size="small"
                    type="number"
                    value={
                      editedLineDisc[line.id] !== undefined
                        ? editedLineDisc[line.id]
                        : Number(line.descuento)
                    }
                    onChange={(e) => onDiscountChange(line.id, e.target.value)}
                    sx={{ width: 110 }}
                  />
                  <TextField
                    variant="outlined"
                    label="Margen %"
                    size="small"
                    type="number"
                    value={
                      editedLineMarg[line.id] !== undefined
                        ? editedLineMarg[line.id]
                        : Number(discountToMargin(line.descuento))
                    }
                    onChange={(e) => onMarginChange(line.id, e.target.value)}
                    sx={{ width: 110 }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleSaveDiscount(line)}
                    disabled={savingLineId === line.id}
                    sx={{ whiteSpace: "nowrap", minWidth: 90 }}
                  >
                    {savingLineId === line.id ? "Guardando..." : "Guardar"}
                  </Button>
                </Box>
              </Box>

              {/* Services list */}
              {line.filteredServices?.length > 0 ? (
                <List disablePadding>
                  {line.filteredServices?.map((service, idx) => (
                    <React.Fragment key={service.id}>
                      {idx > 0 && <Divider component="li" />}
                      <ListItem
                        sx={{
                          px: 2,
                          py: 0.75,
                          gap: 1,
                          "&:hover": { bgcolor: "grey.50" },
                          transition: "background 0.15s",
                        }}
                      >
                        <ListItemText
                          primary={service.nombre}
                          primaryTypographyProps={{
                            variant: "body2",
                            fontWeight: 500,
                          }}
                          sx={{ flexGrow: 1, m: 0 }}
                        />
                        {(editedIsMo[service.id] ?? Boolean(service.is_mo)) && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <TextField
                              label="Precio"
                              variant="outlined"
                              size="small"
                              type="number"
                              value={
                                editedPrices[service.id] ?? service.precio ?? ""
                              }
                              onChange={(e) =>
                                setEditedPrices((prev) => ({
                                  ...prev,
                                  [service.id]: e.target.value,
                                }))
                              }
                              sx={{ width: 90 }}
                            />
                            <TextField
                              label="Desc %"
                              variant="outlined"
                              size="small"
                              value={
                                editedDiscounts[service.id] ??
                                service.descuento ??
                                ""
                              }
                              onChange={(e) =>
                                setEditedDiscounts((prev) => ({
                                  ...prev,
                                  [service.id]: e.target.value,
                                }))
                              }
                              sx={{ width: 75 }}
                            />
                          </Box>
                        )}
                        <Tooltip title="Guardar cambios">
                          <span>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleSaveService(service)}
                              disabled={savingServiceId === service.id}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={
                            editedIsMo[service.id] ?? Boolean(service.is_mo)
                              ? "Mano de obra: Sí"
                              : "Mano de obra: No"
                          }
                        >
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ userSelect: "none" }}
                            >
                              M.O.
                            </Typography>
                            <Switch
                              checked={
                                editedIsMo[service.id] ?? Boolean(service.is_mo)
                              }
                              size="small"
                              onChange={(e) =>
                                setEditedIsMo((prev) => ({
                                  ...prev,
                                  [service.id]: e.target.checked,
                                }))
                              }
                            />
                          </Box>
                        </Tooltip>
                        <Tooltip title="Eliminar servicio">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleDeleteService(service.id, line.linea)
                            }
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ px: 2, py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay servicios en esta línea.
                  </Typography>
                </Box>
              )}
            </Paper>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No se encontraron servicios con ese filtro.
          </Typography>
        )
      ) : (
        <Typography variant="body2" color="text.secondary">
          No hay líneas de servicios disponibles.
        </Typography>
      )}
      {/* Dialog: Agregar línea */}
      <Dialog
        open={lineDialogOpen}
        onClose={() => setLineDialogOpen(false)}
        fullWidth
      >
        <DialogTitle>Nueva línea</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la línea"
            fullWidth
            value={newLine.linea}
            onChange={(e) =>
              setNewLine((prev) => ({ ...prev, linea: e.target.value }))
            }
          />
          <TextField
            margin="dense"
            label="Descuento %"
            type="number"
            inputProps={{ min: 0, max: 50 }}
            fullWidth
            value={newLine.descuento}
            onChange={(e) =>
              setNewLine((prev) => ({ ...prev, descuento: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLineDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={submitLine}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Agregar servicio */}
      <Dialog
        open={serviceDialogOpen}
        onClose={() => setServiceDialogOpen(false)}
        fullWidth
      >
        <DialogTitle>Nuevo servicio</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del servicio"
            fullWidth
            value={newService.nombre}
            onChange={(e) =>
              setNewService((prev) => ({ ...prev, nombre: e.target.value }))
            }
          />
          {/* selector is_mo */}
          <FormControl fullWidth sx={{ my: 2 }}>
            <InputLabel>Vendido por Yantissimo?</InputLabel>
            <Select
              fullWidth
              label="Vendido por Yantissimo?"
              value={newService.is_mo}
              onChange={(e) =>
                setNewService((prev) => ({
                  ...prev,
                  is_mo: e.target.value,
                }))
              }
            >
              <MenuItem value={false}>No</MenuItem>
              <MenuItem value={true}>Sí</MenuItem>
            </Select>
          </FormControl>
          {newService.is_mo && (
            <TextField
              margin="dense"
              label="Precio"
              type="number"
              fullWidth
              value={newService.precio}
              onChange={(e) =>
                setNewService((prev) => ({ ...prev, precio: e.target.value }))
              }
            />
          )}
          <TextField
            margin="dense"
            label="Línea"
            helperText={
              lines.length ? "Seleccione una línea" : "Primero cree una línea"
            }
            fullWidth
            select
            value={newService.linea}
            onChange={(e) =>
              setNewService((prev) => ({ ...prev, linea: e.target.value }))
            }
            disabled={lines.length === 0}
          >
            {lines.map((l) => (
              <MenuItem key={l.id} value={l.linea}>
                {l.linea}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setServiceDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={submitService}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
