"use client";

import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import StoreIcon from "@mui/icons-material/Store";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import { SUCS } from "~/utils/global";

const AgentFiltersBar = ({
  isConversationSelected,
  onBack,
  filters,
  onFilterChange,
  onAnalytics,
  sucursalLocked = false,
}) => {
  const { searchTerm, viewState, viewAgent, viewSucursal } = filters;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "start",
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      {isConversationSelected && (
        <IconButton onClick={onBack} sx={{ mr: 2, height: 40, mt: 1.6 }}>
          <ArrowBackIcon />
        </IconButton>
      )}

      <TextField
        placeholder="Buscar nombre, telefono o mensaje"
        variant="standard"
        size="small"
        value={searchTerm}
        onChange={(e) => onFilterChange("searchTerm", e.target.value)}
        sx={{ mt: 3, mr: 2, ml: 0.5, minWidth: 240 }}
      />

      <FilterAltIcon sx={{ fontSize: 28, mt: 2.3, mr: -1.5, ml: 0.5 }} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          p: 2,
        }}
      >
        <Select
          value={viewState === null ? "todas" : viewState}
          onChange={(e) =>
            onFilterChange(
              "viewState",
              e.target.value === "todas" ? null : e.target.value
            )
          }
          variant="standard"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="open">Abiertos</MenuItem>
          <MenuItem value="follow_up">Seguimiento</MenuItem>
          <MenuItem value="closed">Cerrados</MenuItem>
          <MenuItem value="archived">Archivados</MenuItem>
          <MenuItem value="todas">Todos</MenuItem>
        </Select>
        <FormHelperText>Estado</FormHelperText>
      </Box>

      <SmartToyIcon sx={{ fontSize: 28, mt: 2.3, mr: -1.5, ml: 1 }} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          p: 2,
        }}
      >
        <Select
          value={viewAgent === null ? "todas" : viewAgent ? "agent" : "human"}
          onChange={(e) =>
            onFilterChange(
              "viewAgent",
              e.target.value === "todas" ? null : e.target.value === "agent"
            )
          }
          variant="standard"
          sx={{ minWidth: 110 }}
        >
          <MenuItem value="todas">Todos</MenuItem>
          <MenuItem value="agent">Agente AI</MenuItem>
          <MenuItem value="human">Humano</MenuItem>
        </Select>
        <FormHelperText>Atendido por</FormHelperText>
      </Box>

      <StoreIcon sx={{ fontSize: 28, mt: 2.3, mr: -1.5, ml: 1 }} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          p: 2,
        }}
      >
        <Select
          value={viewSucursal === null ? "todas" : viewSucursal}
          onChange={(e) =>
            onFilterChange(
              "viewSucursal",
              e.target.value === "todas" ? null : e.target.value
            )
          }
          variant="standard"
          disabled={sucursalLocked}
          sx={{ minWidth: 110 }}
        >
          {!sucursalLocked && <MenuItem value="todas">Todos</MenuItem>}
          {SUCS.map((suc) => (
            <MenuItem key={suc} value={suc.toLowerCase()}>
              {suc}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {sucursalLocked ? "Sucursal (fija)" : "Sucursal"}
        </FormHelperText>
      </Box>

      <IconButton onClick={onAnalytics} sx={{ mb: 2 }}>
        <QueryStatsIcon />
      </IconButton>
    </Box>
  );
};

export default AgentFiltersBar;
