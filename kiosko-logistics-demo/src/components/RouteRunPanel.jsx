"use client";

import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DownloadIcon from "@mui/icons-material/Download";

const AMBER = "var(--accent)";
const INK = "var(--text-primary)";
const INK_2 = "var(--text-secondary)";
const INK_3 = "var(--text-muted)";
const BORDER = "var(--glass-border)";

export default function RouteRunPanel({
  runConfig,
  onRunConfigChange,
  onRunVrp,
  onDownloadVrpJson,
  routeRunState,
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        borderColor: "rgba(217,119,6,0.22)",
        background: "#faf7f2",
        boxShadow: "none",
      }}
    >
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 700,
          color: "#b45309",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Solver
      </Typography>
      <Typography sx={{ fontSize: 14, color: INK, fontWeight: 700, mt: 0.5 }}>
        Recalcular rutas
      </Typography>
      <Typography
        sx={{ fontSize: 12, color: INK_3, mt: 0.3, lineHeight: 1.45 }}
      >
        Sube el Excel origen y ejecuta el backend Python. El resultado actualiza
        la pestaña del mapa.
      </Typography>

      <Box sx={{ mt: 1.6, display: "grid", gap: 1.2 }}>
        <Button
          component="label"
          variant="outlined"
          startIcon={<UploadFileIcon sx={{ fontSize: 16 }} />}
          sx={{
            justifyContent: "flex-start",
            borderColor: BORDER,
            color: INK_2,
            borderRadius: 2,
            fontSize: 12,
            py: 1,
          }}
        >
          {runConfig.fileName || "Seleccionar Excel"}
          <input
            hidden
            type="file"
            accept=".xlsx,.xls"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              onRunConfigChange({ file, fileName: file?.name || "" });
            }}
          />
        </Button>

        <TextField
          size="small"
          label="Hoja"
          value={runConfig.sheetName}
          onChange={(event) =>
            onRunConfigChange({ sheetName: event.target.value })
          }
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.2,
          }}
        >
          <TextField
            size="small"
            label="Zona"
            placeholder="Todas"
            value={runConfig.filterZone}
            onChange={(event) =>
              onRunConfigChange({ filterZone: event.target.value })
            }
          />
          <TextField
            size="small"
            label="Estado"
            placeholder="Todos"
            value={runConfig.filterState}
            onChange={(event) =>
              onRunConfigChange({ filterState: event.target.value })
            }
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon sx={{ fontSize: 16 }} />}
            onClick={onRunVrp}
            disabled={routeRunState.running}
            sx={{
              background: AMBER,
              borderRadius: 2,
              py: 1,
              px: 1.6,
              fontSize: 12,
              fontWeight: 800,
              "&:hover": { background: "#b45309" },
              "&.Mui-disabled": { background: "#e7e0d7", color: INK_3 },
            }}
          >
            {routeRunState.running ? "Ejecutando…" : "Ejecutar solver"}
          </Button>

          {routeRunState.result && (
            <Button
              variant="outlined"
              startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
              onClick={onDownloadVrpJson}
              sx={{ borderRadius: 2, fontSize: 12 }}
            >
              Descargar JSON
            </Button>
          )}
        </Box>

        {routeRunState.message && (
          <Alert
            severity={routeRunState.status}
            sx={{ py: 0, alignItems: "center", fontSize: 12 }}
          >
            {routeRunState.message}
          </Alert>
        )}

        {routeRunState.logs && (
          <Box
            sx={{
              maxHeight: 220,
              overflowY: "auto",
              p: 1.2,
              borderRadius: 2,
              background: "#1c1917",
              color: "#d6d3d1",
              fontSize: 11,
              lineHeight: 1.5,
              fontFamily: '"SF Mono","Fira Code","Cascadia Code",monospace',
              whiteSpace: "pre-wrap",
            }}
          >
            {routeRunState.logs}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
