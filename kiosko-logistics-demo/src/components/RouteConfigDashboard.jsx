'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, MenuItem, Select, Slider, Snackbar,
  TextField, Typography, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestoreIcon from '@mui/icons-material/Restore';

import GlassCard from './ui/GlassCard';
import Badge from './ui/Badge';
import RouteRow from './ui/RouteRow';
import FileImportModal from './FileImportModal';
import {
  fetchPlanMaestro, uploadPlanMaestro, setPlanMaestroSheet,
  fetchConfigs, fetchConfig, saveConfig, deleteConfigApi,
} from '@/lib/testingApi';

/**
 * Configurador unificado:
 *  • Sube y selecciona el plan maestro (Excel) → lo persiste el backend.
 *  • Edita TODOS los parámetros del solver (costos, operación, frecuencias,
 *    penalizaciones, solver). No solo VRP — sirven para todos los algoritmos.
 *  • Guarda configs nombradas y las recarga.
 *
 * Esto reemplaza el Configurador anterior (con perfiles fijos y flota
 * heterogénea). La flota ahora es homogénea (720 cajas).
 */

export const DEFAULT_SOLVER_CONFIG = {
  // Costos
  PRECIO_DIESEL_MXN: 30,
  COSTO_CHOFER_DIA_MXN: 650,
  COSTO_DESGASTE_KM_MXN: 2.5,
  COSTO_HORA_EXTRA_MXN: 90,
  // Operación
  MAX_TIENDAS_RUTA: 15,
  TARGET_OCUPACION: 0.85,
  TIEMPO_PARADA_MIN: 30,
  TIEMPO_RESTOCK_MIN: 60,
  JORNADA_BASE_MIN: 480,
  // Flota homogénea
  DEFAULT_CAP_CAJAS: 720,
  DEFAULT_RENDIMIENTO_KML: 6.0,
  // Geometría / penalizaciones
  MAX_ARC_KM: 50,
  ARC_PENALTY_FACTOR: 5,
  CENTROID_DEV_FACTOR: 8,
  CLUSTER_CROSS_PENALTY: 12,
  // Solver
  RENDIMIENTO_SOLVER_KML: 7.0,
  TIME_LIMIT_SECONDS: 60,
  // Frecuencias por clasificación
  FRECUENCIA_MODE: 'PREFERIR',
  FRECUENCIA_PESO: 0.5,
  FRECUENCIA_AAA_DIAS: 3.5,
  FRECUENCIA_AA_DIAS: 7,
  FRECUENCIA_A_DIAS: 14,
  // Toggles del modelo matemático — true = término activo en la formulación
  ARC_PENALTY_ENABLED: true,
  CENTROID_DEV_ENABLED: true,
  CLUSTER_CROSS_ENABLED: true,
  INCLUDE_WEAR_COST: true,
  INCLUDE_DRIVER_COST: true,
};

