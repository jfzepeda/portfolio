'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';
import FilterChip from '../ui/FilterChip';
import { fetchDiagnostics } from '@/lib/testingApi';

const STRATEGIES = [
  { id: 'stratified', label: 'Estratificada', help: 'k-means proporcional, preserva geografía' },
  { id: 'random', label: 'Aleatoria', help: 'Uniforme — baseline' },
  { id: 'weighted', label: 'Por demanda', help: 'Probabilidad ∝ cajas/día' },
];

// Regímenes → tono del Badge (consistente entre las 5 cards)
function toneForRegime(regime) {
  if (!regime) return 'neutral';
  const r = regime.toLowerCase();
  if (r.includes('insuficiente') || r.includes('sin ahorros') || r.includes('falla')) return 'bad';
  if (r.includes('muy clusterizado') || r.includes('uniforme') || r.includes('ahorros fuertes') || r.includes('saturado'))
    return 'success';
  if (r.includes('moderad') || r.includes('balanceado') || r.includes('ligeramente') || r.includes('concentrada'))
    return 'info';
  return 'warn';
}

// Gauge horizontal 0..1 con bandas de interpretación.
function Gauge({ value, bands = [], width = 260, height = 38, label }) {
  if (value == null) return <Typography sx={{ fontSize: 11, color: 'var(--text-muted)' }}>—</Typography>;
  const padX = 6;
  const W = width - padX * 2;
  const x = padX + W * Math.max(0, Math.min(1, value));
  return (
    <svg width={width} height={height}>
      {bands.map((b, i) => (
        <rect
          key={i}
          x={padX + W * b.from}
          y={height / 2 - 6}
          width={W * (b.to - b.from)}
          height={12}
          fill={b.fill}
          opacity={0.55}
        />
      ))}
      <line x1={padX} y1={height / 2} x2={padX + W} y2={height / 2} stroke="var(--glass-border)" strokeWidth={1} />
      <circle cx={x} cy={height / 2} r={7} fill="var(--accent)" stroke="white" strokeWidth={2} />
      {label != null && (
        <text x={x} y={height - 4} textAnchor="middle" fontSize={10} fill="var(--text-muted)">{label}</text>
      )}
    </svg>
  );
}

function Histogram({ counts, edges, width = 280, height = 110, accent = 'var(--accent)' }) {
  if (!counts?.length) return null;
  const padL = 24, padR = 6, padT = 6, padB = 18;
  const W = width - padL - padR, H = height - padT - padB;
  const max = Math.max(...counts) || 1;
  const bw = W / counts.length;
  return (
    <svg width={width} height={height}>
      <line x1={padL} y1={padT + H} x2={padL + W} y2={padT + H} stroke="var(--glass-border)" />
      {counts.map((c, i) => {
        const h = (H * c) / max;
        return (
          <rect
            key={i}
            x={padL + i * bw + 0.5}
            y={padT + H - h}
            width={Math.max(1, bw - 1)}
            height={h}
            fill={accent}
            opacity={0.85}
          />
        );
      })}
      {/* eje x: edges en extremos */}
      <text x={padL} y={height - 4} fontSize={9} fill="var(--text-muted)">{edges[0]}</text>
      <text x={padL + W} y={height - 4} fontSize={9} textAnchor="end" fill="var(--text-muted)">
        {edges[edges.length - 1]}
      </text>
    </svg>
  );
}

