"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Divider,
  Chip,
  IconButton,
  Collapse,
  Tooltip,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LayersClearIcon from "@mui/icons-material/LayersClear";
import FunctionsIcon from "@mui/icons-material/Functions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import RestoreIcon from "@mui/icons-material/Restore";
import MapIcon from "@mui/icons-material/Map";

// ─── Colors ──────────────────────────────────────────────────────────────────
const AMBER = "var(--accent)";
const AMBER_L = "var(--accent-soft)";
const INK = "var(--text-primary)";
const INK_2 = "var(--text-secondary)";
const INK_3 = "var(--text-muted)";
const BORDER = "var(--glass-border)";
const BG = "var(--bg-elevated)";
const BG_CARD = "var(--glass-bg)";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const THRESHOLDS = [
  { min: 85, color: "#16a34a", label: "Óptimo", key: "OPTIMO" },
  { min: 70, color: "#2563eb", label: "Aceptable", key: "ACEPTABLE" },
  { min: 50, color: "#ea580c", label: "Ineficiente", key: "INEFICIENTE" },
  { min: 0, color: "#dc2626", label: "Crítico", key: "CRITICO" },
];

const VARIABLES = [
  { name: "pc", desc: "% Ocupación (0–100)" },
  { name: "dm", desc: "Cajas entregadas" },
  { name: "ca", desc: "Capacidad del camión" },
  { name: "ti", desc: "Tiendas por ruta" },
  { name: "fr", desc: "Frecuencia de visita" },
  { name: "dist", desc: "Distancia de ruta (km)" },
];

const SAMPLE_VARS = { pc: 75.2, dm: 540, ca: 720, ti: 8, fr: 7, dist: 45.3 };

const PRESETS = [
  { label: "% Ocupación", formula: "pc" },
  {
    label: "Ocup + Dist",
    formula: "pc * 0.7 + Math.min(100, (dist / 80) * 100) * 0.3",
  },
  {
    label: "Eficiencia/tienda",
    formula: "Math.min(100, (dm / ti) / (ca / ti) * 100)",
  },
  { label: "Ocup × Frec.", formula: "Math.min(100, pc * (fr / 14))" },
];

function getColor(score) {
  for (const t of THRESHOLDS) if (score >= t.min) return t.color;
  return "#dc2626";
}

function getSem(score) {
  for (const t of THRESHOLDS) if (score >= t.min) return t.key;
  return "CRITICO";
}

