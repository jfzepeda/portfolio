'use client';

import { Box, Tooltip } from '@mui/material';
import { forwardRef } from 'react';

const IconButtonGlass = forwardRef(function IconButtonGlass(
  { icon, tooltip, active = false, onClick, srLabel, size = 38, sx, ...rest },
  ref,
) {
  const button = (
    <Box
      ref={ref}
      component="button"
      type="button"
      onClick={onClick}
      aria-label={srLabel || tooltip}
      aria-pressed={active || undefined}
      sx={{
        width: size,
        height: size,
        borderRadius: '10px',
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        background: active ? 'var(--accent-soft)' : 'var(--glass-bg)',
        border: active ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        transition: 'color .2s, background .2s, transform .15s, border-color .2s',
        '&:hover': {
          color: active ? 'var(--accent)' : 'var(--text-primary)',
          background: 'var(--glass-strong)',
          transform: 'translateY(-1px)',
        },
        '& svg': { width: 18, height: 18 },
        ...sx,
      }}
      {...rest}
    >
      {icon}
    </Box>
  );

  if (!tooltip) return button;
  return (
    <Tooltip title={tooltip} arrow placement="bottom">
      {button}
    </Tooltip>
  );
});

export default IconButtonGlass;
