// src/components/QuoteActions.jsx
"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { downloadPDF } from "~/resources/quotePDF.js";
import CreateEventDialog from "~/components/CreateEvent.jsx";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";
import CachedIcon from "@mui/icons-material/Cached";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { verifyAvailability } from "~/lib/quoteApi.js";
import { createCart } from "~/lib/yaolApi";

import "~/styles/ModalStyles.css";

const QuoteActions = ({
  quote,
  items,
  sumarTotales,
  setSumarTotales,
  clubYantissimo,
  setClubYantissimo,
  refreshItems,
}) => {
  const [eventOpen, setEventOpen] = useState(false);
  const [cartLinksOpen, setCartLinksOpen] = useState(false);
  const [cartLinks, setCartLinks] = useState({
    paymentUrl: "",
    selfServiceUrl: "",
  });
  const handleCloseEvent = () => setEventOpen(false);
  const handleCloseCartLinks = () => setCartLinksOpen(false);

  const onQuoteSaved = () => {
    setEventOpen(false);
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

  const handleCreateCart = async () => {
    try {
      const cart = await createCart({ quote_id: quote.id });

      // Copiar al portapapeles el enlace del carrito
      const paymentUrl = cart?.checkoutUrl;
      const id = cart?.id;
      const selfServiceUrl = `https://yantissimo.com/agendar?cart=${encodeURIComponent(
        id
      )}&agendar=1&quoteid=${quote.id}`;
      if (!paymentUrl) {
        window.showToast("No se pudo generar el enlace del carrito", "error");
        return;
      }
      if (!id) {
        window.showToast(
          "No se pudo generar el enlace de autogestión",
          "error"
        );
        return;
      }

      setCartLinks({
        paymentUrl,
        selfServiceUrl,
      });
      setCartLinksOpen(true);
    } catch (err) {
      console.error("createCart failed:", err);
      window.showToast("Error al crear el carrito", "error");
    }
  };

  const copyToClipboard = async (text) => {
    if (!text) return false;

    // Modern API (requires HTTPS/localhost + permissions)
    try {
      if (navigator?.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      // fall through to legacy fallback
      console.warn("clipboard.writeText failed:", err);
    }

    // Legacy fallback
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-1000px";
      textarea.style.left = "-1000px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch (err) {
      console.warn("execCommand('copy') failed:", err);
      return false;
    }
  };

  const handleCopyCartUrl = async (type) => {
    const isPayment = type === "payment";
    const url = isPayment ? cartLinks.paymentUrl : cartLinks.selfServiceUrl;
    const label = isPayment ? "solo pago" : "agendar y pago";

    const copied = await copyToClipboard(url);
    if (copied) {
      window.showToast(`Enlace "${label}" copiado al portapapeles`);
      return;
    }

    window.showToast(`No se pudo copiar "${label}", cópialo manualmente`);
    window.prompt(`Copia el enlace "${label}":`, url);
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
              checked={clubYantissimo}
              onChange={(e) => setClubYantissimo(e.target.checked)}
              color="primary"
            />
          }
          label={"Club Yantissimo"}
          labelPlacement="start"
        />
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
          onClick={async () => {
            const result = await verifyAvailability({ quote_id: quote.id });
            if (result?.ok && typeof refreshItems === "function") {
              await refreshItems();
            }
          }}
        >
          <CachedIcon />
        </Button>
        <Button
          variant="contained"
          size="medium"
          color="primary"
          sx={{ ml: 2 }}
          onClick={handleCreateCart}
        >
          <ShoppingCartIcon />
        </Button>
      </Box>
      <CreateEventDialog
        open={eventOpen}
        handleClose={handleCloseEvent}
        initialData={initialData}
        onQuoteSaved={onQuoteSaved}
      />
      <Dialog open={cartLinksOpen} onClose={handleCloseCartLinks}>
        <DialogTitle>Enlaces del carrito</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Elige qué enlace quieres copiar:
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleCopyCartUrl("payment")}
          >
            solo pago
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleCopyCartUrl("selfService")}
          >
            agendar y pago
          </Button>
          <Button onClick={handleCloseCartLinks}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default QuoteActions;
