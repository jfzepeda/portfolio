import React from "react";
import {
  Box,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListSubheader,
  TextField,
  IconButton,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

const FiltersToolbar = ({
  period,
  search,
  periodOptions,
  onPeriodChange,
  onSearchChange,
  isFiltersMenuOpen,
  onOpenFilters,
}) => (
  <Box sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 2 }}>
    <Stack direction="row" spacing={2} alignItems="center">
      <FormControl sx={{ minWidth: 220 }} size="small">
        <InputLabel>Periodo</InputLabel>
        <Select value={period} label="Periodo" onChange={onPeriodChange}>
          {periodOptions.quarterOptions.length > 0 && (
            <ListSubheader>Trimestres</ListSubheader>
          )}
          {periodOptions.quarterOptions.map((periodOption) => (
            <MenuItem key={periodOption.value} value={periodOption.value}>
              {periodOption.label}
            </MenuItem>
          ))}
          {periodOptions.monthOptions.length > 0 && (
            <ListSubheader>Meses</ListSubheader>
          )}
          {periodOptions.monthOptions.map((periodOption) => (
            <MenuItem key={periodOption.value} value={periodOption.value}>
              {periodOption.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        size="small"
        label="Buscar"
        placeholder="Nombre o distribuidor"
        value={search}
        onChange={onSearchChange}
        sx={{ flex: 1, minWidth: 220 }}
      />

      <IconButton
        color={isFiltersMenuOpen ? "primary" : "default"}
        onClick={onOpenFilters}
        size="small"
      >
        <FilterAltIcon />
      </IconButton>
    </Stack>
  </Box>
);

export default FiltersToolbar;
