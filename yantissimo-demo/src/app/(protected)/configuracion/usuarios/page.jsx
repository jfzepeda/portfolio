"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Switch from "@mui/material/Switch";

import CreateUserDialog from "~/components/CreateUserDialog";
import { getUserProfile, getSucursal } from "~/utils/session";
import { ROLES, SUCS, debugLog, ROLE_LABELS } from "~/utils/global";
import api, { put } from "~/lib/api";
import Header from "~/components/header";

const sucursales = [...SUCS];
sucursales.push("MYRCOL", "MYRMZO", "Todas");

const userProfile = getUserProfile();
const curSuc = userProfile ? userProfile.sucursal : null;
const curRole = userProfile ? userProfile.role : null;

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.mode === "dark" ? "#2ECA45" : "#65C466",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color:
        theme.palette.mode === "light"
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [sucFilter, setSucFilter] = useState(getSucursal());

  useEffect(() => {
    fetchUsers();
  }, [sucFilter]);

  async function fetchUsers() {
    try {
      const response = await api(`/api/users`);
      if (!response.ok) throw new Error("Error al obtener usuarios");

      const data = await response.json();
      setUsers(data);
      debugLog(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  }

  async function toggleStatus(editingUser) {
    const nextStatus = !editingUser.status;
    setUsers(
      users.map((u) =>
        u.id === editingUser.id ? { ...u, status: nextStatus } : u
      )
    );
    try {
      if (nextStatus) {
        const res = await put(`/api/users/reactivate/${editingUser.id}`, {});
        if (!res.ok) throw new Error("No se pudo reactivar el usuario");
      } else {
        const res = await put(`/api/users/inactivate/${editingUser.id}`, {});
        if (!res.ok) throw new Error("No se pudo inactivar el usuario");
      }
    } catch (error) {
      console.error("Error actualizando estado:", error);
      setUsers(
        users.map((u) =>
          u.id === editingUser.id ? { ...u, status: !nextStatus } : u
        )
      );
      window.showToast?.("No se pudo actualizar el estado", "error");
    }
  }

  const handleCreate = (_userType) => {
    setEditingUser(null);
    setOpenCreateDialog(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setOpenCreateDialog(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`¿Está seguro de que desea inactivar a ${user.name}?`)) {
      try {
        const response = await put(`/api/users/inactivate/${user.id}`, {});
        if (!response.ok) throw new Error("Error al inactivar usuario");
        setUsers(
          users.map((u) => (u.id === user.id ? { ...u, status: false } : u))
        );
      } catch (error) {
        console.error("Error al inactivar usuario:", error);
        window.showToast?.("No se pudo inactivar el usuario", "error");
      }
    }
  };

  const handleDialogClose = () => {
    setOpenCreateDialog(false);
    setEditingUser(null);
  };

  // const handleUserSaved = (savedUser) => {
  //   if (editingUser) {
  //     setUsers(users.map(u => u.id === savedUser.id ? savedUser : u));
  //   } else {
  //     setUsers([...users, savedUser]);
  //   }
  //   handleDialogClose();
  // };

  // Filter users based on selected sucursal
  const sortedUsers = [...users]
    .filter((user) => user.role !== ROLES.CLIENT_ADMIN)
    .sort((a, b) => b.role - a.role);
  let filteredUsers = sortedUsers;
  if (sucFilter !== "Todas") {
    filteredUsers = sortedUsers.filter((user) => user.sucursal === sucFilter);
  }

  return (
    <Box>
      <Header
        title="Gestión de Usuarios"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleCreate(null)}
            disabled={curRole < ROLES.ADMIN}
          >
            Agregar Usuario
          </Button>
        }
      />

      {/* Sucursal Filter */}
      <Box display="flex" justifyContent="flex-start" mb={2}>
        {curRole >= ROLES.MARKETING ? (
          <FormControl sx={{ width: 200 }} variant="standard">
            <InputLabel>Sucursal</InputLabel>
            <Select
              value={sucFilter || ""}
              onChange={(e) => {
                const suc = e.target.value;
                setSucFilter(suc);
                if (suc !== "Todas") {
                  localStorage.setItem("sucursal", suc);
                }
              }}
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
            value={curSuc}
            disabled
            variant="standard"
            sx={{ width: 170 }}
          />
        )}
      </Box>

      {/* Users Table */}
      <Table>
        <TableHead>
          <TableRow>
            {/* <TableCell>ID</TableCell> */}
            <TableCell>Nombre</TableCell>
            <TableCell>Rol</TableCell>
            <TableCell>Sucursal</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id} hover>
              {/* <TableCell>{user.id}</TableCell> */}
              <TableCell>{user.name}</TableCell>
              <TableCell>{ROLE_LABELS[user.role] ?? "Desconocido"}</TableCell>
              <TableCell>{user.sucursal}</TableCell>
              <TableCell>
                <IOSSwitch
                  checked={user.status}
                  onChange={() => toggleStatus(user)}
                />
              </TableCell>
              <TableCell>
                {/* <IconButton > */}
                <IconButton onClick={() => handleEdit(user)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(user)}>
                  <DeleteForeverIcon color="error" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {openCreateDialog && (
        <CreateUserDialog
          open={openCreateDialog}
          handleClose={handleDialogClose}
          onUserSaved={(savedUser) => {
            setUsers([...users, savedUser]);
            setOpenCreateDialog(false);
          }}
          initialData={editingUser}
          role={null}
          sucursal={sucFilter}
        />
      )}
    </Box>
  );
};

export default UsersPage;
