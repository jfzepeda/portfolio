"use client";
import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Snackbar, Alert } from "@mui/material";

// Componente reutilizable
const CustomSnackBar = forwardRef((props, ref) => {
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useImperativeHandle(ref, () => ({
    show(message, severity = "info") {
      setSnack({ open: true, message, severity });
    },
  }));

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnack((prev) => ({ ...prev, open: false }));
  };

  return (
    <Snackbar
      open={snack.open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={handleClose}
        severity={snack.severity}
        sx={{ width: "100%" }}
      >
        {snack.message}
      </Alert>
    </Snackbar>
  );
});

CustomSnackBar.displayName = "CustomSnackBar";

export default CustomSnackBar;
