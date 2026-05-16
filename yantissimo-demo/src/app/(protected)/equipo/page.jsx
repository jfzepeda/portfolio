"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";

import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import CreateUserDialog from "~/components/CreateUserDialog";
import { EditSchedule, ManageUser } from "./EditSchedule";
import { getUserProfile, getSucursal } from "~/utils/session";
import { ROLES, SUCS } from "~/utils/global";
import api from "~/lib/api";
import Header from "~/components/header";

const ItemTypes = { USER: "user" };

// Crear una copia local del array
const sucursales = [...SUCS];
sucursales.push("Todas");

const userProfile = getUserProfile();
const curSuc = userProfile ? userProfile.sucursal : null;
const curRole = userProfile ? userProfile.role : null;

const UserCard = ({ user, onClick, isSmall }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.USER,
    item: { id: user.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));
  return (
    <Button
      key={user.id}
      ref={drag}
      onClick={() => onClick(user)}
      sx={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Box
        textAlign="center"
        m={1}
        sx={{ width: isSmall ? 75 : 120, height: isSmall ? 130 : 191 }} // Ajusta el ancho que desees
      >
        <PersonIcon
          color={user.status ? "success" : "error"}
          sx={{
            fontSize: isSmall ? 60 : 80,
            borderRadius: 3,
            boxShadow: 2,
            "&:hover": { backgroundColor: "#f5f5f5" },
          }}
        />
        <Typography
          variant={"body2"}
          sx={{
            color: "black",
            whiteSpace: "normal", // Permite saltos de línea
            wordBreak: "break-word", // Rompe las palabras largas
            textAlign: "center",
            fontSize: isSmall ? 12 : 16,
          }}
        >
          {user.name}
        </Typography>
      </Box>
    </Button>
  );
};

const DroppableArea = ({ children, onDropAction, ...boxProps }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.USER,
    drop: (_, monitor) => {
      const { id } = monitor.getItem();
      onDropAction(id);
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }));
  return (
    <Box
      ref={drop}
      sx={{
        backgroundColor: isOver ? "#e0f7fa" : "transparent",
        transition: "background-color 0.2s",
      }}
      {...boxProps}
    >
      {children}
    </Box>
  );
};

const AddButton = ({ handleCreate, role }) => (
  <Box mt={1}>
    <IconButton onClick={() => handleCreate(role)} size="small">
      <AddIcon
        sx={{ fontSize: 40, color: "black", "&:hover": { color: "#FFC600" } }}
      />
    </IconButton>
  </Box>
);

