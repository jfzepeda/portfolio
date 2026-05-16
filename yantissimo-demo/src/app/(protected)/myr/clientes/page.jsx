"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  Box,
  Typography,
  Popover,
  Button,
  CircularProgress,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
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
} from "@mui/material";
import { HeroUIProvider } from "@heroui/react";

import {
  fetchFilters,
  fetchTable,
  exportTable,
  fetchOrdersFromClient,
  fetchOpenInvoicesByCustomer,
  createPaymentComplement,
  createPaymentComplementApply,
} from "./clientesApi";
import {
  MX_TZ,
  parseHeroSelection,
  HERO_ALL_KEY,
  buildPeriodOptions,
  buildQueryParams,
  createInitialFilters,
  getPeriodRange,
} from "./constants";
import DashboardHeader from "./components/DashboardHeader.jsx";
import FiltersToolbar from "./components/FiltersToolbar.jsx";
import FiltersPopoverContent from "./components/FiltersPopoverContent.jsx";
import ClientsTable from "./components/ClientsTable.jsx";
import ClientOrdersDialog from "./components/ClientOrdersDialog.jsx";

dayjs.extend(utc);
dayjs.extend(timezone);

const INITIAL_CATALOGS = {
  periods: [],
  sucursales: [],
  lineas: [],
  client_types: [],
  classifications: [],
  pay_conditions: [],
  credit_status: [],
  sellers: [],
};

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

const emptyComplementMethod = () => ({
  metodo_pago: "transferencia",
  monto: "",
  fecha_pago: nowLocalDateTime(),
  currency: "MXN",
  provider: "",
  referencia: "",
});

