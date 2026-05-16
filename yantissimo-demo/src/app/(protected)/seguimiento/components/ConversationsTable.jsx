"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Chip, Tooltip, Typography } from "@mui/material";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import dayjs from "dayjs";
import SuperTable from "~/components/tables/SuperTable";
import {
  FOLLOWUP_TEMPERATURES,
  LEAD_STAGES,
} from "~/app/(protected)/agent/utils/stageConfig";

// ── Helpers ───────────────────────────────────────────────────────────────────

const TEMP_MAP = Object.fromEntries(
  FOLLOWUP_TEMPERATURES.map((t) => [t.key, t])
);

function getFollowupDate(row) {
  return row.followup_date ?? row.date ?? null;
}

function getTemperature(row) {
  return row.followup_temperature ?? row.temperature ?? null;
}

function getReason(row) {
  return row.followup_reason ?? row.reason ?? "";
}

function getDisplayName(row) {
  return row.nombre ?? row.client_name ?? row.name ?? row.contact_name ?? "";
}

function isOverdue(row) {
  const raw = getFollowupDate(row);
  if (!raw) return false;
  const d = new Date(raw);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

// ── Column definitions ────────────────────────────────────────────────────────

function buildColumns(onReschedule, onReopen, onClose, router) {
  return [
    {
      key: "nombre",
      label: "Nombre",
      render: (value, row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {getDisplayName(row) || "Sin nombre"}
        </Typography>
      ),
    },
    {
      key: "user_id",
      label: "Teléfono",
      render: (value) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: "monospace", fontSize: 13 }}
        >
          {value}
        </Typography>
      ),
    },
    {
      key: "_followup_date",
      label: "Fecha Seguimiento",
      sortable: true,
      render: (_, row) => {
        const raw = getFollowupDate(row);
        if (!raw) return <Typography variant="body2">—</Typography>;
        const overdue = isOverdue(row);
        return (
          <Typography
            variant="body2"
            sx={{
              fontWeight: overdue ? 700 : 400,
              color: overdue ? "error.main" : "text.primary",
            }}
          >
            {dayjs(raw).format("DD MMM YYYY")}
            {overdue && (
              <Box
                component="span"
                sx={{
                  ml: 0.75,
                  fontSize: 10,
                  backgroundColor: "error.light",
                  color: "error.main",
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  fontWeight: 700,
                }}
              >
                VENCIDO
              </Box>
            )}
          </Typography>
        );
      },
    },
    {
      key: "_temperature",
      label: "Temp.",
      render: (_, row) => {
        const tempKey = getTemperature(row);
        const temp = TEMP_MAP[tempKey];
        if (!temp) return <Typography variant="body2">—</Typography>;
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: temp.color,
                flexShrink: 0,
              }}
            />
            <Typography variant="body2">{temp.label}</Typography>
          </Box>
        );
      },
    },
    {
      key: "_reason",
      label: "Motivo",
      render: (_, row) => {
        const reason = getReason(row);
        return (
          <Tooltip title={reason} placement="top">
            <Typography
              variant="body2"
              sx={{
                maxWidth: 200,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {reason || "—"}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      key: "followup_previous_stage",
      label: "Etapa Anterior",
      render: (value) => {
        const stage = LEAD_STAGES[value];
        if (!stage) return <Typography variant="body2">—</Typography>;
        return (
          <Chip
            size="small"
            label={stage.label}
            sx={{
              color: stage.color,
              borderColor: stage.color,
              fontSize: 11,
            }}
            variant="outlined"
          />
        );
      },
    },
    {
      key: "lastmessage",
      label: "Último Mensaje",
      render: (value) => {
        const tsmp = value?.tsmp;
        if (!tsmp) return <Typography variant="body2">—</Typography>;
        return (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {dayjs(tsmp).format("DD MMM HH:mm")}
          </Typography>
        );
      },
    },
    {
      key: "__actions__",
      label: "Acciones",
      sortable: false,
      filterable: false,
      align: "right",
      render: (_, row) => (
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
          <Tooltip title="Reprogramar">
            <Button
              size="small"
              variant="outlined"
              color="primary"
              sx={{ minWidth: 0, px: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                onReschedule(row);
              }}
            >
              <EditCalendarIcon sx={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
          <Tooltip title="Reabrir (mover a Abiertos)">
            <Button
              size="small"
              variant="outlined"
              color="warning"
              sx={{ minWidth: 0, px: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                onReopen(row);
              }}
            >
              <LockOpenIcon sx={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
          <Tooltip title="Marcar como cerrado">
            <Button
              size="small"
              variant="outlined"
              color="success"
              sx={{ minWidth: 0, px: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                onClose(row);
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
          <Tooltip title="Ir al chat en el CRM">
            <Button
              size="small"
              variant="contained"
              color="primary"
              sx={{ minWidth: 0, px: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                router.push("/agent");
              }}
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
        </Box>
      ),
    },
  ];
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ConversationsTable({
  conversations = [],
  loading = false,
  curRole,
  onReschedule,
  onReopen,
  onClose,
}) {
  const router = useRouter();

  const columns = buildColumns(onReschedule, onReopen, onClose, router);

  // Enrich rows with sortable computed fields so SuperTable can sort by them
  const rows = conversations.map((conv) => ({
    ...conv,
    _followup_date: getFollowupDate(conv),
    _temperature: getTemperature(conv),
    _reason: getReason(conv),
  }));

  return (
    <SuperTable
      rows={rows}
      columns={columns}
      rowKey="user_id"
      defaultSortColumn="_followup_date"
      defaultSortOrder="asc"
      paginated
      loading={loading}
      emptyMessage="No hay conversaciones en seguimiento"
      userRole={curRole}
      size="small"
      dense
      rowProps={(row) =>
        isOverdue(row)
          ? { sx: { backgroundColor: "rgba(239,68,68,0.04)" } }
          : {}
      }
    />
  );
}
