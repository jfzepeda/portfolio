'use client';

import { Box, Typography } from '@mui/material';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export function ModelBlock({ title, latex, hint, disabled }) {
  return (
    <Box
      sx={{
        position: 'relative',
        p: '12px 16px',
        mb: 1.2,
        borderRadius: 2,
        border: '1px solid var(--glass-border)',
        background: disabled ? 'var(--glass-bg-muted, rgba(255,255,255,0.02))' : 'var(--glass-bg)',
        opacity: disabled ? 0.35 : 1,
        transition: 'opacity 0.18s',
      }}
    >
      {title && (
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: disabled ? 'var(--text-subtle)' : 'var(--accent)',
            mb: 0.6,
          }}
        >
          {title}{disabled ? ' · desactivado' : ''}
        </Typography>
      )}
      <Box
        sx={{
          textDecoration: disabled ? 'line-through' : 'none',
          color: 'var(--text-primary)',
          fontSize: 14,
          overflowX: 'auto',
        }}
      >
        <BlockMath math={latex} />
      </Box>
      {hint && (
        <Typography sx={{ fontSize: 10.5, color: 'var(--text-muted)', mt: 0.4, fontStyle: 'italic' }}>
          {hint}
        </Typography>
      )}
    </Box>
  );
}

export default function MathPanel({ blocks }) {
  return (
    <Box sx={{ p: '8px 4px' }}>
      {blocks.map((b, i) => (
        <ModelBlock key={i} {...b} />
      ))}
    </Box>
  );
}
