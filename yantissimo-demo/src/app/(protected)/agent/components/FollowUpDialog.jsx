"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { FOLLOWUP_TEMPERATURES } from "../utils/stageConfig";

const FollowUpDialog = ({ open, onClose, onConfirm }) => {
  const [followupDate, setFollowupDate] = useState("");
  const [followupTemperature, setFollowupTemperature] = useState("");
  const [followupReason, setFollowupReason] = useState("");

  const handleConfirm = () => {
    if (!followupDate) {
      window.showToast("La fecha de seguimiento es obligatoria", "error");
      return;
    }
    if (!followupTemperature) {
      window.showToast("La temperatura del lead es obligatoria", "error");
      return;
    }

    onConfirm({
      followup_date: new Date(followupDate).toISOString(),
      followup_temperature: followupTemperature,
      followup_reason: followupReason || "Seguimiento programado desde el CRM",
    });

    // Reset form
    setFollowupDate("");
    setFollowupTemperature("");
    setFollowupReason("");
  };

  const handleClose = () => {
    setFollowupDate("");
    setFollowupTemperature("");
    setFollowupReason("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Programar Seguimiento</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Define la fecha y clasificacion del seguimiento para este lead.
          </Typography>

          <TextField
            label="Fecha de seguimiento"
            type="date"
            value={followupDate}
            onChange={(e) => setFollowupDate(e.target.value)}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            inputProps={{
              min: new Date().toISOString().split("T")[0],
            }}
          />

          <TextField
            select
            label="Clasificacion del lead"
            value={followupTemperature}
            onChange={(e) => setFollowupTemperature(e.target.value)}
            required
            fullWidth
          >
            {FOLLOWUP_TEMPERATURES.map((temp) => (
              <MenuItem key={temp.key} value={temp.key}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: temp.color,
                    }}
                  />
                  {temp.label}
                </Box>
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Motivo del seguimiento (opcional)"
            value={followupReason}
            onChange={(e) => setFollowupReason(e.target.value)}
            required
            fullWidth
          ></TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleConfirm}>
          Programar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FollowUpDialog;
