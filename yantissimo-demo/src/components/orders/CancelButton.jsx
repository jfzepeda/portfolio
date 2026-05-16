"use client";
import React, { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { putJson } from "~/lib/api";

const CancelButton = ({ quoteId, canCancel, onCanceled }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!canCancel) return null;

  const handleSubmit = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      await putJson(`/api/orders/${quoteId}/cancel`, {});
      onCanceled?.();
      setOpen(false);
    } catch (err) {
      if (err?.status === 400 || err?.status === 409) {
        setErrorMsg(err?.message || "Pedido final — no se puede cancelar");
      } else {
        setErrorMsg(err?.message || "No se pudo cancelar el pedido.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        size="small"
        onClick={() => setOpen(true)}
      >
        Cancelar pedido
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Cancelar pedido</DialogTitle>
        <DialogContent>
          {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}
          <Typography sx={{ mt: 2 }}>
            ¿Confirmas que deseas cancelar este pedido?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Cerrar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSubmit}
            disabled={loading}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CancelButton;
