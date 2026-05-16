"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Popper,
  Fade,
  CircularProgress,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EventNoteIcon from "@mui/icons-material/EventNote";
import api from "~/lib/api";
import { formatHiddenNumber } from "../utils/formatters";
import {
  deriveConversationState,
  FOLLOWUP_TEMPERATURES,
  normalizeStageKey,
} from "../utils/stageConfig";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const TEMP = Object.fromEntries(
  FOLLOWUP_TEMPERATURES.map((entry) => [entry.key, entry])
);

// Palette tokens — system must feel like a premium planner, not a generic dashboard
const C = {
  bg: "var(--app-calendar-bg)",
  cell: "var(--app-calendar-cell)",
  cellHasLead: "var(--app-calendar-cell-has-lead)",
  cellPast: "var(--app-calendar-cell-past)",
  gridLine: "var(--app-calendar-grid-line)",
  today: "var(--app-calendar-today)",
  dayNum: "var(--app-calendar-day)",
  dayNumPast: "var(--app-calendar-day-past)",
  header: "var(--app-calendar-header)",
  headerSub: "var(--app-calendar-header-sub)",
  popperBg: "var(--app-calendar-popper-bg)",
  popperBorder: "var(--app-calendar-popper-border)",
  border: "var(--app-calendar-grid-line)",
  popperText: "var(--app-calendar-popper-text)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCalendarCells(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Always pad to exactly 42 cells (6 rows × 7 cols) for stable height
  while (cells.length < 42) cells.push(null);
  return cells;
}

function groupByDate(convs) {
  const map = {};
  for (const c of convs) {
    // API returns `date` (not `followup_date`)
    const raw = c.date ?? c.followup_date;
    if (!raw) continue;
    const d = new Date(raw);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    (map[key] = map[key] || []).push(c);
  }
  return map;
}

function dayKey(year, month, day) {
  return `${year}-${month}-${day}`;
}

function isToday(year, month, day) {
  const t = new Date();
  return (
    day === t.getDate() && month === t.getMonth() && year === t.getFullYear()
  );
}

function isPast(year, month, day) {
  const cell = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return cell < today;
}

