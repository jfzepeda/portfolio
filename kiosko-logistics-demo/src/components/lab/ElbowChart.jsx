'use client';

import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Gráfica SVG hand-rolled de la curva de codo.
 *
 * `data`: { ks: number[], inertias: number[], silhouettes: number[], knee_k: number }
 * `selectedK`: número (k actualmente elegido) — se resalta con un círculo.
 * `onSelectK`: callback (k:number) cuando el usuario clickea un punto.
 */
export default function ElbowChart({ data, selectedK, onSelectK, width = 460, height = 230 }) {
  const padL = 36;
  const padR = 36;
  const padT = 14;
  const padB = 28;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const view = useMemo(() => {
    if (!data || !data.ks?.length) return null;
    const { ks, inertias, silhouettes } = data;
    const maxIner = Math.max(...inertias) || 1;
    const minIner = Math.min(...inertias) || 0;
    const maxSil = Math.max(...silhouettes, 1);
    const minSil = Math.min(...silhouettes, 0);

    const xFor = (k) => padL + (innerW * (k - ks[0])) / Math.max(1, ks[ks.length - 1] - ks[0]);
    const yIner = (v) => padT + innerH - (innerH * (v - minIner)) / Math.max(1e-9, maxIner - minIner);
    const ySil = (v) => padT + innerH - (innerH * (v - minSil)) / Math.max(1e-9, maxSil - minSil);

    const inerPath = ks.map((k, i) => `${i === 0 ? 'M' : 'L'}${xFor(k).toFixed(1)},${yIner(inertias[i]).toFixed(1)}`).join(' ');
    const silPath = ks.map((k, i) => `${i === 0 ? 'M' : 'L'}${xFor(k).toFixed(1)},${ySil(silhouettes[i]).toFixed(1)}`).join(' ');

    return { ks, inertias, silhouettes, xFor, yIner, ySil, inerPath, silPath };
  }, [data, innerH, innerW, padL, padT]);

  if (!view) {
    return (
      <Box sx={{ p: 2, color: 'var(--text-muted)', fontSize: 12 }}>
        Sin datos. Corre el estudio de codo.
      </Box>
    );
  }

  const knee = data.knee_k;

  return (
    <Box>
      <svg width={width} height={height} role="img" aria-label="Curva de codo (KMeans)">
        {/* Ejes */}
        <line x1={padL} y1={padT + innerH} x2={padL + innerW} y2={padT + innerH} stroke="var(--glass-border)" />
        <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="var(--glass-border)" />
        <line x1={padL + innerW} y1={padT} x2={padL + innerW} y2={padT + innerH} stroke="var(--glass-border)" />

        {/* Inercia */}
        <path d={view.inerPath} fill="none" stroke="var(--accent)" strokeWidth="2" />
        {view.ks.map((k, i) => (
          <circle
            key={`iner-${k}`}
            cx={view.xFor(k)}
            cy={view.yIner(view.inertias[i])}
            r={selectedK === k ? 5 : 3}
            fill={selectedK === k ? 'var(--accent)' : 'var(--accent)'}
            stroke={selectedK === k ? '#fff' : 'transparent'}
            strokeWidth="1.5"
            style={{ cursor: onSelectK ? 'pointer' : 'default' }}
            onClick={onSelectK ? () => onSelectK(k) : undefined}
          />
        ))}

        {/* Silueta */}
        <path d={view.silPath} fill="none" stroke="var(--cyan)" strokeWidth="1.5" strokeDasharray="4 3" />
        {view.ks.map((k, i) => (
          <circle
            key={`sil-${k}`}
            cx={view.xFor(k)}
            cy={view.ySil(view.silhouettes[i])}
            r={2}
            fill="var(--cyan)"
          />
        ))}

        {/* Knee marker */}
        {knee != null && view.ks.includes(knee) && (
          <line
            x1={view.xFor(knee)}
            x2={view.xFor(knee)}
            y1={padT}
            y2={padT + innerH}
            stroke="var(--success)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
        )}

        {/* Etiquetas eje X (k) */}
        {view.ks.map((k) => (
          <text
            key={`xl-${k}`}
            x={view.xFor(k)}
            y={padT + innerH + 14}
            textAnchor="middle"
            fontSize="9"
            fontFamily="var(--font-mono), monospace"
            fill="var(--text-muted)"
          >
            {k}
          </text>
        ))}
        <text x={padL} y={padT - 4} fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)">
          inercia
        </text>
        <text
          x={padL + innerW}
          y={padT - 4}
          fontSize="9"
          fontFamily="var(--font-mono)"
          fill="var(--cyan)"
          textAnchor="end"
        >
          silueta
        </text>
      </svg>

      <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
          Codo sugerido:{' '}
          <Box component="span" sx={{ color: 'var(--success)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            k={knee}
          </Box>
        </Typography>
        <Typography sx={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
          · {data.n_tiendas} tiendas analizadas
        </Typography>
      </Box>
    </Box>
  );
}
