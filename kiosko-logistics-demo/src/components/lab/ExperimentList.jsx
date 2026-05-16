'use client';

import { useEffect, useState } from 'react';
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

import { listExperiments, getExperiment, createExperiment, deleteExperiment } from '@/lib/labApi';
import { fetchRuns } from '@/lib/testingApi';

const FMT_MXN = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export default function ExperimentList() {
  const [list, setList] = useState([]);
  const [allRuns, setAllRuns] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [newName, setNewName] = useState('');
  const [newRunIds, setNewRunIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [exps, runs] = await Promise.all([listExperiments(), fetchRuns({ limit: 100 })]);
      setList(exps);
      setAllRuns(runs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    getExperiment(selectedId).then(setDetail).catch((e) => setError(e.message));
  }, [selectedId]);

  async function onCreate() {
    if (!newName.trim()) {
      setError('Falta nombre.');
      return;
    }
    try {
      const exp = await createExperiment({ nombre: newName.trim(), runIds: Array.from(newRunIds) });
      setNewName('');
      setNewRunIds(new Set());
      await loadAll();
      setSelectedId(exp.id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDelete(id) {
    try {
      await deleteExperiment(id);
      if (selectedId === id) setSelectedId(null);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  function toggleRun(runId) {
    setNewRunIds((prev) => {
      const next = new Set(prev);
      if (next.has(runId)) next.delete(runId);
      else next.add(runId);
      return next;
    });
  }

  return (
    <Stack spacing={1.5}>
      <GlassCard padding={14}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-secondary)' }}>
              EXPERIMENTOS
            </Typography>
            <Badge tone="info">{list.length}</Badge>
            <Box sx={{ flex: 1 }} />
            <IconButton size="small" onClick={loadAll} title="Recargar">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack spacing={0.5}>
            {list.map((exp) => (
              <Box
                key={exp.id}
                onClick={() => setSelectedId(exp.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  padding: '8px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: selectedId === exp.id ? 'var(--accent-soft)' : 'transparent',
                  border: `1px solid ${selectedId === exp.id ? 'var(--accent)' : 'var(--glass-border)'}`,
                  '&:hover': { borderColor: 'var(--glass-strong)' },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }} noWrap>
                    {exp.nombre}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {exp.kind} · {exp.run_count} runs · {new Date(exp.created_at).toLocaleString('es-MX')}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(exp.id); }}>
                  <DeleteIcon fontSize="small" sx={{ color: 'var(--text-muted)' }} />
                </IconButton>
              </Box>
            ))}
            {list.length === 0 && (
              <Typography sx={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Sin experimentos. Crea uno abajo o desde un sweep.
              </Typography>
            )}
          </Stack>
        </Stack>
      </GlassCard>

      {detail && (
        <GlassCard padding={14}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-secondary)' }}>
                DETALLE
              </Typography>
              <Badge tone="accent">{detail.kind}</Badge>
              <Typography sx={{ fontSize: 11, color: 'var(--text-primary)' }}>{detail.nombre}</Typography>
            </Stack>
            {detail.sweep && (
              <Typography sx={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                Sweep: <b>{detail.sweep.algoritmo}</b> · {detail.sweep.param_path} ∈ [
                {(detail.sweep.values || []).join(', ')}]
              </Typography>
            )}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr 80px 110px 110px 90px', gap: 0.5, fontSize: 11 }}>
              <Typography sx={{ fontSize: 9, color: 'var(--text-muted)' }}>Algo</Typography>
              <Typography sx={{ fontSize: 9, color: 'var(--text-muted)' }}>Run ID</Typography>
              <Typography sx={{ fontSize: 9, color: 'var(--text-muted)' }}>Rutas</Typography>
              <Typography sx={{ fontSize: 9, color: 'var(--text-muted)' }}>km</Typography>
              <Typography sx={{ fontSize: 9, color: 'var(--text-muted)' }}>Costo</Typography>
              <Typography sx={{ fontSize: 9, color: 'var(--text-muted)' }}>Ocup.</Typography>
              {(detail.runs || []).map((r) => (
                <RunRowMini key={r.id} run={r} />
              ))}
            </Box>
          </Stack>
        </GlassCard>
      )}

      <GlassCard padding={14}>
        <Stack spacing={1}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text-secondary)' }}>
            NUEVO EXPERIMENTO
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              label="Nombre"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              sx={{ flex: 1 }}
            />
            <Button
              size="small"
              variant="contained"
              onClick={onCreate}
              sx={{ background: 'var(--accent)' }}
              disabled={!newName.trim()}
            >
              Crear
            </Button>
          </Stack>
          <Typography sx={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
            Selecciona runs para incluir ({newRunIds.size} elegidas):
          </Typography>
          <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
            {allRuns.map((r) => (
              <Box
                key={r.id}
                onClick={() => toggleRun(r.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: newRunIds.has(r.id) ? 'var(--accent-soft)' : 'transparent',
                  fontSize: 11,
                  '&:hover': { background: 'var(--glass-bg)' },
                }}
              >
                <input type="checkbox" checked={newRunIds.has(r.id)} onChange={() => {}} />
                <Typography sx={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {r.algoritmo}
                </Typography>
                <Typography sx={{ fontSize: 10.5, color: 'var(--text-muted)' }} noWrap>
                  {r.id}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Typography sx={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {r.kpis?.n_rutas} rutas · {FMT_MXN.format(r.kpis?.total_costo || 0)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Stack>
      </GlassCard>

      {error && (
        <GlassCard padding={10} sx={{ borderColor: 'var(--error)' }}>
          <Typography sx={{ fontSize: 11, color: 'var(--error)' }}>⚠ {error}</Typography>
        </GlassCard>
      )}
    </Stack>
  );
}

function RunRowMini({ run }) {
  const k = run?.kpis || {};
  return (
    <>
      <Typography sx={{ fontSize: 10.5, fontFamily: 'var(--font-mono)' }}>{run.algoritmo}</Typography>
      <Typography sx={{ fontSize: 10, color: 'var(--text-muted)' }} noWrap>{run.id}</Typography>
      <Typography sx={{ fontSize: 10.5, fontFamily: 'var(--font-mono)' }}>{k.n_rutas ?? '—'}</Typography>
      <Typography sx={{ fontSize: 10.5, fontFamily: 'var(--font-mono)' }}>
        {k.total_km ? Math.round(k.total_km).toLocaleString('es-MX') : '—'}
      </Typography>
      <Typography sx={{ fontSize: 10.5, fontFamily: 'var(--font-mono)' }}>
        {k.total_costo ? FMT_MXN.format(k.total_costo) : '—'}
      </Typography>
      <Typography sx={{ fontSize: 10.5, fontFamily: 'var(--font-mono)' }}>
        {k.ocupacion_promedio ? `${Math.round(k.ocupacion_promedio * 100)}%` : '—'}
      </Typography>
    </>
  );
}
