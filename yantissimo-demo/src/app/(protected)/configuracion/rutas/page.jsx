"use client";
import api, { post, put, del } from "~/lib/api";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import Header from "~/components/header";

const DAYS = [
  { value: 1, label: "Lun", full: "Lunes" },
  { value: 2, label: "Mar", full: "Martes" },
  { value: 3, label: "Mie", full: "Miercoles" },
  { value: 4, label: "Jue", full: "Jueves" },
  { value: 5, label: "Vie", full: "Viernes" },
  { value: 6, label: "Sab", full: "Sabado" },
  { value: 7, label: "Dom", full: "Domingo" },
];

const DAY_MAP = new Map(DAYS.map((d) => [d.value, d]));
const DAY_VALUES = new Set(DAYS.map((d) => d.value));

function normalizeFrecuencia(list) {
  if (!Array.isArray(list)) return [];
  const normalized = list
    .map((v) => Number(v))
    .filter((v) => Number.isInteger(v) && DAY_VALUES.has(v));
  return Array.from(new Set(normalized));
}

function freqArrayToText(freq) {
  if (!Array.isArray(freq)) return "";
  return freq.map((v) => DAY_MAP.get(v)?.label || String(v)).join(", ");
}

export default function RutasPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog create/edit
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null); // {id, zona, frecuencia}
  const [zona, setZona] = useState("");
  const [frecuencia, setFrecuencia] = useState([]);
  const [formError, setFormError] = useState("");

  // Delete confirm
  const [openDelete, setOpenDelete] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // Snackbar
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const endpoint = "/api/rutas";

  const showSnack = (message, severity = "success") => {
    setSnack({ open: true, message, severity });
  };

  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const fetchRutas = async () => {
    setLoading(true);
    try {
      const res = await api(endpoint);

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Error HTTP ${res.status}`);
      }

      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      showSnack("No se pudieron cargar las rutas", "error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRutas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setZona("");
    setFrecuencia([]);
    setFormError("");
    setOpenForm(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setZona(row?.zona ?? "");
    setFrecuencia(normalizeFrecuencia(row?.frecuencia));
    setFormError("");
    setOpenForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setOpenForm(false);
  };

  const submitForm = async () => {
    setFormError("");

    const z = (zona ?? "").trim();
    if (!z) {
      setFormError("zona es requerida");
      return;
    }

    const normalizedFrecuencia = normalizeFrecuencia(frecuencia);

    const payload = {
      zona: z,
      frecuencia: normalizedFrecuencia, // [] permitido
    };

    setSaving(true);
    try {
      const isEdit = Boolean(editing?.id);
      const url = isEdit ? `${endpoint}/${editing.id}` : endpoint;

      const res = await (isEdit ? put : post)(url, payload);

      if (!res.ok) {
        let msg = "Error al guardar";
        try {
          const j = await res.json();
          msg = j?.message || msg;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      showSnack(isEdit ? "Ruta actualizada" : "Ruta creada", "success");
      setOpenForm(false);
      await fetchRutas();
    } catch (e) {
      console.error(e);
      setFormError(e?.message || "Error al guardar");
      showSnack("No se pudo guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const askDelete = (row) => {
    setToDelete(row);
    setOpenDelete(true);
  };

  const closeDelete = () => {
    if (saving) return;
    setOpenDelete(false);
    setToDelete(null);
  };

  const confirmDelete = async () => {
    if (!toDelete?.id) return;

    setSaving(true);
    try {
      const res = await del(`${endpoint}/${toDelete.id}`);

      if (!res.ok) {
        let msg = "Error al eliminar";
        try {
          const j = await res.json();
          msg = j?.message || msg;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      showSnack("Ruta eliminada", "success");
      setOpenDelete(false);
      setToDelete(null);
      await fetchRutas();
    } catch (e) {
      console.error(e);
      showSnack(e?.message || "No se pudo eliminar", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Header
        title="Rutas"
        titleSx={{ typography: "h5", fontWeight: 700 }}
        sx={{ pt: 0 }}
        actions={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Recargar">
              <span>
                <IconButton onClick={fetchRutas} disabled={loading || saving}>
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreate}
              disabled={saving}
            >
              Nueva ruta
            </Button>
          </Stack>
        }
      />

      <Box
        sx={{
          mt: 3,
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Listado
          </Typography>
          {(loading || saving) && <CircularProgress size={18} />}
        </Box>

        <Box sx={{ p: 2 }}>
          {loading ? (
            <Stack alignItems="center" sx={{ py: 6 }} spacing={2}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Cargando...
              </Typography>
            </Stack>
          ) : rows.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No hay rutas registradas.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small" sx={{ minWidth: 720 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 80 }}>
                      <Typography variant="caption" color="text.secondary">
                        ID
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ width: 320 }}>
                      <Typography variant="caption" color="text.secondary">
                        Zona
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        Frecuencia
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ width: 120 }}>
                      <Typography variant="caption" color="text.secondary">
                        Acciones
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>
                        <Typography variant="body2">{r.id}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{r.zona}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {freqArrayToText(r.frecuencia) || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Editar">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => openEdit(r)}
                                disabled={saving}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => askDelete(r)}
                                disabled={saving}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={openForm} onClose={closeForm} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Editar ruta" : "Nueva ruta"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}

            <TextField
              label="Zona"
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              fullWidth
              autoFocus
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Frecuencia
              </Typography>
              <ToggleButtonGroup
                value={frecuencia}
                onChange={(_event, next) => setFrecuencia(next)}
                size="small"
              >
                {DAYS.map((day) => (
                  <ToggleButton key={day.value} value={day.value}>
                    {day.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Selecciona los dias de visita (vacio = sin frecuencia).
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeForm} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={submitForm} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDelete} onClose={closeDelete} fullWidth maxWidth="xs">
        <DialogTitle>Eliminar ruta</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 1 }}>
            ¿Eliminar la ruta <b>#{toDelete?.id}</b> ({toDelete?.zona})?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDelete} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={saving}
          >
            {saving ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={closeSnack}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
