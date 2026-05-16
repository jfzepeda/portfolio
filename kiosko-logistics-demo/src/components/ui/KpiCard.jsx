'use client';

import { Box, Typography } from '@mui/material';
import GlassCard from './GlassCard';
import MetricChip from './MetricChip';
import { useAnimatedNumber } from './useAnimatedNumber';

const FMT_DEFAULT = new Intl.NumberFormat('es-MX');

export default function KpiCard({
  label,
  value,
  format,
  delta,
  deltaTone = 'neutral',
  featured = false,
  unit,
  hint,
  sx,
}) {
  const animated = useAnimatedNumber(typeof value === 'number' ? value : 0);
  const display =
    typeof value === 'number'
      ? (format ? format(animated) : FMT_DEFAULT.format(Math.round(animated)))
      : value;

  return (
    <GlassCard variant={featured ? 'featured' : 'default'} hoverable padding={16} sx={sx}>
      <Typography
        sx={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          marginTop: '6px',
          lineHeight: 1.1,
          color: featured ? 'transparent' : 'var(--text-primary)',
          background: featured ? 'var(--grad-orange)' : 'none',
          WebkitBackgroundClip: featured ? 'text' : 'unset',
          backgroundClip: featured ? 'text' : 'unset',
        }}
      >
        {display}
        {unit && (
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>
            {unit}
          </span>
        )}
      </Typography>
      {(delta || hint) && (
        <Box sx={{ mt: '6px', display: 'flex', gap: 0.6, alignItems: 'center', flexWrap: 'wrap' }}>
          {delta && <MetricChip tone={deltaTone}>{delta}</MetricChip>}
          {hint && (
            <Typography sx={{ fontSize: 10, color: 'var(--text-subtle)' }}>{hint}</Typography>
          )}
        </Box>
      )}
    </GlassCard>
  );
}
