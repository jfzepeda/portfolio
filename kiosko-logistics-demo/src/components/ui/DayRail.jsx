'use client';

import { Box, Typography } from '@mui/material';

export default function DayRail({
  days = [],
  selected,
  onToggle,
  position = 'bottom-left',
  sx,
}) {
  const positions = {
    'top-left': { left: 14, top: 14 },
    'top-right': { right: 14, top: 14 },
    'bottom-left': { left: 14, bottom: 14 },
    'bottom-right': { right: 14, bottom: 14 },
  };
  const isActive = (day) => {
    if (selected instanceof Set) return selected.has(day);
    if (Array.isArray(selected)) return selected.includes(day);
    return selected === day;
  };
  return (
    <Box
      sx={{
        position: 'absolute',
        zIndex: 500,
        display: 'flex',
        gap: 0.6,
        alignItems: 'center',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        border: '1px solid var(--glass-border)',
        borderRadius: '999px',
        padding: '6px',
        ...positions[position],
        ...sx,
      }}
    >
      {days.map(({ day, count }) => {
        const active = isActive(day);
        return (
          <Box
            key={day}
            component="button"
            type="button"
            onClick={() => onToggle?.(day)}
            sx={{
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: 11,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              color: active ? '#fff' : 'var(--text-muted)',
              background: active ? 'var(--accent)' : 'transparent',
              transition: 'background .2s, color .2s, transform .15s',
              '&:hover': { color: active ? '#fff' : 'var(--text-primary)' },
            }}
          >
            {day}
            {count != null && (
              <Typography
                component="span"
                sx={{
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: 10,
                  opacity: 0.7,
                  ml: 0.5,
                }}
              >
                {count}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
