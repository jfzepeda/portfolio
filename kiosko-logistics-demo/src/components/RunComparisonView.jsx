'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveIcon from '@mui/icons-material/Remove';

import GlassCard from '@/components/ui/GlassCard';
import { fetchRuns, fetchRun } from '@/lib/testingApi';

const FMT_NUM = new Intl.NumberFormat('es-MX');
const FMT_MXN = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

// ─── KPI stat box ────────────────────────────────────────────────────────────
function StatBox({ label, value }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        p: '10px 14px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--glass-border)',
        borderRadius: '10px',
      }}
    >
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          lineHeight: 1.15,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// ─── KPI cards panel for one run ─────────────────────────────────────────────
function RunKpiPanel({ runDetail }) {
  if (!runDetail) {
    return (
      <Box
        sx={{
          display: 'grid',
          placeItems: 'center',
          minHeight: 120,
          color: 'var(--text-subtle)',
          fontSize: 12,
        }}
      >
        Selecciona un run
      </Box>
    );
  }

  const kpis = runDetail.meta?.kpis || {};

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
      <StatBox label="Rutas" value={FMT_NUM.format(kpis.n_rutas ?? 0)} />
      <StatBox label="Tiendas" value={FMT_NUM.format(kpis.n_tiendas ?? 0)} />
      <StatBox label="Distancia total" value={`${FMT_NUM.format(Math.round(kpis.total_km ?? 0))} km`} />
      <StatBox label="Costo flota" value={FMT_MXN.format(Math.round(kpis.total_costo ?? 0))} />
      <StatBox
        label="Ocupación prom."
        value={`${((kpis.ocupacion_promedio ?? 0) * 100).toFixed(1)} %`}
        sx={{ gridColumn: '1 / -1' }}
      />
    </Box>
  );
}

// ─── Delta cell ──────────────────────────────────────────────────────────────
// lowerIsBetter: true  → lower B is green (km, costo, rutas)
//                false → higher B is green (ocupacion)
function DeltaCell({ valA, valB, lowerIsBetter = true }) {
  if (valA == null || valB == null || valA === 0) {
    return (
      <TableCell align="center" sx={{ color: 'var(--text-subtle)', fontSize: 12 }}>
        <RemoveIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} />
      </TableCell>
    );
  }

  const pct = ((valB - valA) / Math.abs(valA)) * 100;
  const isImproved = lowerIsBetter ? pct < -0.05 : pct > 0.05;
  const isWorse = lowerIsBetter ? pct > 0.05 : pct < -0.05;
  const color = isImproved ? 'var(--success)' : isWorse ? 'var(--error)' : 'var(--text-muted)';
  const sign = pct > 0 ? '+' : '';

  return (
    <TableCell align="center" sx={{ color, fontSize: 12, fontWeight: 600 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
        {isImproved && <ArrowUpwardIcon sx={{ fontSize: 14 }} />}
        {isWorse && <ArrowDownwardIcon sx={{ fontSize: 14 }} />}
        {!isImproved && !isWorse && <RemoveIcon sx={{ fontSize: 14 }} />}
        <span style={{ fontFamily: 'var(--font-mono), monospace' }}>
          {sign}{pct.toFixed(1)}%
        </span>
      </Box>
    </TableCell>
  );
}

// ─── Comparison table ────────────────────────────────────────────────────────
function ComparisonTable({ runA, runB }) {
  const kpisA = runA?.meta?.kpis || {};
  const kpisB = runB?.meta?.kpis || {};

  const rows = [
    {
      metrica: 'Rutas',
      valA: kpisA.n_rutas,
      valB: kpisB.n_rutas,
      fmt: (v) => FMT_NUM.format(v ?? 0),
      lowerIsBetter: true,
    },
    {
      metrica: 'Tiendas',
      valA: kpisA.n_tiendas,
      valB: kpisB.n_tiendas,
      fmt: (v) => FMT_NUM.format(v ?? 0),
      lowerIsBetter: false,
    },
    {
      metrica: 'Distancia total (km)',
      valA: kpisA.total_km,
      valB: kpisB.total_km,
      fmt: (v) => FMT_NUM.format(Math.round(v ?? 0)),
      lowerIsBetter: true,
    },
    {
      metrica: 'Costo flota (MXN)',
      valA: kpisA.total_costo,
      valB: kpisB.total_costo,
      fmt: (v) => FMT_MXN.format(Math.round(v ?? 0)),
      lowerIsBetter: true,
    },
    {
      metrica: 'Ocupación promedio (%)',
      valA: kpisA.ocupacion_promedio,
      valB: kpisB.ocupacion_promedio,
      fmt: (v) => `${((v ?? 0) * 100).toFixed(1)} %`,
      lowerIsBetter: false,
    },
  ];

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {['Métrica', 'Run A', 'Run B', 'Delta (B vs A)'].map((h) => (
              <TableCell
                key={h}
                align={h === 'Métrica' ? 'left' : 'center'}
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                  borderColor: 'var(--glass-border)',
                  pb: 1,
                }}
              >
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(({ metrica, valA, valB, fmt, lowerIsBetter }) => (
            <TableRow
              key={metrica}
              sx={{
                '&:last-child td': { border: 0 },
                '&:hover': { background: 'var(--glass-bg)' },
              }}
            >
              <TableCell
                sx={{
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--glass-border)',
                }}
              >
                {metrica}
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontSize: 12,
                  fontFamily: 'var(--font-mono), monospace',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--glass-border)',
                }}
              >
                {valA != null ? fmt(valA) : '—'}
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontSize: 12,
                  fontFamily: 'var(--font-mono), monospace',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--glass-border)',
                }}
              >
                {valB != null ? fmt(valB) : '—'}
              </TableCell>
              <DeltaCell valA={valA} valB={valB} lowerIsBetter={lowerIsBetter} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ─── Run selector ─────────────────────────────────────────────────────────────
