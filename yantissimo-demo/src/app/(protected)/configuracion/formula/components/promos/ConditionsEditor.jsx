import React from "react";
import { Box, Button, Typography, TextField, MenuItem, Tooltip, IconButton, Autocomplete, Chip } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

const ConditionsEditor = ({
  conditions,
  onAdd,
  onUpdate,
  onRemove,
  availableColumns,
  operadores,
  marcas,
  proveedores,
}) => {
  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle1" fontWeight={600}>
          Condiciones
        </Typography>
        <Button size="small" onClick={onAdd}>
          Agregar condición
        </Button>
      </Box>
      <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        {conditions.length === 0 && (
          <Typography variant="body1">Sin condiciones (aplica a todos)</Typography>
        )}
        {conditions.map((c, idx) => (
          <Box
            key={idx}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "3fr 2fr 6fr 1fr" },
              gap: 1,
              alignItems: "center",
            }}
          >
            <Box>
              <TextField
                select
                label="Columna"
                size="small"
                value={c.column ?? ""}
                onChange={(e) => onUpdate(idx, { column: e.target.value })}
                fullWidth
              >
                {availableColumns.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField
                select
                label="Operador"
                size="small"
                value={c.operator ?? ""}
                onChange={(e) => onUpdate(idx, { operator: e.target.value })}
                fullWidth
              >
                {operadores.map((op) => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              {c.column === "marca" ? (
                <Autocomplete
                  key={idx}
                  multiple
                  freeSolo
                  options={marcas}
                  value={Array.isArray(c.param) ? c.param : []}
                  onChange={(e, newValue) => onUpdate(idx, { param: newValue })}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip key={index} label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Valores" size="small" />
                  )}
                  fullWidth
                />
              ) : c.column === "proveedor" ? (
                <Autocomplete
                  key={idx}
                  multiple
                  freeSolo
                  options={proveedores}
                  value={Array.isArray(c.param) ? c.param : []}
                  onChange={(e, newValue) => onUpdate(idx, { param: newValue })}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip key={index} label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Valores" size="small" />
                  )}
                  fullWidth
                />
              ) : c.column === "articulo" ? (
                <Autocomplete
                  key={idx}
                  multiple
                  freeSolo
                  options={[]}
                  value={Array.isArray(c.param) ? c.param : []}
                  onChange={(e, newValue) => onUpdate(idx, { param: newValue })}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip key={index} label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Artículos"
                      size="small"
                      placeholder="Escribe y presiona Enter"
                    />
                  )}
                  fullWidth
                />
              ) : c.column === "sku" ? (
                <Autocomplete
                  key={idx}
                  multiple
                  freeSolo
                  options={[]}
                  value={Array.isArray(c.param) ? c.param : []}
                  onChange={(e, newValue) => onUpdate(idx, { param: newValue })}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip key={index} label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="SKUs"
                      size="small"
                      placeholder="Escribe y presiona Enter"
                    />
                  )}
                  fullWidth
                />
              ) : (
                <TextField
                  label="Valor"
                  size="small"
                  value={c.param ?? ""}
                  onChange={(e) => onUpdate(idx, { param: e.target.value })}
                  fullWidth
                />
              )}
            </Box>
            <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", sm: "center" } }}>
              <Tooltip title="Eliminar">
                <IconButton onClick={() => onRemove(idx)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ConditionsEditor;

