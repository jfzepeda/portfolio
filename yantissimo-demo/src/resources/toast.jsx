"use client";
import React, { useState, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";

export default function Toast({ open, message, severity }) {
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  useEffect(() => {
    setToast({ open, message, severity });
  }, [open, message, severity]);

  return (
    <Snackbar
      open={toast.open}
      autoHideDuration={3000}
      onClose={() => setToast((t) => ({ ...t, open: false }))}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        severity={toast.severity}
        sx={{ width: "100%" }}
      >
        {toast.message}
      </Alert>
    </Snackbar>
  );
}
