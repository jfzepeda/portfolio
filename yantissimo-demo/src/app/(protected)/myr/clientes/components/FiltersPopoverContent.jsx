import React from "react";
import {
  Box,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { HERO_ALL_KEY } from "../constants";

const baseFilterConfig = [
  {
    key: "sucursal",
    label: "Sucursal",
    allLabel: "Todas",
    source: "sucursales",
  },
  {
    key: "linea",
    label: "Linea",
    allLabel: "Todas",
    source: "lineas",
  },
  {
    key: "client_type",
    label: "Tipo cliente",
    allLabel: "Todos",
    source: "client_types",
  },
  {
    key: "classification",
    label: "Clasificacion",
    allLabel: "Todas",
    source: "classifications",
  },
  {
    key: "pay_condition",
    label: "Condicion de pago",
    allLabel: "Todas",
    source: "pay_conditions",
  },
  {
    key: "credit_status",
    label: "Estatus",
    allLabel: "Todos",
    source: "credit_status",
  },
];

const FiltersPopoverContent = ({ filters, catalogs, onHeroFilterChange }) => (
  <Box
    sx={{
      width: { xs: "92vw", sm: 300 },
      maxWidth: "92vw",
      p: 2,
    }}
  >
    <Typography variant="subtitle1" sx={{ mb: 2 }}>
      Filtros
    </Typography>

    <Stack sx={{ gap: 1 }}>
      {baseFilterConfig.map((filterCfg) => (
        <FormControl key={filterCfg.key} size="small" fullWidth>
          <InputLabel>{filterCfg.label}</InputLabel>
          <Select
            label={filterCfg.label}
            value={filters[filterCfg.key] || ""}
            onChange={(event) => {
              const value = event.target.value;
              onHeroFilterChange(filterCfg.key)(
                new Set([value || HERO_ALL_KEY])
              );
            }}
          >
            <MenuItem value="">{filterCfg.allLabel}</MenuItem>
            {(catalogs[filterCfg.source] || []).map((option) => (
              <MenuItem key={String(option)} value={String(option)}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}

      <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
        <FormControl size="small" fullWidth>
          <InputLabel>Vendedor</InputLabel>
          <Select
            label="Vendedor"
            value={filters.seller_id || ""}
            onChange={(event) => {
              const value = event.target.value;
              onHeroFilterChange("seller_id")(new Set([value || HERO_ALL_KEY]));
            }}
          >
            <MenuItem value="">Todos</MenuItem>
            {(catalogs.sellers || []).map((seller) => (
              <MenuItem key={String(seller.id)} value={String(seller.id)}>
                {seller.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Stack>
  </Box>
);

export default FiltersPopoverContent;