function RunSelector({ label, value, onChange, runs, loadingDetail }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          displayEmpty
          size="small"
          sx={{
            flex: 1,
            fontSize: 12,
            color: 'var(--text-primary)',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--glass-border)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--glass-strong)' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--accent)' },
          }}
        >
          <MenuItem value="">
            <em style={{ color: 'var(--text-subtle)' }}>Selecciona un run…</em>
          </MenuItem>
          {runs.map((r) => (
            <MenuItem key={r.id} value={r.id} sx={{ fontSize: 12 }}>
              {r.id} · {r.algoritmo} · {r.kpis.n_rutas}r
            </MenuItem>
          ))}
        </Select>
        {loadingDetail && <CircularProgress size={16} sx={{ color: 'var(--accent)', flexShrink: 0 }} />}
      </Box>
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RunComparisonView() {
  const [runs, setRuns] = useState([]);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [error, setError] = useState(null);

  const [runIdA, setRunIdA] = useState('');
  const [runIdB, setRunIdB] = useState('');
  const [runDetailA, setRunDetailA] = useState(null);
  const [runDetailB, setRunDetailB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  // Carga inicial de runs
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchRuns({ limit: 100 });
        setRuns(data);
      } catch (err) {
        setError(`Error cargando runs: ${err.message}`);
      } finally {
        setLoadingRuns(false);
      }
    })();
  }, []);

  const onSelectRunA = async (id) => {
    setRunIdA(id);
    setRunDetailA(null);
    if (!id) return;
    setLoadingA(true);
    try {
      const detail = await fetchRun(id);
      setRunDetailA(detail);
    } catch (err) {
      setError(`Error cargando Run A: ${err.message}`);
    } finally {
      setLoadingA(false);
    }
  };

  const onSelectRunB = async (id) => {
    setRunIdB(id);
    setRunDetailB(null);
    if (!id) return;
    setLoadingB(true);
    try {
      const detail = await fetchRun(id);
      setRunDetailB(detail);
    } catch (err) {
      setError(`Error cargando Run B: ${err.message}`);
    } finally {
      setLoadingB(false);
    }
  };

  const bothSelected = runDetailA && runDetailB;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* ─── Header ─────────────────────────────────────────────── */}
      <GlassCard padding="14px 18px">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: 'var(--text-primary)',
                lineHeight: 1.2,
              }}
            >
              Comparar resultados
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', mt: '2px' }}>
              Selecciona dos runs para analizar sus KPIs en paralelo
            </Typography>
          </Box>
          {loadingRuns && (
            <CircularProgress size={20} sx={{ color: 'var(--accent)' }} />
          )}
        </Box>
      </GlassCard>

      {/* ─── Error global ───────────────────────────────────────── */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: '10px' }}>
          {error}
        </Alert>
      )}

      {/* ─── Selectores + KPI panels (2 columnas) ───────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 2,
          '@media (max-width: 800px)': { gridTemplateColumns: '1fr' },
        }}
      >
        {/* Run A */}
        <GlassCard padding={16}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <RunSelector
              label="Run A"
              value={runIdA}
              onChange={onSelectRunA}
              runs={runs}
              loadingDetail={loadingA}
            />
            {runIdA && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: '6px 10px',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '8px',
                }}
              >
                <Box
                  sx={{ width: 10, height: 10, borderRadius: '50%', background: '#38BDF8', flexShrink: 0 }}
                />
                <Typography sx={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {runDetailA?.meta?.algoritmo || runIdA}
                </Typography>
              </Box>
            )}
            <RunKpiPanel runDetail={runDetailA} />
          </Box>
        </GlassCard>

        {/* Run B */}
        <GlassCard padding={16}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <RunSelector
              label="Run B"
              value={runIdB}
              onChange={onSelectRunB}
              runs={runs}
              loadingDetail={loadingB}
            />
            {runIdB && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: '6px 10px',
                  background: 'var(--accent-soft)',
                  border: '1px solid rgba(255, 107, 26, 0.3)',
                  borderRadius: '8px',
                }}
              >
                <Box
                  sx={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }}
                />
                <Typography sx={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {runDetailB?.meta?.algoritmo || runIdB}
                </Typography>
              </Box>
            )}
            <RunKpiPanel runDetail={runDetailB} />
          </Box>
        </GlassCard>
      </Box>

      {/* ─── Tabla comparativa ──────────────────────────────────── */}
      {bothSelected ? (
        <GlassCard padding={16}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              mb: 1.5,
            }}
          >
            Tabla comparativa · Delta = (B − A) / A
          </Typography>
          <ComparisonTable runA={runDetailA} runB={runDetailB} />
        </GlassCard>
      ) : (
        <GlassCard
          padding={24}
          sx={{
            display: 'grid',
            placeItems: 'center',
            minHeight: 120,
            border: '1px dashed var(--glass-border)',
          }}
        >
          <Typography sx={{ fontSize: 13, color: 'var(--text-subtle)' }}>
            Selecciona Run A y Run B para ver la tabla comparativa
          </Typography>
        </GlassCard>
      )}

      {/* ─── Placeholder mapa ───────────────────────────────────── */}
      <GlassCard
        padding={24}
        sx={{
          display: 'grid',
          placeItems: 'center',
          minHeight: 100,
          border: '1px dashed var(--glass-border)',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
            Mapa no disponible en comparación
          </Typography>
          <Typography sx={{ fontSize: 11, color: 'var(--text-subtle)', mt: '4px' }}>
            Para ver las rutas en el mapa, selecciona un run individual en la vista Probar
          </Typography>
        </Box>
      </GlassCard>
    </Box>
  );
}
