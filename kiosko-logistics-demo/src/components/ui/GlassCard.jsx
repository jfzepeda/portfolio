'use client';

import { Box } from '@mui/material';
import { forwardRef } from 'react';

const VARIANTS = {
  default: {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    backdropFilter: 'blur(20px) saturate(140%)',
    WebkitBackdropFilter: 'blur(20px) saturate(140%)',
  },
  featured: {
    background: 'linear-gradient(135deg, var(--accent-soft), transparent), var(--glass-bg)',
    border: '1px solid var(--accent)',
    backdropFilter: 'blur(20px) saturate(140%)',
    WebkitBackdropFilter: 'blur(20px) saturate(140%)',
    boxShadow: 'var(--shadow-glow)',
  },
  sidepanel: {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    backdropFilter: 'blur(20px) saturate(140%)',
    WebkitBackdropFilter: 'blur(20px) saturate(140%)',
  },
  flat: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--glass-border)',
  },
};

const GlassCard = forwardRef(function GlassCard(
  { variant = 'default', padding = 14, glow = false, hoverable = false, sx, children, ...rest },
  ref,
) {
  const base = VARIANTS[variant] ?? VARIANTS.default;
  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        borderRadius: '14px',
        padding: typeof padding === 'number' ? `${padding}px` : padding,
        color: 'var(--text-primary)',
        ...base,
        ...(glow ? { boxShadow: 'var(--shadow-glow)' } : null),
        ...(hoverable
          ? {
              transition: 'transform .25s ease, border-color .25s, box-shadow .25s',
              '&:hover': {
                transform: 'translateY(-2px)',
                borderColor: 'var(--glass-strong)',
                boxShadow: 'var(--shadow-2)',
              },
            }
          : null),
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
});

export default GlassCard;
