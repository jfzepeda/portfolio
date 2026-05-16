// ToastProvider.jsx
"use client";
import React, { useState, useCallback, useEffect } from "react";
import Toast from "./toast";

let externalShowToast; // variable fuera para exponer global

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = useCallback((message, severity = "success") => {
    setToast({ open: true, message, severity });
  }, []);

  useEffect(() => {
    // asigna la función al objeto global window
    externalShowToast = showToast;
    window.showToast = showToast; // ahora disponible como window.showToast()
  }, [showToast]);

  // const closeToast = () => setToast((t) => ({ ...t, open: false }));

  return (
    <>
      {children}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        // onClose={closeToast}
      />
    </>
  );
}

// También puedes exportarla para imports opcionales
export function getShowToast() {
  return externalShowToast;
}
