"use client";
import React from "react";
import Chip from "@mui/material/Chip";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import { keyframes } from "@mui/system";

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

export const NewBadge = () => {
  return (
    <Chip
      icon={<AutoFixHighIcon />}
      label="NUEVO (BETA)"
      sx={{
        backgroundColor: "info.light",
        color: "info.dark",
        borderRadius: "16px",
        fontWeight: "bold",
        height: "32px",
        px: 1.2,
        ml: 2,
      }}
    />
  );
};

export const TestBadge = () => {
  return (
    <Chip
      icon={<AutoFixHighIcon />}
      label="TEST (BETA)"
      sx={{
        backgroundColor: "success.light",
        color: "success.main",
        borderRadius: "16px",
        fontWeight: "bold",
        height: "32px",
        px: 1.2,
        ml: 2,
      }}
    />
  );
};

export const ModBadge = () => {
  return (
    <Chip
      icon={<AutoFixHighIcon />}
      label="MODIFICADO (BETA)"
      sx={{
        backgroundColor: "var(--app-primary-soft)",
        color: "var(--app-calendar-header)",
        borderRadius: "16px",
        fontWeight: "bold",
        height: "32px",
        px: 1.2,
        ml: 2,
      }}
    />
  );
};

export const ErrorBadge = () => {
  return (
    <Chip
      icon={<ReportGmailerrorredIcon />}
      label="¡ERROR! Tabla de inventario Auto y Camión FALTANTE favor de subirla"
      sx={{
        backgroundColor: "error.light",
        color: "error.dark",
        borderRadius: "16px",
        fontWeight: "bold",
        height: "48px",
        px: 1.2,
        ml: 2,
        animation: `${pulse} 1.5s ease-in-out infinite`,
      }}
    />
  );
};
