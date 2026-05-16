'use client';

import { Box } from '@mui/material';

const TONES = {
  good: { color: 'var(--success)' },
  bad: { color: 'var(--error)' },
  neutral: { color: 'var(--text-muted)' },
};

export default function MetricChip({ tone = 'neutral', children, sx, ...rest }) {
  const palette = TONES[tone] ?? TONES.neutral;
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.4,
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 7px',
        borderRadius: '999px',
        background: 'var(--glass-strong)',
        color: palette.color,
        fontFamily: 'var(--font-mono), monospace',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
