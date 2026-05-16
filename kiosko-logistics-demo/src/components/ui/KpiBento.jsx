'use client';

import { Box } from '@mui/material';

export default function KpiBento({ cols = 6, gap = 14, children, sx }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: `${gap}px`,
        '@media (max-width: 1280px)': {
          gridTemplateColumns: `repeat(${Math.min(cols, 3)}, minmax(0, 1fr))`,
        },
        '@media (max-width: 680px)': {
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '10px',
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
