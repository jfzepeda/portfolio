import React from "react";
import { Box, Button, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, TextField, Tooltip, IconButton, Typography } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { RIN_FIELDS, RIN_FIELD_LABELS } from "./constants";

const RinesEditor = ({ rows, onAdd, onUpdate, onRemove }) => {
  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle1" fontWeight={600}>
          Medidas de rin y descuentos
        </Typography>
        <Button size="small" onClick={onAdd} startIcon={<AddIcon />}>
          Agregar medida
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ mt: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Rin</TableCell>
              {RIN_FIELD_LABELS.map((o) => (
                <TableCell key={o.key}>{o.label}</TableCell>
              ))}
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={RIN_FIELDS.length + 2}>
                  <Box color="text.secondary">Sin medidas agregadas</Box>
                </TableCell>
              </TableRow>
            )}
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell sx={{ minWidth: 90 }}>
                  <TextField
                    size="small"
                    placeholder="Ej. 15"
                    variant="standard"
                    value={row.rim}
                    onChange={(e) => onUpdate(idx, { rim: e.target.value })}
                    sx={{ width: 70 }}
                  />
                </TableCell>
                {RIN_FIELDS.slice(0, 5).map((o) => (
                  <TableCell key={o}>
                    <TextField
                      size="small"
                      variant="standard"
                      value={row[o] ?? 0}
                      onChange={(e) => onUpdate(idx, { [o]: e.target.value })}
                      sx={{ width: 50 }}
                    />
                  </TableCell>
                ))}
                {RIN_FIELDS.slice(5, 10).map((o) => (
                  <TableCell key={o}>
                    <TextField
                      size="small"
                      variant="standard"
                      value={row[o] ?? 0}
                      onChange={(e) => onUpdate(idx, { [o]: e.target.value })}
                      sx={{ width: 70 }}
                    />
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="Eliminar medida">
                    <IconButton size="small" onClick={() => onRemove(idx)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RinesEditor;

