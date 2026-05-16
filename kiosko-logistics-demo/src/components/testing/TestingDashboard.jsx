'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Alert, Box, Button, CircularProgress, Snackbar, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { MenuItem, Select } from '@mui/material';
import GlassCard from '../ui/GlassCard';
import KpiBento from '../ui/KpiBento';
import KpiCard from '../ui/KpiCard';
import FilterChip from '../ui/FilterChip';
import RouteRow from '../ui/RouteRow';
import RadarChart from '../ui/RadarChart';
import IconButtonGlass from '../ui/IconButtonGlass';
import KbdHint from '../ui/KbdHint';
import Badge from '../ui/Badge';
import { useKeyboardShortcuts } from '../ui/useKeyboardShortcuts';

import {
  fetchAlgoritmos,
  fetchActiveRun,
  fetchRun,
  fetchRuns,
  fetchPlanMaestro,
  fetchConfigs,
  fetchConfig,
  pollJob,
  promoteRun,
  runBatch,
} from '@/lib/testingApi';

const TestingMap = dynamic(() => import('./TestingMap'), { ssr: false });

const FMT_NUM = new Intl.NumberFormat('es-MX');
const FMT_MXN = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

const RADAR_AXES = ['rutas', 'km', 'costo', 'ocupacion', 'tiempo'];

function normalizeForRadar(runs) {
  if (!runs.length) return [];
  const max = {
    rutas: Math.max(...runs.map((r) => r.kpis.n_rutas || 0)) || 1,
    km: Math.max(...runs.map((r) => r.kpis.total_km || 0)) || 1,
    costo: Math.max(...runs.map((r) => r.kpis.total_costo || 0)) || 1,
    ocupacion: 1,
    tiempo: Math.max(...runs.map((r) => r.kpis.runtime_sec || 0)) || 1,
  };
  return runs.map((r, i) => ({
    id: r.id,
    label: r.algoritmo,
    color: i === 0 ? 'var(--accent)' : 'var(--cyan)',
    kind: i === 0 ? 'cur' : 'cmp',
    values: [
      1 - (r.kpis.n_rutas || 0) / max.rutas + 0.05,
      1 - (r.kpis.total_km || 0) / max.km + 0.05,
      1 - (r.kpis.total_costo || 0) / max.costo + 0.05,
      r.kpis.ocupacion_promedio || 0,
      1 - (r.kpis.runtime_sec || 0) / max.tiempo + 0.05,
    ],
  }));
}