const SECTIONS = [
  {
    id: 'costos',
    title: 'Costos',
    fields: [
      { key: 'PRECIO_DIESEL_MXN', label: 'Diesel', unit: 'MXN/L', min: 10, max: 60, step: 0.5 },
      { key: 'COSTO_CHOFER_DIA_MXN', label: 'Chofer (turno)', unit: 'MXN', min: 200, max: 2000, step: 25 },
      { key: 'COSTO_DESGASTE_KM_MXN', label: 'Desgaste', unit: 'MXN/km', min: 0, max: 10, step: 0.1 },
      { key: 'COSTO_HORA_EXTRA_MXN', label: 'Hora extra', unit: 'MXN/h', min: 0, max: 400, step: 5 },
    ],
  },
  {
    id: 'operacion',
    title: 'Operación',
    fields: [
      { key: 'MAX_TIENDAS_RUTA', label: 'Máx. tiendas/ruta', unit: '', min: 5, max: 30, step: 1 },
      { key: 'TARGET_OCUPACION', label: 'Ocupación objetivo', unit: '', min: 0.5, max: 1, step: 0.01, fmt: (v) => `${Math.round(v * 100)}%` },
      { key: 'TIEMPO_PARADA_MIN', label: 'Tiempo por parada', unit: 'min', min: 5, max: 120, step: 5 },
      { key: 'TIEMPO_RESTOCK_MIN', label: 'Restock en CEDIS', unit: 'min', min: 10, max: 180, step: 5 },
      { key: 'JORNADA_BASE_MIN', label: 'Jornada base', unit: 'min', min: 240, max: 720, step: 30 },
    ],
  },
  {
    id: 'flota',
    title: 'Flota (homogénea)',
    fields: [
      { key: 'DEFAULT_CAP_CAJAS', label: 'Capacidad', unit: 'cajas', min: 200, max: 1200, step: 20 },
      { key: 'DEFAULT_RENDIMIENTO_KML', label: 'Rendimiento', unit: 'km/L', min: 2, max: 12, step: 0.1 },
    ],
  },
  {
    id: 'penalizaciones',
    title: 'Penalizaciones geométricas',
    fields: [
      { key: 'MAX_ARC_KM', label: 'Máx. km/arco', unit: 'km', min: 10, max: 200, step: 5 },
      { key: 'ARC_PENALTY_FACTOR', label: 'Penalización arco largo', unit: 'x', min: 1, max: 20, step: 1 },
      { key: 'CENTROID_DEV_FACTOR', label: 'Penalización dispersión', unit: '', min: 0, max: 30, step: 1 },
      { key: 'CLUSTER_CROSS_PENALTY', label: 'Aislamiento de zona', unit: 'x', min: 0, max: 30, step: 1 },
    ],
  },
  {
    id: 'solver',
    title: 'Solver',
    fields: [
      { key: 'RENDIMIENTO_SOLVER_KML', label: 'Rendimiento (objetivo)', unit: 'km/L', min: 2, max: 12, step: 0.1 },
      { key: 'TIME_LIMIT_SECONDS', label: 'Tiempo límite', unit: 's', min: 10, max: 600, step: 10 },
    ],
  },
];

const EXPRESS_PRESETS = [
  { id: 'COMPACTO', label: 'Ciudad', icon: '🏙️', desc: 'Rutas cortas, alta consolidación',
    config: { MAX_TIENDAS_RUTA: 10, TARGET_OCUPACION: 0.88, CENTROID_DEV_FACTOR: 16, CLUSTER_CROSS_PENALTY: 14, TIME_LIMIT_SECONDS: 60 } },
  { id: 'ESTANDAR', label: 'Estándar', icon: '⚖️', desc: 'Operación balanceada',
    config: { MAX_TIENDAS_RUTA: 12, TARGET_OCUPACION: 0.75, CENTROID_DEV_FACTOR: 10, CLUSTER_CROSS_PENALTY: 9, TIME_LIMIT_SECONDS: 60 } },
  { id: 'REGIONAL', label: 'Regional', icon: '🗺️', desc: 'Cobertura amplia, rutas largas',
    config: { MAX_TIENDAS_RUTA: 15, TARGET_OCUPACION: 0.55, CENTROID_DEV_FACTOR: 4, CLUSTER_CROSS_PENALTY: 5, TIME_LIMIT_SECONDS: 120 } },
  { id: 'ECONOMICO', label: 'Económico', icon: '💰', desc: 'Máxima ocupación, mínimo costo',
    config: { MAX_TIENDAS_RUTA: 13, TARGET_OCUPACION: 0.92, CENTROID_DEV_FACTOR: 14, CLUSTER_CROSS_PENALTY: 10, TIME_LIMIT_SECONDS: 30 } },
];

