"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  FormControl,
} from "@mui/material";
import { SUCS, ROLE_LABELS, ROLES } from "../utils/global";
import api, { post, put } from "~/lib/api";
// Copia para no mutar el array importado
const sucursales = SUCS.filter((s) => s !== "YAOL");

const isClientRole = (r) =>
  Number(r) === ROLES.CLIENT || Number(r) === ROLES.CLIENT_ADMIN;

const CreateUserDialog = ({
  open,
  handleClose,
  onUserSaved,
  initialData,
  role,
  sucursal,
}) => {
  const [userData, setUserData] = useState({
    name: "",
    role: "",
    username: "",
    password: "",
    sucursal: "",
    phone: "",
  });

  const [company, setCompany] = useState([]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setUserData({
          name: initialData.name,
          role: initialData.role,
          username: initialData.username || "",
          password: initialData.password || "",
          sucursal: initialData.sucursal || "",
          phone: initialData.phone || "",
        });
      }
    } else {
      setUserData({
        name: "",
        role: role,
        username: "",
        password: "",
        sucursal: sucursal,
        phone: "",
      });
    }
  }, [open, role, sucursal, initialData]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setUserData({
      ...userData,
      [field]: field === "role" ? Number(value) : value,
    });
  };

  // Fetch de nombre de compañia cuando rol cliente (3)
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await api(`/api/dist`);
        if (!res.ok) throw new Error("Error al obtener compañia");
        const data = await res.json();
        console.log("Compañia obtenida:", data);
        setCompany(data);
      } catch (err) {
        console.error("Error al obtener compañia:", err);
        setCompany([]);
      }
    };

    if (open && !initialData && isClientRole(userData.role)) {
      fetchSellers();
      setUserData((prev) => ({ ...prev, sucursal: "MYR" }));
    } else if (!isClientRole(userData.role)) {
      setCompany([]);
      setUserData((prev) => ({ ...prev, company: "" }));
    }
  }, [open, userData.role, initialData]);

  const handleSubmit = async () => {
    const clientRole = isClientRole(userData.role);
    const requiresCredentials = Number(userData.role) !== ROLES.TECHNICIAN;

    if (
      !userData.name ||
      (clientRole && !userData.sucursal) ||
      (requiresCredentials && (!userData.username || !userData.password))
    ) {
      window.showToast("Complete todos los campos requeridos");
      return;
    }
    // CREACION DE ROLES TECNICOS
    try {
      const payload = {
        name: userData.name,
        role: userData.role,
        username: userData.username,
        password: userData.password,
        sucursal: userData.sucursal,
        phone: userData.phone,
      };
      // Añadir company solo si es cliente/admin cliente
      if (isClientRole(userData.role) && userData.company) {
        payload.company = userData.company;
        payload.sucursal = "MYR";
      }
      const response = await post(`/api/users`, payload);
      if (response.status === 409) {
        window.showToast("Este nombre de usuario ya existe", "warning");
        return;
      }
      if (!response.ok) {
        throw new Error("Error al guardar el usuario");
      }
      const savedUser = await response.json();
      onUserSaved(savedUser);
      window.showToast("Usuario creado exitosamente");
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      window.showToast("Error al guardar el usuario", "error");
    }
  };

  const handleEdit = async () => {
    if (!userData.name || !userData.sucursal) {
      window.showToast("Complete todos los campos requeridos");
      return;
    }
    try {
      const payload = {
        id: initialData.id,
        name: userData.name,
        role: userData.role,
        sucursal: userData.sucursal,
        phone: userData.phone,
      };
      const response = await put(`/api/users`, payload);
      if (response.status === 409) {
        window.showToast("Este nombre de usuario ya existe");
        return;
      }
      if (!response.ok) {
        throw new Error("Error al guardar el usuario");
      }
      const savedUser = await response.json();
      onUserSaved(savedUser);
      window.showToast("Usuario editado exitosamente");
      window.location.reload();
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      window.showToast("Error al guardar el usuario", "error");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialData ? "Editar usuario" : "Crear Usuario"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {isClientRole(userData?.role) && !initialData && (
            <FormControl fullWidth>
              <TextField
                select
                label="Empresa"
                value={userData.company}
                onChange={handleChange("company")}
                helperText="Asigna a una empresa"
              >
                {company.map((comp) => (
                  <MenuItem key={comp.id} value={comp.company}>
                    {comp.company}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
          )}
          <TextField
            label="Nombre"
            fullWidth
            value={userData.name}
            onChange={handleChange("name")}
            required
          />
          <TextField
            label="Teléfono"
            fullWidth
            value={userData.phone}
            onChange={handleChange("phone")}
            required
          />
          <TextField
            select
            label="Rol"
            fullWidth
            value={userData.role}
            onChange={handleChange("role")}
            required
          >
            {Object.entries(ROLE_LABELS).map(([key, value]) => (
              <MenuItem key={key} value={Number(key)}>
                {value}
              </MenuItem>
            ))}
          </TextField>
          {Number(userData.role) !== ROLES.TECHNICIAN && !initialData && (
            <>
              <TextField
                label="Username"
                fullWidth
                value={userData.username}
                onChange={handleChange("username")}
                required
              />
              <TextField
                label="Contraseña"
                type="password"
                fullWidth
                value={userData.password}
                onChange={handleChange("password")}
                required
              />
            </>
          )}
          {!isClientRole(userData.role) &&
            (Number(userData.role) >= ROLES.MARKETING ? (
              <TextField
                label="Sucursal"
                fullWidth
                value="ADMIN"
                required
                disabled
              />
            ) : Number(userData.role) <= ROLES.MYR_MANAGER &&
              Number(userData.role) >= ROLES.MYR_HELPER ? (
              <FormControl fullWidth>
                <TextField
                  select
                  label="Sucursal"
                  value={userData.sucursal}
                  onChange={handleChange("sucursal")}
                  required
                >
                  {["MYRMZO", "MYRCOL"].map((sucursal) => (
                    <MenuItem key={sucursal} value={sucursal}>
                      {sucursal}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            ) : (
              <FormControl fullWidth>
                <TextField
                  select
                  label="Sucursal"
                  value={userData.sucursal}
                  onChange={handleChange("sucursal")}
                  required
                >
                  {sucursales.map((sucursal) => (
                    <MenuItem key={sucursal} value={sucursal}>
                      {sucursal}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            ))}
          {/* Selector de Agente de ventas para clientes (rol 3) */}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        {initialData ? (
          <Button variant="contained" onClick={handleEdit}>
            Confirmar edición
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSubmit}>
            Crear Usuario
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserDialog;
