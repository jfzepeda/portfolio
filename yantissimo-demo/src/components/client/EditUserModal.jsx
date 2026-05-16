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

const EditUserModal = ({ open, onClose, onSubmit, roleOptions, user }) => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    phone: "",
    role: 3,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm({
      name: user?.name || "",
      username: user?.username || "",
      phone: user?.phone || "",
      role: user?.role ?? 3,
    });
    setErrorMsg("");
  }, [open, user]);

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
        role: Number(form.role),
        phone: Number(form.phone),
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      if (err?.status === 409 || err?.code === "username_exists") {
        setErrorMsg("El nombre de usuario ya existe. Elige otro.");
      } else {
        setErrorMsg(err?.message || "No se pudo actualizar el usuario.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar usuario</DialogTitle>
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
            label="Teléfono"
            value={form.phone}
            onChange={handleChange("phone")}
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
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserModal;
