"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Chip, Tooltip, Typography } from "@mui/material";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import dayjs from "dayjs";
import SuperTable from "~/components/tables/SuperTable";
import { doctypeOptions } from "~/utils/global";
import { currencyFormatter, splitName, trimName } from "~/utils/formaters";

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(dateStr) {
  if (!dateStr) return null;
  return dayjs().diff(dayjs(dateStr), "day");
}

function StaleChip({ days }) {
  if (days === null || days < 7) return null;
  const isVeryStale = days >= 14;
  return (
    <Box
      component="span"
      sx={{
        ml: 0.5,
        fontSize: 10,
        backgroundColor: isVeryStale ? "error.light" : "warning.light",
        color: isVeryStale ? "error.main" : "warning.dark",
        px: 0.75,
        py: 0.25,
        borderRadius: 1,
        fontWeight: 700,
      }}
    >
      {days}d
    </Box>
  );
}

// ── Column definitions ────────────────────────────────────────────────────────

function buildColumns(router) {
  return [
    {
      key: "created_at",
      label: "Fecha",
      render: (value) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="body2">
            {value ? dayjs(value).format("DD MMM") : "—"}
          </Typography>
          <StaleChip days={daysAgo(value)} />
        </Box>
      ),
    },
    {
      key: "id",
      label: "Folio",
      render: (value, row) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: "monospace", fontWeight: 600, fontSize: 13 }}
        >
          {row.sucursal ? `${row.sucursal}-${value}` : value}
        </Typography>
      ),
    },
    {
      key: "client_name",
      label: "Cliente",
      render: (value) => (
        <Typography variant="body2">{trimName(value) || "—"}</Typography>
      ),
    },
    {
      key: "seller",
      label: "Vendedor",
      render: (value) => (
        <Typography variant="body2">{splitName(value) || "—"}</Typography>
      ),
    },
    {
      key: "phone",
      label: "Teléfono",
      render: (value) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: "monospace", fontSize: 13 }}
        >
          {value || "—"}
        </Typography>
      ),
    },
    {
      key: "total",
      label: "Total",
      render: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {value != null ? currencyFormatter(value) : "—"}
        </Typography>
      ),
    },
    {
      key: "channel",
      label: "Canal",
      render: (value) => (
        <Typography variant="body2">{value || "—"}</Typography>
      ),
    },
    {
      key: "type",
      label: "Fase",
      render: (value) => {
        const opt = doctypeOptions[value];
        return (
          <Chip
            size="small"
            label={opt ? opt.text : value}
            sx={{
              color: opt ? opt.color : "text.primary",
              borderColor: opt ? opt.color : "text.primary",
              fontSize: 11,
            }}
            variant="outlined"
          />
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
          <Tooltip title="Abrir suite de cotización">
            <Button
              variant="contained"
              size="small"
              color="primary"
              sx={{ minWidth: 0, px: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/cotizaciones/${row.id}/pre`);
              }}
            >
              <DriveFileMoveIcon sx={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
        </Box>
      ),
    },
  ];
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function QuotesTable({
  quotes = [],
  loading = false,
  curRole,
}) {
  const router = useRouter();
  const columns = buildColumns(router);

  return (
    <SuperTable
      rows={quotes}
      columns={columns}
      rowKey="id"
      defaultSortColumn="created_at"
      defaultSortOrder="desc"
      paginated
      loading={loading}
      emptyMessage="No hay cotizaciones en seguimiento"
      userRole={curRole}
      size="small"
      dense
      onRowClick={(row) => router.push(`/cotizaciones/${row.id}/pre`)}
      rowProps={(row) => {
        const days = daysAgo(row.created_at);
        if (days >= 14) return { sx: { backgroundColor: "error.light" } };
        if (days >= 7) return { sx: { backgroundColor: "warning.light" } };
        return {};
      }}
    />
  );
}
