// src/components/ordersummaryModal.jsx
"use client";
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
} from "@mui/material";

import ModeEditIcon from "@mui/icons-material/ModeEdit";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

import { downloadPDF } from "~/resources/quotePDF.js";
import { currencyFormatter } from "~/utils/formaters";
import { doctypeOptionsMyr } from "~/utils/global.js";
import "~/styles/ModalStyles.css";

const OrderSummaryModal = ({ data = {}, checkIn, onClose, zIndex = 1300 }) => {
  const {
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
    start,
  } = data;
  const resolvedCheckIn = checkIn ?? data?.checkIn ?? data?.check_in;

  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const totalAmount = React.useMemo(() => {
    const servicesTotal = (services || []).reduce(
      (acc, s) =>
        acc + (s.price ?? s.cost) * s.units * (1 - (s.descuento || 0) / 100),
      0
    );
    const itemsTotal = (items || []).reduce(
      (acc, i) =>
        acc + (i.price ?? i.cost) * i.units * (1 - (i.descuento || 0) / 100),
      0
    );
    return servicesTotal + itemsTotal;
  }, [services, items]);

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

  const router = useRouter();
  const handleOpenSuite = () => {
    router.push(`/myr/pedidos/${id}/sentorder`);
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
        zIndex,
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
            Resumen de Cotización MYR
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="text"
              color={doctypeOptionsMyr[type]?.color || "primary"}
              disabled
              sx={{ minWidth: 40 }}
            >
              {doctypeOptionsMyr[type]?.text || "Cotización"}
            </Button>
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
                <strong>Fecha:</strong> {formatDate(start)}
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
                          <TableCell align="right">{item.units}</TableCell>
                          <TableCell align="right">
                            {currencyFormatter(item.price)}
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
                              item.price *
                                item.units *
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
                          {currencyFormatter(service.price)}
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
                  bgcolor: "#2E3B4E",
                  color: "#fff",
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6">TOTAL</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
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
            {type === "sentorder" && (
              <Button
                variant="contained"
                size="medium"
                color="success"
                sx={{ ml: 1 }}
                onClick={() => handleOpenSuite("cotizacion")}
              >
                Revisar
              </Button>
            )}
            <Button
              variant="contained"
              size="medium"
              color="primary"
              sx={{ ml: 1 }}
            >
              <MailOutlineIcon />
            </Button>
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
          </Box>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryModal;
