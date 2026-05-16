'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, MenuItem, Select, Slider, Snackbar, Switch,
  TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';

import GlassCard from './ui/GlassCard';
import Badge from './ui/Badge';
import GurobiCvrpModel from './math/GurobiCvrpModel';
import OrtoolsModel from './math/OrtoolsModel';
import { DEFAULT_SOLVER_CONFIG } from './RouteConfigDashboard';
import { fetchConfigs, fetchConfig, saveConfig } from '@/lib/testingApi';

const TOGGLES = {
  ortools: [
    { key: 'ARC_PENALTY_ENABLED', label: 'Penalización por arco largo', hint: 'Multiplica arcos > MAX_ARC_KM por ARC_PENALTY_FACTOR.' },
    { key: 'CENTROID_DEV_ENABLED', label: 'Dispersión del centroide', hint: 'Castiga tiendas alejadas del centroide de su cluster.' },
    { key: 'CLUSTER_CROSS_ENABLED', label: 'Cruce de cluster', hint: 'Castiga arcos entre clusters geográficos distintos.' },
    { key: 'INCLUDE_WEAR_COST', label: 'Costo de desgaste por km', hint: 'Suma COSTO_DESGASTE_KM_MXN × km al objetivo.' },
    { key: 'INCLUDE_DRIVER_COST', label: 'Costo fijo del chofer', hint: 'Suma COSTO_CHOFER_DIA_MXN por ruta activa.' },
  ],
  gurobi: [
    { key: 'INCLUDE_WEAR_COST', label: 'Costo de desgaste por km', hint: 'Lo incluye dentro del coeficiente de d_ij en el objetivo.' },
    { key: 'INCLUDE_DRIVER_COST', label: 'Costo fijo del chofer', hint: 'Cargo fijo por arco saliente del depósito.' },
  ],
};

const PARAMS = {
  ortools: [
    { key: 'PRECIO_DIESEL_MXN', label: 'Precio diésel', unit: 'MXN/L', min: 10, max: 60, step: 0.5 },
    { key: 'RENDIMIENTO_SOLVER_KML', label: 'Rendimiento', unit: 'km/L', min: 2, max: 12, step: 0.1 },
    { key: 'COSTO_DESGASTE_KM_MXN', label: 'Desgaste', unit: 'MXN/km', min: 0, max: 10, step: 0.1 },
    { key: 'COSTO_CHOFER_DIA_MXN', label: 'Chofer (día)', unit: 'MXN', min: 200, max: 2000, step: 25 },
    { key: 'MAX_ARC_KM', label: 'Umbral arco largo', unit: 'km', min: 10, max: 200, step: 5 },
    { key: 'ARC_PENALTY_FACTOR', label: 'Penalización arco', unit: '×', min: 1, max: 20, step: 1 },
    { key: 'CENTROID_DEV_FACTOR', label: 'Factor dispersión', unit: '', min: 0, max: 30, step: 1 },
    { key: 'CLUSTER_CROSS_PENALTY', label: 'Factor cruce cluster', unit: '×', min: 0, max: 30, step: 1 },
    { key: 'MAX_TIENDAS_RUTA', label: 'Máx. tiendas/ruta', unit: '', min: 5, max: 30, step: 1 },
    { key: 'DEFAULT_CAP_CAJAS', label: 'Capacidad Q', unit: 'cajas', min: 200, max: 1200, step: 20 },
  ],
  gurobi: [
    { key: 'PRECIO_DIESEL_MXN', label: 'Precio diésel', unit: 'MXN/L', min: 10, max: 60, step: 0.5 },
    { key: 'RENDIMIENTO_SOLVER_KML', label: 'Rendimiento', unit: 'km/L', min: 2, max: 12, step: 0.1 },
    { key: 'COSTO_DESGASTE_KM_MXN', label: 'Desgaste', unit: 'MXN/km', min: 0, max: 10, step: 0.1 },
    { key: 'COSTO_CHOFER_DIA_MXN', label: 'Chofer (día)', unit: 'MXN', min: 200, max: 2000, step: 25 },
    { key: 'DEFAULT_CAP_CAJAS', label: 'Capacidad Q', unit: 'cajas', min: 200, max: 1200, step: 20 },
  ],
};

