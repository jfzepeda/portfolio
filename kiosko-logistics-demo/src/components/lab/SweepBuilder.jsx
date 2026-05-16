'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Button, CircularProgress, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';
import FilterChip from '../ui/FilterChip';
import SweepChart from './SweepChart';

import { runSweep, getExperiment } from '@/lib/labApi';
import { fetchAlgoritmos, fetchJob } from '@/lib/testingApi';

const PARAM_SCHEMA = {
  cluster_then_solve: [
    { path: 'cluster_then_solve.k', label: 'k (clusters)', defaults: '4,6,8,10,12,14' },
    { path: 'cluster_then_solve.tsp_time_limit_s', label: 'TSP time limit (s)', defaults: '2,5,10,20' },
  ],
  petal_set_partitioning: [
    { path: 'petal.n_seeds', label: 'n_seeds (KMeans)', defaults: '4,6,8,10' },
    { path: 'petal.time_limit_s', label: 'MILP time limit (s)', defaults: '10,30,60' },
    { path: 'petal.petal_day', label: 'día (0..6)', defaults: '0,1,2,3' },
  ],
  gurobi_cvrp: [
    { path: 'gurobi_cvrp.max_stops', label: 'max_stops', defaults: '10,15,20,25' },
    { path: 'gurobi_cvrp.time_limit_s', label: 'time limit (s)', defaults: '30,60,120,240' },
  ],
  savings: [
    { path: 'savings.shape_lambda', label: 'shape λ', defaults: '0.5,0.8,1.0,1.2,1.5' },
  ],
  granular_tabu: [
    { path: 'granular_tabu.beta', label: 'β granularidad', defaults: '1.0,1.5,2.0,2.5' },
    { path: 'granular_tabu.iteraciones', label: 'iteraciones', defaults: '1000,3000,5000,10000' },
  ],
};

const METRIC_OPTIONS = [
  { id: 'total_costo', label: 'Costo (MXN)' },
  { id: 'total_km', label: 'km' },
  { id: 'n_rutas', label: 'Rutas' },
  { id: 'ocupacion_promedio', label: 'Ocupación' },
  { id: 'n_excede_8h', label: 'Excede 8h' },
  { id: 'runtime_sec', label: 'Runtime (s)' },
];

