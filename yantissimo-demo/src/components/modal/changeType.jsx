import React, { useState } from "react";
import { doctypeOptions, doctypeOptionsMyr } from "~/utils/global.js";
import { Select, MenuItem, TextField } from "@mui/material";
import { updateStatus } from "~/lib/quoteApi.js";

const ChangeType = ({ type, quote_id, onTypeChange, isMyr }) => {
  const [tempType, setTempType] = useState(type || "");
  const doctype = isMyr ? doctypeOptionsMyr : doctypeOptions;

  const canAdvance = (from, to) => {
    if (!from || !to) return false;
    const fromIdx = doctype[from]?.idx;
    const toIdx = doctype[to]?.idx;
    if (fromIdx === -1 || toIdx === -1) return false;
    return toIdx >= fromIdx; // no retroceso
  };

  const handleChangeType = async (e) => {
    const newType = e.target.value;
    // Bloquear retroceso o estados bloqueados
    if (!canAdvance(type, newType)) return;
    setTempType(newType);
    await updateStatus({ quote_id, newType });
    if (typeof onTypeChange === "function") onTypeChange(newType);
  };
  return type !== "prequote" ? (
    <Select
      size="small"
      value={tempType || "unknown"}
      onChange={handleChangeType}
      displayEmpty
      variant="outlined"
      sx={{
        backgroundColor: doctype[tempType || type]?.color + "33" || "#fff",
        borderRadius: 1,
      }}
    >
      {Object.entries(doctype).map(([key, val]) => (
        <MenuItem key={key} value={key} disabled={!canAdvance(type, key)}>
          {val.text}
        </MenuItem>
      ))}
    </Select>
  ) : (
    <TextField
      size="small"
      value={doctype[type]?.text || "unknown"}
      onChange={handleChangeType}
      disabled
      variant="outlined"
      sx={{
        backgroundColor: doctype[type]?.color + "33" || "#fff",
        borderRadius: 1,
      }}
    />
  );
};

export default ChangeType;
