'use client';

import { Box, Typography } from '@mui/material';

export default function KbdHint({ keys = [], label, sx }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        padding: '4px 8px',
        borderRadius: '8px',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        backdropFilter: 'blur(20px)',
        ...sx,
      }}
    >
      {keys.map((k, i) => (
        <Box
          key={`${k}-${i}`}
          component="kbd"
          sx={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'var(--glass-strong)',
            color: 'var(--text-primary)',
            border: '1px solid var(--glass-border)',
            minWidth: 18,
            textAlign: 'center',
          }}
        >
          {k}
        </Box>
      ))}
      {label && (
        <Typography sx={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</Typography>
      )}
    </Box>
  );
}
