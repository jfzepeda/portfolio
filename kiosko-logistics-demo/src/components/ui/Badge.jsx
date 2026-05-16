'use client';

import { Box } from '@mui/material';

const TONES = {
  info: { color: 'var(--cyan)', bg: 'rgba(56,189,248,0.10)', border: 'rgba(56,189,248,0.30)' },
  success: { color: 'var(--success)', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.30)' },
  warn: { color: 'var(--warning)', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.30)' },
  bad: { color: 'var(--error)', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.30)' },
  neutral: { color: 'var(--text-muted)', bg: 'var(--glass-bg)', border: 'var(--glass-border)' },
  accent: { color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'rgba(255,107,26,0.40)' },
};

export default function Badge({ tone = 'neutral', children, mono = false, sx, ...rest }) {
  const palette = TONES[tone] ?? TONES.neutral;
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        fontSize: 10.5,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        padding: '2px 7px',
        borderRadius: '999px',
        color: palette.color,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        fontFamily: mono ? 'var(--font-mono), monospace' : 'inherit',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
