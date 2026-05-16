"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { MYR_DIST_TYPES } from "~/utils/global";
import { ROLES } from "~/utils/session";
import { phoneFormatter } from "~/utils/formaters";

export const EMPTY_DISTRIBUIDOR_FORM = {
  id: null,
  company: "",
  sucursal: "",
  zone: "",
  only_ctdo: false,
  client_type: "",
  client_tier: "",
  location: "",
  delivery_type: "",
  assigned_seller: "",
  ruta_id: "",
  creditPolicy_days: 15,
  creditPolicy_limit: 15_000,
  adminUsername: "",
  adminPassword: "",
  adminPhone: "",
};

const ZONAS = { colima: "MYRCOL", manzanillo: "MYRMZO" };
const CLIENT_TIERS = ["1", "2", "3"];
const DELIVERY_TYPES = ["RUTA", "RECOLECCION", "REPARTO", "ESPECIAL"];

export function buildDistribuidorPayload(form, { isConAcceso = false } = {}) {
  return {
    company: String(form.company || "").trim(),
    ruta_id: form.ruta_id ? Number(form.ruta_id) : null,
    assigned_seller: Number(form.assigned_seller),
    only_ctdo: Boolean(form.only_ctdo),
    location: String(form.location || "").trim() || null,
    delivery_type: String(form.delivery_type || "").trim() || null,
    client_type: String(form.client_type || "").trim() || null,
    client_tier: String(form.client_tier || "").trim() || null,
    zone: String(form.zone || "").trim() || null,
    credit_policy: {
      days: form.creditPolicy_days ?? 0,
      limit: form.creditPolicy_limit ?? 0,
    },
    admin: isConAcceso
      ? {
          username: String(form.adminUsername || "").trim(),
          password: String(form.adminPassword || ""),
          phone: String(form.adminPhone || "").trim() || null,
        }
      : {
          phone: String(form.adminPhone || "").trim() || null,
        },
    pacc: isConAcceso,
  };
}

export function mapProspectToDistribuidorForm(row = {}) {
  return {
    ...EMPTY_DISTRIBUIDOR_FORM,
    company: row.company ?? "",
    sucursal: String(row.sucursal ?? ""),
    zone: String(row.zone ?? row.extras?.zone ?? ""),
    only_ctdo: Boolean(row.only_ctdo),
    assigned_seller: String(row.assigned_seller ?? ""),
    ruta_id: String(row.ruta_id ?? ""),
    client_type: String(row.client_type ?? ""),
    client_tier: String(row.client_tier ?? ""),
    location: String(row.location ?? ""),
    delivery_type: String(row.delivery_type ?? ""),
    creditPolicy_days: row.credit_policy?.days || 15,
    creditPolicy_limit: row.credit_policy?.limit || 15_000,
    adminUsername: row.admin?.username || "",
    adminPassword: "",
    adminPhone: row.admin?.phone || row.phone || "",
  };
}

