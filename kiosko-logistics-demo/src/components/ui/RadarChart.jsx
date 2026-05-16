'use client';

import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Radar SVG hand-rolled. axes: ['rutas','km','costo','ocupacion','tiempo'].
 * series: [{ id, color, values: [0..1, ...] }] — valores normalizados 0..1.
 */
export default function RadarChart({
  axes = [],
  series = [],
  size = 260,
  rings = 4,
  sx,
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 28;

  const axesPoints = useMemo(() => {
    const n = axes.length;
    return axes.map((axis, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return {
        axis,
        angle,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        labelX: cx + (r + 14) * Math.cos(angle),
        labelY: cy + (r + 14) * Math.sin(angle),
      };
    });
  }, [axes, cx, cy, r]);

  const ringRadii = useMemo(
    () => Array.from({ length: rings }, (_, i) => ((i + 1) * r) / rings),
    [rings, r],
  );

  const seriesPaths = useMemo(() => {
    return series.map((s) => {
      const points = axes.map((_, i) => {
        const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
        const v = Math.max(0, Math.min(1, s.values[i] ?? 0));
        return [cx + r * v * Math.cos(angle), cy + r * v * Math.sin(angle)];
      });
      const d = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') + ' Z';
      return { ...s, d };
    });
  }, [series, axes, cx, cy, r]);

  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', ...sx }}>
      <svg width={size} height={size} role="img" aria-label="Comparativa radar">
        {ringRadii.map((rr, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={rr}
            fill="none"
            stroke="var(--glass-border)"
            strokeWidth="1"
          />
        ))}
        {axesPoints.map((p) => (
          <line
            key={p.axis}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="var(--glass-border)"
            strokeWidth="1"
          />
        ))}
        {seriesPaths.map((s) => (
          <path
            key={s.id}
            d={s.d}
            fill={s.color}
            fillOpacity={s.kind === 'cur' ? 0.18 : 0.06}
            stroke={s.color}
            strokeWidth={s.kind === 'cur' ? 2 : 1.2}
            strokeLinejoin="round"
          />
        ))}
        {axesPoints.map((p) => (
          <text
            key={p.axis}
            x={p.labelX}
            y={p.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-mono), monospace"
            fontSize="9"
            fill="var(--text-muted)"
          >
            {p.axis}
          </text>
        ))}
      </svg>
      {series.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1.2, mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {series.map((s) => (
            <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
              <Typography sx={{ fontSize: 10, color: 'var(--text-secondary)' }}>{s.label || s.id}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
