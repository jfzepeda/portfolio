"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dayjs from "dayjs";
import {
  Alert,
  Autocomplete,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import SuperTable from "~/components/tables/SuperTable";
import { getUserProfile, ROLES } from "~/utils/session";
import { fetchSnapshotItem, fetchInvList } from "./snapshotsApi";
import Header from "~/components/header";

const DAY_OPTIONS = [1, 3, 7, 14, 30];
const DEFAULT_DAYS = 7;

const formatDate = (value) => {
  if (!value) return "—";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY HH:mm") : "—";
};

const compareByDate = (a, b) => {
  const da = dayjs(a.snapshotDate);
  const db = dayjs(b.snapshotDate);
  if (da.isValid() && db.isValid()) return db.valueOf() - da.valueOf();
  return 0;
};

const PRICE_COLUMNS = [
  {
    key: "snapshotDate",
    label: "Fecha",
    type: "text",
    render: (v) => formatDate(v),
    sticky: true,
    stickyOffset: 0,
    minWidth: 150,
  },
  {
    key: "precio_lista",
    label: "Precio Lista",
    type: "currency",
    align: "right",
  },
  {
    key: "precio_contado",
    label: "P. Contado",
    type: "currency",
    align: "right",
  },
  {
    key: "contado_dist",
    label: "Contado Dist.",
    type: "currency",
    align: "right",
  },
  {
    key: "credito_dist",
    label: "Crédito Dist.",
    type: "currency",
    align: "right",
  },
  {
    key: "precio_marina",
    label: "P. Marina",
    type: "currency",
    align: "right",
  },
  {
    key: "precio_convenio",
    label: "Convenio",
    type: "currency",
    align: "right",
  },
  { key: "seis_meses", label: "6 MSI", type: "currency", align: "right" },
  { key: "doce_meses", label: "12 MSI", type: "currency", align: "right" },
  { key: "promo_2pz", label: "Promo 2pz", type: "currency", align: "right" },
  { key: "promo_4pz", label: "Promo 4pz", type: "currency", align: "right" },
  { key: "credito", label: "Crédito", type: "currency", align: "right" },
  { key: "volumen_10", label: "Vol. 10", type: "currency", align: "right" },
  {
    key: "vol_10_cred",
    label: "Vol. 10 Créd.",
    type: "currency",
    align: "right",
  },
];

function useInvSearch() {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const search = useCallback((term) => {
    clearTimeout(timerRef.current);
    if (!term?.trim()) {
      setOptions([]);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const rows = await fetchInvList(term);
        setOptions(rows);
      } catch (_) {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  return { options, loading, search };
}

function useSnapshotItem(itemId, days, enabled) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!enabled || !itemId) {
      setData([]);
      setLoading(false);
      setError("");
      return;
    }
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const rows = await fetchSnapshotItem({ itemId, days });
        if (cancelled) return;
        setData(rows);
      } catch (err) {
        if (cancelled) return;
        setData([]);
        setError(
          err?.message || "No se pudo cargar el historial del artículo."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [days, enabled, itemId]);

  return { data, loading, error };
}

export default function SnapshotsPage() {
  const [profile, setProfile] = useState(null);
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const {
    options: productOptions,
    loading: invLoading,
    search: searchInv,
  } = useInvSearch();
  const {
    data: itemData,
    loading: itemLoading,
    error: itemError,
  } = useSnapshotItem(selectedProduct?.id, days, !!selectedProduct);

  useEffect(() => {
    try {
      setProfile(getUserProfile());
    } catch (_) {
      setProfile(null);
    }
  }, []);

  const canView = (profile?.role ?? 0) >= ROLES.MARKETING;

  const tableRows = useMemo(
    () =>
      [...itemData].sort(compareByDate).map((snapshot) => ({
        id: snapshot.id,
        snapshotDate: snapshot.snapshotDate,
        ...snapshot.priceFields,
      })),
    [itemData]
  );

  if (profile && !canView) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        No tienes permisos para consultar el historial de precios.
      </Alert>
    );
  }

  return (
    <Box>
      <Header
        title="Historial de Precios"
        subtitle={
          selectedProduct
            ? selectedProduct.articulo
            : "Busca un artículo para ver la evolución de sus precios"
        }
      />

      {/* Filters */}
      <Box sx={{ display: "flex", alignItems: "flex-end", mb: 2 }}>
        <FormControl variant="standard" sx={{ width: 100 }}>
          <InputLabel>Días</InputLabel>
          <Select
            label="Días"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            {DAY_OPTIONS.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Autocomplete
          options={productOptions}
          value={selectedProduct}
          onChange={(_, value) => setSelectedProduct(value)}
          onInputChange={(_, value) => searchInv(value)}
          loading={invLoading}
          filterOptions={(x) => x}
          getOptionLabel={(opt) => opt.articulo || ""}
          isOptionEqualToValue={(opt, val) => opt.id === val.id}
          sx={{
            width: 400,
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar artículo"
              placeholder="Nombre, marca, descripción..."
              variant="standard"
            />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <Typography variant="body2">{option.articulo}</Typography>
            </li>
          )}
        />
      </Box>

      {itemError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {itemError}
        </Alert>
      )}

      {!selectedProduct ? (
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            Selecciona un artículo para ver su historial de precios
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Usa el buscador para encontrar el artículo por nombre, marca o
            categoría.
          </Typography>
        </Box>
      ) : (
        <SuperTable
          rows={tableRows}
          columns={PRICE_COLUMNS}
          rowKey="id"
          loading={itemLoading}
          emptyMessage={`Sin historial en los últimos ${days} días.`}
          sortable
          defaultSortColumn="snapshotDate"
          defaultSortOrder="desc"
          stickyHeader
          maxHeight="70vh"
          dense
        />
      )}
    </Box>
  );
}
