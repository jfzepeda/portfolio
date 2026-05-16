"use client";

import { useMemo } from "react";
import { Box, Paper, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AssignmentIcon from "@mui/icons-material/Assignment";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFollowupDate(conv) {
  return conv.followup_date ?? conv.date ?? null;
}

function isOverdue(conv) {
  const raw = getFollowupDate(conv);
  if (!raw) return false;
  const d = new Date(raw);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

function isToday(conv) {
  const raw = getFollowupDate(conv);
  if (!raw) return false;
  const d = new Date(raw);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, color, subtitle }) {
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 160,
        p: 2,
        borderRadius: 2,
        borderLeft: `4px solid ${color}`,
        border: "1px solid",
        borderColor: "divider",
        borderLeftColor: color,
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          backgroundColor: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ color, fontSize: 22 }} />
      </Box>
      <Box>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, lineHeight: 1, color: "text.primary" }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mt: 0.25, lineHeight: 1.3 }}
        >
          {label}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color, fontWeight: 600 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function KpiCards({ conversations = [], quotes = [] }) {
  const { overdue, todayCount } = useMemo(() => {
    let overdue = 0;
    let todayCount = 0;
    for (const conv of conversations) {
      if (isOverdue(conv)) overdue++;
      else if (isToday(conv)) todayCount++;
    }
    return { overdue, todayCount };
  }, [conversations]);

  const quoteCount = quotes.length;

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
      <KpiCard
        icon={WarningAmberIcon}
        label="Conversaciones vencidas"
        value={overdue}
        color="#EF4444"
        subtitle={overdue > 0 ? "Requieren atención" : null}
      />
      <KpiCard
        icon={EventNoteIcon}
        label="Seguimientos de hoy"
        value={todayCount}
        color="#6366F1"
      />
      <KpiCard
        icon={AssignmentIcon}
        label="Cotizaciones en seguimiento"
        value={quoteCount}
        color="#F59E0B"
      />
    </Box>
  );
}
