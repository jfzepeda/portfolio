'use client';

import { Box, Typography } from '@mui/material';

export default function MapLegend({
  title,
  meta,
  swatches = [],
  position = 'top-left',
  maxWidth = 240,
  sx,
}) {
  const positions = {
    'top-left': { left: 14, top: 14 },
    'top-right': { right: 14, top: 14 },
    'bottom-left': { left: 14, bottom: 14 },
    'bottom-right': { right: 14, bottom: 14 },
  };
  return (
    <Box
      sx={{
        position: 'absolute',
        zIndex: 500,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '10px 12px',
        fontSize: 11,
        color: 'var(--text-muted)',
        maxWidth,
        ...positions[position],
        ...sx,
      }}
    >
      {title && (
        <Typography
          sx={{
            color: 'var(--text-primary)',
            fontWeight: 600,
            mb: 0.6,
            fontSize: 12,
          }}
        >
          {title}
        </Typography>
      )}
      {swatches.map((row) => (
        <Box
          key={row.key || row.label}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.7, py: '2px' }}
        >
          <Box
            sx={{
              width: 14,
              height: 3,
              borderRadius: '2px',
              flex: '0 0 14px',
              background: row.color,
            }}
          />
          <Typography sx={{ fontSize: 11, color: 'var(--text-secondary)' }}>{row.label}</Typography>
          {row.value != null && (
            <Typography
              sx={{ ml: 'auto', fontSize: 10, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono), monospace' }}
            >
              {row.value}
            </Typography>
          )}
        </Box>
      ))}
      {meta && (
        <Typography sx={{ mt: 0.6, fontSize: 10, color: 'var(--text-subtle)' }}>{meta}</Typography>
      )}
    </Box>
  );
}
