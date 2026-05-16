"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  Chip,
  Popover,
  Tooltip,
  Badge,
} from "@mui/material";

import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";
import FilterListIcon from "@mui/icons-material/FilterList";

import { SUCS, SUCS_MYR } from "~/utils/global";
import Header from "~/components/header";
import {
  getInvoices,
  getFilters,
  getOpenInvoicesByCustomer,
  createPaymentComplement,
  createPaymentComplementApply,
} from "./ventasApi.js";
import { downloadInvoice } from "~/lib/invoiceApi.js";
import { splitName } from "~/utils/formaters.js";
import QuoteSummaryModal from "~/components/modal/modal-ventas.jsx";

const sucursales = [...SUCS, ...SUCS_MYR, "Todas"];
const DEFAULT_FILTERS = { sellers: [], customers: [] };
const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "parcial", label: "Parcial" },
  { value: "pagado", label: "Pagado" },
];
const COMPLEMENT_PAYMENT_METHODS = [
  { value: "transferencia", label: "Transferencia" },
  { value: "spei", label: "SPEI" },
  { value: "efectivo", label: "Efectivo" },
  { value: "deposito", label: "Depósito" },
  { value: "tarjeta_credito", label: "Tarjeta crédito" },
  { value: "tarjeta_debito", label: "Tarjeta débito" },
  { value: "cheque", label: "Cheque" },
  { value: "mercado_pago", label: "Mercado Pago" },
];

const toNumber = (value) => {
  const parsed = Number.parseFloat(String(value ?? "").replace(/,/g, "."));
  return Number.isFinite(parsed) ? parsed : 0;
};
const toCents = (value) => Math.round(toNumber(value) * 100);
const fromCents = (value) => Number((value / 100).toFixed(2));

const nowLocalDateTime = () => new Date().toISOString().slice(0, 16);
const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
});

const emptyComplementMethod = () => ({
  metodo_pago: "transferencia",
  monto: "",
  fecha_pago: nowLocalDateTime(),
  currency: "MXN",
  provider: "",
  referencia: "",
});

