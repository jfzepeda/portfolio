"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
} from "@mui/material";
import { getUserProfile, ROLES } from "~/utils/session";
import dayjs from "dayjs";
import { SUCS } from "~/utils/global";
import api from "~/lib/api";
const sucursales = SUCS;

// URL global del backend

// Constantes dinamicas para sucursal y vendedor
const userProfile = getUserProfile();
const curSuc = userProfile ? userProfile.sucursal : null;
const curRole = userProfile ? userProfile.role : null;

const AssignSeller = ({ open, handleClose, initialData, onQuoteSaved }) => {
  // Estado interno del formulario
  const [missingFields, setMissingFields] = useState(false);
  const [sellers, setSellers] = useState(null);
  // Estado inicial en AssignSeller
  const [quoteData, setQuoteData] = useState({
    channel: "",
    ramp: "",
    technician: "",
    seller: "",
    client_name: "",
    additional_notes: "",
    client_type: "",
    phone: "",
    car_model: "",
    year: "",
    mileage: "",
    sucursal: "",
  });

  // Dentro del useEffect para editar:
  useEffect(() => {
    if (open) {
      if (initialData) {
        setQuoteData({
          channel: initialData.channel || "",
          ramp: initialData.ramp || "",
          technician: initialData.technician || "",
          seller: initialData.seller || "",
          client_name: initialData.client_name || "",
          additional_notes: initialData.additional_notes || "",
          client_type: initialData.client_type || "",
          phone: initialData.phone || "",
          car_model: initialData.car_model || "",
          year: initialData.year || "",
          mileage: initialData.mileage || "",
          sucursal: initialData.sucursal || "",
        });
      } else {
        setQuoteData({
          channel: "",
          ramp: "",
          technician: "",
          seller: "",
          client_name: "",
          additional_notes: "",
          client_type: "",
          phone: "",
          car_model: "",
          year: "",
          mileage: "",
          sucursal: "",
        });
      }
    }
    setMissingFields(false);
  }, [open, initialData]);

  const resetForm = () => {
    setQuoteData({
      channel: "",
      start: dayjs(),
      end: dayjs().add(1, "hour"),
      ramp: "",
      technician: "",
      client_name: "",
      additional_notes: "",
      client_type: "",
      phone: "",
      car_model: "",
      year: "",
      mileage: "",
      sucursal: "",
      services: [],
      items: [],
      duration: null,
    });
    setMissingFields(false);
  };

  // console.log('curSuc', curSuc);

  // Handlers de cambios en el formulario
  const handleChange = (field) => (e) => {
    setQuoteData({ ...quoteData, [field]: e.target.value });
  };

  // Asignar un vendedor a un evento
  async function handleAssignSeller() {
    const payload = {
      id: initialData.id,
      seller: quoteData.seller,
      sucursal: quoteData.sucursal,
    };
    try {
      const response = await api("/api/quotes/assign-seller", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // Reemplaza 1 por el id deseado
      });

      if (!response.ok) {
        throw new Error("Error al asignar vendedor");
      }
      const savedQuote = await response.json();
      window.showToast("Vendedor asignado correctamente");
      // Si hay callback onQuoteSaved, lo llamamos
      if (onQuoteSaved) {
        onQuoteSaved(savedQuote);
      }
      // Reseteamos formulario y cerramos
      resetForm();
      handleClose();
      // if (onCalendar) {
      //   window.location.reload();
      // }
    } catch (error) {
      console.error("Error al archivar evento:", error);
    }
  }

  const fetchSellers = useCallback(async () => {
    try {
      const sellersRes = await api(
        `/api/users/sellers?sucursal=${quoteData.sucursal}`
      );
      if (!sellersRes.ok) throw new Error("Error al obtener vendedores");

      const sellersData = await sellersRes.json();
      setSellers(sellersData);
      console.log("Vendedores:", sellersData);
    } catch (error) {
      console.error("Error al obtener vendedores:", error);
    }
  }, [quoteData.sucursal]);

  useEffect(() => {
    if (quoteData.sucursal) {
      fetchSellers();
    }
  }, [quoteData.sucursal, fetchSellers]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Asignar Vendedor</DialogTitle>
      <DialogContent dividers>
        <Box>
          <Box
            component="form"
            sx={{ mt: 2, display: "flex", flexDirection: "row", gap: 3 }}
          >
            <Box component="div">
              {curRole >= ROLES.MARKETING ? (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Sucursal</InputLabel>
                  <Select
                    label="Sucursal"
                    fullWidth
                    value={quoteData.sucursal || ""}
                    onChange={(e) => {
                      handleChange("sucursal")(e);
                      fetchSellers();
                    }}
                    required
                    error={missingFields && !quoteData.sucursal}
                  >
                    {sucursales.map((suc) => (
                      <MenuItem key={suc} value={suc}>
                        {suc}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  label="Sucursal"
                  fullWidth
                  value={curSuc}
                  disabled
                  sx={{ mb: 2 }}
                />
              )}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Vendedor</InputLabel>
                <Select
                  fullWidth
                  label="Vendedor"
                  value={quoteData.seller || ""}
                  error={missingFields && !quoteData.seller}
                  onChange={handleChange("seller")}
                >
                  <MenuItem value="auto">Auto</MenuItem>
                  {sellers &&
                    sellers.map((seller) => (
                      <MenuItem key={seller.id} value={seller.name}>
                        {seller.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          onClick={handleAssignSeller}
          variant="contained"
          color="primary"
        >
          Asignar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignSeller;