export default function TestingDashboard() {
  const [algoritmos, setAlgoritmos] = useState([]);
  const [selectedAlgos, setSelectedAlgos] = useState(new Set(['ortools']));
  const [allRuns, setAllRuns] = useState([]);
  const [activeRunId, setActiveRunId] = useState(null);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [selectedRunDetail, setSelectedRunDetail] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [hoveredRouteId, setHoveredRouteId] = useState(null);
  const [planMaestro, setPlanMaestro] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  // Filtros
  const [truckFilter, setTruckFilter] = useState(new Set());
  const [dayFilter, setDayFilter] = useState(new Set());

  // Modo comparación
  const [compareMode, setCompareMode] = useState(false);
  const [compareRunId, setCompareRunId] = useState(null);
  const [compareRunDetail, setCompareRunDetail] = useState(null);

  // Help overlay
  const [showHelp, setShowHelp] = useState(false);

  // Carga inicial
  useEffect(() => {
    (async () => {
      try {
        const [algos, runs, active, pmo, cfgs] = await Promise.all([
          fetchAlgoritmos(),
          fetchRuns({ limit: 100 }),
          fetchActiveRun(),
          fetchPlanMaestro(),
          fetchConfigs(),
        ]);
        setAlgoritmos(algos);
        setAllRuns(runs);
        setPlanMaestro(pmo);
        setConfigs(cfgs);
        if (active) {
          setActiveRunId(active.meta.id);
          setSelectedRunId(active.meta.id);
          setSelectedRunDetail(active);
        }
      } catch (err) {
        setError(`Error de conexión con el backend: ${err.message}`);
      }
    })();
  }, []);

  const refreshRuns = useCallback(async () => {
    const [runs, active] = await Promise.all([fetchRuns({ limit: 100 }), fetchActiveRun()]);
    setAllRuns(runs);
    if (active) setActiveRunId(active.meta.id);
  }, []);

  const onSelectAlgo = useCallback((name) => {
    setSelectedAlgos((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const onRun = useCallback(async () => {
    if (!planMaestro) {
      setError('Sube un plan maestro desde la vista Configurar antes de ejecutar.');
      return;
    }
    if (selectedAlgos.size === 0) {
      setError('Selecciona al menos un algoritmo.');
      return;
    }
    setRunning(true);
    setError(null);
    setProgress({ done: 0, total: selectedAlgos.size });
    try {
      const algos = [...selectedAlgos];
      let configInline;
      if (selectedConfigId) {
        const cfg = await fetchConfig(selectedConfigId);
        configInline = cfg.snapshot;
      }
      const { job_ids } = await runBatch({
        algoritmos: algos,
        configInline,
        configId: selectedConfigId || undefined,
      });
      let done = 0;
      const newRunIds = [];
      for (const jid of job_ids) {
        const job = await pollJob(jid, { intervalMs: 1500 });
        done += 1;
        setProgress({ done, total: job_ids.length });
        if (job.status === 'ok' && job.run_id) newRunIds.push(job.run_id);
        if (job.status === 'error') setError(`Job falló: ${(job.error || '').split('\n')[0]}`);
      }
      await refreshRuns();
      if (newRunIds[0]) {
        setSelectedRunId(newRunIds[0]);
        const detail = await fetchRun(newRunIds[0]);
        setSelectedRunDetail(detail);
      }
      setInfo(`${newRunIds.length} algoritmos completados.`);
    } catch (err) {
      setError(`Error al ejecutar: ${err.message}`);
    } finally {
      setRunning(false);
    }
  }, [planMaestro, selectedAlgos, selectedConfigId, refreshRuns]);

  const onSelectRun = useCallback(async (runId) => {
    setSelectedRunId(runId);
    setSelectedRouteId(null);
    setTruckFilter(new Set());
    setDayFilter(new Set());
    try {
      const detail = await fetchRun(runId);
      setSelectedRunDetail(detail);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const onPromote = useCallback(async () => {
    if (!selectedRunId) return;
    try {
      await promoteRun(selectedRunId);
      setActiveRunId(selectedRunId);
      setInfo(`Run ${selectedRunId} marcado como producción.`);
    } catch (err) {
      setError(err.message);
    }
  }, [selectedRunId]);

  const toggleCompare = useCallback(async () => {
    if (compareMode) {
      setCompareMode(false);
      setCompareRunId(null);
      setCompareRunDetail(null);
      return;
    }
    // Activar comparación: elegir el siguiente run distinto al actual
    const candidate = allRuns.find((r) => r.id !== selectedRunId);
    if (!candidate) {
      setError('Necesitas al menos 2 runs para comparar.');
      return;
    }
    setCompareMode(true);
    setCompareRunId(candidate.id);
    try {
      const detail = await fetchRun(candidate.id);
      setCompareRunDetail(detail);
    } catch (err) {
      setError(err.message);
    }
  }, [compareMode, allRuns, selectedRunId]);

  const onCompareRunChange = useCallback(async (runId) => {
    setCompareRunId(runId);
    try {
      const detail = await fetchRun(runId);
      setCompareRunDetail(detail);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const resetFilters = useCallback(() => {
    setTruckFilter(new Set());
    setDayFilter(new Set());
    setSelectedRouteId(null);
    setHoveredRouteId(null);
    setInfo('Filtros limpiados.');
  }, []);

  // Atajos: 1-7 toggle algoritmo, C compare, R reset, ? help
  const algoNames = useMemo(() => algoritmos.map((a) => a.name), [algoritmos]);
  useKeyboardShortcuts({
    '1': () => algoNames[0] && onSelectAlgo(algoNames[0]),
    '2': () => algoNames[1] && onSelectAlgo(algoNames[1]),
    '3': () => algoNames[2] && onSelectAlgo(algoNames[2]),
    '4': () => algoNames[3] && onSelectAlgo(algoNames[3]),
    '5': () => algoNames[4] && onSelectAlgo(algoNames[4]),
    '6': () => algoNames[5] && onSelectAlgo(algoNames[5]),
    '7': () => algoNames[6] && onSelectAlgo(algoNames[6]),
    c: toggleCompare,
    r: resetFilters,
    '?': () => setShowHelp((v) => !v),
    escape: () => {
      setShowHelp(false);
      if (selectedRouteId) setSelectedRouteId(null);
    },
  });

  const cedisFromRun = useMemo(() => {
    const meta = selectedRunDetail?.result?.legacy_vrp_output?.meta;
    if (!meta?.cedis?.length) return null;
    return meta.cedis[0];
  }, [selectedRunDetail]);

  const kpis = selectedRunDetail?.meta?.kpis || {};

  // Trucks y días únicos del run
  const availableTrucks = useMemo(() => {
    const routes = selectedRunDetail?.result?.routes || [];
    const counts = new Map();
    for (const r of routes) {
      counts.set(r.truck_id, (counts.get(r.truck_id) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([truck, count]) => ({ truck, count }))
      .sort((a, b) => a.truck.localeCompare(b.truck));
  }, [selectedRunDetail]);

  const availableDays = useMemo(() => {
    const routes = selectedRunDetail?.result?.routes || [];
    const counts = new Map();
    for (const r of routes) {
      const d = `D${r.day ?? 0}`;
      counts.set(d, (counts.get(d) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day.localeCompare(b.day));
  }, [selectedRunDetail]);

  const routesSorted = useMemo(() => {
    const routes = selectedRunDetail?.result?.routes || [];
    let filtered = routes;
    if (truckFilter.size) {
      filtered = filtered.filter((r) => truckFilter.has(r.truck_id));
    }
    if (dayFilter.size) {
      filtered = filtered.filter((r) => dayFilter.has(`D${r.day ?? 0}`));
    }
    return [...filtered].sort((a, b) => (b.total_km || 0) - (a.total_km || 0));
  }, [selectedRunDetail, truckFilter, dayFilter]);

  // Run-detail filtrado para el mapa (refleja filtros)
  const filteredRunForMap = useMemo(() => {
    if (!selectedRunDetail) return null;
    if (!truckFilter.size && !dayFilter.size) return selectedRunDetail;
    const detail = selectedRunDetail;
    const routes = (detail.result?.routes || []).filter((r) => {
      if (truckFilter.size && !truckFilter.has(r.truck_id)) return false;
      if (dayFilter.size && !dayFilter.has(`D${r.day ?? 0}`)) return false;
      return true;
    });
    const filteredRouteIds = new Set(routes.map((r) => r.route_id));
    const legacyRutas = (detail.result?.legacy_vrp_output?.rutas || []).filter((r) =>
      filteredRouteIds.has(r.ruta_id),
    );
    return {
      ...detail,
      result: {
        ...detail.result,
        routes,
        legacy_vrp_output: {
          ...detail.result?.legacy_vrp_output,
          rutas: legacyRutas,
        },
      },
    };
  }, [selectedRunDetail, truckFilter, dayFilter]);

  const radarRuns = useMemo(() => {
    const subset = allRuns.filter((r) => selectedRunId && r.id === selectedRunId);
    if (compareMode && compareRunId) {
      const cmp = allRuns.find((r) => r.id === compareRunId);
      if (cmp) return [...subset, cmp];
    }
    const others = allRuns.filter((r) => r.id !== selectedRunId).slice(0, 3);
    return [...subset, ...others].slice(0, 4);
  }, [allRuns, selectedRunId, compareMode, compareRunId]);

  const toggleTruck = useCallback((truck) => {
    setTruckFilter((prev) => {
      const next = new Set(prev);
      if (next.has(truck)) next.delete(truck);
      else next.add(truck);
      return next;
    });
  }, []);

  const toggleDay = useCallback((day) => {
    setDayFilter((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }, []);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr',
        gap: 1.4,
        minHeight: 0,
      }}
    >
      {/* ─── Acciones / Algoritmo selector ────────────────────── */}
      <GlassCard padding="12px 14px">
        <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              mr: 1,
            }}
          >
            Algoritmos
          </Typography>
          {algoritmos.length === 0 && (
            <Typography sx={{ fontSize: 11, color: 'var(--text-subtle)' }}>Cargando…</Typography>
          )}
          {algoritmos.map((a, i) => (
            <FilterChip
              key={a.name}
              label={`${i + 1} ${a.name}`}
              active={selectedAlgos.has(a.name)}
              onClick={() => onSelectAlgo(a.name)}
              count={`${a.runtime_estimado_s}s`}
            />
          ))}
          <Box sx={{ flex: 1 }} />
          {planMaestro ? (
            <Badge tone="success">
              {planMaestro.n_tiendas} tiendas · {planMaestro.sheet}
            </Badge>
          ) : (
            <Badge tone="bad">Sin plan maestro — sube uno en Configurar</Badge>
          )}
          {configs.length > 0 && (
            <Select
              value={selectedConfigId}
              onChange={(e) => setSelectedConfigId(e.target.value)}
              displayEmpty
              size="small"
              sx={{ minWidth: 180, fontSize: 12 }}
            >
              <MenuItem value=""><em>Config: defaults</em></MenuItem>
              {configs.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
              ))}
            </Select>
          )}
          <Button
            variant="contained"
            startIcon={running ? <CircularProgress size={14} color="inherit" /> : <PlayArrowIcon />}
            onClick={onRun}
            disabled={running}
            size="small"
          >
            {running
              ? `Ejecutando ${progress.done}/${progress.total}…`
              : `Ejecutar (${selectedAlgos.size})`}
          </Button>
          <IconButtonGlass
            icon={<CompareArrowsIcon />}
            tooltip="Comparar (C)"
            active={compareMode}
            onClick={toggleCompare}
            size={34}
          />
          <IconButtonGlass
            icon={<RestartAltIcon />}
            tooltip="Limpiar filtros (R)"
            onClick={resetFilters}
            size={34}
          />
          <IconButtonGlass
            icon={<HelpOutlineIcon />}
            tooltip="Atajos (?)"
            onClick={() => setShowHelp((v) => !v)}
            size={34}
          />
          <Button
            variant="outlined"
            startIcon={<RocketLaunchIcon />}
            disabled={!selectedRunId || selectedRunId === activeRunId}
            onClick={onPromote}
            size="small"
            sx={{
              borderColor: 'var(--accent)',
              color: 'var(--accent)',
              '&:hover': { background: 'var(--accent-soft)', borderColor: 'var(--accent)' },
              '&.Mui-disabled': { borderColor: 'var(--glass-border)', color: 'var(--text-subtle)' },
            }}
          >
            {selectedRunId === activeRunId ? 'En producción' : 'Promover'}
          </Button>
        </Box>
      </GlassCard>

      {/* ─── KPI Bento ────────────────────────────────────────── */}
      <KpiBento cols={6}>
        <KpiCard label="Algoritmo" value={selectedRunDetail?.meta?.algoritmo || '—'} featured />
        <KpiCard label="Rutas" value={kpis.n_rutas || 0} format={(v) => FMT_NUM.format(Math.round(v))} />
        <KpiCard
          label="Distancia total"
          value={kpis.total_km || 0}
          unit="km"
          format={(v) => FMT_NUM.format(Math.round(v))}
        />
        <KpiCard
          label="Costo flota"
          value={kpis.total_costo || 0}
          format={(v) => FMT_MXN.format(Math.round(v))}
        />
        <KpiCard label="Tiendas" value={kpis.n_tiendas || 0} format={(v) => FMT_NUM.format(Math.round(v))} />
        <KpiCard
          label="Tiempo (s)"
          value={kpis.runtime_sec || 0}
          format={(v) => v.toFixed(2)}
        />
      </KpiBento>

      {/* ─── Mapa + sidepanel ─────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: 1.4,
          minHeight: 0,
          '@media (max-width: 1100px)': {
            gridTemplateColumns: '1fr',
            gridTemplateRows: 'minmax(420px, 1fr) auto',
          },
        }}
      >
        <GlassCard padding={0} sx={{ overflow: 'hidden', minHeight: 360, position: 'relative' }}>
          <TestingMap
            run={filteredRunForMap}
            cedis={cedisFromRun ? [cedisFromRun] : undefined}
            selectedRouteId={selectedRouteId}
            hoveredRouteId={hoveredRouteId}
            onSelectRoute={(rid) => setSelectedRouteId((prev) => (prev === rid ? null : rid))}
          />
          {/* Day rail overlay */}
          {availableDays.length > 1 && (
            <Box
              sx={{
                position: 'absolute', left: 14, bottom: 14, zIndex: 500,
                display: 'flex', gap: 0.6, p: 0.6,
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px) saturate(140%)',
                border: '1px solid var(--glass-border)',
                borderRadius: 999,
              }}
            >
              {availableDays.map(({ day, count }) => (
                <FilterChip
                  key={day}
                  label={day}
                  count={count}
                  active={dayFilter.has(day)}
                  onClick={() => toggleDay(day)}
                />
              ))}
            </Box>
          )}
          {compareMode && compareRunDetail && (
            <Box sx={{ position: 'absolute', top: 14, left: 14, zIndex: 500 }}>
              <Badge tone="info">Comparando con {compareRunDetail.meta.algoritmo}</Badge>
            </Box>
          )}
        </GlassCard>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.4, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
          <GlassCard padding="12px 14px" sx={{ flexShrink: 0 }}>
            <Typography
              sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.06em', color: 'var(--text-muted)', mb: 1 }}
            >
              Comparativa
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <RadarChart axes={RADAR_AXES} series={normalizeForRadar(radarRuns)} size={200} />
            </Box>
          </GlassCard>

          {availableTrucks.length > 1 && (
            <GlassCard padding="10px 14px" sx={{ flexShrink: 0 }}>
              <Typography
                sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.06em', color: 'var(--text-muted)', mb: 0.6 }}
              >
                Camiones
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {availableTrucks.map(({ truck, count }) => (
                  <FilterChip
                    key={truck}
                    label={truck}
                    count={count}
                    active={truckFilter.has(truck)}
                    onClick={() => toggleTruck(truck)}
                  />
                ))}
              </Box>
            </GlassCard>
          )}

          <GlassCard
            padding={0}
            sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column' }}
          >
            <Box
              sx={{
                p: '12px 14px 6px',
                position: 'sticky',
                top: 0,
                zIndex: 2,
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Typography
                sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.06em', color: 'var(--text-muted)' }}
              >
                Runs ({allRuns.length}) · Rutas ({routesSorted.length})
              </Typography>
            </Box>
            <Box sx={{ p: '6px 14px 12px', display: 'grid', gap: 0.5, maxHeight: 340, overflowY: 'auto' }}>
              {allRuns.map((r) => (
                <RouteRow
                  key={r.id}
                  routeId={r.algoritmo}
                  truck={r.id.split('__')[0]}
                  km={Math.round(r.kpis.total_km || 0)}
                  costo={FMT_MXN.format(Math.round(r.kpis.total_costo || 0))}
                  ocupacion={Math.round((r.kpis.ocupacion_promedio || 0) * 100)}
                  selected={selectedRunId === r.id}
                  badges={[
                    ...(r.id === activeRunId ? [{ label: 'PROD', tone: 'accent' }] : []),
                    ...(compareMode && r.id === compareRunId ? [{ label: 'CMP', tone: 'info' }] : []),
                  ]}
                  onClick={() =>
                    compareMode && r.id !== selectedRunId
                      ? onCompareRunChange(r.id)
                      : onSelectRun(r.id)
                  }
                />
              ))}
              {routesSorted.length > 0 && (
                <>
                  <Typography
                    sx={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                          textTransform: 'uppercase', mt: 1.4, mb: 0.6 }}
                  >
                    Rutas del run seleccionado
                  </Typography>
                  {routesSorted.slice(0, 50).map((route) => (
                    <RouteRow
                      key={route.route_id}
                      routeId={route.route_id}
                      truck={route.truck_id}
                      km={Math.round(route.total_km || 0)}
                      costo={FMT_MXN.format(Math.round(route.total_costo || 0))}
                      selected={selectedRouteId === route.route_id}
                      dim={selectedRouteId && selectedRouteId !== route.route_id}
                      onClick={() =>
                        setSelectedRouteId((prev) =>
                          prev === route.route_id ? null : route.route_id,
                        )
                      }
                      onMouseEnter={() => setHoveredRouteId(route.route_id)}
                      onMouseLeave={() => setHoveredRouteId(null)}
                    />
                  ))}
                  {routesSorted.length > 50 && (
                    <Typography
                      sx={{ fontSize: 10, color: 'var(--text-subtle)', textAlign: 'center', mt: 0.6 }}
                    >
                      … y {routesSorted.length - 50} más
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </GlassCard>
        </Box>
      </Box>

      {/* Help overlay */}
      {showHelp && (
        <Box
          onClick={() => setShowHelp(false)}
          sx={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            zIndex: 1300, display: 'grid', placeItems: 'center',
          }}
        >
          <GlassCard
            padding={20}
            variant="flat"
            sx={{ minWidth: 320, maxWidth: 460 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1.4, color: 'var(--text-primary)' }}>
              Atajos de teclado
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 1, columnGap: 2 }}>
              <KbdHint keys={['1', '…', '7']} /> <Typography sx={{ fontSize: 11, color: 'var(--text-secondary)' }}>Toggle algoritmo n</Typography>
              <KbdHint keys={['C']} /> <Typography sx={{ fontSize: 11, color: 'var(--text-secondary)' }}>Activar/desactivar comparación</Typography>
              <KbdHint keys={['R']} /> <Typography sx={{ fontSize: 11, color: 'var(--text-secondary)' }}>Limpiar filtros</Typography>
              <KbdHint keys={['?']} /> <Typography sx={{ fontSize: 11, color: 'var(--text-secondary)' }}>Mostrar/ocultar esta ayuda</Typography>
              <KbdHint keys={['Esc']} /> <Typography sx={{ fontSize: 11, color: 'var(--text-secondary)' }}>Cerrar / deseleccionar</Typography>
            </Box>
          </GlassCard>
        </Box>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!info}
        autoHideDuration={3500}
        onClose={() => setInfo(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setInfo(null)}>
          {info}
        </Alert>
      </Snackbar>
    </Box>
  );
}
