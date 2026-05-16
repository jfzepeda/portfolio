"use client";
import { useCallback, useEffect, useState } from "react";
import api from "~/lib/api";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  isSelected as isItemStored,
  toggle as toggleStoredItem,
  setUnits as setStoredUnits,
  getAll as getStoredItems,
} from "~/lib/quickQuoteStorage.js";
import { currencyFormatter } from "~/utils/formaters.js";

export default function ServicesList({ searchTerm, onSelectionChange }) {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const term = (searchTerm || "").trim();
    if (!term) {
      setServices([]);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    async function fetchServices() {
      try {
        const res = await api(
          `/api/inv/servicios?searchTerm=${encodeURIComponent(term)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Error al cargar servicios");
        const data = await res.json();
        console.log("[ServicesList] fetched:", data);
        // Normaliza respuesta a array de objetos con name y precio
        const raw = Array.isArray(data) ? data : data?.results || [];
        if (!cancelled) setServices(raw.slice(0, 200));
      } catch (err) {
        if (err?.name === "AbortError") return;
        if (!cancelled) setServices([]);
        console.error("[ServicesList] fetch error:", err);
      } finally {
        // no-op
      }
    }
    fetchServices();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [searchTerm]);

  const toItem = useCallback(
    (service) => {
      const id = `svc:${service.nombre}`;
      const idx = services.findIndex((s) => s.nombre === service.nombre);
      return {
        id,
        articulo: service.nombre,
        categoria: "servicios",
        price: service.precio,
        origin: service.precio > 0 ? "Yantissimo" : "Faltante",
        service_id: idx >= 0 ? idx : undefined,
        inventory_id: service.id,
      };
    },
    [services]
  );

  // moved below getQty

  const isSelected = useCallback(
    (service) => isItemStored(`svc:${service.nombre}`),
    []
  );

  // Local quantities per item id for items not yet added
  const [localQty, setLocalQty] = useState({});

  const getQty = useCallback(
    (service) => {
      const id = `svc:${service.nombre}`;
      // If already selected, reflect stored units
      const stored = getStoredItems()?.find((it) => it?.id === id);
      if (stored && Number(stored.units) > 0) return Math.floor(stored.units);
      // Fallback to local state; start UI at 0 regardless of preUnits
      const q = localQty[id] ?? 0;
      const asInt = Math.max(0, Math.floor(Number(q) || 0));
      return asInt;
    },
    [localQty]
  );

  const incQty = useCallback(
    (service) => {
      const id = `svc:${service.nombre}`;
      if (isItemStored(id)) {
        const next = getQty(service) + 1;
        setStoredUnits(id, next);
        if (typeof onSelectionChange === "function") onSelectionChange();
      } else {
        const next = (getQty(service) || 0) + 1;
        // On first increment to 1, auto-add to cart
        if (next === 1) {
          const item = toItem(service);
          toggleStoredItem(item, next);
          if (typeof onSelectionChange === "function") onSelectionChange();
        } else {
          setLocalQty((prev) => ({ ...prev, [id]: next }));
        }
      }
    },
    [getQty, onSelectionChange, toItem]
  );

  const decQty = useCallback(
    (service) => {
      const id = `svc:${service.nombre}`;
      const cur = getQty(service);
      const next = Math.max(0, cur - 1);
      if (isItemStored(id)) {
        setStoredUnits(id, next);
        if (typeof onSelectionChange === "function") onSelectionChange();
      } else {
        setLocalQty((prev) => ({ ...prev, [id]: next }));
      }
    },
    [getQty, onSelectionChange]
  );

  const handleToggle = useCallback(
    (service) => {
      const item = toItem(service);
      const currentUnits = getQty(service);
      toggleStoredItem(item, currentUnits);
      if (typeof onSelectionChange === "function") onSelectionChange();
    },
    [getQty, onSelectionChange, toItem]
  );

  return (
    <Box>
      <List dense disablePadding>
        {services?.map((service, idx) => (
          <ListItem
            key={`${service.nombre}-${idx}`}
            divider
            secondaryAction={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  variant="body2"
                  sx={{ p: 0, m: 0, minWidth: 64, textAlign: "right" }}
                >
                  {service.precio ? currencyFormatter(service.precio) : ""}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => decQty(service)}
                  aria-label="disminuir"
                >
                  -
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{ width: 24, textAlign: "center" }}
                >
                  {getQty(service)}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => incQty(service)}
                  aria-label="aumentar"
                >
                  +
                </IconButton>
                {isSelected(service) && (
                  <Tooltip title="Quitar">
                    <IconButton
                      edge="end"
                      onClick={() => handleToggle(service)}
                    >
                      <DeleteOutlineIcon color="error" fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            }
          >
            <ListItemText primary={service.nombre} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