function fullDayLabel(year, month, day) {
  return new Date(year, month, day).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// ─── Popper Card ─────────────────────────────────────────────────────────────

function DayPopper({ anchor, leads, label }) {
  const open = Boolean(anchor) && leads.length > 0;
  return (
    <Popper
      open={open}
      anchorEl={anchor}
      placement="top"
      transition
      modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
      style={{ zIndex: 1400 }}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={120}>
          <Box
            sx={{
              backgroundColor: C.popperBg,
              border: `1px solid ${C.popperBorder}`,
              borderRadius: "10px",
              boxShadow: "var(--app-shadow-lg)",
              overflow: "hidden",
              minWidth: 190,
              maxWidth: 260,
            }}
          >
            {/* Date label */}
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderBottom: `1px solid ${C.popperBorder}`,
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.popperText,
                  textTransform: "capitalize",
                  letterSpacing: 0.3,
                }}
              >
                {label}
              </Typography>
            </Box>

            {/* Lead rows */}
            <Box sx={{ px: 1, py: 0.75 }}>
              {leads.map((lead, i) => {
                // API returns `temperature` (not `followup_temperature`)
                const temp =
                  TEMP[lead.temperature ?? lead.followup_temperature];
                return (
                  <Box
                    key={lead.user_id ?? i}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      py: 0.6,
                      borderBottom:
                        i < leads.length - 1
                          ? `1px solid ${C.popperBorder}`
                          : "none",
                    }}
                  >
                    {/* Temperature pip */}
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        backgroundColor: temp?.color ?? "var(--app-calendar-today)",
                        flexShrink: 0,
                        mt: "4px",
                      }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      {lead.nombre && (
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: C.popperText,
                            lineHeight: 1.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {lead.nombre}
                        </Typography>
                      )}
                      <Typography
                        sx={{
                          fontSize: 14,
                          color: C.popperText,
                          fontFamily: "monospace",
                          letterSpacing: 0.5,
                        }}
                      >
                        {formatHiddenNumber(lead.user_id)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Fade>
      )}
    </Popper>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FollowUpCalendar({ fixedSucursal, restrictedUserId }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Follow-up conversations fetched independently (main list omits followup fields)
  const [followUpConvs, setFollowUpConvs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hover state for the Popper
  const [popperAnchor, setPopperAnchor] = useState(null);
  const [popperLeads, setPopperLeads] = useState([]);
  const [popperLabel, setPopperLabel] = useState("");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchFollowUps = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fixedSucursal) params.append("sucursal", fixedSucursal);
      if (restrictedUserId) params.append("userId", String(restrictedUserId));

      const res = await api(`/api/conversations/followup?${params.toString()}`);
      const data = await res.json();
      console.log("Follow-up conversations fetched:", data);
      const raw = Array.isArray(data) ? data : data.conversations ?? [];

      const normalized = raw.map((c) => ({
        ...c,
        stage: normalizeStageKey(c.stage),
        state: deriveConversationState({
          ...c,
          stage: normalizeStageKey(c.stage),
        }),
      }));

      // API uses `date`; fall back to `followup_date` for forward-compat
      setFollowUpConvs(normalized.filter((c) => c.date ?? c.followup_date));
    } catch (err) {
      console.error("FollowUpCalendar fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [fixedSucursal, restrictedUserId]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  // ── Derived data ───────────────────────────────────────────────────────────
  const leadsByDate = useMemo(
    () => groupByDate(followUpConvs),
    [followUpConvs]
  );
  const cells = useMemo(
    () => buildCalendarCells(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  // Stats for the header
  const totalThisMonth = useMemo(() => {
    return followUpConvs.filter((c) => {
      const raw = c.date ?? c.followup_date;
      if (!raw) return false;
      const d = new Date(raw);
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
    }).length;
  }, [followUpConvs, viewYear, viewMonth]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };
  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // ── Hover handlers ─────────────────────────────────────────────────────────
  const handleCellEnter = (e, leads, day) => {
    if (!leads.length) return;
    setPopperAnchor(e.currentTarget);
    setPopperLeads(leads);
    setPopperLabel(fullDayLabel(viewYear, viewMonth, day));
  };
  const handleCellLeave = () => {
    setPopperAnchor(null);
    setPopperLeads([]);
    setPopperLabel("");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: C.bg,
        overflow: "hidden",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 1.5,
          borderBottom: `1px solid ${C.border}`,
          backgroundColor: C.bg,
        }}
      >
        {/* Month navigation */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={goPrev}
            sx={{
              color: C.header,
              width: 30,
              height: 30,
              "&:hover": { backgroundColor: "var(--app-calendar-hover)" },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Box sx={{ textAlign: "center", minWidth: 140 }}>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 700,
                color: C.header,
                letterSpacing: -0.3,
                lineHeight: 1.2,
              }}
            >
              {MONTHS[viewMonth]}
            </Typography>
            <Typography
              sx={{ fontSize: 11, color: C.headerSub, lineHeight: 1 }}
            >
              {viewYear}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={goNext}
            sx={{
              color: C.header,
              width: 30,
              height: 30,
              "&:hover": { backgroundColor: "var(--app-calendar-hover)" },
            }}
          >
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Right side: total + legend */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
          {loading ? (
            <CircularProgress size={14} sx={{ color: "var(--app-calendar-today)" }} />
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <EventNoteIcon sx={{ fontSize: 14, color: "var(--app-calendar-today)" }} />
              <Typography sx={{ fontSize: 12, color: C.headerSub }}>
                <Box component="span" sx={{ fontWeight: 700, color: C.header }}>
                  {totalThisMonth}
                </Box>{" "}
                este mes
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              width: 1,
              height: 16,
              backgroundColor: C.border,
            }}
          />

          {/* Temperature legend */}
          <Box sx={{ display: "flex", gap: 1.5 }}>
            {Object.entries(TEMP).map(([key, { color, label }]) => (
              <Box
                key={key}
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: color,
                    flexShrink: 0,
                  }}
                />
                <Typography sx={{ fontSize: 11, color: C.headerSub }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Day-of-week labels ──────────────────────────────────────────────── */}
      <Box
        sx={{
          flexShrink: 0,
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          px: 2,
          pt: 1.5,
          pb: 0.75,
        }}
      >
        {DAYS.map((d, i) => (
          <Typography
            key={d}
            sx={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              // Weekend cols slightly muted
              color: i === 0 || i === 6
                ? "var(--app-calendar-weekend)"
                : "var(--app-text-secondary)",
            }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0, // crucial: allows grid to shrink inside flex column
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gridTemplateRows: "repeat(6, 1fr)",
          gap: "1px",
          mx: 2,
          mb: 2,
          borderRadius: "10px",
          overflow: "hidden",
          border: `1px solid ${C.gridLine}`,
          backgroundColor: C.gridLine, // gap color = grid lines
          boxShadow: "0 2px 12px var(--app-overlay-primary-soft)",
        }}
      >
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <Box key={`empty-${idx}`} sx={{ backgroundColor: C.cellPast }} />
            );
          }

          const leads = leadsByDate[dayKey(viewYear, viewMonth, day)] ?? [];
          const hasLeads = leads.length > 0;
          const today_ = isToday(viewYear, viewMonth, day);
          const past_ = isPast(viewYear, viewMonth, day);

          return (
            <Box
              key={`day-${day}`}
              onMouseEnter={(e) => hasLeads && handleCellEnter(e, leads, day)}
              onMouseLeave={hasLeads ? handleCellLeave : undefined}
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "space-between",
                p: "8px 10px 7px",
                backgroundColor: today_
                  ? "var(--app-calendar-hover)"
                  : hasLeads
                  ? C.cellHasLead
                  : past_
                  ? C.cellPast
                  : C.cell,
                cursor: hasLeads ? "pointer" : "default",
                transition: "background-color 0.12s ease",
                "&:hover": hasLeads
                  ? { backgroundColor: "var(--app-calendar-active)" }
                  : {},
              }}
            >
              {/* Day number */}
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  backgroundColor: today_ ? C.today : "transparent",
                  flexShrink: 0,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: today_ ? 700 : past_ ? 400 : 500,
                    color: today_ ? "var(--app-text-inverse)" : past_ ? C.dayNumPast : C.dayNum,
                    lineHeight: 1,
                  }}
                >
                  {day}
                </Typography>
              </Box>

              {/* Temperature dots — bottom of cell */}
              {hasLeads && (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "3px",
                    alignSelf: "flex-end",
                  }}
                >
                  {leads.slice(0, 5).map((lead, i) => {
                    // API returns `temperature` (not `followup_temperature`)
                    const tempColor =
                      TEMP[lead.temperature ?? lead.followup_temperature]
                        ?.color ?? "var(--app-calendar-today)";
                    return (
                      <Box
                        key={i}
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          backgroundColor: today_
                            ? "var(--app-calendar-indicator-muted)"
                            : tempColor,
                          flexShrink: 0,
                        }}
                      />
                    );
                  })}
                  {leads.length > 5 && (
                    <Typography
                      sx={{
                        fontSize: 9,
                        color: "var(--app-calendar-today)",
                        fontWeight: 700,
                        lineHeight: "7px",
                      }}
                    >
                      +{leads.length - 5}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* ── Popper (hover detail) ───────────────────────────────────────────── */}
      <DayPopper
        anchor={popperAnchor}
        leads={popperLeads}
        label={popperLabel}
      />
    </Box>
  );
}
