"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
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
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";
import { uploadFileToBackblaze } from "~/lib/backblazeUpload";
import {
  facturarOrder,
  fetchInvoice,
  fetchOrderInvoices,
  fetchInvoicePayments,
} from "~/lib/invoiceApi.js";
import { formatFolioMicrosip } from "~/utils/formaters.js";
import { updateStatus } from "~/lib/ordersApi.js";
import { PAYMENT_METHODS } from "~/utils/global";

const PRICE_SCHEMES = [
  { value: "DIST_CTDO", label: "Distribuidor contado" },
  { value: "DIST_CRED", label: "Distribuidor crédito" },
];

const PRICE_SCHEME_ALIASES = {
  "DISTRIBUIDOR CONTADO": "DIST_CTDO",
  DIST_CTDO: "DIST_CTDO",
  "DISTRIBUIDOR CREDITO": "DIST_CRED",
  "DISTRIBUIDOR CRÉDITO": "DIST_CRED",
  DIST_CRED: "DIST_CRED",
};

const toNumber = (value) => {
  const parsed = Number.parseFloat(String(value ?? "").replace(/,/g, "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

const calcOrderTotal = (quote) => {
  if (!quote) return "";
  const services = Array.isArray(quote.services) ? quote.services : [];
  const items = Array.isArray(quote.items) ? quote.items : [];

  const servicesTotal = services.reduce(
    (acc, service) =>
      acc +
      toNumber(service.price) *
        toNumber(service.units || 1) *
        (1 - toNumber(service.descuento) / 100),
    0
  );

  const itemsTotal = items.reduce(
    (acc, item) =>
      acc +
      toNumber(item.price) *
        toNumber(item.units || 1) *
        (1 - toNumber(item.descuento) / 100),
    0
  );

  const total = servicesTotal + itemsTotal;
  return total > 0 ? total.toFixed(2) : "";
};

const getOrderId = (cotId, quote) => quote?.id || cotId;
const emptyPayment = () => ({ metodo: "", monto: "" });

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

const getPaymentMethodLabel = (value) => {
  const raw = String(value || "")
    .trim()
    .toLowerCase();
  const found = PAYMENT_METHODS.find((method) => method.value === raw);
  if (found) return found.label;
  if (raw === "por_definir") return "Por definir";
  return raw || "-";
};

const getInvoiceStatusMeta = (status) => {
  const normalized = String(status || "pendiente")
    .trim()
    .toLowerCase();

  if (normalized === "paid" || normalized === "pagado") {
    return { label: "Pagada", color: "success" };
  }
  if (normalized === "partial" || normalized === "parcial") {
    return { label: "Parcial", color: "warning" };
  }
  if (normalized === "cancelled" || normalized === "cancelada") {
    return { label: "Cancelada", color: "error" };
  }
  return { label: "Pendiente", color: "default" };
};

const extractCustomerId = (sourceInvoice, quote) => {
  const candidates = [
    sourceInvoice?.customer_id,
    sourceInvoice?.customer?.id,
    quote?.customer_id,
    quote?.customer?.id,
    quote?.dist?.customer_id,
    quote?.cliente?.id,
    quote?.clienteId,
  ];

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null || candidate === "") {
      continue;
    }
    const parsed = Number(candidate);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    if (String(candidate).trim()) return String(candidate).trim();
  }

  return null;
};

const normalizeScheme = (value) => {
  const key = String(value || "")
    .trim()
    .toUpperCase();
  return PRICE_SCHEME_ALIASES[key] || "DIST_CTDO";
};

const normalizePaymentMethod = (value) => {
  const raw = String(value || "")
    .trim()
    .toLowerCase();
  if (raw === "por definir") return "por_definir";
  return PAYMENT_METHODS.some((m) => m.value === raw) ? raw : "";
};

const parseMetodoPago = (rawValue) => {
  let parsed = rawValue;
  if (typeof rawValue === "string") {
    try {
      parsed = JSON.parse(rawValue);
    } catch {
      return [emptyPayment()];
    }
  }

  if (!parsed) return [emptyPayment()];

  if (Array.isArray(parsed)) {
    const rows = parsed
      .slice(0, 3)
      .map((it) => ({
        metodo: normalizePaymentMethod(it?.metodo || it?.method),
        monto:
          it?.monto !== undefined && it?.monto !== null ? String(it.monto) : "",
      }))
      .filter((it) => it.metodo || it.monto);
    return rows.length ? rows : [emptyPayment()];
  }

  if (typeof parsed === "object") {
    const entries = Object.entries(parsed);
    const rows = entries
      .slice(0, 3)
      .map(([metodo, monto]) => ({
        metodo: normalizePaymentMethod(metodo),
        monto: monto !== undefined && monto !== null ? String(monto) : "",
      }))
      .filter((it) => it.metodo || it.monto);
    return rows.length ? rows : [emptyPayment()];
  }

  return [emptyPayment()];
};

const arePaymentRowsEqual = (left = [], right = []) => {
  if (left.length !== right.length) return false;
  for (let idx = 0; idx < left.length; idx += 1) {
    const a = left[idx] || {};
    const b = right[idx] || {};
    if (String(a.metodo || "") !== String(b.metodo || "")) return false;
    if (String(a.monto || "") !== String(b.monto || "")) return false;
  }
  return true;
};

const normalizeItemStatus = (value) =>
  String(value || "pendiente")
    .trim()
    .toLowerCase();

const parseItemsCollection = (rawValue) => {
  if (!rawValue) return [];
  if (Array.isArray(rawValue)) return rawValue;
  if (typeof rawValue === "string") {
    try {
      const parsed = JSON.parse(rawValue);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const getItemUniqueKey = (item, index = 0) => {
  const candidates = [
    item?.id,
    item?.item_id,
    item?.inventory_id,
    item?.article_id,
  ];
  const stable = candidates.find(
    (candidate) =>
      candidate !== undefined && candidate !== null && candidate !== ""
  );
  if (stable !== undefined) return `item-${stable}`;
  return `item-${String(
    item?.article || item?.articulo || "sin-articulo"
  )}-${index}`;
};

const calcItemsSubtotal = (items = []) =>
  (Array.isArray(items) ? items : []).reduce(
    (acc, item) =>
      acc +
      toNumber(item?.price) *
        toNumber(item?.units || 1) *
        (1 - toNumber(item?.descuento) / 100),
    0
  );

const normalizeInvoicesCollection = (data) => {
  if (Array.isArray(data)) return data.filter(Boolean);
  if (Array.isArray(data?.invoices)) return data.invoices.filter(Boolean);
  if (Array.isArray(data?.data)) return data.data.filter(Boolean);
  if (data && typeof data === "object" && data?.invoice) {
    return [data.invoice].filter(Boolean);
  }
  if (data && typeof data === "object") return [data];
  return [];
};

const cleanInvoiceItem = (item) => {
  const next = { ...item };
  delete next.__itemKey;
  delete next.__itemStatus;
  return next;
};

export default function InvoicePage({ cotId, quote }) {
  const orderId = getOrderId(cotId, quote);
  const [invoiceData, setInvoiceData] = useState(null);
  const [orderInvoices, setOrderInvoices] = useState([]);
  const [creatingNewInvoice, setCreatingNewInvoice] = useState(true);
  const [selectedInvoiceItemKeys, setSelectedInvoiceItemKeys] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const quoteItems = useMemo(
    () => (Array.isArray(quote?.items) ? quote.items : []),
    [quote?.items]
  );
  const quoteItemsWithMeta = useMemo(
    () =>
      quoteItems.map((item, index) => ({
        ...item,
        __itemKey: getItemUniqueKey(item, index),
        __itemStatus: normalizeItemStatus(item?.status),
      })),
    [quoteItems]
  );
  const confirmedItems = useMemo(
    () =>
      quoteItemsWithMeta.filter((item) => item.__itemStatus === "confirmado"),
    [quoteItemsWithMeta]
  );
  const invoicedItemKeysFromInvoices = useMemo(() => {
    const keys = new Set();
    (Array.isArray(orderInvoices) ? orderInvoices : []).forEach((invoice) => {
      parseItemsCollection(invoice?.items).forEach((item, index) => {
        keys.add(getItemUniqueKey(item, index));
      });
    });
    return keys;
  }, [orderInvoices]);
  const invoiceableItems = useMemo(
    () =>
      confirmedItems.filter(
        (item) => !invoicedItemKeysFromInvoices.has(item.__itemKey)
      ),
    [confirmedItems, invoicedItemKeysFromInvoices]
  );
  const selectedInvoiceItems = useMemo(() => {
    const selectedSet = new Set(selectedInvoiceItemKeys);
    return invoiceableItems.filter((item) => selectedSet.has(item.__itemKey));
  }, [invoiceableItems, selectedInvoiceItemKeys]);
  const selectedInvoiceItemIds = useMemo(
    () =>
      selectedInvoiceItems
        .map((item) => item?.id || item?.item_id || item?.inventory_id)
        .filter(
          (candidate) =>
            candidate !== undefined && candidate !== null && candidate !== ""
        ),
    [selectedInvoiceItems]
  );
  const fallbackTotal = useMemo(() => calcOrderTotal(quote), [quote]);
  const selectedItemsSubtotal = useMemo(
    () => calcItemsSubtotal(selectedInvoiceItems),
    [selectedInvoiceItems]
  );
  const baseContadoTotal = useMemo(
    () =>
      creatingNewInvoice
        ? selectedItemsSubtotal
        : toNumber(
            quote?.total ??
              invoiceData?.importe_total ??
              quote?.importe_total ??
              (fallbackTotal ? Number(fallbackTotal) : 0)
          ),
    [
      creatingNewInvoice,
      selectedItemsSubtotal,
      quote?.total,
      invoiceData?.importe_total,
      quote?.importe_total,
      fallbackTotal,
    ]
  );
  const [esquemaPrecio, setEsquemaPrecio] = useState("");
  const [metodosPago, setMetodosPago] = useState([emptyPayment()]);
  const [folioVentaMicrosip, setFolioVentaMicrosip] = useState("");
  const [urlPdfFactura, setUrlPdfFactura] = useState("");
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const sourceInvoice = useMemo(
    () => (creatingNewInvoice ? quote || null : invoiceData || quote || null),
    [creatingNewInvoice, invoiceData, quote]
  );
  const customerId = useMemo(
    () => extractCustomerId(sourceInvoice, quote),
    [sourceInvoice, quote]
  );
  const customerLinkStatus = useMemo(() => {
    const hasKnownField = [
      sourceInvoice?.customer_id,
      sourceInvoice?.customer?.id,
      quote?.customer_id,
      quote?.customer?.id,
      quote?.dist?.customer_id,
    ].some((candidate) => candidate !== undefined);

    if (customerId) return "linked";
    return hasKnownField ? "missing" : "unknown";
  }, [
    customerId,
    sourceInvoice?.customer_id,
    sourceInvoice?.customer?.id,
    quote?.customer_id,
    quote?.customer?.id,
    quote?.dist?.customer_id,
  ]);
  const isMissingCustomerLink = customerLinkStatus === "missing";
  const isCustomerLinkUnknown = customerLinkStatus === "unknown";
  const invoiceId = useMemo(() => {
    if (creatingNewInvoice) return null;
    const rawId = invoiceData?.id;
    const parsed = Number(rawId);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    return null;
  }, [creatingNewInvoice, invoiceData?.id]);
  const hasExistingInvoiceData = useMemo(() => {
    const hasEsquema = Boolean(
      String(sourceInvoice?.esquema_precio || "").trim()
    );
    const hasFolio = Boolean(
      String(sourceInvoice?.folio_venta_microsip || "").trim()
    );
    const hasUrl = Boolean(String(sourceInvoice?.url_pdf_factura || "").trim());
    const hasImporte = toNumber(sourceInvoice?.importe_total) > 0;
    const parsedPayments = parseMetodoPago(
      sourceInvoice?.metodo_pago || sourceInvoice?.payment_method || null
    );
    const hasMetodoPago = parsedPayments.some(
      (it) => it.metodo && toNumber(it.monto) > 0
    );
    return hasEsquema || hasFolio || hasUrl || hasImporte || hasMetodoPago;
  }, [
    sourceInvoice?.esquema_precio,
    sourceInvoice?.folio_venta_microsip,
    sourceInvoice?.importe_total,
    sourceInvoice?.metodo_pago,
    sourceInvoice?.payment_method,
    sourceInvoice?.url_pdf_factura,
  ]);
  const shouldShowInvoiceDetail = !creatingNewInvoice && hasExistingInvoiceData;
  const paymentDetailRows = useMemo(
    () =>
      metodosPago
        .map((row) => ({
          metodo: getPaymentMethodLabel(row?.metodo),
          monto: toNumber(row?.monto),
        }))
        .filter(
          (row) =>
            row.metodo && (row.monto > 0 || esquemaPrecio === "DIST_CRED")
        ),
    [metodosPago, esquemaPrecio]
  );
  const invoiceStatusMeta = useMemo(
    () => getInvoiceStatusMeta(sourceInvoice?.status),
    [sourceInvoice?.status]
  );

  const importeTotal = useMemo(() => {
    if (!baseContadoTotal || baseContadoTotal <= 0) return "";
    if (esquemaPrecio === "DIST_CRED") {
      return ((baseContadoTotal / 1.12) * 1.165).toFixed(2);
    }
    return baseContadoTotal.toFixed(2);
  }, [baseContadoTotal, esquemaPrecio]);

  useEffect(() => {
    if (esquemaPrecio !== "DIST_CRED" || hasExistingInvoiceData) return;
    setMetodosPago((prev) => {
      const next = [{ metodo: "por_definir", monto: "" }];
      return arePaymentRowsEqual(prev, next) ? prev : next;
    });
  }, [esquemaPrecio, hasExistingInvoiceData]);

  const loadOrderInvoices = useCallback(async () => {
    if (!orderId) {
      setOrderInvoices([]);
      setInvoiceData(null);
      setCreatingNewInvoice(true);
      return;
    }

    const rows = await fetchOrderInvoices(orderId, { showOverlay: false });
    if (rows.length) {
      setOrderInvoices(rows);
      setInvoiceData((prev) => {
        if (prev?.id) {
          const current = rows.find(
            (row) => Number(row?.id) === Number(prev?.id)
          );
          if (current) return current;
        }
        return rows[0];
      });
      setCreatingNewInvoice(false);
      return;
    }

    const fallback = await fetchInvoice(orderId, { showOverlay: false });
    const normalizedFallback = normalizeInvoicesCollection(fallback);
    setOrderInvoices(normalizedFallback);
    setInvoiceData(normalizedFallback[0] || null);
    setCreatingNewInvoice(normalizedFallback.length === 0);
  }, [orderId]);

  useEffect(() => {
    loadOrderInvoices();
  }, [loadOrderInvoices]);

  useEffect(() => {
    if (!creatingNewInvoice) return;
    const availableKeys = invoiceableItems.map((item) => item.__itemKey);
    setSelectedInvoiceItemKeys((prev) => {
      const next = prev.filter((key) => availableKeys.includes(key));
      if (next.length) return next;
      return availableKeys;
    });
  }, [creatingNewInvoice, invoiceableItems]);

  useEffect(() => {
    if (creatingNewInvoice) {
      const nextEsquema = normalizeScheme(quote?.client_type);
      setEsquemaPrecio((prev) => (prev === nextEsquema ? prev : nextEsquema));
      setMetodosPago((prev) =>
        arePaymentRowsEqual(prev, [emptyPayment()]) ? prev : [emptyPayment()]
      );
      setFolioVentaMicrosip("");
      setUrlPdfFactura("");
      return;
    }

    const esquema =
      sourceInvoice?.esquema_precio ||
      sourceInvoice?.price_scheme ||
      sourceInvoice?.client_type;
    const nextEsquema = normalizeScheme(esquema);
    const nextMetodos = parseMetodoPago(
      sourceInvoice?.metodo_pago || sourceInvoice?.payment_method || null
    );
    const nextFolio = sourceInvoice?.folio_venta_microsip || "";
    const nextPdfUrl = sourceInvoice?.url_pdf_factura || "";

    setEsquemaPrecio((prev) => (prev === nextEsquema ? prev : nextEsquema));
    setMetodosPago((prev) =>
      arePaymentRowsEqual(prev, nextMetodos) ? prev : nextMetodos
    );
    setFolioVentaMicrosip((prev) => (prev === nextFolio ? prev : nextFolio));
    setUrlPdfFactura((prev) => (prev === nextPdfUrl ? prev : nextPdfUrl));
  }, [
    sourceInvoice?.client_type,
    sourceInvoice?.esquema_precio,
    sourceInvoice?.folio_venta_microsip,
    sourceInvoice?.id,
    sourceInvoice?.metodo_pago,
    sourceInvoice?.payment_method,
    sourceInvoice?.price_scheme,
    sourceInvoice?.url_pdf_factura,
    creatingNewInvoice,
    quote?.client_type,
  ]);

  useEffect(() => {
    let isMounted = true;
    if (!invoiceId) {
      setPayments([]);
      setLoadingPayments(false);
      return;
    }

    setLoadingPayments(true);
    (async () => {
      const rows = await fetchInvoicePayments(invoiceId, {
        showOverlay: false,
      });
      if (!isMounted) return;
      setPayments(Array.isArray(rows) ? rows : []);
      setLoadingPayments(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [invoiceId]);

  const handleMetodoPagoChange = (idx, key, value) => {
    setMetodosPago((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it))
    );
  };

  const addMetodoPago = () => {
    setMetodosPago((prev) =>
      prev.length >= 3 ? prev : [...prev, emptyPayment()]
    );
  };

  const removeMetodoPago = (idx) => {
    setMetodosPago((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length ? next : [emptyPayment()];
    });
  };

  const toggleInvoiceItemSelection = (itemKey) => {
    setSelectedInvoiceItemKeys((prev) =>
      prev.includes(itemKey)
        ? prev.filter((key) => key !== itemKey)
        : [...prev, itemKey]
    );
  };

  const selectAllInvoiceItems = () => {
    setSelectedInvoiceItemKeys(invoiceableItems.map((item) => item.__itemKey));
  };

  const clearInvoiceItemSelection = () => {
    setSelectedInvoiceItemKeys([]);
  };

  const selectInvoiceForDetail = (invoice) => {
    setInvoiceData(invoice || null);
    setCreatingNewInvoice(false);
  };

  const startNewInvoice = () => {
    setCreatingNewInvoice(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!creatingNewInvoice) {
      window.showToast(
        "Esta factura ya está registrada. Crea una nueva para facturación parcial.",
        "error"
      );
      return;
    }

    if (!invoiceableItems.length) {
      window.showToast(
        "No hay ítems confirmados disponibles para facturar",
        "error"
      );
      return;
    }

    if (!selectedInvoiceItems.length) {
      window.showToast(
        "Selecciona al menos un ítem confirmado para facturar",
        "error"
      );
      return;
    }

    if (isMissingCustomerLink) {
      window.showToast(
        "El distribuidor no tiene customer_id vinculado para CxC",
        "error"
      );
      return;
    }

    const monto = toNumber(importeTotal);
    const validPayments =
      esquemaPrecio === "DIST_CRED"
        ? [{ metodo: "por_definir", monto: 0 }]
        : metodosPago
            .map((it) => ({
              metodo: normalizePaymentMethod(it.metodo),
              monto: toNumber(it.monto),
            }))
            .filter((it) => it.metodo && it.monto > 0);
    const pagosTotal = validPayments.reduce((acc, it) => acc + it.monto, 0);

    if (!orderId) {
      window.showToast("Falta id de pedido", "error");
      return;
    }
    if (!esquemaPrecio.trim()) {
      window.showToast("Esquema de precio obligatorio", "error");
      return;
    }
    if (!Number.isFinite(monto) || monto <= 0) {
      window.showToast("Importe total inválido", "error");
      return;
    }
    if (!folioVentaMicrosip.trim()) {
      window.showToast("Folio de venta Microsip obligatorio", "error");
      return;
    }
    if (esquemaPrecio !== "DIST_CRED") {
      if (!validPayments.length) {
        window.showToast(
          "Agrega al menos un método de pago con monto",
          "error"
        );
        return;
      }
      if (Math.abs(pagosTotal - monto) > 0.01) {
        window.showToast(
          "La suma de métodos de pago debe coincidir con el importe total",
          "error"
        );
        return;
      }
    }

    const itemsPayload = selectedInvoiceItems.map(cleanInvoiceItem);
    const nextInvoicedKeys = new Set(invoicedItemKeysFromInvoices);
    selectedInvoiceItems.forEach((item) => {
      nextInvoicedKeys.add(item.__itemKey);
    });
    const totalOrderItems = quoteItemsWithMeta.length;
    const shouldSetPartInvoiced =
      totalOrderItems > 0 &&
      nextInvoicedKeys.size > 0 &&
      nextInvoicedKeys.size < totalOrderItems;

    setSubmitting(true);
    try {
      const response = await facturarOrder({
        id: orderId,
        esquema_precio: esquemaPrecio.trim(),
        metodo_pago: validPayments,
        importe_total: importeTotal,
        folio_venta_microsip: folioVentaMicrosip.trim(),
        url_pdf_factura: urlPdfFactura.trim() || null,
        items: itemsPayload,
        item_ids: selectedInvoiceItemIds,
      });
      if (response.ok) {
        await loadOrderInvoices();
        setCreatingNewInvoice(false);
        if (shouldSetPartInvoiced) {
          await updateStatus({ order_id: orderId, newType: "part-invoiced" });
        }
        window.showToast("Facturación guardada correctamente");
        return;
      }

      if (
        response?.status === 409 &&
        !/customer_id/i.test(String(response?.error || ""))
      ) {
        window.showToast(
          "No se puede facturar: el distribuidor no tiene customer_id de CxC vinculado",
          "error"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const buildInvoiceFileName = (file) => {
    const timestamp = Date.now();
    const extension = (file?.name?.split(".").pop() || "pdf").toLowerCase();
    return `invoice-${orderId || "sin-pedido"}_${timestamp}.${extension}`;
  };

  const uploadInvoicePdf = async (file) => {
    if (!file) return;
    setUploadingPdf(true);
    try {
      const uniqueFileName = buildInvoiceFileName(file);
      const { publicUrl: pdfUrl } = await uploadFileToBackblaze({
        file,
        fileName: uniqueFileName,
        bucketName: "facturas-yssm",
        uploadEndpoint: "/facturas",
      });
      setUrlPdfFactura(pdfUrl);
      window.showToast("PDF subido correctamente");
    } catch (error) {
      console.error("Error al subir PDF de factura:", error);
      window.showToast(
        `Error al subir el PDF: ${error?.message || "Error desconocido"}`,
        "error"
      );
      setUrlPdfFactura("");
    } finally {
      setUploadingPdf(false);
    }
  };

  const handlePdfFileChange = async (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    if (file.type !== "application/pdf") {
      window.showToast("Solo se permite subir archivos PDF", "error");
      setUrlPdfFactura("");
      return;
    }

    await uploadInvoicePdf(file);
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

  const sectionCardSx = {
    p: { xs: 1.5, md: 2 },
    borderRadius: 2.5,
    border: "none",
    boxShadow: "0 1px 2px rgba(16,24,40,0.06)",
    backgroundColor: "background.paper",
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: { xs: 1.5, md: 2 },
        backgroundColor: "background.default",
      }}
    >
      <Toolbar />
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          md: "minmax(0, 3fr) minmax(0, 1fr)",
        }}
        gap={2}
      >
        <CardContent sx={{ p: 0 }}>
          {orderInvoices.length ? (
            <Paper variant="outlined" sx={{ ...sectionCardSx, mb: 2 }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.25}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
              >
                <Typography variant="subtitle2">
                  Facturas registradas para este pedido
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {orderInvoices.map((invoice, idx) => {
                    const selected =
                      !creatingNewInvoice &&
                      String(invoiceData?.id ?? "") ===
                        String(invoice?.id ?? "");
                    return (
                      <Chip
                        key={`invoice-chip-${invoice?.id || idx}`}
                        label={`Factura ${invoice?.id || "N/D"}`}
                        size="small"
                        clickable
                        color={selected ? "primary" : "default"}
                        variant={selected ? "filled" : "outlined"}
                        onClick={() => selectInvoiceForDetail(invoice)}
                      />
                    );
                  })}
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={startNewInvoice}
                    disabled={submitting || uploadingPdf}
                  >
                    Nueva factura
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ) : null}

          {shouldShowInvoiceDetail ? (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              Esta factura ya tiene datos registrados. Mostramos vista detalle.
            </Alert>
          ) : null}
          {isMissingCustomerLink ? (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              Este distribuidor no tiene customer_id vinculado para CxC. Debes
              vincularlo antes de facturar.
            </Alert>
          ) : isCustomerLinkUnknown && shouldShowInvoiceDetail ? (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              No se pudo validar customer_id de CxC desde este pedido. Al
              guardar se validará en backend y puede responder 409.
            </Alert>
          ) : null}

          {shouldShowInvoiceDetail ? (
            <Paper
              variant="outlined"
              sx={{ ...sectionCardSx, p: { xs: 2, md: 3 }, mb: 1 }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                spacing={1}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle1">
                  Detalle de factura registrada
                </Typography>
                <Chip
                  label={`Saldo ${formatCurrency(
                    sourceInvoice?.balance_due ?? 0,
                    sourceInvoice?.currency || "MXN"
                  )}`}
                  size="small"
                  color={
                    toNumber(sourceInvoice?.balance_due) > 0
                      ? "warning"
                      : "success"
                  }
                  variant="outlined"
                />
              </Stack>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Resumen
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: "none",
                    boxShadow: "none",
                    backgroundColor: "background.default",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Esquema de precio
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {PRICE_SCHEMES.find((opt) => opt.value === esquemaPrecio)
                      ?.label ||
                      esquemaPrecio ||
                      "-"}
                  </Typography>
                </Paper>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: "none",
                    boxShadow: "none",
                    backgroundColor: "background.default",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Importe total
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatCurrency(
                      importeTotal,
                      sourceInvoice?.currency || "MXN"
                    )}
                  </Typography>
                </Paper>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: "none",
                    boxShadow: "none",
                    backgroundColor: "background.default",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Folio venta Microsip
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {folioVentaMicrosip || "-"}
                  </Typography>
                </Paper>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: "none",
                    boxShadow: "none",
                    backgroundColor: "background.default",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Descargar PDF de factura
                  </Typography>
                  {urlPdfFactura ? (
                    <IconButton
                      href={urlPdfFactura}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="primary"
                    >
                      <SimCardDownloadIcon />
                    </IconButton>
                  ) : (
                    <Typography variant="body1">Sin archivo</Typography>
                  )}
                </Paper>
              </Box>

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Métodos de pago
              </Typography>
              {paymentDetailRows.length ? (
                <Stack spacing={1}>
                  {paymentDetailRows.map((row, idx) => (
                    <Box
                      key={`payment-detail-${idx}`}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1.25,
                        px: 1.5,
                        borderRadius: 1.5,
                        backgroundColor: "background.default",
                      }}
                    >
                      <Typography variant="body2">{row.metodo}</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {row.monto > 0
                          ? formatCurrency(
                              row.monto,
                              sourceInvoice?.currency || "MXN"
                            )
                          : "Por definir"}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sin métodos de pago registrados.
                </Typography>
              )}
            </Paper>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  alignItems: "start",
                }}
              >
                <Box>
                  <Paper variant="outlined" sx={{ ...sectionCardSx }}>
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="h6">
                          Datos de facturación
                          <Chip
                            label={invoiceStatusMeta.label}
                            size="small"
                            color={invoiceStatusMeta.color}
                            variant="filled"
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                        <Chip
                          label={`${orderInvoices.length} factura${
                            orderInvoices.length === 1 ? "" : "s"
                          }`}
                          color="primary"
                          variant="contained"
                          size="small"
                        />
                      </Box>

                      <Divider />
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          boxShadow: "none",
                          backgroundColor: "background.default",
                        }}
                      >
                        <Stack spacing={1}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", sm: "center" }}
                          >
                            <Typography variant="subtitle2">
                              Ítems confirmados para esta factura
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={selectAllInvoiceItems}
                                disabled={!invoiceableItems.length}
                              >
                                Todos
                              </Button>
                              <Button
                                size="small"
                                variant="text"
                                onClick={clearInvoiceItemSelection}
                                disabled={!selectedInvoiceItemKeys.length}
                              >
                                Limpiar
                              </Button>
                            </Stack>
                          </Stack>

                          {confirmedItems.length === 0 ? (
                            <Alert severity="warning">
                              No hay ítems con estatus <b>confirmed</b> para
                              facturar.
                            </Alert>
                          ) : invoiceableItems.length === 0 ? (
                            <Alert severity="info">
                              Todos los ítems confirmados ya tienen factura.
                              Crea nuevos confirmados para generar otra factura.
                            </Alert>
                          ) : (
                            <>
                              <TableContainer
                                component={Paper}
                                variant="outlined"
                                sx={{
                                  borderRadius: 1.5,
                                  border: "none",
                                  boxShadow: "none",
                                  backgroundColor: "background.default",
                                }}
                              >
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell padding="checkbox" />
                                      <TableCell>Artículo</TableCell>
                                      <TableCell align="right">Pzas</TableCell>
                                      <TableCell align="right">
                                        Precio
                                      </TableCell>
                                      <TableCell align="right">
                                        Subtotal
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {invoiceableItems.map((item) => (
                                      <TableRow key={item.__itemKey} hover>
                                        <TableCell padding="checkbox">
                                          <Checkbox
                                            checked={selectedInvoiceItemKeys.includes(
                                              item.__itemKey
                                            )}
                                            onChange={() =>
                                              toggleInvoiceItemSelection(
                                                item.__itemKey
                                              )
                                            }
                                          />
                                        </TableCell>
                                        <TableCell>
                                          {item?.article ||
                                            item?.articulo ||
                                            "-"}
                                        </TableCell>
                                        <TableCell align="right">
                                          {item?.units || 1}
                                        </TableCell>
                                        <TableCell align="right">
                                          {formatCurrency(
                                            item?.price,
                                            sourceInvoice?.currency || "MXN"
                                          )}
                                        </TableCell>
                                        <TableCell align="right">
                                          {formatCurrency(
                                            toNumber(item?.price) *
                                              toNumber(item?.units || 1) *
                                              (1 -
                                                toNumber(item?.descuento) /
                                                  100),
                                            sourceInvoice?.currency || "MXN"
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Seleccionados: {selectedInvoiceItems.length} /{" "}
                                {invoiceableItems.length} • Total:{" "}
                                {formatCurrency(
                                  selectedItemsSubtotal,
                                  sourceInvoice?.currency || "MXN"
                                )}
                              </Typography>
                            </>
                          )}
                        </Stack>
                      </Paper>
                      <Box
                        display="grid"
                        gap={2}
                        gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
                      >
                        <Box display="flex" flexDirection="column" gap={2}>
                          <TextField
                            label="Esquema de precio"
                            select
                            value={esquemaPrecio}
                            onChange={(e) => setEsquemaPrecio(e.target.value)}
                            required
                            fullWidth
                          >
                            {PRICE_SCHEMES.map((opt) => (
                              <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </MenuItem>
                            ))}
                          </TextField>

                          <TextField
                            label="Importe total"
                            value={importeTotal}
                            InputProps={{ readOnly: true }}
                            required
                            fullWidth
                          />

                          <TextField
                            label="Folio venta Microsip"
                            value={folioVentaMicrosip}
                            onChange={(e) =>
                              setFolioVentaMicrosip(
                                formatFolioMicrosip(e.target.value)
                              )
                            }
                            required
                            fullWidth
                          />

                          <Button
                            variant="outlined"
                            color={urlPdfFactura ? "success" : "contrast"}
                            component="label"
                            disabled={uploadingPdf}
                          >
                            {urlPdfFactura ? (
                              <>
                                PDF listo
                                <CheckCircleIcon sx={{ mx: 1 }} />
                                (Click para subir nuevo)
                              </>
                            ) : uploadingPdf ? (
                              "Subiendo PDF..."
                            ) : (
                              "Subir PDF de factura"
                            )}
                            <input
                              type="file"
                              accept="application/pdf"
                              hidden
                              onChange={handlePdfFileChange}
                            />
                          </Button>
                        </Box>
                        {esquemaPrecio === "DIST_CTDO" && (
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 2.5,
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Métodos de pago (máximo 3)
                              </Typography>
                              <Stack spacing={1.5}>
                                {metodosPago.map((row, idx) => (
                                  <Stack
                                    key={`metodo-${idx}`}
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={1}
                                    alignItems={{
                                      xs: "stretch",
                                      sm: "center",
                                    }}
                                  >
                                    <TextField
                                      label={`Método ${idx + 1}`}
                                      size="small"
                                      select
                                      value={row.metodo}
                                      onChange={(e) =>
                                        handleMetodoPagoChange(
                                          idx,
                                          "metodo",
                                          e.target.value
                                        )
                                      }
                                      fullWidth
                                    >
                                      {PAYMENT_METHODS.map((opt) => (
                                        <MenuItem
                                          key={opt.value}
                                          value={opt.value}
                                        >
                                          {opt.label}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                    <TextField
                                      label={`Monto ${idx + 1}`}
                                      size="small"
                                      value={row.monto}
                                      onChange={(e) =>
                                        handleMetodoPagoChange(
                                          idx,
                                          "monto",
                                          e.target.value?.replace(/[^0-9]/g, "")
                                        )
                                      }
                                      fullWidth
                                    />
                                    <IconButton
                                      color="error"
                                      disabled={metodosPago.length <= 1}
                                      onClick={() => removeMetodoPago(idx)}
                                    >
                                      <DeleteOutlineIcon />
                                    </IconButton>
                                  </Stack>
                                ))}
                                <Box>
                                  <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={addMetodoPago}
                                    disabled={metodosPago.length >= 3}
                                  >
                                    Agregar método
                                  </Button>
                                </Box>
                              </Stack>
                            </Box>
                          </Paper>
                        )}
                      </Box>
                    </Stack>
                  </Paper>
                  <Button
                    type="submit"
                    variant="contained"
                    color="success"
                    sx={{ mt: 2, minWidth: 220, borderRadius: 999 }}
                    disabled={
                      submitting ||
                      uploadingPdf ||
                      isMissingCustomerLink ||
                      !invoiceableItems.length ||
                      !selectedInvoiceItems.length
                    }
                  >
                    {submitting ? "Guardando..." : "Guardar facturación"}
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>

        {invoiceId ? (
          <CardContent sx={{ p: 0 }}>
            <Paper
              variant="outlined"
              sx={{
                ...sectionCardSx,
                position: { lg: "sticky" },
                top: { lg: 88 },
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Pagos registrados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Estatus: {String(sourceInvoice?.status || "pendiente")} • Saldo:{" "}
                {formatCurrency(
                  sourceInvoice?.balance_due ?? 0,
                  sourceInvoice?.currency || "MXN"
                )}
              </Typography>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  borderRadius: 1.5,
                  border: "none",
                  boxShadow: "none",
                  backgroundColor: "background.default",
                }}
              >
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
                              payment?.currency || sourceInvoice?.currency
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
            </Paper>
          </CardContent>
        ) : null}
      </Box>
    </Box>
  );
}