const VentasPage = () => {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sucursal, setSucursal] = useState("Todas");
  const [seller, setSeller] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("");
  const [onlyOpen, setOnlyOpen] = useState("");
  const [overdue, setOverdue] = useState("");
  const [quoteId, setQuoteId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [openComplementDialog, setOpenComplementDialog] = useState(false);
  const [complementCustomerId, setComplementCustomerId] = useState("");
  const [complementFolioMicrosip, setComplementFolioMicrosip] = useState("");
  const [complementInvoices, setComplementInvoices] = useState([]);
  const [loadingComplementInvoices, setLoadingComplementInvoices] =
    useState(false);
  const [complementPaymentMethods, setComplementPaymentMethods] = useState([
    emptyComplementMethod(),
  ]);
  const [creatingComplement, setCreatingComplement] = useState(false);
  const [filtersAnchorEl, setFiltersAnchorEl] = useState(null);

  const router = useRouter();

  useEffect(() => {
    let active = true;
    const loadFilters = async () => {
      setError("");
      try {
        const filters = await getFilters();
        console.log("Fetched filters:", filters);

        if (active) {
          setFilters(filters);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "No se pudieron cargar los filtros");
          setFilters(DEFAULT_FILTERS);
        }
      }
    };

    loadFilters();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadInvoices = async () => {
      setLoading(true);
      setError("");
      try {
        const invoices = await getInvoices({
          sucursal: sucursal === "Todas" ? "" : sucursal,
          seller,
          customer_id: customerId,
          quote_id: quoteId,
          searchTerm,
          status,
          only_open: onlyOpen,
          overdue,
        });

        if (active) {
          setRows(invoices);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "No se pudieron cargar las ventas");
          setRows([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadInvoices();
    return () => {
      active = false;
    };
  }, [
    sucursal,
    seller,
    customerId,
    quoteId,
    searchTerm,
    status,
    onlyOpen,
    overdue,
  ]);

  const columns = [
    { key: "invoice_id", label: "Factura" },
    { key: "reference", label: "Referencia" },
    { key: "esquema_precio", label: "Esquema" },
    { key: "importe_total", label: "Importe" },
    { key: "balance_due", label: "Saldo" },
    { key: "status", label: "Estatus" },
    { key: "issued_at", label: "F. emisión" },
    { key: "due_date", label: "F. vencimiento" },
    { key: "sucursal", label: "Sucursal" },
    { key: "seller_name", label: "Vendedor" },
    { key: "customer_name", label: "Cliente" },
    { key: "folio_venta_microsip", label: "Venta Microsip" },
    { key: "url_pdf_factura", label: "Factura PDF" },
  ];

  const getStatusChipColor = (value) => {
    if (value === "pagado") return "success";
    if (value === "parcial") return "warning";
    if (value === "pendiente") return "error";
    return "default";
  };

  const clearAdvancedFilters = () => {
    setSucursal("Todas");
    setSeller("");
    setCustomerId("");
    setStatus("");
    setOnlyOpen("");
    setOverdue("");
    setQuoteId("");
  };

  const openFiltersPopover = (event) => {
    setFiltersAnchorEl(event.currentTarget);
  };

  const closeFiltersPopover = () => {
    setFiltersAnchorEl(null);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("es-MX");
  };

  const handleRowClick = (row) => {
    router.push(
      row?.order_id
        ? `/myr/pedidos/${row.order_id}/invoiced`
        : `/cotizacion/${row.quote_id ?? row.id}/factura`
    );
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalData(null);
  };

  const openCreateComplementDialog = () => {
    setComplementCustomerId(customerId ? String(customerId) : "");
    setComplementFolioMicrosip("");
    setComplementInvoices([]);
    setComplementPaymentMethods([emptyComplementMethod()]);
    setOpenComplementDialog(true);
  };

  const closeCreateComplementDialog = () => {
    if (creatingComplement) return;
    setOpenComplementDialog(false);
  };

  useEffect(() => {
    let active = true;
    if (!openComplementDialog || !complementCustomerId) {
      setComplementInvoices([]);
      setLoadingComplementInvoices(false);
      return;
    }

    setLoadingComplementInvoices(true);
    (async () => {
      try {
        const invoices = await getOpenInvoicesByCustomer(complementCustomerId);
        if (!active) return;

        const normalized = (Array.isArray(invoices) ? invoices : []).map(
          (invoice) => ({
            ...invoice,
            selected: false,
            applyAmount: "",
          })
        );
        setComplementInvoices(normalized);
      } catch (err) {
        if (!active) return;
        setComplementInvoices([]);
        window.showToast(
          err?.message || "No se pudieron cargar facturas abiertas",
          "error"
        );
      } finally {
        if (active) setLoadingComplementInvoices(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [openComplementDialog, complementCustomerId]);

  const toggleComplementInvoice = (invoiceId, checked) => {
    setComplementInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === invoiceId
          ? {
              ...invoice,
              selected: checked,
              applyAmount: checked
                ? invoice.applyAmount || String(invoice?.balance_due ?? "")
                : "",
            }
          : invoice
      )
    );
  };

  const updateComplementInvoiceAmount = (invoiceId, value) => {
    setComplementInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === invoiceId ? { ...invoice, applyAmount: value } : invoice
      )
    );
  };

  const addComplementPaymentMethod = () => {
    setComplementPaymentMethods((prev) => [...prev, emptyComplementMethod()]);
  };

  const removeComplementPaymentMethod = (idx) => {
    setComplementPaymentMethods((prev) => {
      const next = prev.filter((_, index) => index !== idx);
      return next.length ? next : [emptyComplementMethod()];
    });
  };

  const updateComplementPaymentMethod = (idx, key, value) => {
    setComplementPaymentMethods((prev) =>
      prev.map((method, index) =>
        index === idx ? { ...method, [key]: value } : method
      )
    );
  };

  const extractComplementId = (payload) => {
    if (!payload) return null;
    const raw =
      payload?.id ??
      payload?.payment_complement?.id ??
      payload?.complement?.id ??
      (Array.isArray(payload) ? payload[0]?.id : null) ??
      (Array.isArray(payload?.data) ? payload.data[0]?.id : null);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const buildComplementApplyPayments = (methods, invoiceApplications) => {
    const remainingInvoices = invoiceApplications.map((invoice) => ({
      invoice_id: invoice.invoice_id,
      remainingCents: toCents(invoice.imp_pagado),
    }));

    return methods.map((method) => {
      let remainingPaymentCents = toCents(method.monto);
      const allocations = [];

      for (const invoice of remainingInvoices) {
        if (remainingPaymentCents <= 0) break;
        if (invoice.remainingCents <= 0) continue;

        const appliedCents = Math.min(
          remainingPaymentCents,
          invoice.remainingCents
        );
        if (appliedCents <= 0) continue;

        allocations.push({
          invoice_id: invoice.invoice_id,
          imp_pagado: fromCents(appliedCents),
        });

        remainingPaymentCents -= appliedCents;
        invoice.remainingCents -= appliedCents;
      }

      const paidAt = method.fecha_pago
        ? new Date(method.fecha_pago)
        : new Date();

      return {
        metodo_pago: method.metodo_pago,
        monto: fromCents(toCents(method.monto)),
        currency: method.currency || "MXN",
        fecha_pago: Number.isNaN(paidAt.getTime())
          ? new Date().toISOString()
          : paidAt.toISOString(),
        provider: method.provider?.trim() || null,
        provider_payload: method.referencia?.trim()
          ? { referencia: method.referencia.trim() }
          : null,
        allocations,
      };
    });
  };

  const handleCreateComplement = async () => {
    if (!complementCustomerId) {
      window.showToast("Selecciona un cliente", "error");
      return;
    }

    const selectedInvoices = complementInvoices
      .filter((invoice) => invoice.selected)
      .map((invoice) => ({
        invoice_id: Number(invoice.id),
        imp_pagado: toNumber(invoice.applyAmount),
        balance_due: toNumber(invoice.balance_due),
      }))
      .filter((invoice) => invoice.invoice_id > 0 && invoice.imp_pagado > 0);

    if (!selectedInvoices.length) {
      window.showToast(
        "Selecciona al menos una factura y captura un monto aplicado",
        "error"
      );
      return;
    }

    const invoiceOverApplied = selectedInvoices.find(
      (invoice) =>
        invoice.balance_due > 0 &&
        invoice.imp_pagado - invoice.balance_due > 0.01
    );
    if (invoiceOverApplied) {
      window.showToast(
        "El monto aplicado no puede exceder el saldo de la factura",
        "error"
      );
      return;
    }

    const validMethods = complementPaymentMethods
      .map((method) => ({
        ...method,
        monto: toNumber(method.monto),
      }))
      .filter((method) => method.metodo_pago && method.monto > 0);

    if (!validMethods.length) {
      window.showToast("Agrega al menos un método de pago con monto", "error");
      return;
    }

    const invoicesTotal = selectedInvoices.reduce(
      (acc, invoice) => acc + invoice.imp_pagado,
      0
    );
    const methodsTotal = validMethods.reduce(
      (acc, method) => acc + method.monto,
      0
    );

    if (Math.abs(invoicesTotal - methodsTotal) > 0.01) {
      window.showToast(
        "La suma de métodos debe coincidir con el total aplicado a facturas",
        "error"
      );
      return;
    }

    setCreatingComplement(true);
    try {
      const complementPayload = await createPaymentComplement({
        customer_id: complementCustomerId,
        status: "draft",
        folio_microsip: complementFolioMicrosip,
      });
      const complementId = extractComplementId(complementPayload);
      if (!complementId) {
        throw new Error("No se pudo obtener el id del complemento creado");
      }

      const payments = buildComplementApplyPayments(
        validMethods,
        selectedInvoices
      );
      await createPaymentComplementApply(complementId, { payments });

      window.showToast("Complemento de pago generado");
      setOpenComplementDialog(false);
      const invoices = await getInvoices({
        sucursal: sucursal === "Todas" ? "" : sucursal,
        seller,
        customer_id: customerId,
        quote_id: quoteId,
        searchTerm,
        status,
        only_open: onlyOpen,
        overdue,
      });
      setRows(invoices);
    } catch (err) {
      window.showToast(
        err?.message || "No se pudo generar el complemento",
        "error"
      );
    } finally {
      setCreatingComplement(false);
    }
  };

  const selectedInvoicesTotal = complementInvoices.reduce(
    (acc, invoice) =>
      invoice.selected ? acc + toNumber(invoice.applyAmount) : acc,
    0
  );
  const selectedMethodsTotal = complementPaymentMethods.reduce(
    (acc, method) => acc + toNumber(method.monto),
    0
  );
  const filtersPopoverOpen = Boolean(filtersAnchorEl);
  const advancedFiltersCount = [
    sucursal !== "Todas",
    Boolean(seller),
    Boolean(customerId),
    Boolean(status),
    Boolean(onlyOpen),
    Boolean(overdue),
    Boolean(quoteId),
  ].filter(Boolean).length;

  const summary = rows.reduce(
    (acc, row) => {
      const balanceDue = toNumber(row?.balance_due);
      acc.balance += balanceDue;
      if (String(row?.status || "").toLowerCase() === "pagado") acc.paid += 1;
      else if (String(row?.status || "").toLowerCase() === "parcial")
        acc.partial += 1;
      else if (String(row?.status || "").toLowerCase() === "pendiente")
        acc.pending += 1;
      return acc;
    },
    { balance: 0, paid: 0, partial: 0, pending: 0 }
  );

  return (
    <Box sx={{ pt: 3, px: { xs: 0, md: 1 } }}>
      <Header
        title="Ventas"
        subtitle="Listado de ventas facturadas"
        titleSx={{ fontWeight: 700 }}
        actions={
          <Button
            variant="contained"
            size="small"
            onClick={openCreateComplementDialog}
          >
            Generar complemento
          </Button>
        }
      />

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        sx={{ mb: 2, flexWrap: "wrap" }}
      >
        <Chip label={`Facturas: ${rows.length}`} variant="outlined" />
        <Chip label={`Pendientes: ${summary.pending}`} color="error" />
        <Chip label={`Parciales: ${summary.partial}`} color="warning" />
        <Chip label={`Pagadas: ${summary.paid}`} color="success" />
        <Chip
          label={`Saldo total: ${money.format(summary.balance)}`}
          color="info"
          variant="outlined"
        />
      </Stack>

      <Box
        variant="outlined"
        sx={{
          p: { xs: 1.5, md: 2 },
          mb: 2,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="Buscar"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cliente, folio o vendedor"
            sx={{ minWidth: 260, flexGrow: 1 }}
          />
          <Tooltip title="Filtros avanzados">
            <IconButton onClick={openFiltersPopover} size="small">
              <Badge
                color="primary"
                badgeContent={advancedFiltersCount}
                invisible={advancedFiltersCount === 0}
              >
                <FilterListIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Popover
        open={filtersPopoverOpen}
        anchorEl={filtersAnchorEl}
        onClose={closeFiltersPopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ p: 2, width: { xs: 300, md: 360 } }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Filtros
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              label="ID"
              variant="outlined"
              size="small"
              value={quoteId}
              onChange={(e) => setQuoteId(e.target.value)}
              fullWidth
            />

            <FormControl size="small" fullWidth>
              <InputLabel>Sucursal</InputLabel>
              <Select
                label="Sucursal"
                value={sucursal}
                onChange={(e) => setSucursal(e.target.value)}
              >
                {sucursales.map((suc) => (
                  <MenuItem key={suc} value={suc}>
                    {suc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Vendedor</InputLabel>
              <Select
                label="Vendedor"
                value={seller}
                onChange={(e) => setSeller(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {filters?.sellers?.map((suc) => (
                  <MenuItem key={suc} value={suc}>
                    {suc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Cliente</InputLabel>
              <Select
                label="Cliente"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {filters?.customers?.map((customer) => (
                  <MenuItem
                    key={String(customer.id)}
                    value={String(customer.id)}
                  >
                    {customer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Estatus</InputLabel>
              <Select
                label="Estatus"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value || "all"} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Abiertas</InputLabel>
              <Select
                label="Abiertas"
                value={onlyOpen}
                onChange={(e) => setOnlyOpen(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="true">Sí</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Vencidas</InputLabel>
              <Select
                label="Vencidas"
                value={overdue}
                onChange={(e) => setOverdue(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="true">Sí</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" justifyContent="space-between">
              <Button
                variant="text"
                size="small"
                onClick={clearAdvancedFilters}
              >
                Limpiar
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={closeFiltersPopover}
              >
                Listo
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Popover>

      <Box sx={{ flex: 1, height: "70vh", overflow: "hidden", width: "90vw" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              height: "100%",
              overflow: "auto",
              borderRadius: 2,
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      sx={{
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        backgroundColor: "grey.100",
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      Sin resultados
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, index) => (
                    <TableRow
                      key={`${row?.quote_id ?? "q"}-${
                        row?.order_id ?? "o"
                      }-${index}`}
                      hover
                      onClick={() => handleRowClick(row)}
                      sx={{
                        cursor: "pointer",
                        "&:nth-of-type(odd)": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <TableCell key={"invoice_id"}>{row?.id || "-"}</TableCell>
                      <TableCell key={"reference"}>
                        {row?.order_id
                          ? `M-${row?.order_id}`
                          : row?.quote_id
                          ? `P-${row?.quote_id}`
                          : "-"}
                      </TableCell>
                      <TableCell key={"esquema_precio"}>
                        {row.esquema_precio}
                      </TableCell>
                      <TableCell key={"importe_total"}>
                        {row.importe_total}
                      </TableCell>
                      <TableCell key={"balance_due"}>
                        {row?.balance_due ?? "-"}
                      </TableCell>
                      <TableCell key={"status"}>
                        <Chip
                          size="small"
                          label={row?.status || "-"}
                          color={getStatusChipColor(
                            String(row?.status || "").toLowerCase()
                          )}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell key={"issued_at"}>
                        {formatDate(row?.issued_at)}
                      </TableCell>
                      <TableCell key={"due_date"}>
                        {formatDate(row?.due_date)}
                      </TableCell>
                      <TableCell key={"sucursal"}>{row.sucursal}</TableCell>
                      <TableCell key={"seller_name"}>
                        {splitName(row.seller_name || row?.seller)}
                      </TableCell>
                      <TableCell key={"customer_name"}>
                        {row?.customer_name || row?.client_name || row?.cliente}
                      </TableCell>
                      <TableCell key={"folio_venta_microsip"}>
                        {row.folio_venta_microsip}
                      </TableCell>
                      <TableCell key={"url_pdf_factura"}>
                        {row.url_pdf_factura && (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadInvoice(row?.order_id || row?.quote_id);
                            }}
                          >
                            <SimCardDownloadIcon color="contrast" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      {showModal && modalData && (
        <QuoteSummaryModal data={modalData} onClose={handleModalClose} />
      )}

      <Dialog
        open={openComplementDialog}
        onClose={closeCreateComplementDialog}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Generar complemento de pago (REP)</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Cliente</InputLabel>
                <Select
                  label="Cliente"
                  value={complementCustomerId}
                  onChange={(e) =>
                    setComplementCustomerId(String(e.target.value))
                  }
                  disabled={creatingComplement}
                >
                  <MenuItem value="">Seleccionar</MenuItem>
                  {filters?.customers?.map((customer) => (
                    <MenuItem
                      key={String(customer.id)}
                      value={String(customer.id)}
                    >
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Folio Microsip (opcional)"
                value={complementFolioMicrosip}
                onChange={(e) => setComplementFolioMicrosip(e.target.value)}
                disabled={creatingComplement}
                fullWidth
              />
            </Stack>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Facturas abiertas del cliente
              </Typography>
              {loadingComplementInvoices ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell />
                        <TableCell>Factura</TableCell>
                        <TableCell>Referencia</TableCell>
                        <TableCell align="right">Saldo</TableCell>
                        <TableCell align="right">Aplicar</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {complementInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            Sin facturas abiertas para el cliente seleccionado
                          </TableCell>
                        </TableRow>
                      ) : (
                        complementInvoices.map((invoice) => (
                          <TableRow key={`comp-invoice-${invoice.id}`}>
                            <TableCell>
                              <Checkbox
                                checked={Boolean(invoice.selected)}
                                onChange={(e) =>
                                  toggleComplementInvoice(
                                    invoice.id,
                                    e.target.checked
                                  )
                                }
                                disabled={creatingComplement}
                              />
                            </TableCell>
                            <TableCell>{invoice.id}</TableCell>
                            <TableCell>
                              {invoice?.order_id
                                ? `M-${invoice.order_id}`
                                : invoice?.quote_id
                                ? `P-${invoice.quote_id}`
                                : "-"}
                            </TableCell>
                            <TableCell align="right">
                              {invoice.balance_due ?? "-"}
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 140 }}>
                              <TextField
                                variant="standard"
                                value={invoice.applyAmount}
                                onChange={(e) =>
                                  updateComplementInvoiceAmount(
                                    invoice.id,
                                    e.target.value.replace(/[^0-9.]/g, "")
                                  )
                                }
                                disabled={
                                  !invoice.selected || creatingComplement
                                }
                                placeholder="0.00"
                                inputProps={{ style: { textAlign: "right" } }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Métodos de pago del complemento
              </Typography>
              <Stack spacing={1.5}>
                {complementPaymentMethods.map((method, idx) => (
                  <Stack
                    key={`method-${idx}`}
                    direction={{ xs: "column", md: "row" }}
                    spacing={1}
                    alignItems={{ xs: "stretch", md: "center" }}
                  >
                    <TextField
                      label="Método"
                      select
                      value={method.metodo_pago}
                      onChange={(e) =>
                        updateComplementPaymentMethod(
                          idx,
                          "metodo_pago",
                          e.target.value
                        )
                      }
                      disabled={creatingComplement}
                      sx={{ minWidth: 180 }}
                    >
                      {COMPLEMENT_PAYMENT_METHODS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Monto"
                      value={method.monto}
                      onChange={(e) =>
                        updateComplementPaymentMethod(
                          idx,
                          "monto",
                          e.target.value.replace(/[^0-9.]/g, "")
                        )
                      }
                      disabled={creatingComplement}
                    />
                    <TextField
                      label="Fecha pago"
                      type="datetime-local"
                      value={method.fecha_pago}
                      onChange={(e) =>
                        updateComplementPaymentMethod(
                          idx,
                          "fecha_pago",
                          e.target.value
                        )
                      }
                      disabled={creatingComplement}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="Moneda"
                      value={method.currency}
                      onChange={(e) =>
                        updateComplementPaymentMethod(
                          idx,
                          "currency",
                          e.target.value.toUpperCase()
                        )
                      }
                      disabled={creatingComplement}
                      sx={{ maxWidth: 100 }}
                    />
                    <TextField
                      label="Proveedor"
                      value={method.provider}
                      onChange={(e) =>
                        updateComplementPaymentMethod(
                          idx,
                          "provider",
                          e.target.value
                        )
                      }
                      disabled={creatingComplement}
                    />
                    <TextField
                      label="Referencia"
                      value={method.referencia}
                      onChange={(e) =>
                        updateComplementPaymentMethod(
                          idx,
                          "referencia",
                          e.target.value
                        )
                      }
                      disabled={creatingComplement}
                    />
                    <Button
                      color="error"
                      onClick={() => removeComplementPaymentMethod(idx)}
                      disabled={creatingComplement}
                    >
                      Quitar
                    </Button>
                  </Stack>
                ))}
                <Box>
                  <Button
                    variant="outlined"
                    onClick={addComplementPaymentMethod}
                    disabled={creatingComplement}
                  >
                    Agregar método
                  </Button>
                </Box>
              </Stack>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Total aplicado a facturas: {selectedInvoicesTotal.toFixed(2)} •
                Total métodos: {selectedMethodsTotal.toFixed(2)}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeCreateComplementDialog}
            disabled={creatingComplement}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateComplement}
            disabled={creatingComplement || loadingComplementInvoices}
          >
            {creatingComplement ? "Generando..." : "Generar complemento"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VentasPage;
