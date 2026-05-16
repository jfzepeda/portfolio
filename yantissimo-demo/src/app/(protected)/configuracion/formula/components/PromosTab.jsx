"use client";
import api from "~/lib/api";
import React, { useEffect, useMemo, useState } from "react";
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Fab,
  IconButton,
  Tooltip,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from "@mui/icons-material";
import { fetchList, createItem, updateItem, deleteItem } from "./api";
import { marcasConocidas } from "~/utils/global";
import { conditionsToSummary, rinesToSummary } from "./promos/formatters";
import { OPERATORS, PROVEEDORES, VARIANTS } from "./promos/constants";
import {
  availableColumnsForVariant,
  suggestNextPriority,
} from "./promos/filters";
import {
  makeEmptyRinRow,
  parseConditionsForEdit,
  parseRinesFromRow,
  sanitizeConditionsForSave,
  serializeRinesForSave,
} from "./promos/mappers";
import ConditionsEditor from "./promos/ConditionsEditor";
import RinesEditor from "./promos/RinesEditor";

// Formatters imported from ./promos/formatters

// Constants, helpers, and editors are imported from ./promos/*

const PromosTab = ({ variant = VARIANTS.EXCLUDE_SKU } = {}) => {
  const endpoint = "promos";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [priority, setPriority] = useState(0);
  const [conditions, setConditions] = useState([]);
  const [rinesRows, setRinesRows] = useState([]);
  const [marcas, setMarcas] = useState(marcasConocidas);
  const [dragIndex, setDragIndex] = useState(null);

  // columnas disponibles según variante
  const COLUMNS = useMemo(() => availableColumnsForVariant(variant), [variant]);

  const nextPriority = () => suggestNextPriority(rows);

  const moveItem = (list, from, to) => {
    if (from === to || from == null || to == null) return list;
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  };

  const persistOrder = async (ordered) => {
    try {
      // Actualizar prioridades solo para los visibles según variante
      const mapping = new Map();
      if (variant === VARIANTS.EXCLUDE_SKU) {
        ordered.forEach((r, i) => mapping.set(r.id, i + 1)); // inicia en 1
      } else {
        ordered.forEach((r) => mapping.set(r.id, 0)); // siempre 0
      }

      await Promise.all(
        Array.from(mapping.entries()).map(([id, p]) =>
          updateItem(endpoint, id, { priority: p })
        )
      );
      setRows((prev) =>
        prev.map((r) =>
          mapping.has(r.id) ? { ...r, priority: mapping.get(r.id) } : r
        )
      );
      window?.showToast?.("Orden actualizado");
    } catch (err) {
      console.error("Error al actualizar orden/prioridades:", err);
      window?.showToast?.("No se pudo actualizar el orden");
      // intentar recargar para no dejar estado inconsistente
      load();
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchList(endpoint, { variant });
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading promos:", err);
      setRows([]);
      window?.showToast?.(
        "No se pudo cargar promociones. Verifica conexión/API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = (row = null) => {
    setEditRow(row);
    if (row) {
      setPriority(row.priority ?? (variant === VARIANTS.SKU_ONLY ? 0 : 1));
      setConditions(parseConditionsForEdit(row.conditions));
      setRinesRows(parseRinesFromRow(row.rines));
    } else {
      setPriority(variant === VARIANTS.SKU_ONLY ? 0 : nextPriority());
      setConditions([]);
      setRinesRows([]);
    }
    setDialogOpen(true);
  };

  const addCondition = () => {
    setConditions((prev) => [
      ...prev,
      { column: COLUMNS[0], operator: OPERATORS[0], param: [] },
    ]);
  };

  const updateCondition = (idx, patch) => {
    setConditions((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, ...patch } : c))
    );
  };

  const removeCondition = (idx) => {
    setConditions((prev) => prev.filter((_, i) => i !== idx));
  };

  const addRinRow = () => setRinesRows((prev) => [...prev, makeEmptyRinRow()]);
  const updateRinRow = (index, patch) => {
    setRinesRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );
  };
  const removeRinRow = (index) => {
    setRinesRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const allowedColumns = COLUMNS;
    const sanitizedConditions = sanitizeConditionsForSave(
      conditions,
      allowedColumns
    );
    const body = {
      priority:
        variant === VARIANTS.SKU_ONLY
          ? 0
          : Number(priority) > 0
          ? Number(priority)
          : 1,
      conditions: sanitizedConditions,
      rines: serializeRinesForSave(rinesRows),
    };
    try {
      if (editRow) {
        await updateItem(endpoint, editRow.id, body);
      } else {
        await createItem(endpoint, body);
      }
      await load();
      setDialogOpen(false);
      window?.showToast?.("Guardado");
    } catch (err) {
      console.error("Error saving promo:", err);
      window?.showToast?.("No se pudo guardar");
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm("¿Eliminar promoción?")) return;
    try {
      await deleteItem(endpoint, row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (err) {
      console.error("Error deleting promo:", err);
      window?.showToast?.("No se pudo eliminar");
    }
  };

  // ConditionsEditor and RinesEditor moved to ./promos subcomponents

  return (
    <Paper>
      {loading ? (
        <Box p={2} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={32} />
                <TableCell>Prioridad</TableCell>
                <TableCell>Condiciones</TableCell>
                <TableCell>Rines</TableCell>
                <TableCell>RI</TableCell>
                <TableCell>RS</TableCell>
                <TableCell>4x3</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(() => {
                const visibleRows = [...rows].sort(
                  (a, b) => (a.priority || 0) - (b.priority || 0)
                );
                return visibleRows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    draggable={variant !== VARIANTS.SKU_ONLY}
                    onDragStart={() =>
                      variant !== VARIANTS.SKU_ONLY && setDragIndex(index)
                    }
                    onDragOver={(e) =>
                      variant !== VARIANTS.SKU_ONLY && e.preventDefault()
                    }
                    onDrop={() => {
                      if (variant === VARIANTS.SKU_ONLY) return;
                      if (dragIndex == null) return;
                      const reordered = moveItem(visibleRows, dragIndex, index);
                      setDragIndex(null);
                      // Persistir prioridades según el nuevo orden (1..n)
                      persistOrder(reordered);
                    }}
                    sx={{
                      cursor:
                        variant !== VARIANTS.SKU_ONLY ? "grab" : "default",
                    }}
                  >
                    <TableCell width={32} sx={{ pr: 0 }}>
                      {variant !== VARIANTS.SKU_ONLY && (
                        <DragIcon
                          fontSize="small"
                          sx={{ color: "text.secondary" }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{row.priority}</TableCell>
                    <TableCell>{conditionsToSummary(row.conditions)}</TableCell>
                    <TableCell>{rinesToSummary(row.rines)}</TableCell>
                    <TableCell>
                      <Switch
                        size="small"
                        checked={!!row.redondeo_regular}
                        onChange={async (e) => {
                          const val = e.target.checked;
                          setRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, redondeo_regular: val }
                                : r
                            )
                          );
                          try {
                            await updateItem(endpoint, row.id, {
                              redondeo_regular: val,
                            });
                          } catch (err) {
                            console.error(
                              "Error toggling redondeo_regular:",
                              err
                            );
                            setRows((prev) =>
                              prev.map((r) =>
                                r.id === row.id
                                  ? { ...r, redondeo_regular: !val }
                                  : r
                              )
                            );
                            window?.showToast?.("No se pudo actualizar");
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        size="small"
                        checked={!!row.redondeo_sets}
                        onChange={async (e) => {
                          const val = e.target.checked;
                          setRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id ? { ...r, redondeo_sets: val } : r
                            )
                          );
                          try {
                            await updateItem(endpoint, row.id, {
                              redondeo_sets: val,
                            });
                          } catch (err) {
                            console.error("Error toggling redondeo_sets:", err);
                            setRows((prev) =>
                              prev.map((r) =>
                                r.id === row.id
                                  ? { ...r, redondeo_sets: !val }
                                  : r
                              )
                            );
                            window?.showToast?.("No se pudo actualizar");
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        size="small"
                        checked={!!row.fourx3}
                        onChange={async (e) => {
                          const val = e.target.checked;
                          setRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id ? { ...r, fourx3: val } : r
                            )
                          );
                          try {
                            await updateItem(endpoint, row.id, {
                              fourx3: val,
                            });
                          } catch (err) {
                            console.error("Error toggling fourx3:", err);
                            setRows((prev) =>
                              prev.map((r) =>
                                r.id === row.id
                                  ? { ...r, fourx3: !val }
                                  : r
                              )
                            );
                            window?.showToast?.("No se pudo actualizar");
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
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
                ));
              })()}
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
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{editRow ? "Editar" : "Nueva"} — Promoción</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            label="Prioridad"
            size="small"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={variant === VARIANTS.SKU_ONLY}
            sx={{ maxWidth: 240, my: 2 }}
          />
          <Divider />
          <ConditionsEditor
            conditions={conditions}
            onAdd={addCondition}
            onUpdate={updateCondition}
            onRemove={removeCondition}
            availableColumns={COLUMNS}
            operadores={OPERATORS}
            marcas={marcas}
            proveedores={PROVEEDORES}
          />
          <Divider sx={{ my: 1 }} />
          <RinesEditor
            rows={rinesRows}
            onAdd={addRinRow}
            onUpdate={updateRinRow}
            onRemove={removeRinRow}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PromosTab;
