'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, IconButton, LinearProgress, Snackbar, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShareIcon from '@mui/icons-material/Share';
import LayersIcon from '@mui/icons-material/Layers';
import CloseIcon from '@mui/icons-material/Close';

import { MenuItem, Select } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import GlassCard from './ui/GlassCard';
import KpiBento from './ui/KpiBento';
import KpiCard from './ui/KpiCard';
import RouteRow from './ui/RouteRow';
import Badge from './ui/Badge';
import FilterChip from './ui/FilterChip';
import IconButtonGlass from './ui/IconButtonGlass';
import KioskoMap from './map/KioskoMap';
import FileImportModal from './FileImportModal';
import ShareRouteModal from './ShareRouteModal';
import {
  fetchActiveRun, fetchRuns, fetchRun, promoteRun,
  fetchConfigs, uploadPlanMaestro, runBatch, pollJob, fetchConfig,
} from '@/lib/testingApi';

const FMT_NUM = new Intl.NumberFormat('es-MX');
const FMT_MXN = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

/**
 * Vista operativa: muestra el RUN actualmente promovido a producción.
 * El usuario puede seleccionar una ruta, ver su detalle, y exportar a Google Maps.
 *
 * Sin Google Maps embebido: el mapa interno es Leaflet (KioskoMap).
 */
