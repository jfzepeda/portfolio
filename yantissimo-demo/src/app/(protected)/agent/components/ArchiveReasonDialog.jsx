"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from "@mui/material";

const ArchiveReasonDialog = ({ open, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      window.showToast("La razón de archivo es obligatoria", "error");
      return;
    }
    onConfirm(reason.trim());
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Archivar</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Escribe la razón por la cual deseas archivar esta conversación. Esto
            nos ayudará a mejorar nuestro servicio.
          </Typography>

          <TextField
            label="Razón de archivo"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            fullWidth
            multiline
            minRows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleConfirm}>
          Archivar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ArchiveReasonDialog;
