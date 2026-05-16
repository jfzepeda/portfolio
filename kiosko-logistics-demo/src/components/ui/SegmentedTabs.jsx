'use client';

import { Box } from '@mui/material';

export default function SegmentedTabs({
  items = [],
  activeId,
  onChange,
  withKeys = false,
  size = 'md',
  sx,
}) {
  const dense = size === 'sm';
  return (
    <Box
      role="tablist"
      sx={{
        display: 'inline-flex',
        gap: '4px',
        padding: '4px',
        borderRadius: '12px',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        flexWrap: 'wrap',
        ...sx,
      }}
    >
      {items.map((item) => {
        const active = activeId === item.id;
        return (
          <Box
            key={item.id}
            role="tab"
            aria-selected={active}
            component={item.href ? 'a' : 'button'}
            href={item.href}
            type={item.href ? undefined : 'button'}
            onClick={item.href ? undefined : () => onChange?.(item.id)}
            sx={{
              position: 'relative',
              padding: dense ? '6px 10px' : '8px 14px',
              borderRadius: '9px',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
              color: active ? '#fff' : 'var(--text-muted)',
              background: active ? 'var(--accent)' : 'transparent',
              boxShadow: active ? 'var(--shadow-glow)' : 'none',
              transition: 'color .2s ease, background .2s ease, transform .15s ease',
              '&:hover': active ? {} : { color: 'var(--text-primary)' },
            }}
          >
            {item.icon}
            <span>{item.label}</span>
            {withKeys && item.key && (
              <Box
                component="span"
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono), monospace',
                  padding: '2px 5px',
                  borderRadius: '4px',
                  background: active ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.12)',
                }}
              >
                {item.key}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
