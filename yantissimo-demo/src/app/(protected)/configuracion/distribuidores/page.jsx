"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  createDistribuidor,
  deleteDistribuidor,
  fetchDistribuidores,
  updateDistribuidor,
  blockDistribuidor,
  fetchSellers,
  fetchRutas,
  grantAccessDist,
} from "~/lib/apiDist";
import {
  Box,
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
  Typography,
  IconButton,
  Tooltip,
  InputAdornment,
  ButtonGroup,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClientesDistribuidoresTable from "./components/table";
import { getUserProfile, ROLES_CORP, ROLES_MYR } from "~/utils/session";
import DistribuidorFormDialog, {
  EMPTY_DISTRIBUIDOR_FORM,
  buildDistribuidorPayload,
  mapProspectToDistribuidorForm,
} from "./components/DistribuidorFormDialog.jsx";
import Header from "~/components/header";

const MODES = {
  CON_ACCESO: "con_acceso",
  SIN_ACCESO: "sin_acceso",
};
const ENDPOINT = "/api/dist?platformAccess=";

export default function ClientesDistribuidoresPage({
  initialMode = MODES.SIN_ACCESO,
}) {
  const userProfile = getUserProfile();
  const [mode, setMode] = useState(initialMode);
  const isConAcceso = mode === MODES.CON_ACCESO;

  const [rows, setRows] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sucursalFilter, setSucursalFilter] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState(() => ({ ...EMPTY_DISTRIBUIDOR_FORM }));
  const [isEdit, setIsEdit] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openGrantAccess, setOpenGrantAccess] = useState(false);
  const [grantTarget, setGrantTarget] = useState(null);
  const [grantForm, setGrantForm] = useState({
    username: "",
    password: "",
    phone: "",
  });
  const [grantingAccess, setGrantingAccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const sucursales = useMemo(() => {
    const set = new Set(rows.map((r) => r.sucursal).filter(Boolean));
    return Array.from(set).sort((a, b) => String(a).localeCompare(String(b)));
  }, [rows]);

  const filteredRows = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      const matchSucursal = sucursalFilter
        ? String(r.sucursal || "") === sucursalFilter
        : true;
      const matchSearch = s
        ? [r.company, r.seller_name, r.client_type].some((field) =>
            String(field || "")
              .toLowerCase()
              .includes(s)
          )
        : true;
      return matchSucursal && matchSearch;
    });
  }, [rows, searchTerm, sucursalFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchDistribuidores(
        ENDPOINT + (isConAcceso ? "true" : "false")
      );
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      window.showToast(e.message || "Error al cargar", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers(setSellers, form?.sucursal);
    fetchRutas(setRutas);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.sucursal, mode]);

  useEffect(() => {
    setOpenForm(false);
    setOpenDelete(false);
    setIsEdit(false);
    setDeleteTarget(null);
    setForm({ ...EMPTY_DISTRIBUIDOR_FORM });
  }, [mode]);

  const openCreate = () => {
    setIsEdit(false);
    setForm({ ...EMPTY_DISTRIBUIDOR_FORM });
    setOpenForm(true);
  };

  const openEdit = (row) => {
    setIsEdit(true);
    setForm({
      ...mapProspectToDistribuidorForm(row),
      id: row?.id ?? null,
    });
    setOpenForm(true);
  };

  const closeForm = () => {
    setOpenForm(false);
    setForm({ ...EMPTY_DISTRIBUIDOR_FORM });
  };

  const submitForm = async () => {
    const payload = buildDistribuidorPayload(form, { isConAcceso });

    try {
      if (isEdit) {
        delete payload.admin;
        const updated = await updateDistribuidor(form.id, payload);
        setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        window.showToast("Actualizado");
      } else {
        delete payload.credit_policy;
        const created = await createDistribuidor(payload);
        setRows((prev) => [created, ...prev]);
        window.showToast("Creado");
      }
      closeForm();
    } catch (e) {
      window.showToast(e.message || "Error al guardar", "error");
    }
  };

  const askDelete = (row) => {
    setDeleteTarget(row);
    setOpenDelete(true);
  };

  const closeDelete = () => {
    setOpenDelete(false);
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;

    try {
      await deleteDistribuidor(deleteTarget.id);
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      window.showToast("Eliminado");
      closeDelete();
    } catch (e) {
      window.showToast(e.message || "Error al eliminar", "error");
    }
  };

  const handleBlock = async (blockTarget, action) => {
    const blocked = await blockDistribuidor(blockTarget, action);
    if (!blocked) return;
    setRows((prev) => prev.map((r) => (r.id === blockTarget.id ? blocked : r)));
  };

  const openGrantAccessDialog = (row) => {
    setGrantTarget(row || null);
    setGrantForm({
      username: "",
      password: "",
      phone: String(row?.admin?.phone || row?.phone || ""),
    });
    setOpenGrantAccess(true);
  };

  const closeGrantAccessDialog = () => {
    setOpenGrantAccess(false);
    setGrantTarget(null);
    setGrantForm({ username: "", password: "", phone: "" });
  };

  const submitGrantAccess = async () => {
    if (!grantTarget?.id) return;
    const password = String(grantForm.password || "").trim();

    if (!password) {
      window.showToast("Contraseña obligatoria", "error");
      return;
    }

    setGrantingAccess(true);
    try {
      const { admin } = await grantAccessDist(grantTarget.id, {
        pacc: true,
        admin: {
          password,
        },
      });
      window.showToast("Acceso otorgado correctamente");
      // Cuadro para permitir que el usuaio copie el usuario admin generado automáticamente, y la contraseña
      const content = [
        `Usuario: ${admin.username}`,
        `Contraseña: ${admin.password}`,
      ].join("\n");

      window.copyboard?.({
        title: "Acceso otorgado correctamente",
        subtitle:
          "Copia las credenciales de acceso y compártelas con tu cliente. Es la única vez que podrás ver esta información",
        content,
      });
      closeGrantAccessDialog();
      await load();
    } catch (e) {
      window.showToast(e.message || "No se pudo otorgar acceso", "error");
    } finally {
      setGrantingAccess(false);
    }
  };

  const title = isConAcceso
    ? "Clientes con acceso a plataforma"
    : "Clientes sin acceso a plataforma";

  return (
    <Box>
      <Stack spacing={2}>
        <Header
          title={title}
          actions={
            <ButtonGroup
              variant="contained"
              value={mode}
              exclusive
              size="small"
              disabled={
                ![...ROLES_CORP, ...ROLES_MYR].includes(userProfile?.role)
              }
            >
              <Button
                color={mode === "con_acceso" ? "primary" : "secondary"}
                onClick={() => setMode("con_acceso")}
                value={MODES.CON_ACCESO}
              >
                Con acceso
              </Button>
              <Button
                color={mode === "sin_acceso" ? "primary" : "secondary"}
                onClick={() => setMode("sin_acceso")}
                value={MODES.SIN_ACCESO}
              >
                Sin acceso
              </Button>
            </ButtonGroup>
          }
        />

        <Box sx={{ display: "flex", mb: 2 }}>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
            }}
          >
            <FormControl sx={{ width: 200 }} variant="standard">
              <InputLabel id="sucursal-label">Sucursal</InputLabel>
              <Select
                labelId="sucursal-label"
                label="Sucursal"
                value={sucursalFilter}
                onChange={(e) => setSucursalFilter(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {sucursales.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <TextField
              label="Buscar por nombre"
              variant="standard"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 300 }}
            />
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              justifyContent: "flex-end",
              display: "flex",
            }}
          >
            <Tooltip title="Recargar">
              <span>
                <IconButton onClick={load} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreate}
                sx={{ ml: 2 }}
              >
                Nuevo
              </Button>
            </Box>
          </Box>
        </Box>

        <ClientesDistribuidoresTable
          rows={filteredRows}
          loading={loading}
          onEdit={openEdit}
          onDelete={askDelete}
          onToggleBlock={handleBlock}
          onGrantAccess={openGrantAccessDialog}
        />
      </Stack>

      <DistribuidorFormDialog
        open={openForm}
        onClose={closeForm}
        onSubmit={submitForm}
        form={form}
        setForm={setForm}
        isEdit={isEdit}
        isConAcceso={isConAcceso}
        sellers={sellers}
        rutas={rutas}
        userRole={userProfile?.role}
      />

      {/* Delete dialog */}
      <Dialog open={openDelete} onClose={closeDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Se eliminará <b>{deleteTarget?.company}</b> (id: {deleteTarget?.id}
            ).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDelete}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openGrantAccess}
        onClose={closeGrantAccessDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Dar acceso a distribuidor</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Cliente: <b>{grantTarget?.company || "-"}</b>
            </Typography>
            <TextField
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              value={grantForm.password}
              onChange={(e) =>
                setGrantForm((prev) => ({ ...prev, password: e.target.value }))
              }
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((p) => !p)}
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeGrantAccessDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={submitGrantAccess}
            disabled={grantingAccess}
          >
            {grantingAccess ? "Guardando..." : "Otorgar acceso"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
