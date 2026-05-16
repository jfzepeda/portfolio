// src/components/OrderMyrActions.jsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { downloadPDF } from "~/resources/ordersPDF.js";
import CreateEventDialog from "~/components/CreateEvent.jsx";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";
import CachedIcon from "@mui/icons-material/Cached";
import { verifyAvailability, confirmOrder } from "~/lib/ordersApi.js";
import "~/styles/ModalStyles.css";

const normalizeStatus = (value) =>
  String(value || "pendiente")
    .trim()
    .toLowerCase();

const getItemKey = (item, index) => {
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

const cleanItem = (item) => {
  const next = { ...item };
  delete next.__rowKey;
  delete next.__status;
  return next;
};

const OrderMyrActions = ({
  quote,
  items,
  setItems,
  setOrder,
  sumarTotales,
  setSumarTotales,
  // profile,
}) => {
  const [eventOpen, setEventOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const handleCloseEvent = () => setEventOpen(false);

  const onQuoteSaved = () => {
    setEventOpen(false);
  };
  const router = useRouter();
  const normalizedItems = useMemo(
    () =>
      (Array.isArray(items) ? items : []).map((item, index) => ({
        ...item,
        __rowKey: getItemKey(item, index),
        __status: normalizeStatus(item?.status),
      })),
    [items]
  );
  console.debug("Normalized items:", normalizedItems);
  const hasItems = normalizedItems.length > 0;
  const hasPendingConfirmation = normalizedItems.some(
    (item) => item.__status !== "confirmado" && item.__status !== "facturado"
  );
  const hasItemsForInvoicing = normalizedItems.some((item) =>
    ["confirmado", "facturado"].includes(item.__status)
  );

  useEffect(() => {
    if (!confirmOpen) return;
    const defaultSelection = normalizedItems
      .filter((item) => item.__status !== "facturado")
      .map((item) => item.__rowKey);
    setSelectedKeys(defaultSelection);
  }, [confirmOpen, normalizedItems]);

  const toggleSelection = (key) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((it) => it !== key) : [...prev, key]
    );
  };

  const handleConfirmSelectedItems = async () => {
    if (!quote?.id) {
      window.showToast("No se encontró el id del pedido", "error");
      return;
    }

    const selectedSet = new Set(selectedKeys);
    const selectedItems = normalizedItems.filter((item) =>
      selectedSet.has(item.__rowKey)
    );
    if (!selectedItems.length) {
      window.showToast("Selecciona al menos un ítem para confirmar", "error");
      return;
    }

    const updatedItems = normalizedItems.map((item) => {
      const next = cleanItem(item);
      if (selectedSet.has(item.__rowKey)) {
        next.status = "confirmado";
      }
      return next;
    });
    const allItemsConfirmed = updatedItems.every((item) =>
      ["confirmado", "facturado"].includes(normalizeStatus(item?.status))
    );

    setConfirming(true);
    const response = await confirmOrder(quote.id, {
      items: updatedItems,
      confirmed_items: selectedItems.map(cleanItem),
      confirmed_item_ids: selectedItems
        .map((item) => item?.id || item?.item_id || item?.inventory_id)
        .filter(
          (candidate) =>
            candidate !== undefined && candidate !== null && candidate !== ""
        ),
      all_items_confirmed: allItemsConfirmed,
      target_type: allItemsConfirmed
        ? "confirmado"
        : String(quote?.type || "sentorder"),
    });
    setConfirming(false);

    if (!response?.ok) return;

    if (typeof setItems === "function") {
      setItems(updatedItems);
    }
    if (typeof setOrder === "function") {
      setOrder((prev) => ({
        ...prev,
        items: updatedItems,
        type: allItemsConfirmed
          ? "confirmado"
          : String(prev?.type || quote?.type || "sentorder"),
      }));
    }
    setConfirmOpen(false);
    router.push(`/myr/pedidos/${quote.id}/invoiced`);
  };

  const initialData = {
    title: `Seguimiento cotización ${quote?.folio ?? quote?.id ?? ""}`,
    description: `Dar seguimiento a la cotización.\nCliente: ${
      quote?.cliente?.nombre ?? quote?.customerName ?? "N/D"
    }\nFolio: ${quote?.folio ?? quote?.id ?? "N/D"}`,
    relatedId: quote?.id ?? quote?._id ?? null,
    customerId: quote?.cliente?.id ?? quote?.clienteId ?? null,
    start: new Date(),
  };

  return (
    <div
      className="modal-buttons"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 16,
        marginTop: 8,
      }}
    >
      <Box sx={{ alignItems: "flex-end" }}>
        <FormControlLabel
          control={
            <Switch
              checked={sumarTotales}
              onChange={(e) => setSumarTotales(e.target.checked)}
              color="primary"
            />
          }
          label={"Sumar totales"}
          labelPlacement="start"
        />
        {hasItems && hasPendingConfirmation && (
          <Button
            variant="contained"
            size="medium"
            color="success"
            sx={{ ml: 2 }}
            onClick={() => setConfirmOpen(true)}
          >
            Confirmar
          </Button>
        )}
        {(hasItemsForInvoicing ||
          ["confirmado", "part-invoiced", "facturado"].includes(
            String(quote?.type || "")
          )) && (
          <Button
            variant="contained"
            size="medium"
            color="bleus"
            sx={{ ml: 2 }}
            onClick={() => router.push(`/myr/pedidos/${quote.id}/invoiced`)}
          >
            Facturar
          </Button>
        )}
        <Button
          variant="contained"
          size="medium"
          color="contrast"
          sx={{ ml: 2 }}
          onClick={() => {
            downloadPDF({
              ...quote,
              items: items,
              sumarTotales,
            });
          }}
        >
          <SimCardDownloadIcon />
        </Button>
        <Button
          variant="contained"
          size="medium"
          color="primary"
          sx={{ ml: 2 }}
          onClick={() => {
            verifyAvailability({ quote_id: quote.id });
          }}
        >
          <CachedIcon />
        </Button>
      </Box>
      <CreateEventDialog
        open={eventOpen}
        handleClose={handleCloseEvent}
        initialData={initialData}
        onQuoteSaved={onQuoteSaved}
      />
      <Dialog
        open={confirmOpen}
        onClose={() => !confirming && setConfirmOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Confirmar ítems del pedido</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Solo los ítems seleccionados se marcarán con estatus{" "}
            <b>confirmed</b>. La orden llega a <b>confirmed</b> solo si todos
            los ítems quedan confirmados.
          </Typography>
          <Divider sx={{ mb: 1.5 }} />
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                setSelectedKeys(
                  normalizedItems
                    .filter((item) => item.__status !== "confirmado")
                    .map((item) => item.__rowKey)
                )
              }
              disabled={confirming}
            >
              Seleccionar todos
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={() => setSelectedKeys([])}
              disabled={confirming}
            >
              Limpiar selección
            </Button>
          </Stack>
          <List dense disablePadding>
            {normalizedItems.map((item) => {
              const isInvoiced = item.__status === "facturado";
              const isConfirmed = item.__status === "confirmado";
              const checked =
                selectedKeys.includes(item.__rowKey) ||
                item.__status === "confirmado";
              const label =
                item?.article ||
                item?.articulo ||
                `Ítem ${item?.id || item?.inventory_id || ""}`;
              return (
                <ListItem
                  key={item.__rowKey}
                  divider
                  secondaryAction={
                    <Chip
                      size="small"
                      label={item.__status}
                      color={
                        item.__status === "confirmado"
                          ? "success"
                          : item.__status === "facturado"
                          ? "default"
                          : "warning"
                      }
                      variant="outlined"
                    />
                  }
                >
                  <FormControlLabel
                    sx={{ m: 0, width: "100%" }}
                    control={
                      <Checkbox
                        checked={checked}
                        disabled={isInvoiced || isConfirmed || confirming}
                        onChange={() => toggleSelection(item.__rowKey)}
                      />
                    }
                    label={
                      <ListItemText
                        primary={label}
                        secondary={`Pzas: ${item?.units || 1}`}
                      />
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={confirming}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmSelectedItems}
            disabled={confirming}
          >
            {confirming ? "Confirmando..." : "Confirmar selección"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OrderMyrActions;