export default function SweepBuilder() {
  const [algoritmos, setAlgoritmos] = useState([]);
  const [algoritmo, setAlgoritmo] = useState('cluster_then_solve');
  const [paramPath, setParamPath] = useState('cluster_then_solve.k');
  const [valuesText, setValuesText] = useState('4,6,8,10,12,14');
  const [metric, setMetric] = useState('total_costo');
  const [submitting, setSubmitting] = useState(false);
  const [experimentId, setExperimentId] = useState(null);
  const [points, setPoints] = useState([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlgoritmos().then((list) => setAlgoritmos(list)).catch(() => {});
  }, []);

  useEffect(() => {
    const opts = PARAM_SCHEMA[algoritmo] || [];
    if (!opts.find((o) => o.path === paramPath)) {
      const first = opts[0];
      if (first) {
        setParamPath(first.path);
        setValuesText(first.defaults);
      }
    }
  }, [algoritmo, paramPath]);

  // Polling efectivo del experimento (en paralelo a los jobs)
  useEffect(() => {
    if (!experimentId) return;
    let cancelled = false;
    let timer;
    async function tick() {
      try {
        const exp = await getExperiment(experimentId);
        if (cancelled) return;
        const sweep = exp.sweep || {};
        const jobIds = sweep.job_ids || [];
        const valuesArr = sweep.values || [];
        const jobs = await Promise.all(jobIds.map((j) => fetchJob(j)));
        if (cancelled) return;
        const done = jobs.filter((j) => j.status === 'ok' || j.status === 'error').length;
        setProgress({ done, total: jobIds.length });
        // Mapa run_id → meta
        const runs = exp.runs || [];
        const runById = new Map(runs.map((r) => [r.id, r]));
        // Mapa value → run_id usando el orden: value[i] ↔ job_ids[i] ↔ jobs[i].run_id
        const newPoints = [];
        for (let i = 0; i < jobIds.length; i += 1) {
          const j = jobs[i];
          if (j?.status === 'ok' && j.run_id && runById.has(j.run_id)) {
            const meta = runById.get(j.run_id);
            const y = Number(meta.kpis?.[metric]);
            if (Number.isFinite(y)) {
              newPoints.push({ x: Number(valuesArr[i]), y, runId: j.run_id });
            }
          }
        }
        setPoints(newPoints);
        if (done < jobIds.length && !cancelled) {
          timer = setTimeout(tick, 1500);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }
    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [experimentId, metric]);

  async function onRun() {
    const values = valuesText
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v !== '')
      .map((v) => (Number.isNaN(Number(v)) ? v : Number(v)));
    if (!values.length) {
      setError('Sin valores para barrer.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setPoints([]);
    setProgress({ done: 0, total: values.length });
    try {
      const res = await runSweep({
        algoritmo,
        paramPath,
        values,
        experimentName: `Sweep ${algoritmo} · ${paramPath}`,
      });
      setExperimentId(res.experiment_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const paramOptions = PARAM_SCHEMA[algoritmo] || [];
  const algoOptions = useMemo(() => {
    return Object.keys(PARAM_SCHEMA).filter((a) => algoritmos.find((al) => al.name === a));
  }, [algoritmos]);

  const metricLabel = METRIC_OPTIONS.find((m) => m.id === metric)?.label || metric;
  const paramLabel = paramOptions.find((p) => p.path === paramPath)?.label || paramPath;

  return (
    <Stack spacing={1.5}>
      <GlassCard padding={14}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-secondary)' }}>
              BARRIDO DE PARÁMETRO
            </Typography>
            <Badge tone="accent">1D sweep</Badge>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
            <Select
              size="small"
              value={algoritmo}
              onChange={(e) => setAlgoritmo(e.target.value)}
              sx={{ minWidth: 200, fontSize: 12 }}
            >
              {(algoOptions.length ? algoOptions : Object.keys(PARAM_SCHEMA)).map((name) => (
                <MenuItem key={name} value={name} sx={{ fontSize: 12 }}>{name}</MenuItem>
              ))}
            </Select>
            <Select
              size="small"
              value={paramPath}
              onChange={(e) => {
                const path = e.target.value;
                setParamPath(path);
                const opt = paramOptions.find((p) => p.path === path);
                if (opt) setValuesText(opt.defaults);
              }}
              sx={{ minWidth: 220, fontSize: 12 }}
            >
              {paramOptions.map((opt) => (
                <MenuItem key={opt.path} value={opt.path} sx={{ fontSize: 12 }}>{opt.label}</MenuItem>
              ))}
            </Select>
            <TextField
              size="small"
              label="Valores (coma)"
              value={valuesText}
              onChange={(e) => setValuesText(e.target.value)}
              sx={{ minWidth: 240, flex: 1 }}
            />
            <Button
              size="small"
              variant="contained"
              disabled={submitting}
              onClick={onRun}
              startIcon={submitting ? <CircularProgress size={14} /> : <PlayArrowIcon />}
              sx={{ background: 'var(--accent)' }}
            >
              {submitting ? 'Lanzando…' : 'Barrer'}
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Métrica:</Typography>
            {METRIC_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.id}
                label={opt.label}
                active={metric === opt.id}
                onClick={() => setMetric(opt.id)}
              />
            ))}
            {progress.total > 0 && (
              <Box sx={{ ml: 'auto' }}>
                <Badge tone={progress.done === progress.total ? 'success' : 'info'}>
                  {progress.done}/{progress.total} corridas
                </Badge>
              </Box>
            )}
          </Stack>
        </Stack>
      </GlassCard>

      <GlassCard padding={14}>
        <SweepChart points={points} metricLabel={metricLabel} paramLabel={paramLabel} />
      </GlassCard>

      {error && (
        <GlassCard padding={10} sx={{ borderColor: 'var(--error)' }}>
          <Typography sx={{ fontSize: 11, color: 'var(--error)' }}>⚠ {error}</Typography>
        </GlassCard>
      )}
    </Stack>
  );
}
