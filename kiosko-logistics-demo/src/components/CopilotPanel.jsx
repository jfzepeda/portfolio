"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Box, Drawer, Fab, IconButton, Tooltip, Typography } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { SERVER_URL } from "@/lib/serverUrl";
import { useDashboardState } from "./DashboardStateProvider";

const PAGE_LABELS = {
  "/rutas": "Mapa de rutas",
  "/configurar-rutas": "Configuración del solver",
  "/laboratorio": "Laboratorio (cluster studio / sweeps)",
  "/testing": "Testing de algoritmos",
  "/comparar": "Comparación de runs",
  "/volumenes": "Visor de empaque 3D",
};

const WORKFLOW_ID = process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID || "";

function summarizeKpis(result) {
  if (!result) return "";
  const k = result.kpis_globales || {};
  const parts = [];
  if (k.total_rutas != null) parts.push(`rutas=${k.total_rutas}`);
  if (k.total_tiendas != null) parts.push(`tiendas=${k.total_tiendas}`);
  if (k.total_km != null) parts.push(`km=${Number(k.total_km).toFixed(1)}`);
  if (k.total_costo != null) parts.push(`costo=$${Number(k.total_costo).toFixed(0)}`);
  if (k.n_excede_8h != null) parts.push(`excede_8h=${k.n_excede_8h}`);
  return parts.join(" · ");
}

function buildContext(pathname, state) {
  const { vrpConfig, runConfig, routeRunState, externalVrpResult } = state;
  const result = routeRunState?.result || externalVrpResult || null;
  return {
    page: pathname || "/",
    page_label: PAGE_LABELS[pathname] || pathname || "desconocida",
    vrp_config: vrpConfig
      ? `alcance=${vrpConfig.alcanceRuta}h carga=${vrpConfig.cargaViaje}% flota=${vrpConfig.flota} velocidad=${vrpConfig.velocidad} diesel=$${vrpConfig.precioDiesel} chofer=$${vrpConfig.costoChofer}`
      : "",
    run_config: runConfig
      ? `archivo=${runConfig.fileName || "(ninguno)"} hoja=${runConfig.sheetName || ""} zona=${runConfig.filterZone || "*"} estado=${runConfig.filterState || "*"}`
      : "",
    run_status: routeRunState
      ? `${routeRunState.status || "info"}${routeRunState.running ? " (ejecutando)" : ""}: ${routeRunState.message || "sin mensaje"}`
      : "",
    kpis: summarizeKpis(result),
    has_result: result ? "true" : "false",
  };
}

export default function CopilotPanel() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const pathname = usePathname();
  const state = useDashboardState();

  const contextRef = useRef(buildContext(pathname, state));
  useEffect(() => {
    contextRef.current = buildContext(pathname, state);
  }, [pathname, state]);

  const getClientSecret = useCallback(async () => {
    if (!WORKFLOW_ID) {
      throw new Error("NEXT_PUBLIC_CHATKIT_WORKFLOW_ID no está configurado.");
    }
    const res = await fetch(`${SERVER_URL}/chatkit/session`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow: { id: WORKFLOW_ID },
        state_variables: contextRef.current,
      }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok || !payload.client_secret) {
      throw new Error(payload.error || `ChatKit session failed (${res.status})`);
    }
    return payload.client_secret;
  }, []);

  const { control } = useChatKit({
    api: { getClientSecret },
    theme: {
      colorScheme:
        typeof document !== "undefined" &&
        document.documentElement.getAttribute("data-theme") === "light"
          ? "light"
          : "dark",
    },
  });

  if (!WORKFLOW_ID) return null;

  return (
    <>
      <Tooltip title="Copiloto KIOSKO" placement="left">
        <Fab
          color="primary"
          onClick={() => {
            setError("");
            setOpen(true);
          }}
          sx={{
            position: "fixed",
            right: 24,
            bottom: 24,
            zIndex: 1200,
            bgcolor: "var(--accent)",
            color: "#fff",
            "&:hover": { bgcolor: "var(--accent)" },
            boxShadow: "0 12px 32px rgba(255,107,26,0.45)",
          }}
        >
          <SmartToyIcon />
        </Fab>
      </Tooltip>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 420 },
            display: "flex",
            flexDirection: "column",
            bgcolor: "var(--bg-elevated, #11161d)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.25,
            borderBottom: "1px solid var(--glass-border)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SmartToyIcon sx={{ color: "var(--accent)" }} />
            <Box>
              <Typography variant="subtitle2" sx={{ color: "var(--text-primary)", lineHeight: 1.1 }}>
                Copiloto KIOSKO
              </Typography>
              <Typography variant="caption" sx={{ color: "var(--text-muted)" }}>
                Conoce esta sesión: {PAGE_LABELS[pathname] || pathname}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "var(--text-secondary)" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {error ? (
          <Box sx={{ p: 2, color: "var(--error, #f87171)" }}>
            <Typography variant="body2">{error}</Typography>
          </Box>
        ) : null}

        <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
          <ChatKit control={control} className="h-full w-full" style={{ height: "100%", width: "100%" }} />
        </Box>
      </Drawer>
    </>
  );
}