export default function RouteConfigDashboard() {
  const [pmo, setPmo] = useState(null);
  const [pmoUploading, setPmoUploading] = useState(false);
  const [pmoFile, setPmoFile] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);

  const [config, setConfig] = useState(DEFAULT_SOLVER_CONFIG);
  const [configs, setConfigs] = useState([]);
  const [activeConfigId, setActiveConfigId] = useState(null);
  const [configName, setConfigName] = useState('');

  const [configMode, setConfigMode] = useState('express');

  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const refreshAll = useCallback(async () => {
    try {
      const [pm, cfgs] = await Promise.all([fetchPlanMaestro(), fetchConfigs()]);
      setPmo(pm);
      setConfigs(cfgs);
    } catch (err) {
      setError(`Backend: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const onUploadPmo = useCallback(async () => {
    if (!pmoFile) {
      setError('Selecciona un archivo .xlsx primero.');
      return;
    }
    setPmoUploading(true);
    try {
      const meta = await uploadPlanMaestro(pmoFile);
      setPmo(meta);
      setInfo(`Plan maestro actualizado: ${meta.n_tiendas} tiendas (sheet "${meta.sheet}")`);
      setPmoFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setPmoUploading(false);
    }
  }, [pmoFile]);

  const onChangeSheet = useCallback(async (sheet) => {
    try {
      const meta = await setPlanMaestroSheet(sheet);
      setPmo(meta);
      setInfo(`Sheet activo: "${sheet}" (${meta.n_tiendas} tiendas)`);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const onResetDefaults = useCallback(() => {
    setConfig(DEFAULT_SOLVER_CONFIG);
    setActiveConfigId(null);
    setConfigName('');
    setInfo('Configuración restaurada a valores por defecto.');
  }, []);

  const onLoadConfig = useCallback(async (id) => {
    try {
      const cfg = await fetchConfig(id);
      setConfig({ ...DEFAULT_SOLVER_CONFIG, ...(cfg.snapshot || {}) });
      setActiveConfigId(cfg.id);
      setConfigName(cfg.nombre);
      setInfo(`Cargada config "${cfg.nombre}".`);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const onSaveConfig = useCallback(async () => {
    const nombre = (configName || '').trim() || `Config ${new Date().toISOString().slice(0, 16)}`;
    try {
      const meta = await saveConfig(nombre, config);
      setActiveConfigId(meta.id);
      setInfo(`Guardada config "${nombre}".`);
      const refreshed = await fetchConfigs();
      setConfigs(refreshed);
    } catch (err) {
      setError(err.message);
    }
  }, [configName, config]);

  const onDeleteConfig = useCallback(async (id) => {
    if (!confirm('¿Borrar esta configuración?')) return;
    try {
      await deleteConfigApi(id);
      const refreshed = await fetchConfigs();
      setConfigs(refreshed);
      if (activeConfigId === id) {
        setActiveConfigId(null);
        setConfigName('');
      }
      setInfo('Configuración borrada.');
    } catch (err) {
      setError(err.message);
    }
  }, [activeConfigId]);

  const setField = useCallback((key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyExpressPreset = useCallback((preset) => {
    setConfig((prev) => ({ ...prev, ...preset.config }));
  }, []);

  const isExpressPresetActive = useCallback((cfg, preset) => {
    return Object.entries(preset.config).every(([k, v]) => cfg[k] === v);
  }, []);

  const dirty = useMemo(() => {
    const baseline = activeConfigId
      ? configs.find((c) => c.id === activeConfigId)
      : null;
    if (!baseline) {
      return JSON.stringify(config) !== JSON.stringify(DEFAULT_SOLVER_CONFIG);
    }
    return true; // simplificación: cualquier edición se considera dirty
  }, [config, configs, activeConfigId]);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
        gridTemplateRows: { xs: 'auto auto 1fr', md: '1fr' },
        gap: 1.4,
        minHeight: 0,
      }}
    >
      {/* Sidebar: plan maestro + configs guardadas */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.4, minHeight: 0 }}>
        <GlassCard padding={14} sx={{ flexShrink: 0 }}>
          <Typography
            sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.06em', color: 'var(--text-muted)', mb: 1 }}
          >
            Plan maestro
          </Typography>
          {pmo ? (
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                {pmo.filename}
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {pmo.n_tiendas} tiendas · subido{' '}
                {new Date(pmo.uploaded_at).toLocaleString('es-MX', {
                  dateStyle: 'short', timeStyle: 'short',
                })}
              </Typography>
              {pmo.sheets?.length > 1 && (
                <Box sx={{ mt: 1 }}>
                  <Typography sx={{ fontSize: 10, color: 'var(--text-muted)', mb: 0.4 }}>
                    Sheet activo
                  </Typography>
                  <Select
                    value={pmo.sheet}
                    onChange={(e) => onChangeSheet(e.target.value)}
                    size="small"
                    fullWidth
                    sx={{ fontSize: 12, fontFamily: 'var(--font-mono), monospace' }}
                  >
                    {pmo.sheets.map((sn) => (
                      <MenuItem key={sn} value={sn}>{sn}</MenuItem>
                    ))}
                  </Select>
                </Box>
              )}
            </Box>
          ) : (
            <Typography sx={{ fontSize: 12, color: 'var(--text-subtle)' }}>
              Sin plan maestro registrado.
            </Typography>
          )}
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            size="small"
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => setShowFileModal(true)}
          >
            {pmoFile ? pmoFile.name.slice(0, 22) : 'Subir / cambiar .xlsx'}
          </Button>
          {pmoFile && (
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={onUploadPmo}
              disabled={pmoUploading}
              startIcon={pmoUploading ? <CircularProgress size={12} color="inherit" /> : null}
              sx={{ mt: 0.6 }}
            >
              {pmoUploading ? 'Subiendo…' : 'Confirmar subida'}
            </Button>
          )}
        </GlassCard>

        <GlassCard
          padding={0}
          sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 220 }}
        >
          <Box sx={{ p: '12px 14px 6px', flexShrink: 0 }}>
            <Typography
              sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.06em', color: 'var(--text-muted)' }}
            >
              Configs guardadas ({configs.length})
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', p: '6px 14px 14px', display: 'grid', gap: 0.5 }}>
            {configs.length === 0 && (
              <Typography sx={{ fontSize: 11, color: 'var(--text-subtle)', textAlign: 'center', py: 2 }}>
                Aún no hay configuraciones. Edita los sliders y guarda.
              </Typography>
            )}
            {configs.map((c) => (
              <Box
                key={c.id}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <RouteRow
                    routeId={c.nombre}
                    truck={c.summary || ''}
                    selected={activeConfigId === c.id}
                    onClick={() => onLoadConfig(c.id)}
                  />
                </Box>
                <Button
                  size="small"
                  onClick={() => onDeleteConfig(c.id)}
                  sx={{ minWidth: 32, color: 'var(--text-muted)', '&:hover': { color: 'var(--error)' } }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </Button>
              </Box>
            ))}
          </Box>
        </GlassCard>
      </Box>

      {/* Main: editor de variables */}
      <GlassCard
        padding={0}
        sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1, p: '12px 18px',
            borderBottom: '1px solid var(--glass-border)',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
              Parámetros del solver
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Aplican a TODOS los algoritmos. Guarda configuraciones para reusarlas en Testing.
            </Typography>
          </Box>
          {dirty && <Badge tone="warn">SIN GUARDAR</Badge>}
          {activeConfigId && <Badge tone="accent">ACTIVA</Badge>}
          <ToggleButtonGroup
            value={configMode}
            exclusive
            size="small"
            onChange={(_, v) => v && setConfigMode(v)}
            sx={{
              '& .MuiToggleButton-root': {
                color: 'var(--text-muted)', borderColor: 'var(--glass-border)',
                fontSize: 11, textTransform: 'none', px: 1.4, py: 0.4,
              },
              '& .Mui-selected': {
                color: '#fff !important', background: 'var(--accent) !important',
                borderColor: 'var(--accent) !important',
              },
            }}
          >
            <ToggleButton value="express">⚡ Express</ToggleButton>
            <ToggleButton value="experto">🔧 Experto</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {configMode === 'express' ? (
          <Box sx={{ p: '14px 18px', overflow: 'auto', flex: 1 }}>
            {/* Presets */}
            <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', mb: 1 }}>
              Perfil de operación
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mb: 2.5 }}>
              {EXPRESS_PRESETS.map((preset) => {
                const isActive = isExpressPresetActive(config, preset);
                return (
                  <Box
                    key={preset.id}
                    onClick={() => applyExpressPreset(preset)}
                    sx={{
                      p: '10px 10px 8px', borderRadius: 2, cursor: 'pointer',
                      border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--glass-border)'}`,
                      background: isActive ? 'var(--accent-soft)' : 'var(--glass-bg)',
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: 'var(--accent)', background: 'var(--accent-soft)' },
                    }}
                  >
                    <Typography sx={{ fontSize: 18, lineHeight: 1, mb: 0.3 }}>{preset.icon}</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: isActive ? 700 : 600, color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {preset.label}
                    </Typography>
                    <Typography sx={{ fontSize: 9.5, color: isActive ? 'var(--accent)' : 'var(--text-muted)', lineHeight: 1.35, mt: 0.2 }}>
                      {preset.desc}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* 3 master sliders */}
            <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', mb: 1.5 }}>
              Ajuste rápido
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <SliderField
                field={{ key: 'MAX_TIENDAS_RUTA', label: 'Carga de ruta', unit: 'tiendas', min: 5, max: 20, step: 1,
                  hint: 'Número máximo de tiendas por ruta' }}
                value={config.MAX_TIENDAS_RUTA}
                onChange={(v) => {
                  const occ = parseFloat((0.55 + 0.35 * ((v - 5) / 15)).toFixed(2));
                  setField('MAX_TIENDAS_RUTA', v);
                  setField('TARGET_OCUPACION', occ);
                }}
              />
              <SliderField
                field={{ key: 'CENTROID_DEV_FACTOR', label: 'Compactación geográfica', unit: '', min: 2, max: 20, step: 1,
                  hint: 'Alto = rutas más compactas, bajo = más dispersas', fmt: (v) => `×${v}` }}
                value={config.CENTROID_DEV_FACTOR}
                onChange={(v) => {
                  const cp = Math.round(3 + (v / 20) * 12);
                  setField('CENTROID_DEV_FACTOR', v);
                  setField('CLUSTER_CROSS_PENALTY', cp);
                }}
              />
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4, alignItems: 'baseline' }}>
                  <Typography sx={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Precisión del solver
                  </Typography>
                </Box>
                <ToggleButtonGroup
                  value={config.TIME_LIMIT_SECONDS <= 30 ? 'RAPIDO' : config.TIME_LIMIT_SECONDS <= 60 ? 'BALANCEADO' : 'PRECISO'}
                  exclusive
                  size="small"
                  onChange={(_, v) => {
                    if (!v) return;
                    setField('TIME_LIMIT_SECONDS', { RAPIDO: 30, BALANCEADO: 60, PRECISO: 120 }[v]);
                  }}
                  sx={{
                    '& .MuiToggleButton-root': { fontSize: 11, textTransform: 'none', px: 1.5, py: 0.5, borderColor: 'var(--glass-border)', color: 'var(--text-muted)' },
                    '& .Mui-selected': { color: '#fff !important', background: 'var(--accent) !important', borderColor: 'var(--accent) !important' },
                  }}
                >
                  <ToggleButton value="RAPIDO">⚡ Rápido (30s)</ToggleButton>
                  <ToggleButton value="BALANCEADO">⚖️ Balanceado (60s)</ToggleButton>
                  <ToggleButton value="PRECISO">🔬 Preciso (120s)</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
          </Box>
        ) : (
          /* EXPERTO: formulario completo */
          <Box sx={{ flex: 1, overflowY: 'auto', p: '14px 18px' }}>
            {SECTIONS.map((section) => (
              <Box key={section.id} sx={{ mb: 2.4 }}>
                <Typography
                  sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.08em', color: 'var(--accent)', mb: 1 }}
                >
                  {section.title}
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                    gap: 1.6,
                  }}
                >
                  {section.fields.map((f) => (
                    <SliderField
                      key={f.key}
                      field={f}
                      value={config[f.key]}
                      onChange={(v) => setField(f.key, v)}
                    />
                  ))}
                </Box>
              </Box>
            ))}

            {/* Frecuencias por clasificación */}
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.08em', color: 'var(--accent)', mb: 1 }}
              >
                Frecuencias por clasificación
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: 12, color: 'var(--text-secondary)' }}>Modo:</Typography>
                <ToggleButtonGroup
                  value={config.FRECUENCIA_MODE}
                  exclusive
                  size="small"
                  onChange={(_, val) => val && setField('FRECUENCIA_MODE', val)}
                  sx={{
                    '& .MuiToggleButton-root': {
                      color: 'var(--text-muted)', borderColor: 'var(--glass-border)',
                      fontSize: 11, textTransform: 'none', px: 1.4,
                    },
                    '& .Mui-selected': {
                      color: '#fff !important', background: 'var(--accent) !important',
                      borderColor: 'var(--accent) !important',
                    },
                  }}
                >
                  <ToggleButton value="PREFERIR">Preferir (suave)</ToggleButton>
                  <ToggleButton value="BLOQUEAR">Bloquear (forzado)</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {config.FRECUENCIA_MODE === 'PREFERIR' && (
                <Box sx={{ mb: 1.5 }}>
                  <SliderField
                    field={{
                      key: 'FRECUENCIA_PESO',
                      label: 'Peso de la preferencia',
                      unit: '',
                      min: 0,
                      max: 1,
                      step: 0.05,
                      fmt: (v) => `${Math.round(v * 100)}%`,
                      hint: '0% = ignora · 100% = equivale a Bloquear',
                    }}
                    value={config.FRECUENCIA_PESO}
                    onChange={(v) => setField('FRECUENCIA_PESO', v)}
                  />
                </Box>
              )}

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                  gap: 1.6,
                }}
              >
                <SliderField
                  field={{
                    key: 'FRECUENCIA_AAA_DIAS', label: 'AAA cada X días',
                    min: 1, max: 14, step: 0.5,
                    hint: 'Tiendas AAA (alta rotación)',
                  }}
                  value={config.FRECUENCIA_AAA_DIAS}
                  onChange={(v) => setField('FRECUENCIA_AAA_DIAS', v)}
                />
                <SliderField
                  field={{
                    key: 'FRECUENCIA_AA_DIAS', label: 'AA cada X días',
                    min: 1, max: 21, step: 0.5,
                  }}
                  value={config.FRECUENCIA_AA_DIAS}
                  onChange={(v) => setField('FRECUENCIA_AA_DIAS', v)}
                />
                <SliderField
                  field={{
                    key: 'FRECUENCIA_A_DIAS', label: 'A cada X días',
                    min: 1, max: 30, step: 0.5,
                  }}
                  value={config.FRECUENCIA_A_DIAS}
                  onChange={(v) => setField('FRECUENCIA_A_DIAS', v)}
                />
              </Box>
            </Box>
          </Box>
        )}

        <Box
          sx={{
            display: 'flex', gap: 1, alignItems: 'center', p: '12px 18px',
            borderTop: '1px solid var(--glass-border)', flexWrap: 'wrap',
          }}
        >
          <TextField
            size="small"
            placeholder="Nombre de la configuración"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            sx={{ flex: 1, minWidth: 240 }}
          />
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={onResetDefaults}
            size="small"
          >
            Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={onSaveConfig}
            size="small"
          >
            Guardar config
          </Button>
        </Box>
      </GlassCard>

      <FileImportModal
        open={showFileModal}
        onClose={() => setShowFileModal(false)}
        title="Subir Plan Maestro"
        onConfirm={({ file, sheetName }) => {
          setPmoFile(file);
          setShowFileModal(false);
        }}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
      <Snackbar
        open={!!info}
        autoHideDuration={3500}
        onClose={() => setInfo(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setInfo(null)}>{info}</Alert>
      </Snackbar>
    </Box>
  );
}

function SliderField({ field, value, onChange }) {
  const display = field.fmt
    ? field.fmt(value)
    : `${typeof value === 'number' ? Number(value.toFixed(2)) : value}${field.unit ? ' ' + field.unit : ''}`;
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4, alignItems: 'baseline' }}>
        <Typography sx={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
          {field.label}
        </Typography>
        <Typography
          sx={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11.5,
                color: 'var(--text-primary)', fontWeight: 700 }}
        >
          {display}
        </Typography>
      </Box>
      <Slider
        value={typeof value === 'number' ? value : Number(value) || 0}
        min={field.min}
        max={field.max}
        step={field.step}
        onChange={(_, v) => onChange(v)}
        sx={{ py: 0.4 }}
      />
      {field.hint && (
        <Typography sx={{ fontSize: 9.5, color: 'var(--text-subtle)' }}>{field.hint}</Typography>
      )}
    </Box>
  );
}