export default function MapDashboard() {
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [hoveredRouteId, setHoveredRouteId] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState(new Set());

  // Para el selector "Cargar run anterior"
  const [allRuns, setAllRuns] = useState([]);
  const [activeRunId, setActiveRunId] = useState(null);

  // Para el selector de config (la que se aplica al subir un nuevo PMO)
  const [configs, setConfigs] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState('');

  // Para el upload de PMO + auto-corrida
  const [uploadBusy, setUploadBusy] = useState(false);
  const [solverProgress, setSolverProgress] = useState(0);

  // Modal de importación de archivo
  const [showFileModal, setShowFileModal] = useState(false);

  // Modal de compartir ruta
  const [showShareModal, setShowShareModal] = useState(false);

  // Toggle de heatmap
  const [showHeatmap, setShowHeatmap] = useState(false);

  const loadActive = useCallback(async () => {
    setLoading(true);
    try {
      const [active, runs, cfgs] = await Promise.all([
        fetchActiveRun(),
        fetchRuns({ limit: 100 }),
        fetchConfigs(),
      ]);
      setAllRuns(runs);
      setConfigs(cfgs);
      if (!active) {
        setError('No hay run activo. Promueve uno desde /testing.');
        setRun(null);
        setActiveRunId(null);
      } else {
        setRun(active);
        setActiveRunId(active.meta.id);
      }
    } catch (err) {
      setError(`Error al cargar el run activo: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActive();
  }, [loadActive]);

  const onSelectRun = useCallback(async (runId) => {
    if (!runId) return;
    setLoading(true);
    try {
      const detail = await fetchRun(runId);
      setRun(detail);
      setSelectedRouteId(null);
      setZoneFilter(new Set());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const onPromoteCurrent = useCallback(async () => {
    if (!run?.meta?.id || run.meta.id === activeRunId) return;
    try {
      await promoteRun(run.meta.id);
      setActiveRunId(run.meta.id);
      const refreshed = await fetchRuns({ limit: 100 });
      setAllRuns(refreshed);
      setInfo(`Run ${run.meta.id} promovido a producción.`);
    } catch (err) {
      setError(err.message);
    }
  }, [run, activeRunId]);

  const onUploadPmo = useCallback(async (file) => {
    if (!file) return;
    setUploadBusy(true);
    setSolverProgress(0);
    setError(null);
    try {
      // 1. Subir el plan maestro (lo persiste el backend).
      const meta = await uploadPlanMaestro(file);
      setInfo(`Plan maestro actualizado: ${meta.n_tiendas} tiendas. Ejecutando…`);

      // 2. Resolver config a usar.
      let configInline;
      if (selectedConfigId) {
        const cfg = await fetchConfig(selectedConfigId);
        configInline = cfg.snapshot;
      }

      // 3. Determinar algoritmo: el del run activo (o ortools como default).
      const algoritmo = run?.meta?.algoritmo || 'ortools';

      // 4. Lanzar el solver y promover automáticamente al terminar.
      const { job_ids } = await runBatch({
        algoritmos: [algoritmo],
        configInline,
        configId: selectedConfigId || undefined,
      });
      const job = await pollJob(job_ids[0], {
        intervalMs: 1500,
        onProgress: setSolverProgress,
      });
      setSolverProgress(0);
      if (job.status !== 'ok' || !job.run_id) {
        throw new Error((job.error || 'Job falló').split('\n')[0]);
      }
      await promoteRun(job.run_id);
      await loadActive();
      setInfo(`Nuevo run promovido a producción (${algoritmo}).`);

      if (typeof Notification !== 'undefined') {
        const finalRun = await fetchRun(job.run_id).catch(() => null);
        const finalKpis = finalRun?.meta?.kpis || {};
        const body = `${finalKpis.n_rutas || 0} rutas · ${FMT_MXN.format(Math.round(finalKpis.total_costo || 0))}`;
        if (Notification.permission === 'granted') {
          new Notification('Optimización lista', { body });
        } else if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }
    } catch (err) {
      setError(`Error al actualizar plan maestro: ${err.message}`);
    } finally {
      setUploadBusy(false);
    }
  }, [run, selectedConfigId, loadActive]);

  const meta = run?.meta || {};
  const kpis = meta.kpis || {};
  const routes = run?.result?.routes || [];

  // Mapeo route_id → set de zonas (de legacy_vrp_output.rutas[].tiendas[].zona)
  const routeZones = useMemo(() => {
    const map = new Map();
    const legacyRutas = run?.result?.legacy_vrp_output?.rutas || [];
    for (const r of legacyRutas) {
      const zonas = new Set();
      for (const t of r.tiendas || []) {
        if (t.zona) zonas.add(String(t.zona).toUpperCase());
      }
      map.set(r.ruta_id, zonas);
    }
    return map;
  }, [run]);

  const availableZones = useMemo(() => {
    const counts = new Map();
    for (const zonas of routeZones.values()) {
      for (const z of zonas) counts.set(z, (counts.get(z) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([zona, count]) => ({ zona, count }))
      .sort((a, b) => b.count - a.count);
  }, [routeZones]);

  const matchesZoneFilter = useCallback(
    (routeId) => {
      if (!zoneFilter.size) return true;
      const zonas = routeZones.get(routeId);
      if (!zonas) return false;
      for (const z of zoneFilter) if (zonas.has(z)) return true;
      return false;
    },
    [zoneFilter, routeZones],
  );

  const routesSorted = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let filtered = routes.filter((r) => matchesZoneFilter(r.route_id));
    if (term) {
      filtered = filtered.filter(
        (r) =>
          r.route_id?.toLowerCase().includes(term) ||
          r.truck_id?.toLowerCase().includes(term) ||
          (r.sequence || []).some((s) => String(s.store_id).toLowerCase().includes(term)),
      );
    }
    return [...filtered].sort((a, b) => (b.total_km || 0) - (a.total_km || 0));
  }, [routes, searchTerm, matchesZoneFilter]);

  const selectedRoute = useMemo(
    () => routes.find((r) => r.route_id === selectedRouteId) || null,
    [routes, selectedRouteId],
  );

  const filteredRunForMap = useMemo(() => {
    if (!run || !zoneFilter.size) return run;
    const visibleIds = new Set(routes.filter((r) => matchesZoneFilter(r.route_id)).map((r) => r.route_id));
    const newRoutes = (run.result?.routes || []).filter((r) => visibleIds.has(r.route_id));
    const newLegacy = (run.result?.legacy_vrp_output?.rutas || []).filter((r) => visibleIds.has(r.ruta_id));
    return {
      ...run,
      result: {
        ...run.result,
        routes: newRoutes,
        legacy_vrp_output: { ...run.result?.legacy_vrp_output, rutas: newLegacy },
      },
    };
  }, [run, routes, zoneFilter, matchesZoneFilter]);

  const toggleZone = useCallback((zona) => {
    setZoneFilter((prev) => {
      const next = new Set(prev);
      if (next.has(zona)) next.delete(zona);
      else next.add(zona);
      return next;
    });
  }, []);

  const exportToGoogleMaps = useCallback(() => {
    if (!selectedRoute) return;
    const legacyRoutes = run?.result?.legacy_vrp_output?.rutas || [];
    const legacyMatch = legacyRoutes.find((r) => r.ruta_id === selectedRoute.route_id);
    const tiendas = legacyMatch?.tiendas || [];
    if (!tiendas.length) {
      setError('No se encontraron coordenadas para esta ruta.');
      return;
    }
    const cedis = run?.result?.legacy_vrp_output?.meta?.cedis?.[0];
    const origin = cedis ? `${cedis.lat},${cedis.lng}` : `${tiendas[0].lat},${tiendas[0].lng}`;
    const destination = `${tiendas[tiendas.length - 1].lat},${tiendas[tiendas.length - 1].lng}`;
    const waypoints = tiendas.slice(0, -1).map((t) => `${t.lat},${t.lng}`).join('|');
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [run, selectedRoute]);

  const selectedRouteStops = useMemo(() => {
    if (!selectedRoute) return [];
    const legacy = run?.result?.legacy_vrp_output?.rutas || [];
    const match = legacy.find((r) => r.ruta_id === selectedRoute.route_id);
    return match?.tiendas || [];
  }, [run, selectedRoute]);

  if (loading) {
    return (
      <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', gap: 2 }}>
        <CircularProgress size={28} sx={{ color: 'var(--accent)' }} />
        <Typography sx={{ color: 'var(--text-muted)', fontSize: 12 }}>
          Cargando run activo…
        </Typography>
      </Box>
    );
  }

  if (!run) {
    return (
      <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', p: 3 }}>
        <GlassCard padding={20} sx={{ maxWidth: 460, textAlign: 'center' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', mb: 1 }}>
            Sin run en producción
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'var(--text-muted)', mb: 2 }}>
            Ve a la vista <b>Testing</b>, ejecuta un algoritmo, y promuévelo a producción.
          </Typography>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadActive}>
            Reintentar
          </Button>
        </GlassCard>
      </Box>
    );
  }

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
      {/* Barra de acciones operativas */}
      <GlassCard padding="10px 14px">
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography
            sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.06em', color: 'var(--text-muted)' }}
          >
            En producción
          </Typography>
          <Select
            value={run?.meta?.id || ''}
            onChange={(e) => onSelectRun(e.target.value)}
            displayEmpty
            size="small"
            sx={{ minWidth: 280, fontSize: 12, fontFamily: 'var(--font-mono), monospace' }}
          >
            <MenuItem value="" disabled><em>Selecciona un run</em></MenuItem>
            {allRuns.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.id === activeRunId ? '★ ' : ''}
                {r.id} · {r.algoritmo} · {r.kpis.n_rutas}r
              </MenuItem>
            ))}
          </Select>
          {run?.meta?.id && run.meta.id !== activeRunId && (
            <Button variant="outlined" size="small" onClick={onPromoteCurrent} sx={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
              Promover este
            </Button>
          )}
          {activeRunId && run?.meta?.id === activeRunId && (
            <Badge tone="accent">PROD</Badge>
          )}
          <Box sx={{ flex: 1 }} />
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
            startIcon={uploadBusy ? <CircularProgress size={14} color="inherit" /> : <UploadFileIcon />}
            size="small"
            disabled={uploadBusy}
            onClick={() => setShowFileModal(true)}
          >
            {uploadBusy ? 'Procesando…' : 'Subir nuevo PMO'}
          </Button>
          <IconButtonGlass
            icon={<RefreshIcon />}
            tooltip="Refrescar"
            onClick={loadActive}
            size={34}
          />
        </Box>
        {uploadBusy && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={Math.round(solverProgress * 100)}
              sx={{ height: 3, borderRadius: 2 }}
            />
            <Typography sx={{ fontSize: 10, color: 'var(--text-muted)', mt: 0.4 }}>
              {Math.round(solverProgress * 100)}% · resolviendo…
            </Typography>
          </Box>
        )}
      </GlassCard>

      {/* KPIs */}
      <KpiBento cols={6}>
        <KpiCard
          label="Algoritmo"
          value={meta.algoritmo || '—'}
          hint={meta.id?.split('__')[0]}
          featured
        />
        <KpiCard label="Rutas" value={kpis.n_rutas || 0} format={(v) => FMT_NUM.format(Math.round(v))} />
        <KpiCard label="Tiendas" value={kpis.n_tiendas || 0} format={(v) => FMT_NUM.format(Math.round(v))} />
        <KpiCard
          label="Distancia"
          value={kpis.total_km || 0}
          unit="km"
          format={(v) => FMT_NUM.format(Math.round(v))}
        />
        <KpiCard
          label="Costo flota"
          value={kpis.total_costo || 0}
          format={(v) => FMT_MXN.format(Math.round(v))}
        />
        <KpiCard
          label="Ocupación"
          value={(kpis.ocupacion_promedio || 0) * 100}
          unit="%"
          format={(v) => v.toFixed(1)}
        />
      </KpiBento>

      {/* Mapa + sidebar */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: 1.4,
          minHeight: 0,
          '@media (max-width: 1100px)': {
            gridTemplateColumns: '1fr',
            gridTemplateRows: 'minmax(420px, 1fr) auto',
          },
        }}
      >
        <GlassCard padding={0} sx={{ overflow: 'hidden', minHeight: 360, position: 'relative' }}>
          <KioskoMap
            run={filteredRunForMap}
            selectedRouteId={selectedRouteId}
            hoveredRouteId={hoveredRouteId}
            onSelectRoute={(rid) => setSelectedRouteId((prev) => (prev === rid ? null : rid))}
            onSelectStore={(stop) => setSelectedStore(stop || null)}
            showHeatmap={showHeatmap}
          />
          {selectedRoute && (
            <Box sx={{ position: 'absolute', top: 14, right: 14, zIndex: 600, display: 'flex', gap: 0.6 }}>
              <IconButtonGlass
                icon={<LayersIcon sx={{ color: showHeatmap ? 'var(--accent)' : undefined }} />}
                tooltip={showHeatmap ? 'Ocultar densidad' : 'Mostrar densidad de tiendas'}
                onClick={() => setShowHeatmap(v => !v)}
                size={34}
              />
              <IconButtonGlass
                icon={<OpenInNewIcon />}
                tooltip="Abrir en Google Maps"
                onClick={exportToGoogleMaps}
              />
              <IconButtonGlass
                icon={<RefreshIcon />}
                tooltip="Refrescar run activo"
                onClick={loadActive}
              />
            </Box>
          )}
        </GlassCard>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.4, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
          {/* Historial de runs */}
          {allRuns.length > 1 && (
            <GlassCard padding="10px 14px" sx={{ flexShrink: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.8, gap: 1 }}>
                <Typography sx={{ flex: 1, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                  Historial
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                {allRuns.slice(0, 5).map((r, i) => {
                  const isActive = r.id === activeRunId;
                  const prev = allRuns[i + 1];
                  const deltaKm = prev ? ((r.kpis.total_km - prev.kpis.total_km) / prev.kpis.total_km * 100) : null;
                  return (
                    <Box
                      key={r.id}
                      onClick={() => onSelectRun(r.id)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 0.8,
                        px: 0.8, py: 0.5, borderRadius: 1.5, cursor: 'pointer',
                        background: isActive ? 'var(--accent-soft)' : 'transparent',
                        border: `1px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                        '&:hover': { background: 'var(--glass-bg)' },
                        transition: 'all 0.15s',
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--accent)' : 'var(--text-secondary)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.algoritmo}
                        </Typography>
                        <Typography sx={{ fontSize: 9.5, color: 'var(--text-subtle)', fontFamily: 'monospace' }}>
                          {r.kpis.n_rutas}r · {Math.round(r.kpis.total_km)} km
                        </Typography>
                      </Box>
                      {deltaKm !== null && (
                        <Typography sx={{
                          fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace',
                          color: deltaKm < 0 ? 'var(--success)' : deltaKm > 0 ? 'var(--error)' : 'var(--text-subtle)',
                        }}>
                          {deltaKm > 0 ? '+' : ''}{deltaKm.toFixed(1)}%
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
              {allRuns.length >= 3 && (
                <Box sx={{ display: 'flex', gap: 2, mt: 1, pt: 0.8, borderTop: '1px solid var(--glass-border)' }}>
                  <Box>
                    <Typography sx={{ fontSize: 8.5, color: 'var(--text-muted)', mb: 0.3 }}>KM</Typography>
                    <KpiSparkline runs={[...allRuns].reverse().slice(-10)} field="total_km" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 8.5, color: 'var(--text-muted)', mb: 0.3 }}>COSTO</Typography>
                    <KpiSparkline runs={[...allRuns].reverse().slice(-10)} field="total_costo" color="#10B981" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 8.5, color: 'var(--text-muted)', mb: 0.3 }}>OCUP %</Typography>
                    <KpiSparkline runs={[...allRuns].reverse().slice(-10)} field="ocupacion_promedio" color="#A78BFA" />
                  </Box>
                </Box>
              )}
            </GlassCard>
          )}

          {availableZones.length > 1 && (
            <GlassCard padding="10px 14px" sx={{ flexShrink: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.6, gap: 1 }}>
                <Typography
                  sx={{ flex: 1, fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.06em', color: 'var(--text-muted)' }}
                >
                  Zonas
                </Typography>
                {zoneFilter.size > 0 && (
                  <Typography
                    component="button"
                    onClick={() => setZoneFilter(new Set())}
                    sx={{
                      fontSize: 10, color: 'var(--accent)', cursor: 'pointer',
                      background: 'none', border: 'none', textTransform: 'uppercase',
                      letterSpacing: '0.06em', fontWeight: 700,
                    }}
                  >
                    Limpiar
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {availableZones.map(({ zona, count }) => (
                  <FilterChip
                    key={zona}
                    label={zona}
                    count={count}
                    active={zoneFilter.has(zona)}
                    onClick={() => toggleZone(zona)}
                  />
                ))}
              </Box>
            </GlassCard>
          )}
          {selectedStore && (
            <StoreDetailPanel
              store={selectedStore}
              cedis={run?.result?.legacy_vrp_output?.meta?.cedis?.[0] || null}
              routeId={selectedRouteId}
              onClose={() => setSelectedStore(null)}
            />
          )}
          {selectedRoute ? (
            <GlassCard padding="10px 12px" sx={{ flexShrink: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                <Typography
                  sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.06em', color: 'var(--text-muted)' }}
                >
                  Ruta seleccionada
                </Typography>
                <Badge tone="accent">{selectedRoute.truck_id}</Badge>
              </Box>
              <Typography
                sx={{ fontFamily: 'var(--font-mono), monospace', fontSize: 13, fontWeight: 700,
                      color: 'var(--text-primary)', mb: 0.6 }}
              >
                {selectedRoute.route_id}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.8, mb: 1 }}>
                <Stat label="km" value={Math.round(selectedRoute.total_km || 0)} />
                <Stat label="paradas" value={(selectedRoute.sequence || []).length} />
                <Stat label="costo" value={FMT_MXN.format(Math.round(selectedRoute.total_costo || 0))} />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<OpenInNewIcon />}
                  onClick={exportToGoogleMaps}
                  size="small"
                >
                  Maps
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={() => setShowShareModal(true)}
                  size="small"
                >
                  Compartir
                </Button>
              </Box>
            </GlassCard>
          ) : null}

          <GlassCard
            padding={0}
            sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column' }}
          >
            <Box
              sx={{
                p: '12px 14px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                position: 'sticky',
                top: 0,
                zIndex: 2,
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Typography
                sx={{ flex: 1, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.06em', color: 'var(--text-muted)' }}
              >
                Rutas ({routesSorted.length}/{routes.length})
              </Typography>
            </Box>
            <Box sx={{ px: '14px', pb: 1 }}>
              <input
                type="text"
                placeholder="Buscar ruta o tienda…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </Box>
            <Box sx={{ p: '6px 14px 14px', display: 'grid', gap: 0.5, maxHeight: 260, overflowY: 'auto' }}>
              {routesSorted.length === 0 && (
                <Typography sx={{ fontSize: 11, color: 'var(--text-subtle)', textAlign: 'center', py: 2 }}>
                  Sin coincidencias
                </Typography>
              )}
              {routesSorted.slice(0, 80).map((route) => (
                <RouteRow
                  key={route.route_id}
                  routeId={route.route_id}
                  truck={route.truck_id}
                  km={Math.round(route.total_km || 0)}
                  costo={FMT_MXN.format(Math.round(route.total_costo || 0))}
                  selected={selectedRouteId === route.route_id}
                  dim={selectedRouteId && selectedRouteId !== route.route_id}
                  onClick={() =>
                    setSelectedRouteId((prev) => (prev === route.route_id ? null : route.route_id))
                  }
                  onMouseEnter={() => setHoveredRouteId(route.route_id)}
                  onMouseLeave={() => setHoveredRouteId(null)}
                />
              ))}
              {routesSorted.length > 80 && (
                <Typography sx={{ fontSize: 10, color: 'var(--text-subtle)', textAlign: 'center', mt: 1 }}>
                  … y {routesSorted.length - 80} más (refina la búsqueda)
                </Typography>
              )}
            </Box>
          </GlassCard>
        </Box>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!info}
        autoHideDuration={3000}
        onClose={() => setInfo(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setInfo(null)}>
          {info}
        </Alert>
      </Snackbar>

      <FileImportModal
        open={showFileModal}
        onClose={() => setShowFileModal(false)}
        title="Subir Plan Maestro"
        onConfirm={({ file, sheetName }) => {
          setShowFileModal(false);
          onUploadPmo(file);
        }}
      />

      <ShareRouteModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        route={selectedRoute}
        run={run}
      />
    </Box>
  );
}

function Stat({ label, value }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 9.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </Typography>
      <Typography
        sx={{ fontFamily: 'var(--font-mono), monospace', fontSize: 13, fontWeight: 700,
              color: 'var(--text-primary)' }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function haversine({ lat: lat1, lng: lng1 }, { lat: lat2, lng: lng2 }) {
  const R = 6371, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

const CLASIF_COLORS = { AAA: '#F59E0B', AA: 'var(--accent)', A: '#38BDF8' };

function StoreDetailPanel({ store, cedis, routeId, onClose }) {
  const clasif = (store.clasificacion || '').toUpperCase();
  const badgeColor = CLASIF_COLORS[clasif] || 'var(--text-subtle)';
  const distanciaKm =
    cedis && Number.isFinite(cedis.lat) && Number.isFinite(cedis.lng)
      ? Math.round(haversine({ lat: cedis.lat, lng: cedis.lng }, { lat: store.lat, lng: store.lng }))
      : null;
  return (
    <GlassCard padding="14px" sx={{ flexShrink: 0, position: 'relative' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.8 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.06em', color: 'var(--text-muted)', mb: 0.4 }}>
            Tienda seleccionada
          </Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
                            overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {store.nombre || `Tienda ${store.id_tienda || ''}`}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'var(--text-muted)', mt: -0.6, mr: -0.6 }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
      {clasif && (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 0.8, py: 0.2,
                   borderRadius: 1, background: `${badgeColor}22`, border: `1px solid ${badgeColor}`,
                   fontSize: 10, fontWeight: 700, color: badgeColor, mb: 1, letterSpacing: '0.06em' }}>
          {clasif}
        </Box>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.8, mb: 1 }}>
        <Stat label="zona" value={store.zona || '—'} />
        <Stat label="municipio" value={store.municipio || '—'} />
        <Stat label="estado" value={store.estado || '—'} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0.8, mb: 1 }}>
        <Stat label="demanda" value={`${store.demanda || 0} cajas`} />
        <Stat label="frecuencia" value={store.frecuencia ? `cada ${store.frecuencia} d` : '—'} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0.8 }}>
        <Stat label="ruta" value={routeId || '—'} />
        <Stat label="dist. CEDIS" value={distanciaKm !== null ? `${distanciaKm} km` : '—'} />
      </Box>
    </GlassCard>
  );
}

function KpiSparkline({ runs, field, color = 'var(--accent)', width = 80, height = 28 }) {
  if (!runs || runs.length < 2) return null;
  const vals = runs.map((r) => r.kpis?.[field] ?? 0);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  const last = pts[pts.length - 1].split(',');
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.7} />
      <circle cx={last[0]} cy={last[1]} r={3} fill={color} />
    </svg>
  );
}