const TeamPage = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditSchedule, setOpenEditSchedule] = useState(false);
  const [editSchedule, setEditSchedule] = useState(null);
  const [openManageUser, setOpenManageUser] = useState(null);
  const [manageUser, setManageUser] = useState(false);
  const [checklistMode, setChecklistMode] = useState(false);
  const [createUserRole, setCreateUserRole] = useState(null);
  const [sucFilter, setSucFilter] = useState(getSucursal());

  const vendorUsers = useMemo(
    () =>
      users.filter(
        (user) => user.role === ROLES.MYR_SELLER || user.role === ROLES.SELLER
      ),
    [users]
  );
  const techUsers = useMemo(
    () => users.filter((user) => user.role === ROLES.TECHNICIAN),
    [users]
  );

  const fetchUsers = useCallback(async () => {
    try {
      const [sellersRes, techniciansRes] = await Promise.all([
        api(`/api/users/sellers?sucursal=${sucFilter}`),
        api(`/api/users/technician/get?sucursal=${sucFilter}`),
      ]);
      if (!sellersRes.ok) throw new Error("Error al obtener vendedores");
      if (!techniciansRes.ok) throw new Error("Error al obtener técnicos");

      const sellersData = await sellersRes.json();
      const techniciansData = await techniciansRes.json();

      const combinedData = [...sellersData, ...techniciansData];
      setUsers(combinedData);
      console.log("Vendedores:", sellersData);
      console.log("Técnicos:", techniciansData);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  }, [sucFilter]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await api(`/api/team/get-all`);
      if (!response.ok) throw new Error("Error al obtener equipo");

      const teamData = await response.json();

      setAllUsers(teamData);
      console.log("Equipo:", teamData);
    } catch (error) {
      console.error("Error al obtener equipo:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchAllUsers();
  }, [fetchUsers, fetchAllUsers]);

  // Cuando se activa checklist mode todos los usuarios se deshabilitan
  useEffect(() => {
    if (checklistMode) {
      setUsers((prevUsers) =>
        prevUsers.map((user) => ({ ...user, status: false }))
      );
      (async () => {
        try {
          const response = await api(`/api/team/checklist`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sucursal: sucFilter, status: false }),
          });
          if (!response.ok)
            throw new Error("Error al cambiar el estado del usuario");
        } catch (error) {
          console.error("Error al cambiar el estado del usuario:", error);
        }
      })();
    }
  }, [checklistMode, sucFilter]);

  async function toggleStatus(editSchedule) {
    // MFM: Comentar con el backend
    try {
      const response = await api(`/api/team/toggle-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editSchedule.id,
          status: !editSchedule.status,
        }),
      });
      if (!response.ok)
        throw new Error("Error al cambiar el estado del usuario");
      const updatedUser = await response.json();
      setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    } catch (error) {
      console.error("Error al cambiar el estado del usuario:", error);
    }

    // Temporralmente cambiarlo de manera local
    setUsers(
      users.map((u) =>
        u.id === editSchedule.id ? { ...u, status: !u.status } : u
      )
    );
    setAllUsers(
      allUsers.map((u) =>
        u.id === editSchedule.id ? { ...u, status: !u.status } : u
      )
    );
    console.log(
      "Recordatorio para cambiar el estado del usuario en la base de datos"
    );
  }

  const handleCreateClose = () => {
    setOpenCreateDialog(false);
    setEditSchedule(null);
    setCreateUserRole(null);
  };

  const handleCreateUserSaved = (savedUser) => {
    setUsers([...users, savedUser]);
    handleCreateClose();
  };

  const handleEditClose = () => {
    setOpenEditSchedule(false);
    setEditSchedule(null);
  };

  const handleEditUserSaved = (savedUser) => {
    setUsers(users.map((u) => (u.id === savedUser.id ? savedUser : u)));
    handleEditClose();
  };

  const handleCreate = (role) => {
    setEditSchedule(null);
    setCreateUserRole(role);
    setOpenCreateDialog(true);
  };

  const handleManage = (user) => {
    if (checklistMode) {
      toggleStatus(user);
      return;
    }
    setManageUser(user);
    setOpenManageUser(true);
  };

  const handleEdit = (user) => {
    if (checklistMode) {
      toggleStatus(user);
      return;
    }
    setEditSchedule(user);
    setOpenEditSchedule(true);
  };

  const handleAssign = async (id, sucursal) => {
    if (!id || !sucursal) {
      window.showToast("Complete todos los campos requeridos");
      return;
    }
    try {
      const payload = { id, sucursal };
      const response = await api(`/api/users/migrate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.status === 409) {
        window.showToast("Este nombre de usuario ya existe");
        return;
      }
      if (!response.ok) throw new Error("Error al guardar el usuario");
      const savedUser = await response.json();
      handleEditUserSaved(savedUser);
      window.showToast("Usuario editado exitosamente");
      window.location.reload();
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      window.showToast("Error al guardar el usuario", "error");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Header
        title="Gestión de equipo por sucursal"
        actions={
          curRole >= ROLES.MARKETING ? (
            <FormControl sx={{ width: 200 }} variant="standard">
              <InputLabel>Sucursal</InputLabel>
              <Select
                label="Sucursal"
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
                    {" "}
                    {suc}{" "}
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
              sx={{ width: 170 }}
              variant="standard"
            />
          )
        }
      />
      <Box display="flex" justifyContent="flex-end" p={1}>
        <FormControlLabel
          label="Checklist Mode"
          labelPlacement="start"
          size="large"
          disabled={curRole < ROLES.MANAGER}
          control={
            <Switch
              checked={checklistMode}
              onChange={(event) => setChecklistMode(event.target.checked)}
              color="primary"
            />
          }
        />
      </Box>

      {curRole >= ROLES.MANAGER && (
        /* SOLO PUEDEN EDITAR ADMINISTRADORES */ <>
          <Typography variant="h5" gutterBottom>
            Vendedores
          </Typography>
          <DroppableArea
            onDropAction={(id) => handleAssign(id, sucFilter)}
            display="flex"
            flexWrap="wrap"
            justifyContent="left"
            sx={{ minHeight: 160 }}
            alignItems="flex-start"
          >
            {vendorUsers.map((user) => (
              <UserCard key={user.id} user={user} onClick={handleEdit} />
            ))}
            <AddButton handleCreate={handleCreate} role={ROLES.SELLER} />
          </DroppableArea>
        </>
      )}

      <Typography variant="h5" gutterBottom>
        {" "}
        Técnicos{" "}
      </Typography>
      <DroppableArea
        onDropAction={(id) => handleAssign(id, sucFilter)}
        display="flex"
        flexWrap="wrap"
        justifyContent="left"
        sx={{ minHeight: 160 }}
        alignItems="flex-start"
      >
        {techUsers.map((user) => (
          <UserCard key={user.id} user={user} onClick={handleEdit} />
        ))}
        <AddButton handleCreate={handleCreate} role={ROLES.TECHNICIAN} />
      </DroppableArea>

      <Typography variant="h5" gutterBottom>
        {" "}
        Equipo{" "}
      </Typography>
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="left"
        alignItems="flex-start"
      >
        {allUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            isSmall={true}
            onClick={handleManage}
          />
        ))}
        {/* <AddButton handleCreate={handleCreate} role={0} /> */}
      </Box>

      {openCreateDialog && (
        <CreateUserDialog
          open={openCreateDialog}
          handleClose={handleCreateClose}
          onUserSaved={handleCreateUserSaved}
          role={createUserRole}
          sucursal={sucFilter}
        />
      )}
      {openEditSchedule && (
        <EditSchedule
          open={openEditSchedule}
          handleClose={handleEditClose}
          onUserSaved={handleEditUserSaved}
          initialData={editSchedule}
          toggleStatus={toggleStatus}
          curRole={curRole}
        />
      )}
      {openManageUser && (
        <ManageUser
          open={openManageUser}
          handleClose={() => setOpenManageUser(false)}
          // onUserSaved={handleEditUserSaved}
          initialData={manageUser}
          toggleStatus={toggleStatus}
          curRole={curRole}
          handleAssign={handleAssign}
        />
      )}
    </DndProvider>
  );
};

export default TeamPage;
