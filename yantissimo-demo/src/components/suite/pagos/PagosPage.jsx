"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  createInvoicePayment,
  fetchInvoice,
  fetchInvoicePayments,
  reconcileInvoice,
} from "~/lib/invoiceApi.js";

const PAYMENT_METHODS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "mercado_pago", label: "Mercado Pago" },
  { value: "afirme", label: "Afirme" },
  { value: "bbva", label: "BBVA" },
  { value: "santander", label: "Santander" },
  { value: "spei", label: "SPEI" },
  { value: "credito", label: "Crédito" },
  { value: "por_definir", label: "Por definir" },
];

const toNumber = (value) => {
  const parsed = Number.parseFloat(String(value ?? "").replace(/,/g, "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

const getOrderId = (cotId, quote) => quote?.id || cotId;

const emptyInvoicePaymentForm = (currency = "MXN") => ({
  fecha_pago: new Date().toISOString().slice(0, 16),
  metodo_pago: "transferencia",
  monto: "",
  currency,
  provider: "",
  referencia: "",
});

const normalizeInvoiceResponse = (data) => {
  if (data?.invoice && typeof data?.invoice === "object") return data.invoice;
  if (Array.isArray(data)) return data[0] || null;
  if (Array.isArray(data?.invoices)) return data.invoices[0] || null;
  return data && typeof data === "object" ? data : null;
};

const formatCurrency = (value, currency = "MXN") => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: String(currency || "MXN").toUpperCase(),
    }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("es-MX");
};

const resolvePaymentReference = (payment) => {
  const rawPayload =
    payment?.provider_payload ||
    payment?.payload ||
    payment?.providerPayload ||
    null;

  if (rawPayload && typeof rawPayload === "object") {
    return rawPayload?.referencia || rawPayload?.reference || "-";
  }

  if (typeof rawPayload === "string") {
    try {
      const parsed = JSON.parse(rawPayload);
      if (parsed && typeof parsed === "object") {
        return parsed?.referencia || parsed?.reference || "-";
      }
    } catch {
      return rawPayload.trim() || "-";
    }
  }

  return payment?.reference || "-";
};

export default function PagosPage({ cotId, quote }) {
  const muiTheme = useTheme();
  const PRIMARY_COLOR = muiTheme.palette.primary.main;
  const orderId = getOrderId(cotId, quote);
  const [invoiceData, setInvoiceData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [reconcilingInvoice, setReconcilingInvoice] = useState(false);

  const invoiceId = useMemo(() => {
    const parsed = Number(invoiceData?.id);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [invoiceData?.id]);

  const [paymentForm, setPaymentForm] = useState(() =>
    emptyInvoicePaymentForm(invoiceData?.currency || "MXN")
  );

  useEffect(() => {
    let isMounted = true;
    if (!orderId) return;

    setLoadingInvoice(true);
    (async () => {
      const data = await fetchInvoice(orderId);
      if (!isMounted) return;
      setInvoiceData(normalizeInvoiceResponse(data));
      setLoadingInvoice(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  useEffect(() => {
    const currency = String(invoiceData?.currency || "MXN").toUpperCase();
    setPaymentForm((prev) => ({ ...prev, currency }));
  }, [invoiceData?.currency]);

  useEffect(() => {
    let isMounted = true;
    if (!invoiceId) {
      setPayments([]);
      setLoadingPayments(false);
      return;
    }

    setLoadingPayments(true);
    (async () => {
      const rows = await fetchInvoicePayments(invoiceId);
      if (!isMounted) return;
      setPayments(Array.isArray(rows) ? rows : []);
      setLoadingPayments(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [invoiceId]);

  const handlePaymentFormChange = (key, value) => {
    setPaymentForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    if (!invoiceId) {
      window.showToast("No hay factura para registrar pagos", "error");
      return;
    }

    const monto = toNumber(paymentForm.monto);
    if (!paymentForm.metodo_pago) {
      window.showToast("Método de pago obligatorio", "error");
      return;
    }
    if (!Number.isFinite(monto) || monto <= 0) {
      window.showToast("Monto de pago inválido", "error");
      return;
    }

    const dateValue = paymentForm.fecha_pago
      ? new Date(paymentForm.fecha_pago)
      : new Date();
    const fechaPago = Number.isNaN(dateValue.getTime())
      ? new Date().toISOString()
      : dateValue.toISOString();

    setSubmittingPayment(true);
    const response = await createInvoicePayment(invoiceId, {
      fecha_pago: fechaPago,
      metodo_pago: paymentForm.metodo_pago,
      monto,
      currency: paymentForm.currency || "MXN",
      exchange_rate: null,
      provider: paymentForm.provider?.trim() || null,
      provider_payload: paymentForm.referencia?.trim()
        ? { referencia: paymentForm.referencia.trim() }
        : null,
    });

    if (response.ok) {
      const invoiceFromResponse = response?.data?.invoice;
      if (invoiceFromResponse && typeof invoiceFromResponse === "object") {
        setInvoiceData((prev) => ({
          ...(prev || {}),
          ...invoiceFromResponse,
        }));
      }

      const paymentFromResponse = response?.data?.payment;
      if (paymentFromResponse) {
        setPayments((prev) => [paymentFromResponse, ...prev]);
      } else {
        const rows = await fetchInvoicePayments(invoiceId);
        setPayments(Array.isArray(rows) ? rows : []);
      }

      setPaymentForm((prev) => ({
        ...prev,
        monto: "",
        provider: "",
        referencia: "",
      }));
    }
    setSubmittingPayment(false);
  };

  const handleReconcile = async () => {
    if (!invoiceId) {
      window.showToast("No hay factura para reconciliar", "error");
      return;
    }

    setReconcilingInvoice(true);
    const response = await reconcileInvoice(invoiceId);

    if (response.ok) {
      const invoiceFromResponse = response?.data?.invoice;
      if (invoiceFromResponse && typeof invoiceFromResponse === "object") {
        setInvoiceData((prev) => ({
          ...(prev || {}),
          ...invoiceFromResponse,
        }));
      } else {
        const data = await fetchInvoice(orderId);
        setInvoiceData(normalizeInvoiceResponse(data));
      }

      const rows = await fetchInvoicePayments(invoiceId);
      setPayments(Array.isArray(rows) ? rows : []);
    }
    setReconcilingInvoice(false);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Toolbar />
      <Box sx={{ maxWidth: 1280 }}>
        <CardHeader
          title="PAGOS CxC"
          subheader={`Pedido: ${orderId || "N/D"} ${
            quote?.client_name ? `• Cliente: ${quote.client_name}` : ""
          }`}
        />
        <Divider color={PRIMARY_COLOR} />
        <CardContent>
          {loadingInvoice ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : !invoiceId ? (
            <Typography variant="body2" color="warning.main">
              No existe una factura registrada para este pedido. Primero guarda
              la factura y después registra pagos.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 320px" },
                columnGap: 3,
                rowGap: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Pagos registrados
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Estatus: {String(invoiceData?.status || "pendiente")} • Saldo:{" "}
                  {formatCurrency(
                    invoiceData?.balance_due ?? 0,
                    invoiceData?.currency || "MXN"
                  )}
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Método</TableCell>
                        <TableCell align="right">Monto</TableCell>
                        <TableCell>Referencia</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loadingPayments ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <CircularProgress size={20} />
                          </TableCell>
                        </TableRow>
                      ) : payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            Sin pagos registrados
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.map((payment, idx) => (
                          <TableRow key={`${payment?.id || "pago"}-${idx}`}>
                            <TableCell>
                              {formatDateTime(
                                payment?.fecha_pago ||
                                  payment?.paid_at ||
                                  payment?.created_at
                              )}
                            </TableCell>
                            <TableCell>
                              {payment?.metodo_pago || payment?.method || "-"}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(
                                payment?.monto ?? payment?.amount,
                                payment?.currency || invoiceData?.currency
                              )}
                            </TableCell>
                            <TableCell>
                              {resolvePaymentReference(payment)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 4 }}>
                  Registrar pago
                </Typography>
                <Stack
                  component="form"
                  spacing={1.25}
                  onSubmit={handleCreatePayment}
                >
                  <TextField
                    label="Fecha de pago"
                    type="datetime-local"
                    value={paymentForm.fecha_pago}
                    onChange={(e) =>
                      handlePaymentFormChange("fecha_pago", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    label="Método de pago"
                    select
                    value={paymentForm.metodo_pago}
                    onChange={(e) =>
                      handlePaymentFormChange("metodo_pago", e.target.value)
                    }
                    fullWidth
                  >
                    {PAYMENT_METHODS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Monto"
                    value={paymentForm.monto}
                    onChange={(e) =>
                      handlePaymentFormChange(
                        "monto",
                        e.target.value?.replace(/[^0-9.]/g, "")
                      )
                    }
                    placeholder="0.00"
                    fullWidth
                  />
                  <TextField
                    label="Moneda"
                    value={paymentForm.currency}
                    onChange={(e) =>
                      handlePaymentFormChange("currency", e.target.value)
                    }
                    fullWidth
                  />
                  <TextField
                    label="Proveedor"
                    value={paymentForm.provider}
                    onChange={(e) =>
                      handlePaymentFormChange("provider", e.target.value)
                    }
                    placeholder="bbva, santander..."
                    fullWidth
                  />
                  <TextField
                    label="Referencia"
                    value={paymentForm.referencia}
                    onChange={(e) =>
                      handlePaymentFormChange("referencia", e.target.value)
                    }
                    placeholder="ABC123"
                    fullWidth
                  />

                  <Stack direction="row" spacing={1}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submittingPayment || reconcilingInvoice}
                    >
                      {submittingPayment ? "Guardando..." : "Registrar pago"}
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={handleReconcile}
                      disabled={submittingPayment || reconcilingInvoice}
                    >
                      {reconcilingInvoice
                        ? "Recalculando..."
                        : "Recalcular saldo"}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          )}
        </CardContent>
      </Box>
    </Box>
  );
}
