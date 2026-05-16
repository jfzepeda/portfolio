// src/components/QuoteSummaryModal.jsx
"use client";
import api from "~/lib/api";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Divider,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import CheckIcon from "@mui/icons-material/Check";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";
import CheckOut from "./check_out";
import TestigosTablero from "./TestigosTablero";
import { downloadPDF } from "~/resources/quotePDF.js";
import { downloadPDF as downloadServiceOrderPDF } from "~/resources/serviceOrderPDF.js";
import { currencyFormatter } from "~/utils/formaters";
import ChangeType from "~/components/modal/changeType";
import "../../styles/ModalStyles.css";
import { getRamps, physicalDT } from "~/utils/global";
import { startService } from "~/lib/startService";
import { endService } from "~/lib/endService";

const defaultCheckInTestigos = {
  engine: false,
  oil: false,
  battery: false,
  brake: false,
  abs: false,
  coolant: false,
  fuel: false,
  seatbelt: false,
  traction: false,
  airbag: false,
};

const QuoteSummaryModal = ({
  data = {},
  check_out,
  check_in,
  onClose,
  checks,
  onTypeChange,
}) => {
  const {
    id,
    channel,
    client_name,
    additional_notes,
    plate,
    client_type,
    phone,
    car_model,
    year,
    mileage,
    sucursal,
    seller,
    ramp,
    technician,
    type,
    services,
    items,
    start_at,
    anticipo,
  } = data;
  const resolvedCheckOut = check_out ?? data?.check_out;
  const resolvedCheckIn = check_in ?? data?.check_in ?? data?.checkIn;

  const [openChecks, setopenChecks] = useState(checks || false);
  const [openBeginDialog, setOpenBeginDialog] = useState(false);
  const [beginTechnician, setBeginTechnician] = useState(technician || "");
  const [beginRamp, setBeginRamp] = useState(ramp || "");
  const [technicians, setTechnicians] = useState([]);
  const getInitialCheckIn = React.useCallback(
    () => ({
      clienteEspera: false,
      cortaCorriente: false,
      retiroUsado: false,
      autorizaProbar: false,
      antirrobo: false,
      testigosTab: false,
      testigos: defaultCheckInTestigos,
      mileage_km: mileage || "",
      plate: plate || "",
      ...(resolvedCheckIn || {}),
      testigos: {
        ...defaultCheckInTestigos,
        ...(resolvedCheckIn?.testigos || {}),
      },
    }),
    [mileage, plate, resolvedCheckIn]
  );
  const [beginCheckIn, setBeginCheckIn] = useState(() => getInitialCheckIn());
  const rampsInBranch = React.useMemo(
    () => getRamps(sucursal) || [],
    [sucursal]
  );

  const updateBeginCheckIn = (name, value) => {
    setBeginCheckIn((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenBeginDialog = () => {
    setBeginTechnician(technician || "");
    setBeginRamp(ramp || "");
    setBeginCheckIn(getInitialCheckIn());
    setOpenBeginDialog(true);
  };

  React.useEffect(() => {
    async function fetchTechnicians() {
      if (!openBeginDialog) return;
      try {
        const res = await api(`/api/users/technician/get?sucursal=${sucursal}`);
        if (!res.ok) return;
        const data = await res.json();
        setTechnicians(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error al obtener técnicos:", e);
      }
    }
    fetchTechnicians();
  }, [openBeginDialog, sucursal]);

  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const normalizeEntries = React.useCallback((value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    if (value && typeof value === "object") {
      if (Array.isArray(value.items)) return value.items;
      if (Array.isArray(value.rows)) return value.rows;
      return Object.values(value).filter((v) => v && typeof v === "object");
    }
    return [];
  }, []);
  const safeServices = React.useMemo(
    () => normalizeEntries(services),
    [services, normalizeEntries]
  );
  const safeItems = React.useMemo(
    () => normalizeEntries(items),
    [items, normalizeEntries]
  );
  const showServiceOrderPDF = physicalDT.includes(type);

  const totalAmount = React.useMemo(() => {
    const servicesTotal = safeServices.reduce(
      (acc, s) =>
        acc +
        (s?.price ?? s?.cost ?? 0) * s.units * (1 - (s.descuento || 0) / 100),
      0
    );
    const itemsTotal = safeItems.reduce(
      (acc, i) =>
        acc +
        (i?.price ?? i?.cost ?? 0) * i.units * (1 - (i.descuento || 0) / 100),
      0
    );
    return servicesTotal + itemsTotal;
  }, [safeServices, safeItems]);

  const formatDate = (dateLike) => {
    try {
      if (!dateLike) return "-";
      const d = new Date(dateLike);
      return d.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // --- Dynamic column layout based on the number of items + services ---
  // Base modal width 700 px; add 250 px for every extra column

  const handleOpenSchedule = () => {
    router.push(`/cotizaciones/${id}/agendar`);
  };

  const router = useRouter();
  const handleOpenSuite = () => {
    router.push(`/cotizaciones/${id}/pre`);
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(2px)",
        padding: 32,
        overflowY: "auto",
        zIndex: 1300,
      }}
      onClick={(e) => e.target.className === "modal-overlay" && onClose()}
    >
      <div
        className="modal-content"
        style={{
          minWidth: 950,
          maxWidth: "min(1200px, 96vw)",
          margin: "0 auto",
          maxHeight: "90vh",
          overflow: "hidden",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          border: "1px solid rgba(0,0,0,0.08)",
          background: "#fff",
          padding: 24,
          position: "relative",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Resumen de Cotización
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <ChangeType
              type={type}
              quote_id={id}
              onTypeChange={(newType) =>
                onTypeChange && onTypeChange(id, newType)
              }
            />
            <Button
              variant="text"
              className="modal-edit"
              color="inherit"
              onClick={handleOpenSuite}
              sx={{ minWidth: 40 }}
              aria-label="Editar"
            >
              <ModeEditIcon />
            </Button>
          </Stack>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <div
          className="modal-columns"
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                display: "block",
                textAlign: "center",
                mt: 1,
              }}
            >
              Folio: {sucursal}-{id}
            </Typography>
            <div
              className="modal-column"
              style={{
                marginLeft: 0,
                maxWidth: 360,
                borderRadius: 12,
                padding: 16,
                fontFamily: "Arial, sans-serif",
              }}
            >
              <p>
                <strong>Venta:</strong> {channel}
              </p>
              <p>
                <strong>Vendedor:</strong> {seller}
              </p>
              <p>
                <strong>Fecha:</strong> {formatDate(start_at)}
              </p>
              <Divider sx={{ my: 1 }} />
              <p>
                <strong>Nombre:</strong> {client_name}
              </p>
              <p>
                <strong>Teléfono:</strong> {phone}
              </p>
              <p>
                <strong>Venta a:</strong> {client_type}
              </p>
              <Divider sx={{ my: 1 }} />
              <p>
                <strong>Automóvil:</strong> {car_model} {year}
              </p>
              {/* <p>
              <strong>Año:</strong> {year}
            </p> */}
              <p>
                <strong>Kilometraje:</strong> {mileage}
              </p>
              <p>
                <strong>Placa:</strong> {plate}
              </p>
              <Divider sx={{ my: 1 }} />
              <p>
                <strong>Notas Adicionales:</strong> {additional_notes}
              </p>
            </div>
          </Box>
          <div
            className="modal-column"
            style={{ marginLeft: 0, flex: 1, background: "#fff" }}
          >
            {/* ----- ARTÍCULOS TABLE ----- */}
            {items && items.length > 0 && (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    display: "block",
                    textAlign: "center",
                    mt: 1,
                  }}
                >
                  ARTÍCULOS
                </Typography>
                <Table size="small" sx={{ mb: 2 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Artículo</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Precio unitario</TableCell>
                      {items.some((i) => i.descuento && i.descuento > 0) && (
                        <TableCell align="right">Desc&nbsp;(%)</TableCell>
                      )}
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.article}</TableCell>
                          <TableCell align="right">
                            {Number(item?.units)}
                          </TableCell>
                          <TableCell align="right">
                            {currencyFormatter(item?.price)}
                          </TableCell>
                          {items.some(
                            (i) => i.descuento && i.descuento > 0
                          ) && (
                            <TableCell align="right">
                              {item.descuento || 0}
                            </TableCell>
                          )}
                          <TableCell align="right">
                            {currencyFormatter(
                              item?.price *
                                Number(item?.units) *
                                (1 - (item.descuento || 0) / 100)
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                  {/* Pagination for items */}
                  {items.length > rowsPerPage && (
                    <TablePagination
                      component="div"
                      count={items.length}
                      page={page}
                      onPageChange={handleChangePage}
                      rowsPerPage={rowsPerPage}
                      rowsPerPageOptions={[rowsPerPage]}
                    />
                  )}
                </Table>
              </>
            )}

            {/* ----- SERVICIOS TABLE ----- */}
            {services && services.length > 0 && (
              <>
                <Typography
                  variant="overline"
                  sx={{
                    display: "block",
                    textAlign: "center",
                    mt: 1,
                  }}
                >
                  SERVICIOS
                </Typography>
                <Table size="small" sx={{ mb: 2 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Servicio</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Precio unitario</TableCell>
                      {services.some((s) => s.descuento && s.descuento > 0) && (
                        <TableCell align="right">Desc&nbsp;(%)</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {services.map((service, index) => (
                      <TableRow key={index}>
                        <TableCell>{service.service}</TableCell>
                        <TableCell align="right">{service.units}</TableCell>
                        <TableCell align="right">
                          {currencyFormatter(service?.price)}
                        </TableCell>
                        {services.some(
                          (s) => s.descuento && s.descuento > 0
                        ) && (
                          <TableCell align="right">
                            {service.descuento || 0}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 3,
                  mb: 0.75,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#2E3B4E", fontWeight: 600 }}
                >
                  ANTICIPO
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: "#2E3B4E", fontWeight: 800 }}
                >
                  {currencyFormatter(anticipo || 0, 2)}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "#2E3B4E", fontWeight: 600 }}
                >
                  TOTAL
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ color: "#2E3B4E", fontWeight: 800 }}
                >
                  {currencyFormatter(totalAmount)}
                </Typography>
              </Box>
            </Box>
          </div>
        </div>
        <div
          className="modal-buttons"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 16,
            marginTop: 8,
            borderTop: "1px solid #eee",
          }}
        >
          <Button variant="contained" onClick={onClose}>
            Cerrar
          </Button>
          <Box sx={{ alignItems: "flex-end" }}>
            {(type === "accepted" ||
              type === "quote" ||
              type === "followup") && (
              <Button
                variant="contained"
                color="primary"
                size="medium"
                sx={{ ml: 1, color: "black", backgroundColor: "#70a7ff" }}
                onClick={handleOpenSchedule}
              >
                Agendar
              </Button>
            )}
            {(type === "scheduled" || type === "appointed") && (
              <Button
                variant="contained"
                size="medium"
                color="success"
                sx={{ ml: 1 }}
                onClick={handleOpenBeginDialog}
              >
                Iniciar servicio
                {resolvedCheckIn ? <CheckIcon /> : <PriorityHighIcon />}
              </Button>
            )}
            {(type === "ongoing" || type === "completed") && (
              <Button
                variant="contained"
                size="medium"
                sx={{ ml: 1, color: "black" }}
                onClick={() => setopenChecks(true)}
              >
                Check Out
                {resolvedCheckOut ? <CheckIcon /> : <PriorityHighIcon />}
              </Button>
            )}
            {type === "ongoing" && (
              <Button
                variant="contained"
                size="medium"
                color="error"
                sx={{ ml: 1 }}
                onClick={() => endService(id, resolvedCheckOut)}
              >
                Finalizar servicio
              </Button>
            )}
            {type === "sentorder" && (
              <Button
                variant="contained"
                size="medium"
                color="success"
                sx={{ ml: 1 }}
                onClick={() => handleOpenSuite("cotizacion")}
              >
                Confirmar
              </Button>
            )}
            <Button
              variant="contained"
              size="medium"
              color="contrast"
              sx={{ ml: 1 }}
              onClick={() =>
                downloadPDF({
                  id,
                  channel,
                  client_name,
                  additional_notes,
                  client_type,
                  phone,
                  car_model,
                  year,
                  mileage,
                  sucursal,
                  seller,
                  ramp,
                  technician,
                  type,
                  services,
                  items,
                  check_in: resolvedCheckIn,
                  sumarTotales: false,
                  desgloceIva: false,
                  ordenServicio: false,
                })
              }
            >
              <SimCardDownloadIcon />
            </Button>
            {showServiceOrderPDF && (
              <Button
                variant="contained"
                size="medium"
                color="contrast"
                startIcon={<SimCardDownloadIcon />}
                sx={{ ml: 1 }}
                onClick={() =>
                  downloadServiceOrderPDF({
                    id,
                    channel,
                    client_name,
                    additional_notes,
                    client_type,
                    phone,
                    car_model,
                    year,
                    mileage,
                    plate,
                    sucursal,
                    seller,
                    ramp,
                    technician,
                    type,
                    services,
                    items,
                    check_in: resolvedCheckIn,
                    check_out: resolvedCheckOut,
                  })
                }
              >
                Orden servicio
              </Button>
            )}
          </Box>
        </div>
      </div>

      <CheckOut
        open={openChecks}
        onClose={() => setopenChecks(false)}
        onConfirm={() => setopenChecks(false)}
        id={id}
        // saveChecks={saveChecks}
        initialData={{
          channel,
          ramp,
          technician,
          client_name,
          additional_notes,
          client_type,
          phone,
          car_model,
          year,
          mileage,
          sucursal,
          seller,
        }}
        check_out={resolvedCheckOut}
      />
      {/* Dialogo para iniciar servicio: check-in, technician y ramp */}
      <Dialog
        open={openBeginDialog}
        onClose={() => setOpenBeginDialog(false)}
        sx={{ zIndex: 2100 }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Iniciar servicio</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: "grid", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label="Kilometraje"
                value={beginCheckIn.mileage_km ?? ""}
                onChange={(e) =>
                  updateBeginCheckIn("mileage_km", e.target.value)
                }
                size="small"
                sx={{ minWidth: 180, flex: 1 }}
              />
              <TextField
                label="Placa"
                value={beginCheckIn.plate ?? ""}
                onChange={(e) => updateBeginCheckIn("plate", e.target.value)}
                size="small"
                sx={{ minWidth: 180, flex: 1 }}
              />
            </Box>
            <FormGroup
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(beginCheckIn.clienteEspera)}
                    onChange={(e) =>
                      updateBeginCheckIn("clienteEspera", e.target.checked)
                    }
                  />
                }
                label="Cliente en espera"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(beginCheckIn.cortaCorriente)}
                    onChange={(e) =>
                      updateBeginCheckIn("cortaCorriente", e.target.checked)
                    }
                  />
                }
                label="Corta corriente"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(beginCheckIn.retiroUsado)}
                    onChange={(e) =>
                      updateBeginCheckIn("retiroUsado", e.target.checked)
                    }
                  />
                }
                label="Retiro de usado"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(beginCheckIn.autorizaProbar)}
                    onChange={(e) =>
                      updateBeginCheckIn("autorizaProbar", e.target.checked)
                    }
                  />
                }
                label="Autoriza a probar"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(beginCheckIn.antirrobo)}
                    onChange={(e) =>
                      updateBeginCheckIn("antirrobo", e.target.checked)
                    }
                  />
                }
                label="Antirrobo"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(beginCheckIn.testigosTab)}
                    onChange={(e) =>
                      updateBeginCheckIn("testigosTab", e.target.checked)
                    }
                  />
                }
                label="Testigos en Tablero"
              />
            </FormGroup>
            {beginCheckIn.testigosTab && (
              <TestigosTablero
                values={beginCheckIn.testigos}
                onChange={(name, value) =>
                  setBeginCheckIn((prev) => ({
                    ...prev,
                    testigos: { ...prev.testigos, [name]: value },
                  }))
                }
              />
            )}
            <FormControl fullWidth>
              <InputLabel>Técnico</InputLabel>
              <Select
                label="Técnico"
                value={beginTechnician}
                onChange={(e) => setBeginTechnician(e.target.value)}
                MenuProps={{
                  disablePortal: false,
                  sx: { zIndex: 2100 },
                  PaperProps: { sx: { zIndex: 2100 } },
                  container:
                    typeof document !== "undefined" ? document.body : undefined,
                }}
              >
                <MenuItem value="">Auto</MenuItem>
                {technicians.map((tech) => (
                  <MenuItem key={tech.id ?? tech.name} value={tech.name}>
                    {tech.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Rampa</InputLabel>
              <Select
                label="Rampa"
                value={beginRamp}
                onChange={(e) => setBeginRamp(e.target.value)}
                MenuProps={{
                  disablePortal: false,
                  sx: { zIndex: 2100 },
                  PaperProps: { sx: { zIndex: 2100 } },
                  container:
                    typeof document !== "undefined" ? document.body : undefined,
                }}
              >
                {rampsInBranch.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBeginDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenBeginDialog(false);
              startService({
                id,
                check_in: beginCheckIn,
                technician: beginTechnician,
                ramp: beginRamp,
              });
            }}
          >
            Iniciar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default QuoteSummaryModal;
