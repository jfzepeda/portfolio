"use client";
import { useMemo, useState, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  List,
  TextField,
  Toolbar,
  IconButton,
  Paper,
  Chip,
  ListItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveIcon from "@mui/icons-material/Remove";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useQuickQuote } from "~/lib/QuickQuoteContext.jsx";
import SaveSelection from "~/lib/saveItemsSelection";
import {
  getCotiprov,
  saveCotiprov,
  updateCotiprov,
  acceptCotiprov,
  deleteItem,
  deleteProveedor as deleteProv,
  duplicateCotiprov,
} from "~/lib/cotiprovApi.js";

// Estructura UI de grupo:
// { id, group_id, provider, items: [{ svcKey, service_id, articulo, price }], persisted, accepted }
export default function CotiProvPage({ cotId, quote, saveSelectionPath }) {
  const muiTheme = useTheme();
  const PRIMARY_COLOR = muiTheme.palette.primary.main;
  const { items, setAll } = useQuickQuote();
  const selectionSaveOptions = useMemo(
    () => ({
      priceMode: "byClientType",
      clientType: quote?.client_type || "PUBLICO",
    }),
    [quote?.client_type]
  );

  const allServices = useMemo(
    () =>
      Array.isArray(items)
        ? items.filter((it) => it?.categoria === "servicios")
        : [],
    [items]
  );

  // UI state
  const [groups, setGroups] = useState([]);
  const [poolSel, setPoolSel] = useState({}); // { [svcKey]: boolean }

  // Orden: aceptados primero, luego guardados (persisted), luego nuevos
  const sortedGroups = useMemo(() => {
    const rank = (g) => (g.accepted ? 0 : g.persisted ? 1 : 2);
    return [...groups].sort((a, b) => {
      const r = rank(a) - rank(b);
      if (r !== 0) return r;
      // desempate por nombre de proveedor y luego por id
      const pa = (a.provider || "").toLowerCase();
      const pb = (b.provider || "").toLowerCase();
      if (pa < pb) return -1;
      if (pa > pb) return 1;
      return String(a.id ?? a._tid ?? "").localeCompare(
        String(b.id ?? b._tid ?? "")
      );
    });
  }, [groups]);

  // Claves asignadas a cualquier grupo, para ocultarlas del pool de faltantes
  const assignedKeys = useMemo(() => {
    const s = new Set();
    const low = (v) => String(v || "").toLowerCase();
    for (const g of groups) {
      for (const it of g.items || []) {
        if (it.svcKey) s.add(it.svcKey);
        // Fallback: map por articulo a un servicio faltante actual
        if (it.articulo) {
          const hit = allServices.find(
            (svc) =>
              low(svc.origin) === "faltante" && svc.articulo === it.articulo
          );
          if (hit?.id) s.add(hit.id);
        }
      }
    }
    return s;
  }, [groups, allServices]);

  const faltantes = useMemo(() => {
    const low = (v) => String(v || "").toLowerCase();
    return allServices.filter(
      (svc) => low(svc.origin) === "faltante" && !assignedKeys.has(svc.id)
    );
  }, [allServices, assignedKeys]);

  // Cargar cotiprov existentes
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const rows = await getCotiprov(cotId);
        if (ignore) return;
        // Mapear filas a grupos UI
        const mapped = rows.map((r) => ({
          id: r.id,
          group_id: r.group_id,
          provider: r.provider,
          persisted: true,
          accepted: !!r.accepted,
          items: (r.items || []).map((it) => ({
            svcKey: findSvcKeyByArticulo(allServices, it.articulo),
            service_id: it.service_id ?? null,
            articulo: it.articulo || "Servicio",
            price: String(Number(it.price) || 0),
          })),
        }));
        setGroups(mapped);
      } catch (e) {
        console.warn("No se pudieron cargar cotizaciones de proveedor:", e);
      }
    })();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cotId]);

  const togglePool = useCallback((key) => {
    setPoolSel((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const doCotizar = useCallback(() => {
    const selected = faltantes.filter((f) => poolSel[f.id]);
    if (selected.length === 0) {
      window.showToast("Selecciona servicios faltantes para cotizar");
      return;
    }
    const id = crypto?.randomUUID?.() || String(Date.now() + Math.random());
    const group = {
      id: null,
      group_id: null,
      provider: "",
      persisted: false,
      accepted: false,
      items: selected.map((svc) => ({
        svcKey: svc.id,
        service_id: svc.service_id ?? null,
        articulo: svc.articulo || "Servicio",
        price: "",
      })),
    };
    setGroups((prev) => [...prev, { ...group, _tid: id }]);
    // limpiar selección del pool
    setPoolSel((prev) => {
      const next = { ...prev };
      for (const s of selected) delete next[s.id];
      return next;
    });
  }, [faltantes, poolSel]);

  const setProviderName = useCallback((tidOrId, name) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === tidOrId || g._tid === tidOrId ? { ...g, provider: name } : g
      )
    );
  }, []);

  const setItemPrice = useCallback((tidOrId, idx, value) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (!(g.id === tidOrId || g._tid === tidOrId)) return g;
        const items = [...(g.items || [])];
        if (!items[idx]) return g;
        items[idx] = { ...items[idx], price: value };
        return { ...g, items };
      })
    );
  }, []);

  const ensureItemsPayload = (itemsArr = []) =>
    itemsArr.map((it) => ({
      service_id: it.service_id ?? null,
      price: Number(it.price) || 0,
      articulo: it.articulo || "",
    }));

  const handleSave = useCallback(
    async (tidOrId) => {
      const g = groups.find((x) => x.id === tidOrId || x._tid === tidOrId);
      if (!g) return;
      const provider = (g.provider || "").trim();
      if (!provider) {
        window.showToast("Ingresa el nombre del proveedor");
        return;
      }
      const payloadItems = ensureItemsPayload(g.items);
      try {
        if (!g.persisted) {
          const saved = await saveCotiprov({
            quote_id: cotId,
            provider,
            items: payloadItems,
          });
          // reemplazar grupo con datos persistidos
          setGroups((prev) =>
            prev.map((x) =>
              x.id === tidOrId || x._tid === tidOrId
                ? {
                    ...x,
                    id: saved.id,
                    group_id: saved.group_id,
                    persisted: true,
                    provider: saved.provider,
                  }
                : x
            )
          );
          window.showToast("Cotización guardada");
        } else {
          const upd = await updateCotiprov({ id: g.id, items: payloadItems });
          setGroups((prev) =>
            prev.map((x) => (x.id === g.id ? { ...x, items: upd.items } : x))
          );
          window.showToast("Cotización actualizada");
        }
      } catch (e) {
        console.error(e);
        window.showToast("No se pudo guardar", "error");
      }
    },
    [groups, cotId]
  );

  const handleDuplicate = useCallback(
    async (tidOrId) => {
      const g = groups.find((x) => x.id === tidOrId || x._tid === tidOrId);
      if (!g || !g.persisted || !g.id) {
        window.showToast("Primero guarda la cotización del proveedor");
        return;
      }
      try {
        const suggested = (g.provider ? `${g.provider} copia` : "").trim();
        const name =
          window.prompt("Nombre del nuevo proveedor", suggested) || "";
        const provider = name.trim();
        if (!provider) {
          window.showToast("Nombre de proveedor requerido", "warning");
          return;
        }
        const dup = await duplicateCotiprov({
          id: g.id,
          provider,
        });
        const mapped = {
          id: dup.id,
          group_id: dup.group_id,
          provider: dup.provider,
          persisted: true,
          accepted: !!dup.accepted,
          items: (dup.items || []).map((it) => ({
            svcKey: findSvcKeyByArticulo(allServices, it.articulo),
            service_id: it.service_id ?? null,
            articulo: it.articulo || "Servicio",
            price: String(Number(it.price) || 0),
          })),
        };
        setGroups((prev) => [...prev, mapped]);
        window.showToast("Duplicado creado");
      } catch (e) {
        console.error(e);
        window.showToast("No se pudo duplicar", "error");
      }
    },
    [groups, allServices]
  );

  const handleAccept = useCallback(
    async (tidOrId) => {
      const g = groups.find((x) => x.id === tidOrId || x._tid === tidOrId);
      if (!g || !g.persisted || !g.id || !g.group_id) {
        window.showToast("Primero guarda la cotización del proveedor");
        return;
      }
      try {
        await acceptCotiprov({
          id: g.id,
          group_id: g.group_id,
          car_model_year: quote?.vehicle?.year,
        });
        // Marcar aceptado en UI (y desmarcar otros del mismo group_id)
        setGroups((prev) =>
          prev.map((x) =>
            x.group_id === g.group_id ? { ...x, accepted: x.id === g.id } : x
          )
        );
        // Reflejar en pre-cotización: asignar precio con margen y origen proveedor
        const next = (items || []).map((it) => {
          const hit = (g.items || []).find(
            (gi) => gi.svcKey === it.id || gi.articulo === it.articulo
          );
          if (!hit) return it;
          const base = Number(hit.price) || 0;
          // Margen de aumento de servicios
          return { ...it, price: base / 0.7, origin: g.provider };
        });
        setAll(next);
        try {
          if (saveSelectionPath) {
            await SaveSelection(cotId, saveSelectionPath, selectionSaveOptions);
          } else {
            await SaveSelection(cotId, "/prequotes", selectionSaveOptions);
          }
        } catch (_e) {}
        window.showToast("Cotización aceptada para " + g.provider);
      } catch (e) {
        console.error(e);
        window.showToast("No se pudo aceptar", "error");
      }
    },
    [
      groups,
      items,
      setAll,
      cotId,
      quote,
      saveSelectionPath,
      selectionSaveOptions,
    ]
  );

  const handleDelete = useCallback(
    async (tidOrId) => {
      const g = groups.find((x) => x.id === tidOrId || x._tid === tidOrId);
      if (!g) return;
      try {
        if (g.persisted) {
          await deleteProv({ id: g.id });
          // Quitar todos los grupos del mismo proveedor
          setGroups((prev) => prev.filter((x) => x.provider !== g.provider));
        } else {
          // remover grupo local y liberar sus items al pool
          setGroups((prev) =>
            prev.filter((x) => !(x._tid && x._tid === g._tid))
          );
        }
      } catch (e) {
        console.error(e);
        window.showToast("No se pudo eliminar", "error");
      }
    },
    [groups]
  );

  // Eliminar un servicio del grupo y regresarlo al pool de faltantes
  const handleRemoveItem = useCallback(
    async (tidOrId, itemIdx) => {
      setGroups((prev) =>
        prev.map((g) => {
          if (!(g.id === tidOrId || g._tid === tidOrId)) return g;
          const items = Array.isArray(g.items)
            ? g.items.filter((_, i) => i !== itemIdx)
            : [];
          return { ...g, items };
        })
      );
      await deleteItem({ id: tidOrId, itemIdx });

      if (saveSelectionPath) {
        await SaveSelection(cotId, saveSelectionPath, selectionSaveOptions);
      } else {
        await SaveSelection(cotId, "/prequotes", selectionSaveOptions);
      }
    },
    [cotId, saveSelectionPath, selectionSaveOptions]
  );

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Toolbar />
      <Box>
        <Typography variant="h5" gutterBottom>
          COTIZACIÓN A PROVEEDORES
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Selecciona servicios faltantes, crea un grupo y cotiza por proveedor.
        </Typography>
        <Divider color={PRIMARY_COLOR} sx={{ mb: 2 }} />

        {/* Faltantes */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Servicios faltantes
        </Typography>
        {faltantes.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No hay servicios faltantes disponibles.
          </Typography>
        ) : (
          <>
            <List dense sx={{ mb: 1 }}>
              {faltantes.map((svc) => (
                <ListItem key={svc.id} disableGutters>
                  <Checkbox
                    edge="start"
                    checked={!!poolSel[svc.id]}
                    onChange={() => togglePool(svc.id)}
                  />
                  <ListItemText
                    primary={svc.articulo}
                    secondary={`Origen: ${svc.origin || "Faltante"}`}
                  />
                </ListItem>
              ))}
            </List>
            <Button variant="contained" color="primary" onClick={doCotizar}>
              Cotizar
            </Button>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Grupos por proveedor */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Cotizaciones por proveedor
        </Typography>
        {sortedGroups.map((g, gi) => (
          <Paper
            key={g.id ?? g._tid ?? gi}
            variant="outlined"
            sx={{ p: 1.5, mb: 2 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 1 }}
            >
              <TextField
                label="Proveedor"
                size="small"
                value={g.provider}
                onChange={(e) =>
                  setProviderName(g.id ?? g._tid, e.target.value)
                }
                disabled={!!g.persisted}
              />
              <Chip
                size="small"
                label={g.persisted ? "Guardado" : "Nuevo"}
                color={g.persisted ? "success" : "warning"}
                variant="outlined"
              />
              {g.accepted && (
                <Chip size="small" color="info" label="Aceptado" />
              )}
              <Box sx={{ flexGrow: 1 }} />
              <Button
                color="success"
                startIcon={<CheckIcon />}
                onClick={() => handleAccept(g.id ?? g._tid)}
                disabled={!g.persisted}
              >
                Aceptar
              </Button>
              <Button
                color="contrast"
                onClick={() => handleSave(g.id ?? g._tid)}
              >
                Guardar
              </Button>
              <IconButton
                onClick={() => handleDuplicate(g.id ?? g._tid)}
                aria-label="Duplicar"
                disabled={!g.persisted}
              >
                <ContentCopyIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => handleDelete(g.id ?? g._tid)}
                aria-label="Eliminar proveedor"
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
            {g.items?.length ? (
              <List>
                {g.items.map((it, idx) => (
                  <ListItem
                    key={(it.svcKey ?? it.articulo ?? idx) + "-g"}
                    secondaryAction={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          label="Precio"
                          variant="standard"
                          size="small"
                          value={it.price ?? ""}
                          onChange={(e) =>
                            setItemPrice(g.id ?? g._tid, idx, e.target.value)
                          }
                          slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                          sx={{ width: 140 }}
                        />
                        <IconButton
                          color="error"
                          aria-label="Quitar servicio del grupo"
                          onClick={() => handleRemoveItem(g.id ?? g._tid, idx)}
                          size="small"
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    }
                  >
                    <ListItemText primary={it.articulo || "Servicio"} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay artículos en este grupo.
              </Typography>
            )}
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

function findSvcKeyByArticulo(services, articulo) {
  if (!articulo) return undefined;
  const hit = (services || []).find((s) => s?.articulo === articulo);
  return hit?.id;
}