function PolarHist({ counts, width = 160, height = 160, accent = 'var(--accent)' }) {
  if (!counts?.length) return null;
  const cx = width / 2, cy = height / 2;
  const Rmax = Math.min(cx, cy) - 8;
  const max = Math.max(...counts) || 1;
  const n = counts.length;
  const slice = (2 * Math.PI) / n;
  // Bin 0 corresponds to angle -π .. -π+slice. Convert to SVG (y down): use -angle.
  return (
    <svg width={width} height={height}>
      <circle cx={cx} cy={cy} r={Rmax} fill="none" stroke="var(--glass-border)" strokeDasharray="2 3" />
      <circle cx={cx} cy={cy} r={Rmax / 2} fill="none" stroke="var(--glass-border)" strokeDasharray="2 3" />
      {counts.map((c, i) => {
        const r = (Rmax * c) / max;
        const a0 = -Math.PI + i * slice;
        const a1 = a0 + slice;
        const x0 = cx + r * Math.cos(a0);
        const y0 = cy + r * Math.sin(a0);
        const x1 = cx + r * Math.cos(a1);
        const y1 = cy + r * Math.sin(a1);
        const large = slice > Math.PI ? 1 : 0;
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`}
            fill={accent}
            opacity={0.7}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={3} fill="var(--text-secondary)" />
    </svg>
  );
}

function LorenzChart({ x, y, width = 280, height = 140 }) {
  if (!x?.length) return null;
  const padL = 28, padR = 10, padT = 10, padB = 22;
  const W = width - padL - padR, H = height - padT - padB;
  const path = x
    .map((xi, i) => `${i === 0 ? 'M' : 'L'} ${padL + W * xi} ${padT + H - H * y[i]}`)
    .join(' ');
  return (
    <svg width={width} height={height}>
      <line x1={padL} y1={padT + H} x2={padL + W} y2={padT + H} stroke="var(--glass-border)" />
      <line x1={padL} y1={padT} x2={padL} y2={padT + H} stroke="var(--glass-border)" />
      {/* Diagonal de igualdad perfecta */}
      <line
        x1={padL}
        y1={padT + H}
        x2={padL + W}
        y2={padT}
        stroke="var(--text-muted)"
        strokeDasharray="3 3"
        opacity={0.6}
      />
      <path d={path} stroke="var(--accent)" fill="none" strokeWidth={2} />
      <text x={padL} y={height - 6} fontSize={9} fill="var(--text-muted)">% tiendas</text>
      <text x={padL + W} y={height - 6} fontSize={9} textAnchor="end" fill="var(--text-muted)">100%</text>
    </svg>
  );
}

function DiagnosticCard({ icon, title, score, scoreLabel, regime, recomendacion, children, footer }) {
  return (
    <GlassCard padding={14} sx={{ height: '100%' }}>
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography sx={{ fontSize: 16 }}>{icon}</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, color: 'var(--text-primary)' }}>
              {title}
            </Typography>
          </Stack>
          {score != null ? (
            <Badge tone={toneForRegime(regime)} mono>
              {scoreLabel || score}
            </Badge>
          ) : (
            <Badge tone="neutral">—</Badge>
          )}
        </Stack>
        <Box sx={{ minHeight: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </Box>
        <Typography sx={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: 0.5 }}>
          {regime || '—'}
        </Typography>
        <Typography sx={{ fontSize: 11.5, lineHeight: 1.45, color: 'var(--text-muted)' }}>
          {recomendacion || '—'}
        </Typography>
        {footer}
      </Stack>
    </GlassCard>
  );
}

function ExecutiveSummary({ res }) {
  if (!res) return null;
  // Combina las 5 señales en un ranking de familias.
  const score = { 'cluster-first': 0, 'savings/Clarke-Wright': 0, 'sweep angular': 0, 'route-first': 0, 'set-partitioning/petals': 0 };
  const w = (k, v) => { if (k in score) score[k] += v; };

  const H = res.hopkins?.score ?? 0.5;
  if (H >= 0.75) { w('cluster-first', 3); w('sweep angular', 1); }
  else if (H >= 0.6) { w('cluster-first', 2); w('savings/Clarke-Wright', 1); }
  else { w('savings/Clarke-Wright', 2); }

  const tau = res.tightness?.score ?? 0;
  if (tau >= 0.85) { w('route-first', 3); w('cluster-first', 1); }
  else if (tau < 0.30) { w('route-first', 1); w('savings/Clarke-Wright', 1); }

  const sa = res.savings?.score ?? 0;
  if (sa >= 0.30) w('savings/Clarke-Wright', 3);
  else if (sa >= 0.15) w('savings/Clarke-Wright', 1);

  const Rb = res.angular?.score ?? 1;
  if (Rb < 0.15) w('sweep angular', 3);
  else if (Rb < 0.35) w('sweep angular', 1);

  const G = res.gini?.score ?? 0;
  if (G >= 0.6) w('set-partitioning/petals', 3);
  else if (G >= 0.45) { w('cluster-first', 1); w('set-partitioning/petals', 1); }

  const ranked = Object.entries(score)
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 0);

  const total = ranked.reduce((s, [, v]) => s + v, 0) || 1;
  return (
    <GlassCard padding={14} variant="featured">
      <Stack spacing={1}>
        <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.6, color: 'var(--text-primary)' }}>
          🎯  RECOMENDACIÓN EJECUTIVA
        </Typography>
        <Typography sx={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Combinación ponderada de los 5 diagnósticos. Familias ordenadas por adecuación a tu instancia.
        </Typography>
        <Stack spacing={0.75} sx={{ mt: 1 }}>
          {ranked.map(([fam, v], i) => (
            <Stack key={fam} direction="row" alignItems="center" spacing={1}>
              <Typography sx={{ fontSize: 12, width: 22, color: 'var(--text-muted)', fontWeight: 700 }}>
                {i + 1}.
              </Typography>
              <Box sx={{ flex: 1, height: 8, borderRadius: 999, background: 'var(--glass-bg)', overflow: 'hidden' }}>
                <Box sx={{ width: `${(v / total) * 100}%`, height: '100%', background: i === 0 ? 'var(--accent)' : 'var(--cyan)' }} />
              </Box>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', minWidth: 180 }}>
                {fam}
              </Typography>
              <Badge tone={i === 0 ? 'accent' : 'info'} mono>{v}</Badge>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </GlassCard>
  );
}

export default function DiagnosticPanel() {
  const [sampleSize, setSampleSize] = useState(120);
  const [strategy, setStrategy] = useState('stratified');
  const [seed, setSeed] = useState(42);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [res, setRes] = useState(null);

  async function onRun() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetchDiagnostics({ sampleSize, strategy, seed });
      setRes(r);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Stack spacing={1.5}>
      {/* Controles */}
      <GlassCard padding={14}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap' }}>
          <Stack sx={{ minWidth: 240, flex: 1 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--text-secondary)' }}>
              MUESTRA · {sampleSize} tiendas
            </Typography>
            <Slider
              value={sampleSize}
              min={20}
              max={300}
              step={10}
              onChange={(_, v) => setSampleSize(v)}
              valueLabelDisplay="auto"
              size="small"
              sx={{ color: 'var(--accent)' }}
            />
          </Stack>
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
            {STRATEGIES.map((s) => (
              <FilterChip
                key={s.id}
                label={s.label}
                active={strategy === s.id}
                onClick={() => setStrategy(s.id)}
                title={s.help}
              />
            ))}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography sx={{ fontSize: 11, color: 'var(--text-muted)' }}>seed</Typography>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              style={{
                width: 60, fontSize: 12, padding: '4px 6px',
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)', borderRadius: 6,
              }}
            />
          </Stack>
          <Button
            size="small"
            variant="contained"
            disabled={loading}
            onClick={onRun}
            startIcon={loading ? <CircularProgress size={14} /> : <PlayArrowIcon />}
            sx={{ background: 'var(--accent)', '&:hover': { background: 'var(--accent-strong)' } }}
          >
            Diagnosticar
          </Button>
        </Stack>
        {error && (
          <Typography sx={{ fontSize: 11, color: 'var(--error)', mt: 1 }}>{error}</Typography>
        )}
        {res && (
          <Typography sx={{ fontSize: 11, color: 'var(--text-muted)', mt: 1 }}>
            Muestra {res.sample.n} de {res.sample.n_total} tiendas · estrategia {res.sample.strategy} · CEDIS {res.sample.cedis.nombre}
          </Typography>
        )}
      </GlassCard>

      {res && (
        <>
          {/* Grid 3 + 2 */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 1.5,
            }}
          >
            <DiagnosticCard
              icon="🌐"
              title="HOPKINS · Tendencia a clusterizar"
              score={res.hopkins.score}
              scoreLabel={`H = ${res.hopkins.score ?? '—'}`}
              regime={res.hopkins.regime}
              recomendacion={res.hopkins.recomendacion}
              footer={
                <Typography sx={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  H≈0.5 aleatorio · H&gt;0.75 muy clusterizado · m={res.hopkins.n_sample}
                </Typography>
              }
            >
              <Gauge
                value={res.hopkins.score}
                bands={[
                  { from: 0.0, to: 0.4, fill: 'var(--cyan)' },
                  { from: 0.4, to: 0.6, fill: 'var(--text-muted)' },
                  { from: 0.6, to: 1.0, fill: 'var(--accent)' },
                ]}
                label={`H = ${res.hopkins.score}`}
              />
            </DiagnosticCard>

            <DiagnosticCard
              icon="📦"
              title="τ · Capacity tightness"
              score={res.tightness.score}
              scoreLabel={`τ = ${res.tightness.score ?? '—'}`}
              regime={res.tightness.regime}
              recomendacion={res.tightness.recomendacion}
              footer={
                <Typography sx={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  Demanda {res.tightness.demanda_total} / cap {res.tightness.capacidad_total} · {(res.tightness.pct_tiendas_grandes * 100).toFixed(0)}% tiendas &gt;50% camión
                </Typography>
              }
            >
              <Gauge
                value={res.tightness.score}
                bands={[
                  { from: 0.0, to: 0.30, fill: 'var(--cyan)' },
                  { from: 0.30, to: 0.55, fill: 'var(--text-muted)' },
                  { from: 0.55, to: 0.85, fill: 'var(--accent)' },
                  { from: 0.85, to: 1.0, fill: 'var(--error)' },
                ]}
                label={`τ = ${res.tightness.score}`}
              />
            </DiagnosticCard>

            <DiagnosticCard
              icon="🤝"
              title="SAVINGS · Clarke-Wright suitability"
              score={res.savings.score}
              scoreLabel={`p90 = ${res.savings.p90 ?? '—'}`}
              regime={res.savings.regime}
              recomendacion={res.savings.recomendacion}
              footer={
                <Typography sx={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {res.savings.n_pairs} pares · mean={res.savings.mean} · p50={res.savings.p50}
                </Typography>
              }
            >
              <Histogram counts={res.savings.histogram} edges={res.savings.bin_edges} />
            </DiagnosticCard>

            <DiagnosticCard
              icon="🧭"
              title="ANGULAR · Sweep feasibility"
              score={res.angular.score}
              scoreLabel={`R̄ = ${res.angular.score ?? '—'}`}
              regime={res.angular.regime}
              recomendacion={res.angular.recomendacion}
              footer={
                <Typography sx={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  Rayleigh sobre {res.angular.n_stores} tiendas · 0=uniforme, 1=concentrado
                </Typography>
              }
            >
              <PolarHist counts={res.angular.histogram} />
            </DiagnosticCard>

            <DiagnosticCard
              icon="📈"
              title="GINI · Concentración de demanda"
              score={res.gini.score}
              scoreLabel={`G = ${res.gini.score ?? '—'}`}
              regime={res.gini.regime}
              recomendacion={res.gini.recomendacion}
              footer={
                <Typography sx={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  Curva de Lorenz vs igualdad perfecta (diagonal) · n={res.gini.n}
                </Typography>
              }
            >
              <LorenzChart x={res.gini.lorenz_x} y={res.gini.lorenz_y} />
            </DiagnosticCard>

            <ExecutiveSummary res={res} />
          </Box>
        </>
      )}

      {!res && !loading && (
        <GlassCard padding={20}>
          <Stack spacing={1} alignItems="center" sx={{ py: 3 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' }}>
              Diagnóstico de instancia
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 520, textAlign: 'center' }}>
              5 tests pequeños tipo "elbow plot" — Hopkins, capacity tightness, savings amplitude, Rayleigh angular y Gini de demanda — para
              elegir la familia de algoritmo VRP <i>antes</i> de correrlo. Pulsa <b>Diagnosticar</b>.
            </Typography>
          </Stack>
        </GlassCard>
      )}
    </Stack>
  );
}
