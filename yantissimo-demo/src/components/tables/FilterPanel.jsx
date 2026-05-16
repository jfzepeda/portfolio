"use client";

import React, { useMemo } from "react";
import {
  Autocomplete,
  MenuItem,
  Select,
  TextField,
  FormControl,
  Box,
} from "@mui/material";
import { DISTINCT_THRESHOLD, FORMATTERS } from "./constants";
import { getDistinctValues } from "./filterModel";

/**
 * Renders a filter control for a single column.
 *
 * - <10 distinct values → <Select> dropdown
 * - >=10 distinct values → <Autocomplete> search with suggestions
 *
 * Controlled by `value` / `onChange`.
 */
function FilterPanel({ column, rows, value, onChange }) {
  const distinctValues = useMemo(
    () => getDistinctValues(rows, column.key),
    [rows, column.key],
  );

  const explicitType = column.filterType;
  const useSelect =
    explicitType === "select" ||
    (explicitType !== "search" && distinctValues.length < DISTINCT_THRESHOLD);

  const formatLabel = (val) => {
    if (column.format) return column.format(val, {});
    const formatter = FORMATTERS[column.type || "text"];
    return formatter ? String(formatter(val, column)) : String(val);
  };

  if (useSelect) {
    return (
      <FormControl size="small" fullWidth sx={{ minWidth: 140 }}>
        <Select
          value={value ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === "" ? null : v);
          }}
          displayEmpty
          size="small"
          sx={{ fontSize: 13 }}
        >
          <MenuItem value="">
            <em>Todos</em>
          </MenuItem>
          {distinctValues.map((v) => (
            <MenuItem key={String(v)} value={v}>
              {formatLabel(v)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  // Autocomplete search mode
  const options = distinctValues.map((v) => ({
    raw: v,
    label: formatLabel(v),
  }));

  return (
    <Box sx={{ minWidth: 180 }}>
      <Autocomplete
        freeSolo
        size="small"
        options={options}
        getOptionLabel={(opt) =>
          typeof opt === "string" ? opt : opt.label ?? ""
        }
        value={value != null ? { raw: value, label: formatLabel(value) } : null}
        onChange={(_e, newVal) => {
          if (!newVal) return onChange(null);
          onChange(typeof newVal === "string" ? newVal : newVal.raw);
        }}
        onInputChange={(_e, inputVal, reason) => {
          if (reason === "clear") onChange(null);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Buscar..."
            size="small"
            sx={{ "& .MuiInputBase-input": { fontSize: 13 } }}
          />
        )}
        isOptionEqualToValue={(opt, val) =>
          String(opt.raw) === String(val?.raw ?? val)
        }
        slotProps={{ popper: { sx: { zIndex: 1500 } } }}
      />
    </Box>
  );
}

export default React.memo(FilterPanel);
