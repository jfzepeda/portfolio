'use client';

import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Gráfica de línea SVG: métrica vs valor del parámetro.
 *
 * `points`: [{ x: number, y: number, runId: string, label?: string }]
 *   - x = valor del parámetro barrido
 *   - y = métrica (costo, km, etc)
 * `width` / `height` controlan el tamaño total.
 */
export default function SweepChart({
  points = [],
  width = 520,
  height = 240,
  metricLabel = 'metric',
  paramLabel = 'param',
  color = 'var(--accent)',
}) {
  const padL = 50;
  const padR = 16;
  const padT = 14;
  const padB = 28;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const view = useMemo(() => {
    if (!points.length) return null;
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const xSpan = xMax - xMin || 1;
    const ySpan = yMax - yMin || 1;
    const xFor = (x) => padL + (innerW * (x - xMin)) / xSpan;
    const yFor = (y) => padT + innerH - (innerH * (y - yMin)) / ySpan;
    const sorted = [...points].sort((a, b) => a.x - b.x);
    const path = sorted.map((p, i) => `${i === 0 ? 'M' : 'L'}${xFor(p.x).toFixed(1)},${yFor(p.y).toFixed(1)}`).join(' ');
    return { sorted, xFor, yFor, xMin, xMax, yMin, yMax, path };
  }, [points, innerH, innerW, padL, padT]);

  if (!view) {
    return (
      <Box sx={{ p: 2, color: 'var(--text-muted)', fontSize: 12 }}>
        Sin datos del barrido.
      </Box>
    );
  }

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => view.yMin + ((view.yMax - view.yMin) * i) / yTicks);

  return (
    <Box>
      <svg width={width} height={height} role="img" aria-label={`Sweep ${metricLabel} vs ${paramLabel}`}>
        {/* Cuadrícula */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={padL}
              x2={padL + innerW}
              y1={view.yFor(t)}
              y2={view.yFor(t)}
              stroke="var(--glass-border)"
              strokeDasharray={i === 0 || i === ticks.length - 1 ? '0' : '2 2'}
            />
            <text x={padL - 6} y={view.yFor(t) + 3} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)" textAnchor="end">
              {Math.round(t).toLocaleString('es-MX')}
            </text>
          </g>
        ))}

        {/* Línea */}
        <path d={view.path} fill="none" stroke={color} strokeWidth="2" />
        {view.sorted.map((p) => (
          <circle key={p.runId || p.x} cx={view.xFor(p.x)} cy={view.yFor(p.y)} r={4} fill={color} />
        ))}

        {/* Eje X */}
        {view.sorted.map((p) => (
          <text
            key={`xl-${p.runId || p.x}`}
            x={view.xFor(p.x)}
            y={padT + innerH + 14}
            textAnchor="middle"
            fontSize="9"
            fontFamily="var(--font-mono)"
            fill="var(--text-muted)"
          >
            {p.x}
          </text>
        ))}

        <text x={padL} y={padT - 4} fontSize="9" fontFamily="var(--font-mono)" fill={color}>
          {metricLabel}
        </text>
        <text x={padL + innerW} y={height - 6} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          {paramLabel}
        </text>
      </svg>

      <Typography sx={{ fontSize: 10, color: 'var(--text-muted)', mt: 0.5 }}>
        {points.length} corridas · min {Math.round(view.yMin).toLocaleString('es-MX')} ·
        max {Math.round(view.yMax).toLocaleString('es-MX')}
      </Typography>
    </Box>
  );
}
