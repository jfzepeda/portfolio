'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Box } from '@mui/material';
import GlassCard from './GlassCard';
import BrandLogo from './BrandLogo';
import IconButtonGlass from './IconButtonGlass';
import { useThemeMode } from './useThemeMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

export default function TopBar({ tabs = [], actions = null }) {
  const pathname = usePathname();
  const { mode, toggle } = useThemeMode();

  return (
    <GlassCard
      padding="10px 14px"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.6,
        flexWrap: 'wrap',
        borderRadius: '14px',
      }}
    >
      <BrandLogo />
      <Box sx={{ flex: 1 }} />

      <Box
        role="tablist"
        sx={{
          display: 'inline-flex',
          gap: '4px',
          padding: '4px',
          borderRadius: '12px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          flexWrap: 'wrap',
        }}
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Box
              key={tab.id}
              role="tab"
              aria-selected={active}
              component={NextLink}
              href={tab.href}
              sx={{
                padding: '8px 14px',
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
                transition: 'color .2s ease, background .2s ease',
                '&:hover': active ? {} : { color: 'var(--text-primary)' },
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
        {actions}
        <IconButtonGlass
          icon={mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          tooltip={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          srLabel="Cambiar tema"
          onClick={toggle}
        />
      </Box>
    </GlassCard>
  );
}
