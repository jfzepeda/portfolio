"use client";
import api, { post, del } from "~/lib/api";
import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Fab,
  CircularProgress,
  Tooltip,
  Autocomplete,
  Chip,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Rule as RuleIcon,
} from "@mui/icons-material";
import { fetchList, createItem, updateItem, deleteItem, API_BASE } from "./api";
import { marcasConocidas } from "~/utils/global";

// Dialog para gestionar detalles (rines) de un promo set
const DetailsDialog = ({ open, onClose, promoObject, endpoint }) => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    rim: "",
    set_2: "",
    set_4: "",
    contado: "",
    msi6: "",
    msi12: "",
    fourx3: "",
    ppl: "",
  });

  useEffect(() => {
    setRows(promoObject.details || []);
  }, [promoObject]);

  const delDetail = async (d) => {
    await del(`${API_BASE}/admin/${endpoint}/detail/${d.id}`);
    setRows(rows.filter((r) => r.id !== d.id));
  };

  function addRow(quickSave = false) {
    if (!form.rim) {
      console.log("Rin es obligatorio");
      if (!quickSave) window.showToast("Rin es obligatorio");
      return;
    }

    const newRow = {
      // generar id temporal para tener keys estables en React
      tempId: `tmp-${Date.now()}`,
      rim: form.rim,
      set_2: form.set_2,
      set_4: form.set_4,
      contado: form.contado,
      msi6: form.msi6,
      msi12: form.msi12,
      fourx3: form.fourx3,
      ppl: form.ppl,
    };

    // usar actualización funcional para no depender del valor antiguo de estado
    setRows((prev) => [...prev, newRow]);

    // limpiar formulario rápido
    setForm({
      rim: "",
      set_2: "",
      set_4: "",
      contado: "",
      msi6: "",
      msi12: "",
      fourx3: "",
      ppl: "",
    });
  }

  const saveDetail = async () => {
    // Construir un snapshot local con la posible última fila sin persistir
    const candidate = form.rim
      ? {
          rim: form.rim,
          set_2: form.set_2,
          set_4: form.set_4,
          contado: form.contado,
          msi6: form.msi6,
          msi12: form.msi12,
          fourx3: form.fourx3,
          ppl: form.ppl,
        }
      : null;

    const nextRows = candidate ? [...rows, candidate] : [...rows];

    // Solo enviar las que no tienen id (nuevas)
    const newDetails = nextRows.filter((r) => !r.id);

    if (newDetails.length === 0) {
      onClose();
      return;
    }

    await post(
      `${API_BASE}/admin/${endpoint}/${promoObject.id}/detail`,
      newDetails
    );

    // Refrescar desde el servidor para obtener IDs definitivos
    const data = await fetchList(endpoint);
    const updated = data.find((p) => p.id === promoObject.id) || {};
    setRows(updated.details || []);

    // Reset del formulario
    setForm({
      rim: "",
      set_2: "",
      set_4: "",
      contado: "",
      msi6: "",
      msi12: "",
      fourx3: "",
      ppl: "",
    });

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Sets — {promoObject.nombre || "Promo Set"}</DialogTitle>
      <DialogContent dividers>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Rin</TableCell>
              <TableCell>Contado %</TableCell>
              <TableCell>6 MSI %</TableCell>
              <TableCell>12 MSI %</TableCell>
              <TableCell>Set2 $</TableCell>
              <TableCell>Set4 $</TableCell>
              <TableCell>4x3</TableCell>
              <TableCell>PPL $</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={r.id || r.tempId || `i-${i}`}>
                <TableCell>{r.rim === 100 ? "Todos" : r.rim}</TableCell>
                <TableCell>{r.contado}%</TableCell>
                <TableCell>{r.msi6}%</TableCell>
                <TableCell>{r.msi12}%</TableCell>
                <TableCell>${r.set_2}</TableCell>
                <TableCell>${r.set_4}</TableCell>
                <TableCell>{r.fourx3}%</TableCell>
                <TableCell>${r.ppl}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => delDetail(r)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Divider sx={{ my: 1 }} />
        <DialogContent sx={{ display: "flex", gap: 1 }}>
          <TextField
            label="Rin"
            size="small"
            value={form.rim}
            onChange={(e) => setForm({ ...form, rim: e.target.value })}
          />
          <TextField
            label="Contado"
            size="small"
            value={form.contado}
            onChange={(e) => setForm({ ...form, contado: e.target.value })}
          />
          <TextField
            label="6 meses"
            size="small"
            value={form.msi6}
            onChange={(e) => setForm({ ...form, msi6: e.target.value })}
          />
          <TextField
            label="12 meses"
            size="small"
            value={form.msi12}
            onChange={(e) => setForm({ ...form, msi12: e.target.value })}
          />
          <TextField
            label="Desc Set 2"
            size="small"
            value={form.set_2}
            onChange={(e) => setForm({ ...form, set_2: e.target.value })}
          />
          <TextField
            label="Desc Set 4"
            size="small"
            value={form.set_4}
            onChange={(e) => setForm({ ...form, set_4: e.target.value })}
          />
          <TextField
            label="4x3"
            size="small"
            value={form.fourx3}
            onChange={(e) => setForm({ ...form, fourx3: e.target.value })}
          />
          <TextField
            label="PPL"
            size="small"
            value={form.ppl}
            onChange={(e) => setForm({ ...form, ppl: e.target.value })}
          />
          <IconButton color="primary" onClick={addRow}>
            <AddIcon />
          </IconButton>
        </DialogContent>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button color="primary" onClick={saveDetail}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Componente genérico para el contenido de cada catálogo
const CatalogTab = ({ config }) => {
  const { endpoint, columns, idField, label, hasDetails } = config;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState({});
  const [marcas, setMarcas] = useState(marcasConocidas);
  const [detailsDlg, setDetailsDlg] = useState({
    open: false,
    promoObject: null,
  });

  const load = async (ignore = false) => {
    setLoading(true);
    try {
      const data = await fetchList(endpoint);
      if (!ignore) setRows(data);
    } catch (err) {
      console.error("Error cargando catálogo:", err);
      if (!ignore) setRows([]);
      window.showToast(
        "No se pudo conectar con el servidor. Verifica tu red o el backend."
      );
    } finally {
      if (!ignore) setLoading(false);
    }
  };

  useEffect(() => {
    if (endpoint === "promos-brand") {
      (async () => {
        try {
          const marcas = await api("/api/formula/marcas");
          const data = await marcas.json();
          // Unir sin duplicados, comparando case-insensitive y preservando orden de la API
          const base = Array.isArray(data)
            ? data.filter((x) => typeof x === "string" && x.trim() !== "")
            : [];

          const seen = new Set();
          const merged = [...base, ...marcasConocidas].filter((m) => {
            const key = m.trim().toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          setMarcas(merged);
        } catch (err) {
          console.error("Error cargando marcas:", err);
        }
      })();
    }
    let ignore = false;
    load(ignore);
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const openEdit = (row = null) => {
    setEditRow(row);
    const initial = {};
    columns.forEach((c) => {
      if (c.field === "brands" || c.field === "brand") {
        initial[c.field] = row ? row[c.field] ?? [] : [];
      } else {
        initial[c.field] = row ? row[c.field] ?? "" : "";
      }
    });
    setForm(initial);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const body = { ...form };
    Object.keys(body).forEach((k) => {
      if (body[k] === "" || (Array.isArray(body[k]) && body[k].length === 0)) {
        body[k] = null;
      }
    });
    if (editRow) {
      await updateItem(endpoint, editRow[idField], body);
    } else {
      await createItem(endpoint, body);
    }
    setRows(await fetchList(endpoint));
    setDialogOpen(false);
  };

  const handleDelete = async (row) => {
    if (!window.confirm("¿Eliminar registro?")) return;
    await deleteItem(endpoint, row[idField]);
    setRows(rows.filter((r) => r !== row));
  };

  const handleClose = () => {
    setDetailsDlg({ open: false, promoObject: null });
    // hacer fetchList para refrescar los datos
    load();
  };

  return (
    <Paper>
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.field}>{col.label}</TableCell>
                ))}
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row[idField] || Math.random()}>
                  {columns.map((col) => (
                    <TableCell key={col.field}>
                      {endpoint === "promos-brand" &&
                        col.field === "typehard" && (
                          <Tooltip title="Tipo de descuento">
                            <Switch checked={row.typehard}></Switch>
                            {row.typehard ? "Sustituye" : "Suma"}
                          </Tooltip>
                        )}
                      {col.render
                        ? col.render(row[col.field], row)
                        : Array.isArray(row[col.field])
                        ? row[col.field].join(", ")
                        : row[col.field]}
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    {hasDetails && (
                      <Tooltip title="Rines">
                        <IconButton
                          size="small"
                          onClick={() =>
                            setDetailsDlg({ open: true, promoObject: row })
                          }
                        >
                          <RuleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => openEdit(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(row)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        onClick={() => openEdit()}
      >
        <AddIcon />
      </Fab>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editRow ? "Editar" : "Nuevo"} — {label}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          {columns
            .filter((c) => c.field !== "rules")
            .map((col) =>
              col.field === "brands" || col.field === "brand" ? (
                <Autocomplete
                  key={col.field}
                  multiple
                  freeSolo
                  options={marcas}
                  value={form[col.field] ?? []}
                  onChange={(e, newValue) =>
                    setForm({ ...form, [col.field]: newValue })
                  }
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={index}
                        label={option}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label={col.label} size="small" />
                  )}
                  fullWidth
                />
              ) : col.field === "typehard" ? (
                <FormControlLabel
                  control={
                    <Switch
                      checked={form[col.field] ?? false}
                      onChange={(e, checked) =>
                        setForm({ ...form, [col.field]: checked })
                      }
                    />
                  }
                  label={form[col.field] ? "Sustituye" : "Suma"}
                  labelPlacement="end"
                />
              ) : (
                <TextField
                  key={col.field}
                  label={col.label}
                  value={form[col.field] ?? ""}
                  type={typeof form[col.field] === "number" ? "number" : "text"}
                  onChange={(e) =>
                    setForm({ ...form, [col.field]: e.target.value })
                  }
                  fullWidth
                  size="small"
                />
              )
            )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      {detailsDlg.open && (
        <DetailsDialog
          open={detailsDlg.open}
          onClose={handleClose}
          promoObject={detailsDlg.promoObject}
          endpoint={endpoint}
        />
      )}
    </Paper>
  );
};

export default CatalogTab;