export default function DistribuidorFormDialog({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  isEdit = false,
  isConAcceso = false,
  sellers = [],
  rutas = [],
  userRole,
  title,
  submitLabel = "Guardar",
  submitting = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const showAdminFields = !isEdit && isConAcceso;
  const showPhoneOnly = !isEdit && !isConAcceso;
  const canEditCreditPolicy = isEdit || userRole >= ROLES.ADMIN;

  const resolvedTitle =
    title ||
    (isEdit
      ? isConAcceso
        ? "Editar distribuidor"
        : "Editar cliente"
      : isConAcceso
      ? "Nuevo distribuidor"
      : "Nuevo cliente");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={showAdminFields ? "md" : "sm"}
    >
      <DialogTitle>{resolvedTitle}</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            mt: 1,
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              md: showAdminFields ? "1fr 1fr" : "1fr",
            },
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6">Datos de la Empresa</Typography>
            {isConAcceso ? (
              !isEdit && (
                <TextField
                  label="Nombre"
                  value={form.company}
                  onChange={handleChange("company")}
                  required
                  autoFocus
                />
              )
            ) : (
              <TextField
                label="Nombre"
                value={form.company}
                onChange={handleChange("company")}
                required
                autoFocus
                disabled={isEdit}
              />
            )}
            <FormControl fullWidth>
              <TextField
                select
                label="Tipo de cliente"
                value={String(form.client_type ?? "")}
                onChange={handleChange("client_type")}
              >
                {MYR_DIST_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
            <FormControl fullWidth>
              <TextField
                select
                label="Potencial de cliente"
                value={String(form.client_tier ?? "")}
                onChange={handleChange("client_tier")}
              >
                {CLIENT_TIERS.map((tier) => (
                  <MenuItem key={tier} value={tier}>
                    {tier}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
            <FormControl fullWidth>
              <TextField
                select
                label="Sucursal de atención"
                value={String(form.sucursal ?? "")}
                onChange={handleChange("sucursal")}
              >
                {Object.entries(ZONAS).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {key}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
            <FormControl fullWidth>
              <TextField
                select
                label="Agente de ventas"
                value={String(form.assigned_seller ?? "")}
                onChange={handleChange("assigned_seller")}
              >
                {sellers.map((seller) => (
                  <MenuItem key={seller.id} value={String(seller.id)}>
                    {seller.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
            <TextField
              label="Zona"
              value={String(form.zone ?? "")}
              onChange={handleChange("zone")}
            />
            <TextField
              label="Link de ubicación (Google Maps)"
              value={form.location}
              onChange={handleChange("location")}
            />
            <FormControl fullWidth>
              <TextField
                select
                label="Tipo de entrega"
                value={String(form.delivery_type ?? "")}
                onChange={handleChange("delivery_type")}
              >
                {DELIVERY_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
            {form.delivery_type === "RUTA" && (
              <FormControl fullWidth>
                <TextField
                  select
                  label="Ruta de distribución"
                  value={String(form.ruta_id ?? "")}
                  onChange={handleChange("ruta_id")}
                  disabled={form.delivery_type !== "RUTA"}
                >
                  {rutas.map((route) => (
                    <MenuItem key={route.id} value={String(route.id)}>
                      {route.zona}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(form.only_ctdo)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      only_ctdo: e.target.checked,
                    }))
                  }
                />
              }
              label="Solo Contado"
              sx={{ px: 2 }}
            />
            {!form.only_ctdo && (
              <Box sx={{ display: "flex", gap: 4, px: 2 }}>
                <TextField
                  label="Días de crédito"
                  variant="standard"
                  value={form.creditPolicy_days ?? 0}
                  onChange={handleChange("creditPolicy_days")}
                  disabled={!canEditCreditPolicy}
                />
                <TextField
                  label="Limite de crédito"
                  variant="standard"
                  value={form.creditPolicy_limit ?? 0}
                  onChange={handleChange("creditPolicy_limit")}
                  disabled={!canEditCreditPolicy}
                />
              </Box>
            )}
          </Stack>

          {showAdminFields && (
            <Stack spacing={2}>
              <Typography variant="h6">Admin del cliente</Typography>
              <TextField
                label="Usuario"
                value={form.adminUsername}
                onChange={handleChange("adminUsername")}
                required
              />
              <TextField
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                value={form.adminPassword}
                onChange={handleChange("adminPassword")}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Teléfono"
                type="text"
                value={form.adminPhone}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    adminPhone: phoneFormatter(e.target.value),
                  }))
                }
              />
            </Stack>
          )}

          {showPhoneOnly && (
            <Stack spacing={2}>
              <Typography variant="h6">Contacto del cliente</Typography>
              <TextField
                label="Teléfono"
                type="text"
                value={form.adminPhone}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    adminPhone: phoneFormatter(e.target.value),
                  }))
                }
              />
            </Stack>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSubmit} disabled={submitting}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
