'use client';

import { Box, Typography } from '@mui/material';
import Badge from './Badge';

export default function RouteRow({
  routeId,
  truck,
  day,
  km,
  costo,
  ocupacion,
  badges = [],
  swatch,
  selected = false,
  dim = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  sx,
}) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick(e);
        }
      }}
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: 1.2,
        padding: '10px 12px',
        borderRadius: '10px',
        cursor: 'pointer',
        background: selected ? 'var(--accent-soft)' : 'var(--glass-bg)',
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--glass-border)'}`,
        opacity: dim ? 0.45 : 1,
        transition: 'background .15s, border-color .15s, transform .15s',
        '&:hover': {
          background: selected ? 'var(--accent-soft)' : 'var(--glass-strong)',
          transform: 'translateX(2px)',
        },
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 4,
          height: 28,
          borderRadius: '2px',
          background: swatch || 'var(--accent)',
          flexShrink: 0,
        }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
          <Typography
            sx={{
              fontSize: 12.5,
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono), monospace',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {routeId}
          </Typography>
          {truck && (
            <Typography
              sx={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono), monospace' }}
            >
              {truck}
            </Typography>
          )}
          {day && (
            <Typography
              sx={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono), monospace' }}
            >
              {day}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 0.3, flexWrap: 'wrap' }}>
          {km != null && (
            <Typography sx={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
              <span style={{ fontFamily: 'var(--font-mono), monospace', color: 'var(--text-secondary)' }}>
                {km}
              </span>{' '}
              km
            </Typography>
          )}
          {costo != null && (
            <Typography sx={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
              <span style={{ fontFamily: 'var(--font-mono), monospace', color: 'var(--text-secondary)' }}>
                {costo}
              </span>
            </Typography>
          )}
          {ocupacion != null && (
            <Typography sx={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
              <span style={{ fontFamily: 'var(--font-mono), monospace', color: 'var(--text-secondary)' }}>
                {ocupacion}
              </span>
              %
            </Typography>
          )}
          {badges.map((b) => (
            <Badge key={b.label} tone={b.tone}>
              {b.label}
            </Badge>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