function testFormula(formula, vars) {
  try {
    const fn = new Function(
      ...Object.keys(vars),
      `"use strict"; return (${formula});`
    );
    const result = fn(...Object.values(vars));
    if (typeof result !== "number" || !isFinite(result))
      return { ok: false, error: "Resultado no numérico" };
    return { ok: true, value: Math.max(0, Math.min(100, result)) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function SectionHeader({ label, count, open, onToggle, extra }) {
  return (
    <Box
      onClick={onToggle}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        px: 2,
        py: 1,
        "&:hover": { background: "rgba(0,0,0,0.025)" },
        userSelect: "none",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: INK_3,
            fontSize: 9,
          }}
        >
          {label}
        </Typography>
        {count !== undefined && (
          <Chip
            label={count}
            size="small"
            sx={{
              height: 16,
              fontSize: 9,
              background: "#f0ebe4",
              color: INK_2,
              "& .MuiChip-label": { px: 0.8 },
            }}
          />
        )}
        {extra}
      </Box>
      {open ? (
        <ExpandLessIcon sx={{ fontSize: 14, color: INK_3 }} />
      ) : (
        <ExpandMoreIcon sx={{ fontSize: 14, color: INK_3 }} />
      )}
    </Box>
  );
}

function OccBar({ score, compact }) {
  const color = getColor(score);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
      <Box
        sx={{
          flex: 1,
          height: compact ? 3 : 4,
          background: "#ede8e1",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${Math.min(score, 100)}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: 4,
            transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </Box>
      <Typography
        sx={{
          fontWeight: 700,
          color,
          fontSize: 10,
          minWidth: 28,
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {Math.round(score)}%
      </Typography>
    </Box>
  );
}

// ─── ROUTES TAB ──────────────────────────────────────────────────────────────
function RoutesTab({
  routes,
  cedis,
  selectedZone,
  onSelectZone,
  selectedRoute,
  onSelectRoute,
  filter,
  onFilterChange,
  formula,
  onFormulaChange,
  scoredStores,
}) {
  const [search, setSearch] = useState("");
  const [openSections, setOpenSections] = useState({
    filters: true,
    zones: true,
    routes: true,
    formula: false,
  });
  const [draftFormula, setDraftFormula] = useState(formula);
  const toggle = useCallback(
    (key) => setOpenSections((p) => ({ ...p, [key]: !p[key] })),
    []
  );

  const formulaTest = useMemo(
    () => testFormula(draftFormula, SAMPLE_VARS),
    [draftFormula]
  );

  const zones = useMemo(() => {
    const map = {};
    routes.forEach((r) => {
      const z = r.zone;
      if (!map[z]) map[z] = { name: z, routes: [], totalStores: 0, avgPc: 0 };
      map[z].routes.push(r);
      map[z].totalStores += r.stores.length;
    });
    Object.values(map).forEach((z) => {
      z.avgPc = Math.round(
        z.routes.reduce((s, r) => s + r.avgPc, 0) / z.routes.length
      );
      z.cedisNm = z.routes[0]?.cedisNm || "";
    });
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  }, [routes]);

  const filteredRoutes = useMemo(() => {
    let list = routes;
    if (selectedZone) list = list.filter((r) => r.zone === selectedZone);
    if (filter !== "ALL") list = list.filter((r) => getSem(r.avgPc) === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.zone.toLowerCase().includes(q) ||
          r.stores.some((s) => s.nm.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => a.avgPc - b.avgPc);
  }, [routes, selectedZone, filter, search]);

  const filterCounts = useMemo(() => {
    const base = selectedZone
      ? routes.filter((r) => r.zone === selectedZone)
      : routes;
    const counts = { ALL: base.length };
    THRESHOLDS.forEach((t) => {
      counts[t.key] = base.filter((r) => getSem(r.avgPc) === t.key).length;
    });
    return counts;
  }, [routes, selectedZone]);

  const handleApplyFormula = () => {
    if (formulaTest.ok) onFormulaChange(draftFormula);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "hidden",
      }}
    >
      {/* Search */}
      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar ruta o tienda…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 15, color: INK_3 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            pt: 1,
            "& .MuiOutlinedInput-root": {
              fontSize: 12,
              borderRadius: 2,
              background: BG_CARD,
              "& fieldset": { borderColor: BORDER },
              "&:hover fieldset": { borderColor: "#c0bab5" },
              "&.Mui-focused fieldset": { borderColor: AMBER },
            },
          }}
        />
      </Box>

      <Divider sx={{ borderColor: BORDER }} />

      {/* Status filter */}
      <SectionHeader
        label="Estado"
        open={openSections.filters}
        onToggle={() => toggle("filters")}
        extra={
          filter !== "ALL" && (
            <Tooltip title="Limpiar filtro">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onFilterChange("ALL");
                }}
                sx={{ p: 0.3 }}
              >
                <LayersClearIcon sx={{ fontSize: 12, color: INK_3 }} />
              </IconButton>
            </Tooltip>
          )
        }
      />
      <Collapse in={openSections.filters} sx={{ flexShrink: 0 }}>
        <Box
          sx={{
            px: 1.5,
            pb: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 0.4,
          }}
        >
          {[
            { key: "ALL", label: "Todas las rutas", color: INK_2 },
            ...THRESHOLDS.map((t) => ({
              key: t.key,
              label: t.label,
              color: t.color,
            })),
          ].map((f) => (
            <Box
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 1.2,
                py: 0.65,
                borderRadius: 1.5,
                cursor: "pointer",
                background: filter === f.key ? `${f.color}14` : "transparent",
                border: `1px solid ${
                  filter === f.key ? f.color + "40" : "transparent"
                }`,
                "&:hover": { background: `${f.color}0e` },
                transition: "all 0.12s",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.9 }}>
                {f.key !== "ALL" && (
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      backgroundColor: f.color,
                      flexShrink: 0,
                    }}
                  />
                )}
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: filter === f.key ? 700 : 400,
                    color: filter === f.key ? f.color : "#444",
                  }}
                >
                  {f.label}
                </Typography>
              </Box>
              <Chip
                label={filterCounts[f.key] ?? 0}
                size="small"
                sx={{
                  height: 17,
                  fontSize: 9,
                  background: filter === f.key ? f.color : "#ede8e1",
                  color: filter === f.key ? "#fff" : INK_3,
                  fontWeight: 600,
                  "& .MuiChip-label": { px: 0.7 },
                }}
              />
            </Box>
          ))}
        </Box>
      </Collapse>

      <Divider sx={{ borderColor: BORDER }} />

      {/* Zones */}
      <SectionHeader
        label="Zonas"
        count={zones.length}
        open={openSections.zones}
        onToggle={() => toggle("zones")}
        extra={
          selectedZone && (
            <Tooltip title="Ver todas las zonas">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectZone(null);
                }}
                sx={{ p: 0.3 }}
              >
                <LayersClearIcon sx={{ fontSize: 12, color: INK_3 }} />
              </IconButton>
            </Tooltip>
          )
        }
      />
      <Collapse in={openSections.zones} sx={{ flexShrink: 0 }}>
        <Box
          sx={{
            px: 1.5,
            pb: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 0.4,
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {zones.map((z) => {
            const isActive = selectedZone === z.name;
            return (
              <Box
                key={z.name}
                onClick={() => onSelectZone(isActive ? null : z.name)}
                sx={{
                  px: 1.2,
                  py: 0.8,
                  borderRadius: 1.5,
                  cursor: "pointer",
                  background: isActive ? "#eff6ff" : BG_CARD,
                  border: `1px solid ${isActive ? "#2563eb44" : BORDER}`,
                  boxShadow: isActive
                    ? "0 1px 4px rgba(37,99,235,0.1)"
                    : "0 1px 2px rgba(0,0,0,0.03)",
                  "&:hover": { background: isActive ? "#eff6ff" : "#f7f5f2" },
                  transition: "all 0.12s",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.4,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 11,
                      color: isActive ? "#1d4ed8" : INK,
                    }}
                  >
                    {z.name}
                  </Typography>
                  <Typography sx={{ fontSize: 9, color: INK_3 }}>
                    {z.routes.length} rutas · {z.totalStores} tiendas
                  </Typography>
                </Box>
                <OccBar score={z.avgPc} compact />
              </Box>
            );
          })}
        </Box>
      </Collapse>

      {/* Routes list */}
      <Box
        sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
      >
        <Divider sx={{ borderColor: BORDER }} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
          }}
        >
          <SectionHeader
            label={selectedZone ? `Rutas — ${selectedZone}` : "Rutas"}
            count={filteredRoutes.length}
            open={openSections.routes}
            onToggle={() => toggle("routes")}
            extra={
              selectedRoute && (
                <Tooltip title="Deseleccionar ruta">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRoute(null);
                    }}
                    sx={{ p: 0.3 }}
                  >
                    <LayersClearIcon sx={{ fontSize: 12, color: INK_3 }} />
                  </IconButton>
                </Tooltip>
              )
            }
          />
          <Collapse
            in={openSections.routes}
            sx={{
              flex: openSections.routes ? 1 : "0 0 auto",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 1.5,
                pb: 1.5,
                display: "flex",
                flexDirection: "column",
                gap: 0.4,
                minHeight: 0,
                maxHeight: "100%",
                overflowY: "auto",
              }}
            >
              {filteredRoutes.length === 0 && (
                <Typography sx={{ color: INK_3, fontSize: 11, px: 0.5, py: 1 }}>
                  Sin rutas que coincidan
                </Typography>
              )}
              {filteredRoutes.map((r) => {
                const isActive = selectedRoute === r.id;
                const c = getColor(r.avgPc);
                return (
                  <Box
                    key={r.id}
                    onClick={() => onSelectRoute(isActive ? null : r.id)}
                    sx={{
                      px: 1.2,
                      py: 0.9,
                      borderRadius: 1.5,
                      cursor: "pointer",
                      background: isActive ? "#fffbeb" : BG_CARD,
                      border: `1px solid ${isActive ? AMBER + "66" : BORDER}`,
                      borderLeft: `3px solid ${c}`,
                      boxShadow: isActive
                        ? `0 2px 8px ${AMBER}20`
                        : "0 1px 2px rgba(0,0,0,0.04)",
                      "&:hover": {
                        background: isActive ? "#fffbeb" : "#f7f5f2",
                      },
                      transition: "all 0.12s",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          fontFamily: "monospace",
                          color: INK,
                        }}
                      >
                        {r.id}
                      </Typography>
                      <Typography sx={{ fontSize: 9, color: INK_3 }}>
                        {r.stores.length} · {r.totalDist} km
                      </Typography>
                    </Box>
                    <OccBar score={r.avgPc} compact />
                    {!selectedZone && (
                      <Typography
                        sx={{
                          fontSize: 9,
                          color: INK_3,
                          display: "block",
                          mt: 0.3,
                        }}
                      >
                        {r.zone}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Collapse>
        </Box>

        <Divider sx={{ borderColor: BORDER }} />

        {/* Formula editor */}
        <SectionHeader
          label="Fórmula de color"
          open={openSections.formula}
          onToggle={() => toggle("formula")}
          extra={
            formula !== "pc" && (
              <Chip
                label="activa"
                size="small"
                sx={{
                  height: 14,
                  fontSize: 9,
                  background: AMBER_L,
                  color: "#92400e",
                  border: `1px solid ${AMBER}55`,
                  "& .MuiChip-label": { px: 0.6 },
                }}
              />
            )
          }
        />
        <Collapse in={openSections.formula} sx={{ flexShrink: 0 }}>
          <Box sx={{ px: 1.5, pb: 2 }}>
            <Typography
              sx={{
                color: INK_3,
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                mb: 0.8,
              }}
            >
              Variables
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
              {VARIABLES.map((v) => (
                <Tooltip key={v.name} title={v.desc} arrow placement="top">
                  <Chip
                    label={v.name}
                    size="small"
                    variant="outlined"
                    onClick={() => setDraftFormula((prev) => prev + v.name)}
                    sx={{
                      fontFamily: "monospace",
                      fontSize: 10,
                      height: 20,
                      cursor: "pointer",
                      borderColor: BORDER,
                      "&:hover": { borderColor: AMBER, color: AMBER },
                      "& .MuiChip-label": { px: 0.8 },
                    }}
                  />
                </Tooltip>
              ))}
            </Box>

            <Typography
              sx={{
                color: INK_3,
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                mb: 0.8,
              }}
            >
              Plantillas
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
              {PRESETS.map((p) => (
                <Chip
                  key={p.label}
                  label={p.label}
                  size="small"
                  variant={draftFormula === p.formula ? "filled" : "outlined"}
                  onClick={() => setDraftFormula(p.formula)}
                  sx={{
                    fontSize: 10,
                    height: 20,
                    cursor: "pointer",
                    ...(draftFormula === p.formula
                      ? {
                          background: AMBER,
                          color: "#fff",
                          "&:hover": { background: "#b45309" },
                        }
                      : {
                          borderColor: BORDER,
                          "&:hover": { borderColor: AMBER, color: AMBER },
                        }),
                    "& .MuiChip-label": { px: 0.8 },
                  }}
                />
              ))}
            </Box>

            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              size="small"
              value={draftFormula}
              onChange={(e) => setDraftFormula(e.target.value)}
              error={!formulaTest.ok}
              placeholder="pc"
              helperText={
                formulaTest.ok
                  ? `Ejemplo → ${formulaTest.value.toFixed(1)}%`
                  : formulaTest.error
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {formulaTest.ok ? (
                      <CheckCircleIcon
                        sx={{ fontSize: 13, color: "#16a34a" }}
                      />
                    ) : (
                      <ErrorIcon sx={{ fontSize: 13, color: "#dc2626" }} />
                    )}
                  </InputAdornment>
                ),
                sx: { fontFamily: "monospace", fontSize: 11 },
              }}
              sx={{
                mb: 1,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: BORDER },
                  "&.Mui-focused fieldset": { borderColor: AMBER },
                },
              }}
            />

            <Box sx={{ display: "flex", gap: 0.8 }}>
              <Button
                size="small"
                variant="contained"
                fullWidth
                disabled={!formulaTest.ok || draftFormula === formula}
                onClick={handleApplyFormula}
                startIcon={<FunctionsIcon sx={{ fontSize: 13 }} />}
                sx={{
                  fontSize: 11,
                  borderRadius: 1.5,
                  py: 0.5,
                  background: AMBER,
                  "&:hover": { background: "#b45309" },
                  "&.Mui-disabled": { background: "#ede8e1", color: INK_3 },
                }}
              >
                Aplicar
              </Button>
              <Tooltip title="Resetear a % ocupación">
                <IconButton
                  size="small"
                  onClick={() => {
                    setDraftFormula("pc");
                    onFormulaChange("pc");
                  }}
                  disabled={formula === "pc" && draftFormula === "pc"}
                  sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5 }}
                >
                  <RestoreIcon sx={{ fontSize: 13 }} />
                </IconButton>
              </Tooltip>
            </Box>

            {formula !== "pc" && (
              <Box
                sx={{
                  mt: 1.2,
                  p: "8px 10px",
                  borderRadius: 1.5,
                  background: AMBER_L,
                  border: `1px solid ${AMBER}44`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 9,
                    color: "#92400e",
                    fontWeight: 700,
                    mb: 0.3,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Fórmula activa
                </Typography>
                <Typography
                  sx={{
                    fontSize: 10,
                    color: INK,
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}
                >
                  {formula}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>

        {/* Footer */}
        <Box
          sx={{ px: 2, py: 1, borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}
        >
          <Typography sx={{ color: INK_3, fontSize: 9 }}>
            Fórmula retorna 0–100 · umbrales fijos
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ControlSidebar({
  routes,
  cedis,
  selectedZone,
  onSelectZone,
  selectedRoute,
  onSelectRoute,
  filter,
  onFilterChange,
  formula,
  onFormulaChange,
  scoredStores,
}) {
  return (
    <Box
      sx={{
        width: 275,
        minWidth: 275,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: BG,
        borderRight: `1px solid ${BORDER}`,
        overflowY: "hidden",
        overflowX: "hidden",
        boxShadow: "1px 0 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header eliminado: el TopBar global ya muestra el branding KIOSKO */}

      {/* ─── TAB CONTENT ────────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <RoutesTab
          routes={routes}
          cedis={cedis}
          selectedZone={selectedZone}
          onSelectZone={onSelectZone}
          selectedRoute={selectedRoute}
          onSelectRoute={onSelectRoute}
          filter={filter}
          onFilterChange={onFilterChange}
          formula={formula}
          onFormulaChange={onFormulaChange}
          scoredStores={scoredStores}
        />
      </Box>
    </Box>
  );
}
