'use client';

import { Box } from '@mui/material';

export default function FilterChip({
  label,
  count,
  active = false,
  dim = false,
  onClick,
  mono = true,
  sx,
  ...rest
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-pressed={active}
      sx={{
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        fontSize: 10.5,
        fontWeight: 600,
        padding: '4px 9px',
        borderRadius: '999px',
        color: active ? '#fff' : 'var(--text-muted)',
        background: active ? 'var(--accent)' : 'var(--glass-bg)',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--glass-border)'}`,
        opacity: dim ? 0.4 : 1,
        fontFamily: mono ? 'var(--font-mono), monospace' : 'inherit',
        transition: 'all .15s ease',
        '&:hover': {
          color: active ? '#fff' : 'var(--text-primary)',
          borderColor: active ? 'var(--accent)' : 'var(--glass-strong)',
        },
        ...sx,
      }}
      {...rest}
    >
      <span>{label}</span>
      {count != null && (
        <span style={{ fontSize: 9.5, opacity: 0.7 }}>{count}</span>
      )}
    </Box>
  );
}
