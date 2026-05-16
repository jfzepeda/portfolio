"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PedidosTable from "~/components/mayoreo/ordersTable.jsx";
import QuoteSummaryModal from "~/components/modal/modal-ventas.jsx";

const noop = () => {};

const ClientOrdersDialog = ({
  open,
  onClose,
  selectedClient,
  loading,
  error,
  orders,
  handleOpenSuite = noop,
}) => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    if (!open) {
      setShowQuoteModal(false);
      setModalData(null);
    }
  }, [open]);

  const parseArrayField = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const handleRowClick = (quote) => {
    setModalData({
      ...quote,
      services: parseArrayField(quote?.services),
      items: parseArrayField(quote?.items),
      start: quote?.start ?? quote?.start_at ?? quote?.created_at,
    });
    setShowQuoteModal(true);
  };

  const handleCloseQuoteModal = () => {
    setShowQuoteModal(false);
    setModalData(null);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: "95vw",
            maxWidth: "95vw",
            height: "92vh",
            maxHeight: "92vh",
          },
        }}
      >
        <DialogTitle sx={{ pr: 6 }}>
          Órdenes de{" "}
          {selectedClient?.cliente ||
            selectedClient?.customer_id ||
            selectedClient?.dist_id ||
            ""}
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 240,
              }}
            >
              <CircularProgress size={28} />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <PedidosTable
              quotes={orders}
              handleRowClick={handleRowClick}
              handleOpenSuite={handleOpenSuite}
              handleArchive={noop}
              handleRecover={noop}
            />
          )}
        </DialogContent>
      </Dialog>
      {showQuoteModal && modalData && (
        <QuoteSummaryModal
          data={modalData}
          onClose={handleCloseQuoteModal}
          zIndex={2000}
        />
      )}
    </>
  );
};

export default ClientOrdersDialog;
