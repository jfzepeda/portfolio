"use client";
import React, { useEffect, useState, useCallback } from "react";
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
  Divider,
  Stack,
  Typography,
  Autocomplete,
} from "@mui/material";
import api, { put } from "~/lib/api";
import { SUCS } from "~/utils/global";

const saleTypes = ["De Piso", "Online", "Teléfono"];
const client_types = ["PUBLICO", "CONVENIO", "DISTRIBUIDOR"];

const extractLatestYear = (value) => {
  if (!value) return "";
  const parts = String(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts[parts.length - 1] || "";
};

export default function EditQuoteDialog({
  open,
  onClose,
  initialData,
  profile,
  cotId,
  onUpdated,
}) {
  const roleNum = Number(profile?.role || 0);

  const [missing, setMissing] = useState(false);
  const [carOptions, setCarOptions] = useState([]);
  const [carMap, setCarMap] = useState({});
  const [form, setForm] = useState({
    channel: "Online",
    client_type: "PUBLICO",
    phone: "",
    sucursal: "",
    seller: "",
    client_name: "",
    additional_notes: "",
    vehicle_model: "",
    vehicle_year: "",
  });

  // Prefill when opened
  useEffect(() => {
    if (!open) return;
    const q = initialData || {};
    setForm({
      channel: q.channel || "Online",
      client_type: q.client_type || "PUBLICO",
      phone: q.phone || "",
      sucursal: q.sucursal || profile?.sucursal || "",
      seller: q.seller || profile?.username || "",
      client_name: q.client_name || "",
      additional_notes: q.additional_notes || "",
      vehicle_model: q?.vehicle?.model || "",
      vehicle_year: q?.vehicle?.year || "",
    });
    setMissing(false);
  }, [open, initialData, profile?.sucursal, profile?.username]);

  const handleChange = useCallback(
    (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
    []
  );

  const fetchClientData = useCallback(async (value) => {
    if (!value || value.length !== 10) return;
    try {
      const res = await api(`/api/clients/get?phone=${value}`);
      if (!res.ok) return;
      const data = await res.json();
      const nombre = data?.nombre || data?.name || "";
      const car = data?.car && typeof data.car === "object" ? data.car : {};
      setCarOptions(Object.keys(car));
      setCarMap(car);
      setForm((prev) => {
        const next = { ...prev };
        if (nombre) next.client_name = nombre;
        if (!prev.vehicle_model) {
          const [defaultModel, defaultYears] = Object.entries(car)[0] || [];
          if (defaultModel) {
            next.vehicle_model = defaultModel;
            next.vehicle_year = extractLatestYear(defaultYears);
          }
        }
        return next;
      });
    } catch (err) {
      console.error("Autocomplete cliente error:", err);
    }
  }, []);

  // Numeric phone with max 10 and client autocomplete
  const handleNumericPhone = useCallback(
    async (e) => {
      let value = String(e.target.value || "").replace(/[^0-9]/g, "");
      value = value.slice(0, 10);
      setForm((f) => ({ ...f, phone: value }));
      if (value.length === 10) {
        fetchClientData(value);
      } else {
        setCarOptions([]);
        setCarMap({});
      }
    },
    [fetchClientData]
  );

  useEffect(() => {
    if (!open) return;
    const phone = initialData?.phone || "";
    if (phone.length === 10) {
      fetchClientData(phone);
    }
  }, [open, initialData?.phone, fetchClientData]);

  useEffect(() => {
    if (!form.vehicle_model) return;
    const mapValue = carMap[form.vehicle_model];
    if (!mapValue) return;
    const latestYear = extractLatestYear(mapValue);
    if (latestYear && latestYear !== form.vehicle_year) {
      setForm((prev) => ({ ...prev, vehicle_year: latestYear }));
    }
  }, [carMap, form.vehicle_model, form.vehicle_year]);

  const handleSave = useCallback(async () => {
    if (!form.channel || !form.client_name || !form.phone) {
      setMissing(true);
      window.showToast("Por favor, complete los campos obligatorios.");
      return;
    }
    try {
      const idNum = Number(cotId);
      if (!idNum) return;
      const payload = {
        id: idNum,
        channel: form.channel,
        client_type: form.client_type,
        phone: form.phone,
        sucursal: roleNum >= 9 ? form.sucursal : profile?.sucursal,
        seller:
          roleNum >= 9 ? form.seller || profile?.username : profile?.username,
        client_name: form.client_name,
        additional_notes: form.additional_notes,
        vehicle: {
          model: form.vehicle_model,
          year: form.vehicle_year,
        },
      };
      const res = await put(`/api/prequotes/${idNum}`, payload);
      if (!res.ok) throw new Error("No se pudo actualizar la cotización");
      const updated = await res.json();
      if (typeof onUpdated === "function") onUpdated(updated);
      onClose?.();
      window.showToast("Datos actualizados");
    } catch (e) {
      console.error(e);
      window.showToast("Error al actualizar los datos", "error");
    }
  }, [
    cotId,
    form,
    onUpdated,
    onClose,
    profile?.username,
    profile?.sucursal,
    roleNum,
  ]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={"md"}>
      <DialogTitle>Editar datos de la cotización</DialogTitle>
      <DialogContent dividers>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ mt: 1 }}
        >
          <Box sx={{ flex: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tipo de Venta</InputLabel>
              <Select
                label="Tipo de Venta"
                value={form.channel}
                onChange={handleChange("channel")}
                required
                error={missing && !form.channel}
              >
                {saleTypes.map((ch) => (
                  <MenuItem key={ch} value={ch}>
                    {ch}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tipo de cliente</InputLabel>
              <Select
                label="Tipo de cliente"
                value={form.client_type}
                onChange={handleChange("client_type")}
                required
                error={missing && !form.client_type}
              >
                {client_types.map((ct) => (
                  <MenuItem key={ct} value={ct}>
                    {ct}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {roleNum >= 9 ? (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Sucursal</InputLabel>
                <Select
                  label="Sucursal"
                  value={form.sucursal}
                  onChange={handleChange("sucursal")}
                >
                  {SUCS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                label="Sucursal"
                fullWidth
                value={profile?.sucursal || ""}
                disabled
                sx={{ mb: 2 }}
              />
            )}
            <TextField
              label="Vendedor"
              fullWidth
              value={roleNum >= 9 ? form.seller : profile?.username || ""}
              onChange={handleChange("seller")}
              disabled={roleNum < 9}
              sx={{ mb: 2 }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              label="Teléfono"
              fullWidth
              value={form.phone}
              onChange={handleNumericPhone}
              required
              error={
                (missing && !form.phone) ||
                (form.phone && form.phone.length > 0 && form.phone.length < 10)
              }
              sx={{ mb: 2 }}
            />
            <TextField
              label="Nombre del Cliente"
              fullWidth
              value={form.client_name}
              onChange={handleChange("client_name")}
              required
              error={missing && !form.client_name}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Notas Adicionales"
              fullWidth
              value={form.additional_notes}
              onChange={handleChange("additional_notes")}
              multiline
              minRows={3}
            />
          </Box>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Datos del vehículo
        </Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Autocomplete
            freeSolo
            fullWidth
            options={carOptions}
            value={form.vehicle_model}
            onChange={(_event, newValue) => {
              const nextModel = newValue || "";
              const nextYear =
                nextModel && carMap[nextModel]
                  ? extractLatestYear(carMap[nextModel])
                  : "";
              setForm((prev) => ({
                ...prev,
                vehicle_model: nextModel,
                vehicle_year: nextYear,
              }));
            }}
            onInputChange={(_event, newInputValue, reason) => {
              if (reason === "reset") return;
              setForm((prev) => ({
                ...prev,
                vehicle_model: newInputValue || "",
                vehicle_year: "",
              }));
            }}
            renderInput={(params) => (
              <TextField {...params} label="Modelo" fullWidth />
            )}
          />
          <TextField
            label="Año"
            fullWidth
            value={form.vehicle_year}
            onChange={handleChange("vehicle_year")}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          Guardar cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
}
