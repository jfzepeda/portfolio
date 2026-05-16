"use client";
import React, { useState, useEffect } from "react";
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
import { debugLog, SUCS } from "~/utils/global";
import { useRouter } from "next/navigation";
import api, { post } from "~/lib/api";

// URL global del backend

// Constantes fijas para el formulario
const saleTypes = ["De Piso", "Online", "Teléfono"]; // channel
const client_types = ["PUBLICO", "CONVENIO", "DISTRIBUIDOR"];

// Datos de sesión (sucursal y vendedor actuales)
const userProfile = getUserProfile();
const curSuc = userProfile ? userProfile.sucursal : null;
const curRole = userProfile ? userProfile.role : null;
const currentSeller = userProfile ? userProfile.username : null;

const CreatePrequoteDialog = ({
  open,
  handleClose,
  initialData,
  onQuoteSaved,
}) => {
  // Single-step flow: no stepper
  const [missingFields, setMissingFields] = useState(false);
  const router = useRouter();

  // Estado limitado a los campos de la tabla
  const [quoteData, setQuoteData] = useState({
    channel: "Online",
    client_type: "PUBLICO",
    phone: "",
    sucursal: curSuc || "",
    seller: currentSeller || "",
    client_name: "",
    additional_notes: "",
    items: [],
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setQuoteData({
          channel: initialData.channel || "Online",
          client_type: initialData.client_type || "PUBLICO",
          phone: initialData.phone || "",
          sucursal: initialData.sucursal || curSuc || "",
          seller: initialData.seller || currentSeller || "",
          client_name: initialData.client_name || "",
          additional_notes: initialData.additional_notes || "",
          items: Array.isArray(initialData.items) ? initialData.items : [],
        });
      } else {
        setQuoteData({
          channel: "Online",
          client_type: "PUBLICO",
          phone: "",
          sucursal: "",
          seller: currentSeller || "",
          client_name: "",
          additional_notes: "",
          items: [],
        });
      }
    }
    setMissingFields(false);
  }, [open, initialData]);

  const handleAutocomplete = (data) => {
    if (!data || data.length === 0) return;

    const { nombre } = data;

    setQuoteData((prev) => ({
      ...prev,
      client_name: nombre || "",
    }));
  };

  async function fetchClient(value) {
    try {
      const clientRes = await api(`/api/clients/get?phone=${value}`);
      if (!clientRes.ok) throw new Error("Error al obtener datos del cliente");

      const clientData = await clientRes.json();
      console.debug("Cliente:", clientData);

      handleAutocomplete(clientData);
      console.log("Datos del cliente:", clientData);
    } catch (error) {
      console.error("Error al obtener datos del cliente:", error);
    }
  }

  const handleNumericPhone = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    value = value.slice(0, 10);
    setQuoteData({ ...quoteData, phone: value });
    if (value.length === 10) {
      fetchClient(value);
    }
  };

  const handleChange = (field) => (e) => {
    setQuoteData({ ...quoteData, [field]: e.target.value });
  };

  // const resetForm = () => {
  //   setQuoteData({
  //     channel: "Online",
  //     client_type: "PUBLICO",
  //     phone: "",
  //     sucursal: "",
  //     seller: currentSeller || "",
  //     client_name: "",
  //     additional_notes: "",
  //     items: [],
  //   });
  //   // Ensure any previous step state is irrelevant
  //   setMissingFields(false);
  // };

  const handleSubmit = async () => {
    // Validación mínima: obligatorios
    if (!quoteData.channel || !quoteData.client_name || !quoteData.phone) {
      window.showToast("Por favor, complete todos los campos obligatorios.");
      setMissingFields(true);
      return;
    }
    // Items no longer required at creation time

    // Construcción del payload SOLO con los campos de la tabla
    const payload = {
      // type no se envía: el backend puede usar DEFAULT 'quote'
      channel: quoteData.channel,
      client_type: quoteData.client_type,
      phone: quoteData.phone,
      sucursal: curRole >= ROLES.MARKETING ? quoteData.sucursal : curSuc,
      seller:
        curRole >= ROLES.MARKETING
          ? quoteData.seller || currentSeller
          : currentSeller,
      client_name: quoteData.client_name,
      additional_notes: quoteData.additional_notes,
      items: quoteData.items.map((item) => ({
        article: item.article,
        units: Number(item.units),
        price: Number(item.precioLista || item.preciolista),
        promo: item.promo || "preciocontado",
      })),
    };

    try {
      const response = await post(`/api/prequotes/save`, {
        ...payload,
        id: initialData?.id,
      });
      debugLog("response", response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar cotización");
      }
      const savedQuote = await response.json();
      if (onQuoteSaved) onQuoteSaved(savedQuote);
      // Redirect to search detail on success
      router.push(`/cotizaciones/${savedQuote.id}/pre`);
    } catch (error) {
      console.error("Error al guardar la cotización:", error);
      window.showToast("Error al guardar la cotización", "error");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth={"md"}>
      <DialogTitle>{`Nueva Cotización ${curSuc}`}</DialogTitle>
      <DialogContent dividers>
        <Box>
          <Box
            component="form"
            sx={{ mt: 2, display: "flex", flexDirection: "row", gap: 3 }}
          >
            <Box component="div">
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Tipo de Venta</InputLabel>
                <Select
                  label="Tipo de Venta"
                  value={quoteData.channel}
                  onChange={handleChange("channel")}
                  required
                  error={missingFields && !quoteData.channel}
                >
                  {saleTypes.map((channel) => (
                    <MenuItem key={channel} value={channel}>
                      {channel}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {curRole >= ROLES.MARKETING ? (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Sucursal</InputLabel>
                  <Select
                    label="Sucursal"
                    value={quoteData.sucursal || ""}
                    onChange={handleChange("sucursal")}
                    required
                    error={missingFields && !quoteData.sucursal}
                  >
                    {SUCS.map((suc) => (
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
                  value={curSuc || ""}
                  disabled
                  sx={{ mb: 2 }}
                />
              )}

              <TextField
                label="Vendedor"
                fullWidth
                value={quoteData.seller || currentSeller || ""}
                disabled
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Tipo de cliente</InputLabel>
                <Select
                  label="Tipo de cliente"
                  value={quoteData.client_type}
                  onChange={handleChange("client_type")}
                  required
                  error={missingFields && !quoteData.client_type}
                >
                  {client_types.map((client) => (
                    <MenuItem key={client} value={client}>
                      {client}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <TextField
                label="Teléfono"
                fullWidth
                value={quoteData.phone}
                onChange={handleNumericPhone}
                required
                error={
                  (missingFields && !quoteData.phone) ||
                  (quoteData.phone?.length > 0 && quoteData.phone.length < 10)
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="Nombre del Cliente"
                fullWidth
                value={quoteData.client_name}
                onChange={handleChange("client_name")}
                required
                error={missingFields && !quoteData.client_name}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Notas Adicionales"
                fullWidth
                value={quoteData.additional_notes}
                onChange={handleChange("additional_notes")}
                multiline
                minRows={3}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePrequoteDialog;