const ClientesPage = () => {
  const todayMx = useMemo(() => dayjs().tz(MX_TZ), []);
  const [filters, setFilters] = useState(() => createInitialFilters(todayMx));
  const [catalogs, setCatalogs] = useState(INITIAL_CATALOGS);
  const [rows, setRows] = useState([]);
  const [range, setRange] = useState({ from: filters.from, to: filters.to });
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const [filtersAnchorEl, setFiltersAnchorEl] = useState(null);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientOrders, setClientOrders] = useState([]);
  const [loadingClientOrders, setLoadingClientOrders] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
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

  const periodOptions = useMemo(
    () => buildPeriodOptions(catalogs.periods),
    [catalogs.periods]
  );
  const complementClientOptions = useMemo(() => {
    const byCustomerId = new Map();
    rows.forEach((row) => {
      const rawId = row?.customer_id;
      if (rawId === undefined || rawId === null || rawId === "") return;
      const key = String(rawId);
      if (byCustomerId.has(key)) return;
      byCustomerId.set(key, {
        id: key,
        name:
          row?.cliente ||
          row?.customer_name ||
          row?.dist_id ||
          `Cliente ${String(rawId)}`,
      });
    });

    return [...byCustomerId.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [rows]);
  const isFiltersMenuOpen = Boolean(filtersAnchorEl);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await fetchFilters();
        if (!active) return;

        setCatalogs(data);

        if (!data?.periods?.length) return;

        const selectedPeriod = data.periods[0];
        const nextRange = getPeriodRange(selectedPeriod);

        setFilters((prev) => ({
          ...prev,
          period: selectedPeriod,
          from: nextRange.from,
          to: nextRange.to,
        }));
        setRange(nextRange);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los filtros.");
      } finally {
        if (active) setLoadingFilters(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loadingFilters) return;

    let active = true;
    setLoadingTable(true);
    setError(null);

    (async () => {
      try {
        const query = buildQueryParams(filters);
        const data = await fetchTable(query);
        if (!active) return;

        setRows(data?.rows || []);
        setRange({
          from: data?.fromDate || query.from,
          to: data?.toDate || query.to,
        });
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Error al cargar la tabla.");
      } finally {
        if (active) setLoadingTable(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [filters, loadingFilters]);

  const handleFilterChange = (key) => (event) => {
    setFilters((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleHeroFilterChange = (key) => (selection) => {
    const selectedKey = parseHeroSelection(selection);
    const value = selectedKey === HERO_ALL_KEY ? "" : selectedKey;
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePeriodChange = (event) => {
    const period = event.target.value;
    const nextRange = getPeriodRange(period);
    if (!nextRange.from || !nextRange.to) return;

    setFilters((prev) => ({ ...prev, period, ...nextRange }));
    setRange(nextRange);
  };

  const openFiltersMenu = (event) => {
    setFiltersAnchorEl(event.currentTarget);
  };

  const closeFiltersMenu = () => {
    setFiltersAnchorEl(null);
  };

  const handleRefresh = () => {
    setFilters((prev) => ({ ...prev }));
  };

  const router = useRouter();
  const handleOpenSuite = (quoteData) => {
    router.push(`/myr/pedidos/${quoteData.id}/sentorder`);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = buildQueryParams(filters);
      const { blob, headers } = await exportTable(params);
      const dispo = headers.get("content-disposition") || "";
      const match = dispo.match(/filename="?([^";]+)"?/i);
      const filename =
        match?.[1] ||
        `clientes-${params.from || range.from}-a-${params.to || range.to}.xlsx`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      window.showToast?.("Archivo exportado");
    } catch (err) {
      console.error(err);
      window.showToast?.(err?.message || "Error al exportar", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleShowDetail = async (row) => {
    setSelectedClient(row);
    setOrdersModalOpen(true);
    setOrdersError(null);
    setLoadingClientOrders(true);

    try {
      const orders = await fetchOrdersFromClient({
        company: row?.dist_id,
        type: "invoiced",
      });
      setClientOrders(Array.isArray(orders) ? orders : []);
    } catch (err) {
      setClientOrders([]);
      setOrdersError(err?.message || "No se pudieron cargar las órdenes.");
    } finally {
      setLoadingClientOrders(false);
    }
  };

  const handleCloseOrdersModal = () => {
    setOrdersModalOpen(false);
    setSelectedClient(null);
    setClientOrders([]);
    setOrdersError(null);
  };

  const openCreateComplementDialog = () => {
    const selectedFromRow =
      selectedClient?.customer_id !== undefined &&
      selectedClient?.customer_id !== null &&
      selectedClient?.customer_id !== ""
        ? String(selectedClient.customer_id)
        : "";
    const fallback = complementClientOptions[0]?.id || "";

    setComplementCustomerId(selectedFromRow || fallback);
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
        const invoices = await fetchOpenInvoicesByCustomer(complementCustomerId);
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
        window.showToast?.(
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

      const paidAt = method.fecha_pago ? new Date(method.fecha_pago) : new Date();

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
      window.showToast?.("Selecciona un cliente", "error");
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
      window.showToast?.(
        "Selecciona al menos una factura y captura monto aplicado",
        "error"
      );
      return;
    }

    const overApplied = selectedInvoices.find(
      (invoice) =>
        invoice.balance_due > 0 && invoice.imp_pagado - invoice.balance_due > 0.01
    );
    if (overApplied) {
      window.showToast?.(
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
      window.showToast?.(
        "Agrega al menos un método de pago con monto",
        "error"
      );
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
      window.showToast?.(
        "La suma de métodos debe coincidir con el total aplicado",
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
        throw new Error("No se pudo obtener el id del complemento");
      }

      const payments = buildComplementApplyPayments(validMethods, selectedInvoices);
      await createPaymentComplementApply(complementId, { payments });

      window.showToast?.("Complemento de pago generado");
      setOpenComplementDialog(false);
      handleRefresh();
    } catch (err) {
      window.showToast?.(
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

  return (
    <HeroUIProvider>
      <Box sx={{ pt: 3, pb: 4 }}>
        <DashboardHeader
          range={range}
          onRefresh={handleRefresh}
          onExport={handleExport}
          onOpenComplement={openCreateComplementDialog}
          loadingFilters={loadingFilters}
          loadingTable={loadingTable}
          exporting={exporting}
          creatingComplement={creatingComplement}
        />

        <FiltersToolbar
          period={filters.period}
          search={filters.search}
          periodOptions={periodOptions}
          onPeriodChange={handlePeriodChange}
          onSearchChange={handleFilterChange("search")}
          isFiltersMenuOpen={isFiltersMenuOpen}
          onOpenFilters={openFiltersMenu}
        />

        <Popover
          open={isFiltersMenuOpen}
          anchorEl={filtersAnchorEl}
          onClose={closeFiltersMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <FiltersPopoverContent
            filters={filters}
            catalogs={catalogs}
            onHeroFilterChange={handleHeroFilterChange}
          />
        </Popover>

        {error && (
          <Typography color="error" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}

        <ClientsTable
          rows={rows}
          loading={loadingTable}
          onRowClick={handleShowDetail}
        />

        <ClientOrdersDialog
          open={ordersModalOpen}
          onClose={handleCloseOrdersModal}
          selectedClient={selectedClient}
          loading={loadingClientOrders}
          error={ordersError}
          orders={clientOrders}
          handleOpenSuite={handleOpenSuite}
        />

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
                    {complementClientOptions.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name}
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
                            <TableRow key={`rep-invoice-${invoice.id}`}>
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
                                  disabled={!invoice.selected || creatingComplement}
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
                      key={`rep-method-${idx}`}
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
    </HeroUIProvider>
  );
};

export default ClientesPage;
