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
  Stack,
  MenuItem,
  TextField,
  Box,
  Autocomplete,
} from "@mui/material";
import { debugLog, MYR_DIST_TYPES } from "~/utils/global";
import { phoneFormatter } from "~/utils/formaters";
import { useRouter } from "next/navigation";
import { post } from "~/lib/api";
import { fetchClients } from "~/lib/apiDist";

const emptyData = {
  client_type: "GENERAL",
  phone: "",
  client_name: "",
  additional_notes: "",
  channel: "DE PISO",
  items: [],
};
const MYR_CHANNELS = ["DE PISO", "TELEFONO"];

const CreateOrderDialog = ({ open, handleClose, onQuoteSaved, profile }) => {
  // Single-step flow: no stepper
  const [missingFields, setMissingFields] = useState(false);
  const [quoteData, setQuoteData] = useState(emptyData);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuoteData(emptyData);
      setSelectedClient(null);
      fetchClients(setClients);
    }
    setMissingFields(false);
  }, [open]);

  const handleChange = (field) => (e) => {
    setQuoteData({ ...quoteData, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    // Validación mínima: obligatorios
    if (!quoteData.company || !quoteData.phone || !quoteData.channel) {
      window.showToast("Por favor, complete todos los campos obligatorios.");
      setMissingFields(true);
      return;
    }

    const payload = {
      client_type: quoteData.client_type,
      phone: quoteData.phone,
      company: quoteData.company,
      additional_notes: quoteData.additional_notes,
      sucursal: profile?.sucursal || "",
      seller_id: profile?.id || null,
      items: [],
    };

    if (selectedClient) {
      payload.dist_id = selectedClient.id;
      payload.client_id = selectedClient.admin_user_id;
    }

    try {
      const response = await post(`/api/orders/${quoteData.channel}`, payload);
      debugLog("response", response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar cotización");
      }
      const savedQuote = await response.json();
      if (onQuoteSaved) onQuoteSaved(savedQuote);
      // Redirect to search detail on success
      router.push(`/myr/pedidos/${savedQuote.id}/preorder`);
    } catch (error) {
      console.error("Error al guardar la cotización:", error);
      window.showToast("Error al guardar la cotización", "error");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth={"sm"}>
      <DialogTitle>{`Nueva Cotización ${profile?.sucursal || ""}`}</DialogTitle>
      <DialogContent dividers>
        <Stack sx={{ gap: 2 }}>
          <Box sx={{ display: "flex", gap: 3 }}>
            <TextField
              label="Vendedor"
              value={profile?.username || "ERROR"}
              disabled
              variant="standard"
            />
            <TextField
              label="Sucursal"
              value={profile?.sucursal || "ERROR"}
              disabled
              variant="standard"
              sx={{ mb: 2 }}
            />
          </Box>
          <Autocomplete
            freeSolo
            options={clients}
            value={selectedClient}
            inputValue={quoteData.company}
            getOptionLabel={(option) =>
              typeof option === "string" ? option : option?.company || ""
            }
            isOptionEqualToValue={(option, value) =>
              option?.company === value?.company
            }
            onChange={(_, value) => {
              if (!value) {
                setSelectedClient(null);
                setQuoteData({ ...quoteData, company: "" });
                return;
              }
              if (typeof value === "string") {
                setSelectedClient(null);
                setQuoteData({ ...quoteData, company: value });
                return;
              }
              setSelectedClient(value);
              setQuoteData({
                ...quoteData,
                company: value.company || "",
                client_type: value.client_type || quoteData.client_type,
                client_name: value.client_name || quoteData.client_name,
                phone: value.phone ? phoneFormatter(value.phone) : "",
              });
            }}
            onInputChange={(_, value, reason) => {
              if (reason === "input") {
                setSelectedClient(null);
                setQuoteData({
                  ...emptyData,
                  company: value,
                  // phone: "",
                  // client_name: "",
                  // client_type: "DE PISO",
                });
              }
            }}
            // onAbortCapture={() => {
            //   setSelectedClient(null);
            //   setQuoteData({
            //     ...quoteData,
            //   });
            // }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Nombre del Cliente"
                fullWidth
                error={missingFields && !quoteData.company}
                required
              />
            )}
          />
          <TextField
            label="Teléfono"
            fullWidth
            value={quoteData.phone}
            onChange={(e) => {
              const formattedPhone = phoneFormatter(e.target.value);
              setQuoteData({ ...quoteData, phone: formattedPhone });
            }}
            required
            error={
              (missingFields && !quoteData.phone) ||
              (quoteData.phone?.length > 0 && quoteData.phone.length < 10)
            }
          />

          <FormControl fullWidth>
            <InputLabel>Tipo de cliente</InputLabel>
            <Select
              label="Tipo de cliente"
              value={quoteData.client_type}
              onChange={handleChange("client_type")}
              error={missingFields && !quoteData.client_type}
              required
            >
              {MYR_DIST_TYPES.map((client) => (
                <MenuItem key={client} value={client}>
                  {client}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Canal de venta</InputLabel>
            <Select
              label="Canal de venta"
              value={quoteData.channel}
              onChange={handleChange("channel")}
              error={missingFields && !quoteData.channel}
              required
            >
              {MYR_CHANNELS.map((channel) => (
                <MenuItem key={channel} value={channel}>
                  {channel}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Notas Adicionales"
            fullWidth
            value={quoteData.additional_notes}
            onChange={handleChange("additional_notes")}
            multiline
            minRows={3}
          />
        </Stack>
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

export default CreateOrderDialog;
