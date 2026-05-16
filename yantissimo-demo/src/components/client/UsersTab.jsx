"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getJson, postJson, putJson } from "~/lib/api";
import { ROLE_LABELS, ROLES } from "~/utils/global";
import CreateUserModal from "./CreateUserModal.jsx";
import EditUserModal from "./EditUserModal.jsx";

const roleOptions = [
  { value: ROLES.CLIENT, label: "Cliente" },
  { value: ROLES.CLIENT_ADMIN, label: "Admin Cliente" },
];

const UsersTab = ({ clientId, initialUsers = [], canEdit }) => {
  const [users, setUsers] = useState(initialUsers || []);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    setUsers(initialUsers || []);
  }, [initialUsers]);

  const loadUsers = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await getJson(`/api/dist/${clientId}/users`);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err?.message || "No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const handleCreateUser = async (payload) => {
    const data = await postJson(`/api/dist/${clientId}/users`, payload);
    const user = data?.user || data;
    setUsers((prev) => [user, ...prev]);
  };

  const handleUpdateUser = async (payload) => {
    if (!editingUser) return;
    const data = await putJson(
      `/api/dist/${clientId}/users/${editingUser.id}`,
      payload
    );
    const updated = data?.user || data || {};
    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? { ...u, ...updated } : u))
    );
  };

  const handleInactivate = async (user) => {
    if (!confirm(`¿Inactivar a ${user.name}?`)) return;
    try {
      await putJson(`/api/users/inactivate/${user.id}`, {});
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: false } : u))
      );
    } catch (err) {
      setErrorMsg(err?.message || "No se pudo inactivar el usuario.");
    }
  };

  const handleReactivate = async (user) => {
    if (!confirm(`¿Reactivar a ${user.name}?`)) return;
    try {
      await putJson(`/api/users/reactivate/${user.id}`, {});
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: true } : u))
      );
    } catch (err) {
      if (err?.status === 409) {
        setErrorMsg(
          "El nombre de usuario ya existe. Cambia el username para reactivar."
        );
      } else {
        setErrorMsg(err?.message || "No se pudo reactivar el usuario.");
      }
    }
  };

  const rows = useMemo(
    () =>
      (users || [])
        .slice()
        .sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || ""))
        ),
    [users]
  );

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">Usuarios</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={loadUsers} disabled={loading}>
            Recargar
          </Button>
          {canEdit ? (
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              Nuevo usuario
            </Button>
          ) : null}
        </Stack>
      </Stack>

      {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Usuario</TableCell>
            <TableCell>Rol</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((user) => {
            const active =
              user.status === true ||
              user.status === 1 ||
              user.status === "active" ||
              user.status === "activo";
            return (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{ROLE_LABELS[user.role] || user.role}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={active ? "Activo" : "Inactivo"}
                    color={active ? "success" : "default"}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => setEditingUser(user)}
                    disabled={!canEdit}
                  >
                    <EditIcon />
                  </IconButton>
                  {active ? (
                    <IconButton
                      onClick={() => handleInactivate(user)}
                      disabled={!canEdit}
                      color="error"
                    >
                      <BlockIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={() => handleReactivate(user)}
                      disabled={!canEdit}
                      color="success"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateUser}
        roleOptions={roleOptions}
      />
      <EditUserModal
        open={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        onSubmit={handleUpdateUser}
        roleOptions={roleOptions}
        user={editingUser}
      />
    </Box>
  );
};

export default UsersTab;
