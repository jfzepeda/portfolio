'use client';

import { Box, Typography } from '@mui/material';
import IconButtonGlass from './IconButtonGlass';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Panel lateral overlay sin backdrop (a diferencia de MUI Drawer).
 * Útil para el modo comparación en /testing o detail panes en /rutas.
 */
export default function SidePanel({
  open,
  onClose,
  title,
  meta,
  width = 380,
  position = 'right',
  children,
  sx,
}) {
  if (!open) return null;
  const sideStyle =
    position === 'right'
      ? { right: 14, top: 14, bottom: 14 }
      : { left: 14, top: 14, bottom: 14 };
  return (
    <Box
      sx={{
        position: 'absolute',
        zIndex: 600,
        width,
        maxWidth: 'calc(100vw - 28px)',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        boxShadow: 'var(--shadow-2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...sideStyle,
        ...sx,
      }}
    >
      {(title || onClose) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: '12px 14px',
            borderBottom: '1px solid var(--glass-border)',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {title && (
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                }}
              >
                {title}
              </Typography>
            )}
            {meta && (
              <Typography
                sx={{
                  fontSize: 11,
                  color: 'var(--text-subtle)',
                  fontFamily: 'var(--font-mono), monospace',
                }}
              >
                {meta}
              </Typography>
            )}
          </Box>
          {onClose && (
            <IconButtonGlass icon={<CloseIcon />} tooltip="Cerrar" srLabel="Cerrar panel" onClick={onClose} size={32} />
          )}
        </Box>
      )}
      <Box sx={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>{children}</Box>
    </Box>
  );
}
