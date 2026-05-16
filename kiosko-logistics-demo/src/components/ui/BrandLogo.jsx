'use client';

import { Box, Typography } from '@mui/material';

export default function BrandLogo({ size = 30, letter = 'K', name = 'KIOSKO', sub = 'Optimización de rutas y empaque' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '8px',
          background: 'var(--grad-orange)',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          fontWeight: 800,
          fontSize: size * 0.45,
          boxShadow: 'var(--shadow-glow)',
          letterSpacing: '-0.02em',
        }}
      >
        {letter}
      </Box>
      <Box sx={{ lineHeight: 1.1 }}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {name}
        </Typography>
        {sub && (
          <Typography sx={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{sub}</Typography>
        )}
      </Box>
    </Box>
  );
}
