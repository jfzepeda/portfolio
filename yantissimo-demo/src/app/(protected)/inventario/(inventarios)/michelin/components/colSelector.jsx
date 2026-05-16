import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Radio,
  Checkbox,
  Box,
} from "@mui/material";
import { ROLES } from "~/utils/global";

const ColSelector = ({
  open,
  onClose,
  columns = [],
  visibleColumns,
  setVisibleColumns,
  curRole,
}) => {
  const handleToggle = (key) => {
    if (curRole >= ROLES.MARKETING) {
      setVisibleColumns(
        visibleColumns.includes(key)
          ? visibleColumns.filter((c) => c !== key)
          : [...visibleColumns, key]
      );
    } else {
      setVisibleColumns(key);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Selección de columnas</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
          {columns.map(({ key, label }) => (
            <FormControlLabel
              key={key}
              control={
                curRole >= ROLES.MARKETING ? (
                  <Checkbox
                    checked={visibleColumns.includes(key)}
                    onChange={() => handleToggle(key)}
                  />
                ) : (
                  <Radio
                    checked={visibleColumns === key}
                    onChange={() => handleToggle(key)}
                  />
                )
              }
              label={label}
              sx={{ width: "120px" }}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColSelector;
