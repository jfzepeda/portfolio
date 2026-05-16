"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Tooltip,
  IconButton,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CheckIcon from "@mui/icons-material/Check";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SpeedIcon from "@mui/icons-material/Speed";
import RouteIcon from "@mui/icons-material/Route";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import RouteRunPanel from "./RouteRunPanel";

// ─── Colors ──────────────────────────────────────────────────────────────────
const AMBER = "var(--accent)";
const AMBER_L = "var(--accent-soft)";
const AMBER_B = "rgba(255,107,26,0.40)";
const INK = "var(--text-primary)";
const INK_2 = "var(--text-secondary)";
const INK_3 = "var(--text-muted)";
const BORDER = "var(--glass-border)";

// ─── Profiles ─────────────────────────────────────────────────────────────────
const PROFILES = [
  {
    id: "COMPACTO",
    label: "Ciudad",
    icon: "🏙️",
    desc: "Rutas cortas, alta consolidación, camión grande",
    config: {
      alcanceRuta: 18,
      cargaViaje: 88,
      flota: "T12",
      velocidad: "BALANCEADO",
      precioDiesel: 30,
      costoChofer: 650,
    },
  },
  {
    id: "ESTANDAR",
    label: "Estándar",
    icon: "⚖️",
    desc: "Configuración balanceada para operación normal",
    config: {
      alcanceRuta: 48,
      cargaViaje: 65,
      flota: "T10",
      velocidad: "BALANCEADO",
      precioDiesel: 30,
      costoChofer: 650,
    },
  },
  {
    id: "REGIONAL",
    label: "Regional",
    icon: "🗺️",
    desc: "Cobertura amplia, rutas largas, flota ligera",
    config: {
      alcanceRuta: 78,
      cargaViaje: 42,
      flota: "T8",
      velocidad: "PRECISO",
      precioDiesel: 30,
      costoChofer: 650,
    },
  },
  {
    id: "ECONOMICO",
    label: "Económico",
    icon: "💰",
    desc: "Máxima ocupación, mínimo costo por caja",
    config: {
      alcanceRuta: 32,
      cargaViaje: 92,
      flota: "T12",
      velocidad: "RAPIDO",
      precioDiesel: 30,
      costoChofer: 650,
    },
  },
];

// ─── Default config ───────────────────────────────────────────────────────────
export const DEFAULT_VRP_CONFIG = {
  alcanceRuta: 48,    // 0–100 → MAX_ARC_KM + ARC_PENALTY_FACTOR + MAX_RUTA_KM
  cargaViaje: 65,     // 0–100 → MAX_TIENDAS_RUTA + TARGET_OCUPACION
  aislamientoZona: 60, // 0–100 → CLUSTER_CROSS_PENALTY (aislamiento geográfico por cluster)
  flota: "T10",       // 'T8' | 'T10' | 'T12'
  velocidad: "BALANCEADO", // 'RAPIDO' | 'BALANCEADO' | 'PRECISO'
  precioDiesel: 30,   // MXN / L
  costoChofer: 650,   // MXN / día
};

