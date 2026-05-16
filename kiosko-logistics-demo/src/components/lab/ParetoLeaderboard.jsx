'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Button, CircularProgress, MenuItem, Select, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';
import FilterChip from '../ui/FilterChip';

import { fetchPareto } from '@/lib/labApi';
import { fetchRun } from '@/lib/testingApi';

const METRICS = [
  { id: 'total_costo', label: 'Costo (MXN)' },
  { id: 'total_km', label: 'km' },
  { id: 'n_rutas', label: 'Rutas' },
  { id: 'ocupacion_inv', label: '1 − Ocup.' },
  { id: 'n_excede_8h', label: 'Excede 8h' },
  { id: 'runtime_sec', label: 'Runtime (s)' },
];

const FMT_MXN = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const FMT_NUM = new Intl.NumberFormat('es-MX');

export default function ParetoLeaderboard() {
  const [xMetric, setXMetric] = useState('total_costo');
  const [yMetric, setYMetric] = useState('total_km');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [filterAlgo, setFilterAlgo] = useState('');
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPareto({
        metrics: [xMetric, yMetric],
        limit: 200,
        algoritmo: filterAlgo || undefined,
      });
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [xMetric, yMetric, filterAlgo]);

  useEffect(() => {
    if (!selected) {
      setSelectedDetail(null);
      return;
    }
    fetchRun(selected).then(setSelectedDetail).catch(() => setSelectedDetail(null));
  }, [selected]);

  const algoOptions = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.points.map((p) => p.algoritmo));
    return ['', ...Array.from(set)];
  }, [data]);

  const view = useMemo(() => {
    if (!data || !data.points.length) return null;
    const pts = data.points.map((p) => ({ ...p, x: p.values[0], y: p.values[1] }));
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    return { pts, xMin, xMax, yMin, yMax };
  }, [data]);

  const W = 600;
  const H = 360;
  const padL = 60;
  const padR = 16;
  const padT = 14;
  const padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const xFor = (x) => view ? padL + (innerW * (x - view.xMin)) / Math.max(1e-9, view.xMax - view.xMin) : 0;
  const yFor = (y) => view ? padT + innerH - (innerH * (y - view.yMin)) / Math.max(1e-9, view.yMax - view.yMin) : 0;

  return (
    <Stack spacing={1.5}>
      <GlassCard padding={14}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-secondary)' }}>
              FRONTERA DE PARETO
            </Typography>
            <Badge tone="success">{data?.frontier?.length || 0} óptimos</Badge>
            <Badge tone="info">{data?.dominated?.length || 0} dominados</Badge>
            <Box sx={{ flex: 1 }} />
            <Button
              size="small"
              variant="outlined"
              onClick={load}
              startIcon={loading ? <CircularProgress size={14} /> : <RefreshIcon />}
              sx={{ borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
            >
              Recargar
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Eje X:</Typography>
            <Select size="small" value={xMetric} onChange={(e) => setXMetric(e.target.value)} sx={{ fontSize: 12, minWidth: 160 }}>
              {METRICS.map((m) => <MenuItem key={m.id} value={m.id} sx={{ fontSize: 12 }}>{m.label}</MenuItem>)}
            </Select>
            <Typography sx={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Eje Y:</Typography>
            <Select size="small" value={yMetric} onChange={(e) => setYMetric(e.target.value)} sx={{ fontSize: 12, minWidth: 160 }}>
              {METRICS.map((m) => <MenuItem key={m.id} value={m.id} sx={{ fontSize: 12 }}>{m.label}</MenuItem>)}
            </Select>
            <Typography sx={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Algoritmo:</Typography>
            <Select size="small" value={filterAlgo} onChange={(e) => setFilterAlgo(e.target.value)} sx={{ fontSize: 12, minWidth: 140 }}>
              {algoOptions.map((a) => <MenuItem key={a || 'all'} value={a} sx={{ fontSize: 12 }}>{a || 'todos'}</MenuItem>)}
            </Select>
          </Stack>

          <Box>
            {view ? (
              <svg width={W} height={H} role="img" aria-label="Frontera de Pareto">
                <line x1={padL} y1={padT + innerH} x2={padL + innerW} y2={padT + innerH} stroke="var(--glass-border)" />
                <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="var(--glass-border)" />
                {/* Etiquetas */}
                <text x={padL} y={padT - 4} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                  {METRICS.find((m) => m.id === yMetric)?.label}
                </text>
                <text x={padL + innerW} y={H - 6} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                  {METRICS.find((m) => m.id === xMetric)?.label} →
                </text>
                {/* Puntos */}
                {view.pts.map((p) => (
                  <g key={p.id}>
                    <circle
                      cx={xFor(p.x)}
                      cy={yFor(p.y)}
                      r={p.frontier ? 6 : 3}
                      fill={p.frontier ? 'var(--accent)' : 'var(--text-muted)'}
                      stroke={selected === p.id ? '#fff' : 'transparent'}
                      strokeWidth="2"
                      fillOpacity={p.frontier ? 0.95 : 0.5}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelected(p.id)}
                    />
                  </g>
                ))}
              </svg>
            ) : (
              <Typography sx={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {loading ? 'Cargando…' : 'Sin runs aún. Lanza algunas corridas en /testing o aquí.'}
              </Typography>
            )}
          </Box>
        </Stack>
      </GlassCard>

      {selectedDetail && (
        <GlassCard padding={14}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-secondary)' }}>
              RUN SELECCIONADO
            </Typography>
            <Badge tone="accent">{selectedDetail.meta?.algoritmo}</Badge>
            <Typography sx={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {selectedDetail.meta?.id}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
            <KpiSpan label="Rutas" value={selectedDetail.meta?.kpis?.n_rutas} />
            <KpiSpan label="km" value={FMT_NUM.format(selectedDetail.meta?.kpis?.total_km || 0)} />
            <KpiSpan label="Costo" value={FMT_MXN.format(selectedDetail.meta?.kpis?.total_costo || 0)} />
            <KpiSpan label="Ocup." value={`${Math.round((selectedDetail.meta?.kpis?.ocupacion_promedio || 0) * 100)}%`} />
            <KpiSpan label="Excede 8h" value={selectedDetail.meta?.kpis?.n_excede_8h} />
          </Stack>
        </GlassCard>
      )}

      {error && (
        <GlassCard padding={10} sx={{ borderColor: 'var(--error)' }}>
          <Typography sx={{ fontSize: 11, color: 'var(--error)' }}>⚠ {error}</Typography>
        </GlassCard>
      )}
    </Stack>
  );
}

function KpiSpan({ label, value }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
        {value ?? '—'}
      </Typography>
    </Box>
  );
}