export default function MathModelDashboard() {
  const [solver, setSolver] = useState('gurobi');
  const [config, setConfig] = useState(DEFAULT_SOLVER_CONFIG);
  const [configs, setConfigs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [configName, setConfigName] = useState('');
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetchConfigs().then(setConfigs).catch((e) => setError(e.message));
  }, []);

  const onLoad = useCallback(async (id) => {
    try {
      const cfg = await fetchConfig(id);
      setConfig({ ...DEFAULT_SOLVER_CONFIG, ...(cfg.snapshot || {}) });
      setActiveId(cfg.id);
      setConfigName(cfg.nombre);
      setInfo(`Cargada config "${cfg.nombre}".`);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const onSave = useCallback(async () => {
    const nombre = (configName || '').trim() || `Modelo ${new Date().toISOString().slice(0, 16)}`;
    try {
      const meta = await saveConfig(nombre, config);
      setActiveId(meta.id);
      setInfo(`Guardada config "${nombre}". Toggles activos se respetarán en el próximo /run.`);
      const refreshed = await fetchConfigs();
      setConfigs(refreshed);
    } catch (err) {
      setError(err.message);
    }
  }, [config, configName]);

  const onReset = useCallback(() => {
    setConfig(DEFAULT_SOLVER_CONFIG);
    setActiveId(null);
    setConfigName('');
    setInfo('Modelo restaurado a defaults.');
  }, []);

  const setField = useCallback((key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggles = TOGGLES[solver];
  const params = PARAMS[solver];
  const ModelView = solver === 'gurobi' ? GurobiCvrpModel : OrtoolsModel;

  const dirtyFlags = useMemo(() => {
    return toggles.some((t) => config[t.key] !== DEFAULT_SOLVER_CONFIG[t.key]);
  }, [toggles, config]);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 360px' },
        gap: 1.4,
        minHeight: 0,
      }}
    >
      {/* Panel central: fórmulas */}
      <GlassCard
        padding={0}
        sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1, p: '12px 18px',
            borderBottom: '1px solid var(--glass-border)', flexShrink: 0,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
              Modelo matemático
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Coeficientes y restricciones generadas desde la config actual.
            </Typography>
          </Box>
          {dirtyFlags && <Badge tone="warn">SIN GUARDAR</Badge>}
          <ToggleButtonGroup
            value={solver}
            exclusive
            size="small"
            onChange={(_, v) => v && setSolver(v)}
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
            <ToggleButton value="gurobi">🎯 Gurobi (MILP)</ToggleButton>
            <ToggleButton value="ortools">⚙️ OR-Tools</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: '12px 18px' }}>
          <ModelView config={config} />
        </Box>
      </GlassCard>

      {/* Panel lateral: toggles + sliders */}
      <GlassCard
        padding={0}
        sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        <Box sx={{ p: '12px 18px', borderBottom: '1px solid var(--glass-border)', flexShrink: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            Editar modelo
          </Typography>
          <Typography sx={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
            Toggles modifican la estructura. Sliders modifican coeficientes.
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: '14px 18px' }}>
          <Typography
            sx={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--accent)', mb: 1,
            }}
          >
            Términos del modelo
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, mb: 2.4 }}>
            {toggles.map((t) => (
              <Box
                key={t.key}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1, p: '6px 8px',
                  borderRadius: 1.2, border: '1px solid var(--glass-border)',
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {t.label}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3 }}>
                    {t.hint}
                  </Typography>
                </Box>
                <Switch
                  size="small"
                  checked={!!config[t.key]}
                  onChange={(e) => setField(t.key, e.target.checked)}
                />
              </Box>
            ))}
          </Box>

          <Typography
            sx={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--accent)', mb: 1,
            }}
          >
            Coeficientes
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.4 }}>
            {params.map((f) => (
              <SliderField
                key={f.key}
                field={f}
                value={config[f.key]}
                onChange={(v) => setField(f.key, v)}
              />
            ))}
          </Box>

          <Typography
            sx={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--accent)', mt: 2.4, mb: 1,
            }}
          >
            Configs guardadas
          </Typography>
          <Select
            value={activeId || ''}
            onChange={(e) => e.target.value && onLoad(e.target.value)}
            displayEmpty
            size="small"
            fullWidth
            sx={{ fontSize: 12, mb: 1 }}
          >
            <MenuItem value="">— Defaults —</MenuItem>
            {configs.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
            ))}
          </Select>
        </Box>

        <Box
          sx={{
            display: 'flex', gap: 1, alignItems: 'center', p: '12px 18px',
            borderTop: '1px solid var(--glass-border)', flexWrap: 'wrap', flexShrink: 0,
          }}
        >
          <TextField
            size="small"
            placeholder="Nombre"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            sx={{ flex: 1, minWidth: 140 }}
          />
          <Button variant="outlined" size="small" startIcon={<RestoreIcon />} onClick={onReset}>
            Reset
          </Button>
          <Button variant="contained" size="small" startIcon={<SaveIcon />} onClick={onSave}>
            Guardar
          </Button>
        </Box>
      </GlassCard>

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.2, alignItems: 'baseline' }}>
        <Typography sx={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
          {field.label}
        </Typography>
        <Typography
          sx={{
            fontFamily: 'var(--font-mono), monospace', fontSize: 11,
            color: 'var(--text-primary)', fontWeight: 700,
          }}
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
    </Box>
  );
}