// ─── Derive technical params from friendly config ─────────────────────────────
export function deriveParams(cfg) {
  const ar = cfg.alcanceRuta / 100;
  const cv = cfg.cargaViaje / 100;
  const az = (cfg.aislamientoZona ?? 60) / 100;
  return {
    MAX_ARC_KM: Math.round(15 + 85 * ar),
    ARC_PENALTY_FACTOR: Math.round(9 - 7 * ar),
    // Penalización por dispersión del centroide:
    // Compacto (0) → factor alto (18) = rutas se ciñen a su zona central
    // Amplio (100)  → factor bajo  (2) = mayor tolerancia a dispersión
    CENTROID_DEV_FACTOR: Math.round(18 - 16 * ar),
    MAX_TIENDAS_RUTA: Math.round(5 + 15 * cv),
    TARGET_OCUPACION: parseFloat((0.62 + 0.33 * cv).toFixed(2)),
    // Penalización por cruce de cluster geográfico — controla aislamiento de zona
    CLUSTER_CROSS_PENALTY: Math.round(3 + 15 * az),
    DEFAULT_CAP_CAJAS: { T8: 560, T10: 720, T12: 864 }[cfg.flota],
    DEFAULT_RENDIMIENTO_KML: { T8: 7.0, T10: 6.0, T12: 5.0 }[cfg.flota],
    TIME_LIMIT_SECONDS: { RAPIDO: 30, BALANCEADO: 60, PRECISO: 120 }[
      cfg.velocidad
    ],
    PRECIO_DIESEL_MXN: cfg.precioDiesel,
    COSTO_CHOFER_DIA_MXN: cfg.costoChofer,
    COSTO_DESGASTE_KM_MXN: 2.5,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function detectProfile(cfg) {
  return (
    PROFILES.find(
      (p) =>
        p.config.alcanceRuta === cfg.alcanceRuta &&
        p.config.cargaViaje === cfg.cargaViaje &&
        p.config.flota === cfg.flota &&
        p.config.velocidad === cfg.velocidad
    )?.id || null
  );
}

function SectionLabel({ icon, label }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1.5 }}>
      <Box
        sx={{
          color: AMBER,
          display: "flex",
          alignItems: "center",
          fontSize: 14,
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: INK_2,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  leftLabel,
  rightLabel,
  format,
  onChange,
  color = AMBER,
}) {
  return (
    <Box sx={{ mb: 0.5 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          mb: 0.3,
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: INK }}>
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: color,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {format ? format(value) : value}
        </Typography>
      </Box>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(_, v) => onChange(v)}
        size="small"
        sx={{
          color: color,
          height: 4,
          "& .MuiSlider-thumb": {
            width: 14,
            height: 14,
            boxShadow: `0 0 0 3px ${color}33`,
            "&:hover": { boxShadow: `0 0 0 5px ${color}33` },
          },
          "& .MuiSlider-rail": { opacity: 0.18, backgroundColor: INK_2 },
          "& .MuiSlider-track": { border: "none" },
          py: 1,
        }}
      />
      {(leftLabel || rightLabel) && (
        <Box
          sx={{ display: "flex", justifyContent: "space-between", mt: -0.8 }}
        >
          <Typography sx={{ fontSize: 9, color: INK_3 }}>
            {leftLabel}
          </Typography>
          <Typography sx={{ fontSize: 9, color: INK_3 }}>
            {rightLabel}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ConfigPanel({
  config,
  onChange,
  runConfig,
  onRunConfigChange,
  onRunVrp,
  onDownloadVrpJson,
  routeRunState,
}) {
  const [copied, setCopied] = useState(false);
  const [techOpen, setTechOpen] = useState(false);

  const params = useMemo(() => deriveParams(config), [config]);
  const activeProfile = detectProfile(config);

  const set = (key) => (value) => onChange({ ...config, [key]: value });

  const applyProfile = (profile) => {
    onChange({ ...config, ...profile.config });
  };

  const resetToDefault = () => onChange(DEFAULT_VRP_CONFIG);

  const exportConfig = () => {
    const p = params;
    const snippet = `# ── Parámetros VRP generados desde UI ──────────────────
MAX_ARC_KM            = ${p.MAX_ARC_KM}
ARC_PENALTY_FACTOR    = ${p.ARC_PENALTY_FACTOR}
CENTROID_DEV_FACTOR   = ${p.CENTROID_DEV_FACTOR}
CLUSTER_CROSS_PENALTY = ${p.CLUSTER_CROSS_PENALTY}
MAX_TIENDAS_RUTA      = ${p.MAX_TIENDAS_RUTA}
TARGET_OCUPACION      = ${p.TARGET_OCUPACION}
DEFAULT_CAP_CAJAS     = ${p.DEFAULT_CAP_CAJAS}
DEFAULT_RENDIMIENTO_KML = ${p.DEFAULT_RENDIMIENTO_KML}
TIME_LIMIT_SECONDS    = ${p.TIME_LIMIT_SECONDS}
PRECIO_DIESEL_MXN     = ${p.PRECIO_DIESEL_MXN}
COSTO_CHOFER_DIA_MXN  = ${p.COSTO_CHOFER_DIA_MXN}
COSTO_DESGASTE_KM_MXN = ${p.COSTO_DESGASTE_KM_MXN}
`;
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isDefault =
    config.alcanceRuta === DEFAULT_VRP_CONFIG.alcanceRuta &&
    config.cargaViaje === DEFAULT_VRP_CONFIG.cargaViaje &&
    config.aislamientoZona === DEFAULT_VRP_CONFIG.aislamientoZona &&
    config.flota === DEFAULT_VRP_CONFIG.flota &&
    config.velocidad === DEFAULT_VRP_CONFIG.velocidad &&
    config.precioDiesel === DEFAULT_VRP_CONFIG.precioDiesel &&
    config.costoChofer === DEFAULT_VRP_CONFIG.costoChofer;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: INK,
              letterSpacing: "-0.01em",
            }}
          >
            Panel de configuración
          </Typography>
          <Typography sx={{ fontSize: 10, color: INK_3, mt: 0.2 }}>
            Parámetros para el optimizador VRP
          </Typography>
        </Box>
        {!isDefault && (
          <Tooltip title="Restaurar valores por defecto">
            <IconButton
              size="small"
              onClick={resetToDefault}
              sx={{ color: INK_3, "&:hover": { color: INK } }}
            >
              <RestartAltIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box sx={{ px: 2, pb: 2, flex: 1 }}>
        {/* ── Perfiles rápidos ──────────────────────────────────────────────── */}
        <SectionLabel icon="⚡" label="Perfil de operación" />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 0.8,
            mb: 2.5,
          }}
        >
          {PROFILES.map((profile) => {
            const isActive = activeProfile === profile.id;
            return (
              <Box
                key={profile.id}
                onClick={() => applyProfile(profile)}
                sx={{
                  p: "10px 10px 8px",
                  borderRadius: 2,
                  cursor: "pointer",
                  border: `1.5px solid ${isActive ? AMBER : BORDER}`,
                  background: isActive ? AMBER_L : "#fff",
                  transition: "all 0.15s",
                  "&:hover": {
                    border: `1.5px solid ${isActive ? AMBER : "#c0bab5"}`,
                    background: isActive ? AMBER_L : "#faf9f7",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 0.3,
                  }}
                >
                  <Typography sx={{ fontSize: 14, lineHeight: 1 }}>
                    {profile.icon}
                  </Typography>
                  {isActive && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: AMBER,
                      }}
                    />
                  )}
                </Box>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? "#92400e" : INK,
                    mt: 0.4,
                  }}
                >
                  {profile.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 9,
                    color: isActive ? "#b45309" : INK_3,
                    lineHeight: 1.35,
                    mt: 0.2,
                  }}
                >
                  {profile.desc}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ mb: 2, borderColor: BORDER }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 0.8,
            mb: 2.5,
          }}
        >
          {/* ── Alcance de ruta ───────────────────────────────────────────────── */}
          <Box>
            <SectionLabel
              icon={<RouteIcon sx={{ fontSize: 14 }} />}
              label="Compactación de ruta"
            />
            <SliderRow
              label="Penalización por dispersión del centroide"
              value={config.alcanceRuta}
              min={0}
              max={100}
              leftLabel="Muy compacto"
              rightLabel="Disperso"
              format={(v) => `×${Math.round(18 - (16 * v) / 100)}`}
              onChange={set("alcanceRuta")}
            />

            {/* Derived hint */}
            <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", mb: 2 }}>
              <Chip
                size="small"
                label={`Centroide ×${params.CENTROID_DEV_FACTOR}`}
                sx={{
                  fontSize: 9,
                  height: 18,
                  background: "#f5f0eb",
                  color: INK_2,
                  "& .MuiChip-label": { px: 0.9 },
                }}
              />
              <Chip
                size="small"
                label={`Arc ≤ ${params.MAX_ARC_KM} km`}
                sx={{
                  fontSize: 9,
                  height: 18,
                  background: "#f5f0eb",
                  color: INK_2,
                  "& .MuiChip-label": { px: 0.9 },
                }}
              />
            </Box>
          </Box>

          {/* ── Carga por viaje ───────────────────────────────────────────────── */}
          <Box>
            <SectionLabel
              icon={<LocalShippingIcon sx={{ fontSize: 14 }} />}
              label="Consolidación de carga"
            />
            <SliderRow
              label="Tiendas y ocupación por ruta"
              value={config.cargaViaje}
              min={0}
              max={100}
              leftLabel="Rutas ligeras"
              rightLabel="Rutas densas"
              format={(v) => `${Math.round(5 + (15 * v) / 100)} tiendas`}
              onChange={set("cargaViaje")}
            />
            <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", mb: 2 }}>
              <Chip
                size="small"
                label={`Máx. ${params.MAX_TIENDAS_RUTA} tiendas`}
                sx={{
                  fontSize: 9,
                  height: 18,
                  background: "#f5f0eb",
                  color: INK_2,
                  "& .MuiChip-label": { px: 0.9 },
                }}
              />
              <Chip
                size="small"
                label={`Target ${Math.round(
                  params.TARGET_OCUPACION * 100
                )}% ocupación`}
                sx={{
                  fontSize: 9,
                  height: 18,
                  background: "#f5f0eb",
                  color: INK_2,
                  "& .MuiChip-label": { px: 0.9 },
                }}
              />
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mb: 2, borderColor: BORDER }} />

        {/* ── Tipo de flota ─────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 0.8,
            mb: 2.5,
          }}
        >
          <Box>
            <SectionLabel
              icon={<LocalShippingIcon sx={{ fontSize: 14 }} />}
              label="Flota predominante"
            />
            <ToggleButtonGroup
              value={config.flota}
              exclusive
              onChange={(_, v) => {
                if (v) set("flota")(v);
              }}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            >
              {[
                { v: "T8", label: "T-8", sub: "560 cajas", icon: "🚐" },
                { v: "T10", label: "T-10", sub: "720 cajas", icon: "🚛" },
                { v: "T12", label: "T-12", sub: "864 cajas", icon: "🚚" },
              ].map(({ v, label, sub, icon }) => (
                <ToggleButton
                  key={v}
                  value={v}
                  sx={{
                    flexDirection: "column",
                    py: 1,
                    fontSize: 11,
                    fontWeight: 600,
                    gap: 0.2,
                    border: `1px solid ${BORDER} !important`,
                    borderRadius: "8px !important",
                    mx: 0.3,
                    "&.Mui-selected": {
                      background: AMBER_L,
                      color: "#92400e",
                      border: `1px solid ${AMBER} !important`,
                      "&:hover": { background: AMBER_B },
                    },
                    "&:hover": { background: "#f5f0eb" },
                  }}
                >
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  <span>{label}</span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 400,
                      color: config.flota === v ? "#b45309" : "#999",
                    }}
                  >
                    {sub}
                  </span>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* ── Velocidad del solver ──────────────────────────────────────────── */}
          <Box>
            <SectionLabel
              icon={<SpeedIcon sx={{ fontSize: 14 }} />}
              label="Precisión del optimizador"
            />
            <ToggleButtonGroup
              value={config.velocidad}
              exclusive
              onChange={(_, v) => {
                if (v) set("velocidad")(v);
              }}
              fullWidth
              size="small"
              sx={{ mb: 0.8 }}
            >
              {[
                { v: "RAPIDO", label: "Rápido", sub: "30 s", icon: "⚡" },
                {
                  v: "BALANCEADO",
                  label: "Balanceado",
                  sub: "60 s",
                  icon: "⚖️",
                },
                { v: "PRECISO", label: "Preciso", sub: "2 min", icon: "🔬" },
              ].map(({ v, label, sub, icon }) => (
                <ToggleButton
                  key={v}
                  value={v}
                  sx={{
                    flexDirection: "column",
                    py: 0.8,
                    fontSize: 10,
                    fontWeight: 600,
                    gap: 0.2,
                    border: `1px solid ${BORDER} !important`,
                    borderRadius: "8px !important",
                    mx: 0.3,
                    "&.Mui-selected": {
                      background: AMBER_L,
                      color: "#92400e",
                      border: `1px solid ${AMBER} !important`,
                      "&:hover": { background: AMBER_B },
                    },
                    "&:hover": { background: "#f5f0eb" },
                  }}
                >
                  <span style={{ fontSize: 14 }}>{icon}</span>
                  <span>{label}</span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 400,
                      color: config.velocidad === v ? "#b45309" : "#999",
                    }}
                  >
                    {sub}
                  </span>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Typography
              sx={{ fontSize: 10, color: INK_3, mb: 2, lineHeight: 1.4 }}
            >
              Más tiempo = solución más cercana al óptimo global.
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 2, borderColor: BORDER }} />

        {/* ── Costos ────────────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 0.8,
            mb: 2.5,
          }}
        >
          <RouteRunPanel
            runConfig={runConfig}
            onRunConfigChange={onRunConfigChange}
            onRunVrp={onRunVrp}
            onDownloadVrpJson={onDownloadVrpJson}
            routeRunState={routeRunState}
          />
          <Box>
            <SectionLabel
              icon={<AttachMoneyIcon sx={{ fontSize: 14 }} />}
              label="Costos de operación"
            />
            <SliderRow
              label="Precio del diesel"
              value={config.precioDiesel}
              min={18}
              max={55}
              step={0.5}
              leftLabel="$18 / L"
              rightLabel="$55 / L"
              format={(v) => `$${v.toFixed(1)} MXN/L`}
              onChange={set("precioDiesel")}
              color="#0284c7"
            />
            <Box sx={{ mb: 1.5 }} />
            <SliderRow
              label="Costo del chofer"
              value={config.costoChofer}
              min={350}
              max={1200}
              step={50}
              leftLabel="$350"
              rightLabel="$1,200"
              format={(v) => `$${v.toLocaleString()} / día`}
              onChange={set("costoChofer")}
              color="#0284c7"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: BORDER }} />

        {/* ── Resumen técnico ───────────────────────────────────────────────── */}
        <Accordion
          expanded={techOpen}
          onChange={() => setTechOpen((o) => !o)}
          disableGutters
          elevation={0}
          sx={{
            background: "transparent",
            border: `1px solid ${BORDER}`,
            borderRadius: "8px !important",
            mb: 2,
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ fontSize: 14, color: INK_3 }} />}
            sx={{
              minHeight: 36,
              px: 1.5,
              "& .MuiAccordionSummary-content": { my: 0 },
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: INK_2 }}>
              Parámetros técnicos derivados
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 1.5, pt: 0, pb: 1.5 }}>
            <Box
              component="pre"
              sx={{
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: 10,
                color: INK_2,
                background: "#f5f0eb",
                borderRadius: 1.5,
                p: 1.2,
                m: 0,
                lineHeight: 1.8,
                overflowX: "auto",
              }}
            >
              {Object.entries(params)
                .map(([k, v]) => `${k.padEnd(26)} = ${v}`)
                .join("\n")}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* ── Export button ─────────────────────────────────────────────────── */}
        <Box
          onClick={exportConfig}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            py: 1.1,
            borderRadius: 2,
            cursor: "pointer",
            background: copied ? "#d1fae5" : AMBER,
            color: copied ? "#065f46" : "#fff",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.01em",
            transition: "all 0.2s",
            userSelect: "none",
            boxShadow: copied ? "none" : `0 2px 8px ${AMBER}55`,
            "&:hover": {
              background: copied ? "#d1fae5" : "#b45309",
              boxShadow: copied ? "none" : `0 3px 12px ${AMBER}77`,
            },
            "&:active": { transform: "scale(0.98)" },
          }}
        >
          {copied ? (
            <>
              <CheckIcon sx={{ fontSize: 15 }} /> Config copiada al portapapeles
            </>
          ) : (
            <>
              <ContentCopyIcon sx={{ fontSize: 15 }} /> Copiar config para
              Python
            </>
          )}
        </Box>

        <Typography
          sx={{
            fontSize: 9,
            color: INK_3,
            textAlign: "center",
            mt: 1,
            lineHeight: 1.5,
          }}
        >
          Pega el resultado en vrp_tuned.py y re-ejecuta
        </Typography>
      </Box>
    </Box>
  );
}
