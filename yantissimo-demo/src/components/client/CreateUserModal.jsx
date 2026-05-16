"use client";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";

const DEFAULT_FORM = {
  name: "",
  username: "",
  password: "",
  role: 3,
  phone: "",
};

const CreateUserModal = ({ open, onClose, onSubmit, roleOptions }) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm(DEFAULT_FORM);
    setErrorMsg("");
  }, [open]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!String(form.username || "").trim()) {
      setErrorMsg("El nombre de usuario es requerido.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: String(form.name || "").trim(),
        username: String(form.username || "").trim(),
        password: String(form.password || ""),
        role: Number(form.role),
        phone: String(form.phone || "").trim(),
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      if (err?.status === 409 || err?.code === "username_exists") {
        setErrorMsg("El nombre de usuario ya existe. Elige otro.");
      } else {
        setErrorMsg(err?.message || "No se pudo crear el usuario.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Crear usuario</DialogTitle>
      <DialogContent>
        {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Nombre"
            value={form.name}
            onChange={handleChange("name")}
          />
          <TextField
            label="Usuario"
            value={form.username}
            onChange={handleChange("username")}
            required
          />
          <TextField
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={handleChange("password")}
          />
          <FormControl>
            <InputLabel>Rol</InputLabel>
            <Select
              label="Rol"
              value={form.role}
              onChange={handleChange("role")}
            >
              {(roleOptions || []).map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Teléfono"
            value={form.phone}
            onChange={handleChange("phone")}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserModal;
