"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import QrCodeIcon from "@mui/icons-material/QrCode2";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LanguageIcon from "@mui/icons-material/Language";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { getJson } from "~/lib/api";
import { APP_COLOR_VARS as C } from "~/theme";
import Header from "~/components/header";

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmt = new Intl.NumberFormat("es-MX");

function KpiCard({ icon, label, value, sub, accent }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: C.shadow.sm,
        border: `1px solid ${C.border.subtle}`,
        flex: 1,
        minWidth: 160,
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction="row" alignItems="center" gap={1.5} mb={1}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: accent ?? C.primary.soft,
              color: accent ? C.text.inverse : C.primary.main,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Typography variant="body2" color={C.text.secondary} fontWeight={500}>
            {label}
          </Typography>
        </Stack>
        <Typography variant="h4" fontWeight={700} color={C.text.primary}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" color={C.text.muted}>
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function BarList({ title, rows = [], valueKey = "scans", labelKey }) {
  const max = Math.max(...rows.map((r) => Number(r[valueKey])), 1);
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: C.shadow.sm,
        border: `1px solid ${C.border.subtle}`,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          color={C.text.secondary}
          mb={2}
          textTransform="uppercase"
          letterSpacing={0.5}
          fontSize={11}
        >
          {title}
        </Typography>
        <Stack gap={1.25}>
          {rows.length === 0 && (
            <Typography variant="body2" color={C.text.muted}>
              Sin datos
            </Typography>
          )}
          {rows.map((row, i) => {
            const label = row[labelKey] || "—";
            const val = Number(row[valueKey]);
            const pct = Math.round((val / max) * 100);
            return (
              <Box key={i}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  mb={0.4}
                >
                  <Typography
                    variant="body2"
                    color={C.text.primary}
                    fontWeight={500}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "70%",
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography variant="body2" color={C.text.secondary}>
                    {fmt.format(val)}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    height: 6,
                    borderRadius: 99,
                    bgcolor: C.border.subtle,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${pct}%`,
                      height: "100%",
                      borderRadius: 99,
                      bgcolor: C.primary.main,
                      transition: "width 0.5s ease",
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

function SparkLine({ rows = [] }) {
  if (rows.length < 2) return null;
  const vals = rows.map((r) => Number(r.scans));
  const max = Math.max(...vals, 1);
  const W = 100;
  const H = 48;
  const pts = vals
    .map((v, i) => {
      const x = (i / (vals.length - 1)) * W;
      const y = H - (v / max) * H;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: 48 }}
    >
      <polyline
        points={pts}
        fill="none"
        stroke="var(--app-primary-main)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function QrStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [campana, setCampana] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const [scans, setScans] = useState([]);
  const [scansLoading, setScansLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getJson("/qr/stats", {
        trackingId: campana || undefined,
        desde: desde || undefined,
        hasta: hasta || undefined,
      });
      setStats(data);
    } catch (e) {
      setError(e.message || "Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  }, [campana, desde, hasta]);

  const fetchScans = useCallback(async () => {
    setScansLoading(true);
    try {
      const data = await getJson("/qr/scans", {
        trackingId: campana || undefined,
        limit: 50,
      });
      setScans(data);
    } catch {
      setScans([]);
    } finally {
      setScansLoading(false);
    }
  }, [campana]);

  useEffect(() => {
    fetchStats();
    fetchScans();
  }, [fetchStats, fetchScans]);

  const campanasDisponibles = stats?.porCampana ?? [];
  const totalScans = stats?.total ?? 0;
  const topDevice = stats?.porDevice?.[0]?.device_type ?? "—";
  const topPais = stats?.porPais?.[0]?.country ?? "—";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: C.surface.page,
        p: { xs: 2, md: 4 },
      }}
    >
      <Header
        title="QR Campañas"
        subtitle="Tracking y análisis de escaneos"
        startIcon={<QrCodeIcon sx={{ color: C.primary.main, fontSize: 28 }} />}
        titleSx={{ typography: "h5", fontWeight: 700, color: C.text.primary }}
        subtitleSx={{ typography: "body2", color: C.text.muted }}
        sx={{ pt: 0, mb: 3 }}
      />

      {/* filtros */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: C.shadow.sm,
          border: `1px solid ${C.border.subtle}`,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            gap={2}
            alignItems={{ sm: "center" }}
          >
            <Select
              size="small"
              value={campana}
              onChange={(e) => setCampana(e.target.value)}
              displayEmpty
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Todas las campañas</MenuItem>
              {campanasDisponibles.map((c) => (
                <MenuItem key={c.tracking_id} value={c.tracking_id}>
                  {c.tracking_id}
                </MenuItem>
              ))}
            </Select>
            <TextField
              size="small"
              label="Desde"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="Hasta"
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* loading / error */}
      {loading && (
        <Stack alignItems="center" py={8}>
          <CircularProgress sx={{ color: C.primary.main }} />
        </Stack>
      )}
      {error && !loading && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {!loading && stats && (
        <>
          {/* KPIs */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            gap={2}
            mb={3}
            flexWrap="wrap"
          >
            <KpiCard
              icon={<QrCodeIcon fontSize="small" />}
              label="Total escaneos"
              value={fmt.format(totalScans)}
              sub="en el período seleccionado"
            />
            <KpiCard
              icon={<PhoneAndroidIcon fontSize="small" />}
              label="Dispositivo top"
              value={topDevice}
              sub={`${fmt.format(stats.porDevice?.[0]?.scans ?? 0)} escaneos`}
            />
            <KpiCard
              icon={<LanguageIcon fontSize="small" />}
              label="País top"
              value={topPais}
              sub={`${fmt.format(stats.porPais?.[0]?.scans ?? 0)} escaneos`}
            />
            <KpiCard
              icon={<TrendingUpIcon fontSize="small" />}
              label="Campañas activas"
              value={campanasDisponibles.length}
              sub="con al menos 1 scan"
            />
          </Stack>

          {/* tendencia diaria */}
          {stats.porDia?.length > 1 && (
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: C.shadow.sm,
                border: `1px solid ${C.border.subtle}`,
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color={C.text.secondary}
                    textTransform="uppercase"
                    letterSpacing={0.5}
                    fontSize={11}
                  >
                    Escaneos por día
                  </Typography>
                  <Typography variant="caption" color={C.text.muted}>
                    {stats.porDia[0]?.dia} → {stats.porDia.at(-1)?.dia}
                  </Typography>
                </Stack>
                <SparkLine rows={stats.porDia} />
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  mt={0.5}
                >
                  <Typography variant="caption" color={C.text.muted}>
                    {stats.porDia[0]?.dia}
                  </Typography>
                  <Typography variant="caption" color={C.text.muted}>
                    {stats.porDia.at(-1)?.dia}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* bar lists */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <BarList
                title="Por campaña"
                rows={stats.porCampana}
                labelKey="tracking_id"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <BarList
                title="Por dispositivo"
                rows={stats.porDevice}
                labelKey="device_type"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <BarList
                title="Por sistema operativo"
                rows={stats.porOs}
                labelKey="os"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <BarList
                title="Por navegador"
                rows={stats.porBrowser}
                labelKey="browser"
              />
            </Grid>
          </Grid>

          {/* país */}
          {stats.porPais?.length > 0 && (
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: C.shadow.sm,
                border: `1px solid ${C.border.subtle}`,
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color={C.text.secondary}
                  textTransform="uppercase"
                  letterSpacing={0.5}
                  fontSize={11}
                  mb={2}
                >
                  Por país
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {stats.porPais.map((p) => (
                    <Chip
                      key={p.country}
                      label={`${p.country} · ${fmt.format(Number(p.scans))}`}
                      size="small"
                      sx={{
                        bgcolor: C.primary.soft,
                        color: C.text.primary,
                        fontWeight: 600,
                        border: `1px solid ${C.primary.border}`,
                      }}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}

          <Divider sx={{ mb: 3, borderColor: C.border.subtle }} />

          {/* tabla de scans recientes */}
          <Typography
            variant="subtitle2"
            fontWeight={700}
            color={C.text.secondary}
            textTransform="uppercase"
            letterSpacing={0.5}
            fontSize={11}
            mb={1.5}
          >
            Últimos 50 escaneos
          </Typography>

          {scansLoading ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress size={24} sx={{ color: C.primary.main }} />
            </Stack>
          ) : (
            <TableContainer
              sx={{
                borderRadius: 3,
                border: `1px solid ${C.border.subtle}`,
                boxShadow: C.shadow.sm,
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {[
                      "Campaña",
                      "Dispositivo",
                      "OS",
                      "Navegador",
                      "País",
                      "Ciudad",
                      "Idioma",
                      "IP",
                      "Fecha",
                    ].map((h) => (
                      <TableCell key={h}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scans.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        align="center"
                        sx={{ color: C.text.muted, py: 4 }}
                      >
                        Sin registros
                      </TableCell>
                    </TableRow>
                  )}
                  {scans.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Chip
                          label={s.tracking_id}
                          size="small"
                          sx={{
                            bgcolor: C.primary.soft,
                            color: C.text.primary,
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ textTransform: "capitalize" }}>
                        {s.device_type ?? "—"}
                      </TableCell>
                      <TableCell>{s.os ?? "—"}</TableCell>
                      <TableCell>{s.browser ?? "—"}</TableCell>
                      <TableCell>{s.country ?? "—"}</TableCell>
                      <TableCell>{s.city ?? "—"}</TableCell>
                      <TableCell>{s.language ?? "—"}</TableCell>
                      <TableCell
                        sx={{
                          fontFamily: "monospace",
                          fontSize: 12,
                          color: C.text.muted,
                        }}
                      >
                        {s.ip ?? "—"}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap", fontSize: 12 }}>
                        {s.scanned_at
                          ? new Date(s.scanned_at).toLocaleString("es-MX", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Box>
  );
}
