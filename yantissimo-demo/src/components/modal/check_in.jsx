"use client";
import React, { useState } from "react";
import {
  Button,
  Modal,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { put } from "~/lib/api";
import TestigosTablero from "./TestigosTablero";

const CheckIn = ({ open, onClose, id, check_in }) => {
  const defaultTestigos = {
    engine: false,
    oil: false,
    battery: false,
    brake: false,
    abs: false,
    coolant: false,
    fuel: false,
    seatbelt: false,
    traction: false,
    airbag: false,
  };

  const [checks, setChecks] = useState({
    clienteEspera: false,
    cortaCorriente: false,
    retiroUsado: false,
    autorizaProbar: false,
    antirrobo: false,
    testigosTab: false,
    testigos: defaultTestigos,
    mileage_km: "",
    plate: "",
    ...(check_in || {}),
    testigos: { ...defaultTestigos, ...(check_in?.testigos || {}) },
  });

  async function saveCheckIn(id, data) {
    /// MFM - Cotejar con el backend
    try {
      const response = await put("/api/events/check_in", {
        id,
        mileage_km: data.mileage_km,
        plate: data.plate,
        check_in: data,
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      window.showToast("Checkin guardado correctamente");
    } catch (error) {
      console.error("Error saving data to checkin:", error);
    }
    window.location.reload(); // MFM usar el estado de eventos
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "fit-content",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          pt: 2,
        }}
      >
        <h2>Revisión</h2>
        {/* Datos del vehículo */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Kilometraje"
            value={checks.mileage_km ?? ""}
            onChange={(e) =>
              setChecks({ ...checks, mileage_km: e.target.value })
            }
            size="small"
          />
          <TextField
            label="Placa"
            value={checks.plate ?? ""}
            onChange={(e) => setChecks({ ...checks, plate: e.target.value })}
            size="small"
          />
        </Box>
        <FormGroup sx={{ display: "flex", flexDirection: "row" }}>
          <Box sx={{ display: "flex", flexDirection: "column", mb: 2, mr: 8 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={checks.clienteEspera}
                  onChange={(e) =>
                    setChecks({ ...checks, clienteEspera: e.target.checked })
                  }
                />
              }
              label="Cliente en espera"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={checks.cortaCorriente}
                  onChange={(e) =>
                    setChecks({ ...checks, cortaCorriente: e.target.checked })
                  }
                />
              }
              label="Corta corriente"
            />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={checks.retiroUsado}
                  onChange={(e) =>
                    setChecks({ ...checks, retiroUsado: e.target.checked })
                  }
                />
              }
              label="Retiro de usado"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={checks.autorizaProbar}
                  onChange={(e) =>
                    setChecks({ ...checks, autorizaProbar: e.target.checked })
                  }
                />
              }
              label="Autoriza a probar"
            />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={checks.antirrobo}
                  onChange={(e) =>
                    setChecks({ ...checks, antirrobo: e.target.checked })
                  }
                />
              }
              label="Antirrobo"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={checks.testigosTab}
                  onChange={(e) =>
                    setChecks({ ...checks, testigosTab: e.target.checked })
                  }
                />
              }
              label="Testigos en Tablero"
            />
          </Box>
        </FormGroup>
        {/* doble columna */}

        {checks.testigosTab && (
          <TestigosTablero
            values={checks.testigos}
            onChange={(name, value) =>
              setChecks((prev) => ({
                ...prev,
                testigos: { ...prev.testigos, [name]: value },
              }))
            }
          />
        )}
        <Box
          sx={{ display: "flex", flexDirection: "row", justifyContent: "end" }}
        >
          <Button
            variant="contained"
            sx={{ m: 2, mb: -1, mr: -1 }}
            onClick={() => {
              saveCheckIn(id, checks);
            }}
          >
            Guardar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CheckIn;
