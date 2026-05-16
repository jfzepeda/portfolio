// src/components/OrderClientActions.jsx
"use client";
import React from "react";
import { Box, Button } from "@mui/material";
import { downloadPDF } from "~/app/(clientes)/clientes/inventario/[id]/[doctype]/Cotizacion/clientsPDF.js";
import CreateEventDialog from "~/components/CreateEvent.jsx";
import SimCardDownloadIcon from "@mui/icons-material/SimCardDownload";
import CachedIcon from "@mui/icons-material/Cached";
import { verifyAvailability } from "~/lib/ordersApi.js";
import "~/styles/ModalStyles.css";

const OrderClientActions = ({ quote, items, refreshItems }) => {
  const [eventOpen, setEventOpen] = React.useState(false);

  const handleCloseEvent = () => setEventOpen(false);

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
        <Button
          variant="contained"
          size="medium"
          color="contrast"
          sx={{ ml: 2 }}
          onClick={() => {
            downloadPDF({
              ...quote,
              items: items,
              sumarTotales: true,
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
      </Box>
      <CreateEventDialog
        open={eventOpen}
        handleClose={handleCloseEvent}
        initialData={initialData}
        onQuoteSaved={onQuoteSaved}
      />
    </div>
  );
};

export default OrderClientActions;
