"use client";
import React from "react";
import { Box, Checkbox, Typography } from "@mui/material";
import Icon from "@mdi/react";
import {
  mdiEngine, // Check engine
  mdiOil, // Presión de aceite
  mdiBatteryAlert, // Batería / sistema eléctrico
  mdiCarBrakeAlert, // Freno / freno de mano
  mdiCarBrakeAbs, // ABS
  mdiCoolantTemperature, // Temperatura del motor
  mdiCarTractionControl, // Control de tracción
  mdiAirbag, // Airbag / SRS
  mdiCarTireAlert,
} from "@mdi/js";

const INDICATORS = [
  // revisión (requiere atención)
  {
    name: "engine",
    label: "Motor",
    icon: mdiEngine,
    level: "revision",
    color: "#FF9800",
  },
  {
    name: "abs",
    label: "ABS",
    icon: mdiCarBrakeAbs,
    level: "revision",
    color: "#FF9800",
  },
  {
    name: "traction",
    label: "Tracción",
    icon: mdiCarTractionControl,
    level: "revision",
    color: "#FF9800",
  },
  {
    name: "tire",
    label: "Neumáticos",
    icon: mdiCarTireAlert,
    level: "revision",
    color: "#FF9800",
  },

  // crítico (detener / riesgo)
  {
    name: "oil",
    label: "Aceite",
    icon: mdiOil,
    level: "critico",
    color: "#D32F2F",
  },
  {
    name: "battery",
    label: "Batería",
    icon: mdiBatteryAlert,
    level: "critico",
    color: "#D32F2F",
  },
  {
    name: "brake",
    label: "Freno",
    icon: mdiCarBrakeAlert,
    level: "critico",
    color: "#D32F2F",
  },
  {
    name: "coolant",
    label: "Temperatura",
    icon: mdiCoolantTemperature,
    level: "critico",
    color: "#D32F2F",
  },
  {
    name: "airbag",
    label: "Airbag",
    icon: mdiAirbag,
    level: "critico",
    color: "#D32F2F",
  },
];

// values: { [name]: boolean }
// onChange: (name: string, value: boolean) => void
const TestigosTablero = ({ values = {}, onChange }) => {
  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Testigos en tablero
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
        }}
      >
        {INDICATORS.map((item) => {
          const selected = values?.[item.name] ?? false;
          return (
            <Box
              key={item.name}
              sx={{
                display: "grid",
                alignItems: "center",
                gridTemplateColumns: "32px 1fr 32px",
                columnGap: 1,
                px: 2,
                py: 1,
              }}
            >
              <Icon path={item.icon} color={item.color} size={"1.5em"} />
              <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                {item.label}
              </Typography>
              <Checkbox
                checked={selected}
                onChange={(e) => onChange?.(item.name, e.target.checked)}
                size="medium"
                sx={{ p: 0, justifySelf: "end" }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default TestigosTablero;
