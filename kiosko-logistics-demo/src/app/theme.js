'use client';

import { createTheme } from '@mui/material/styles';

/**
 * MUI v6 valida palette.*.main como hex/rgb/hsl literal y rechaza CSS vars.
 * Usamos los valores HEX del tema dark como base. El estilo dinámico (que reacciona
 * al toggle dark/light) vive en styleOverrides usando var(--…) — MUI sí los acepta
 * dentro de sx y styleOverrides.
 *
 * Componentes que necesiten un color dinámico literal (ej. icon stroke) deben usar
 * 'var(--accent)' directamente en sx, no leer theme.palette.
 */
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#FF6B1A' },
    error: { main: '#EF4444' },
    warning: { main: '#F59E0B' },
    success: { main: '#10B981' },
    info: { main: '#38BDF8' },
    text: {
      primary: '#F5F5F7',
      secondary: '#C2C7D0',
    },
    background: {
      default: '#08080F',
      paper: '#11131C',
    },
    divider: 'rgba(255,255,255,0.08)',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'var(--font-sans), system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: 13,
    h1: { letterSpacing: '-0.02em' },
    h2: { letterSpacing: '-0.02em' },
    h3: { letterSpacing: '-0.02em' },
    button: { letterSpacing: '0.01em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body': { backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          backgroundImage: 'none',
          color: 'var(--text-primary)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 999,
          fontWeight: 600,
          fontSize: 12,
        },
        containedPrimary: {
          color: '#fff',
          background: 'var(--accent)',
          boxShadow: 'var(--shadow-glow)',
          '&:hover': { background: 'var(--accent-2)' },
        },
        outlined: {
          borderColor: 'var(--glass-border)',
          color: 'var(--text-secondary)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px) saturate(140%)',
          '&:hover': {
            borderColor: 'var(--glass-strong)',
            background: 'var(--glass-strong)',
          },
        },
        text: { color: 'var(--text-secondary)' },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { color: 'var(--text-muted)' },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: 'var(--glass-bg)',
          color: 'var(--text-primary)',
          '& fieldset': { borderColor: 'var(--glass-border)' },
          '&:hover fieldset': { borderColor: 'var(--glass-strong)' },
          '&.Mui-focused fieldset': { borderColor: 'var(--accent)' },
        },
        input: { color: 'var(--text-primary)' },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: 'var(--text-muted)',
          '&.Mui-focused': { color: 'var(--accent)' },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { color: 'var(--accent)' },
        rail: { backgroundColor: 'var(--glass-strong)' },
        track: { backgroundColor: 'var(--accent)', border: 'none' },
        thumb: {
          backgroundColor: 'var(--accent)',
          '&:hover, &.Mui-focusVisible': {
            boxShadow: '0 0 0 8px rgba(255,107,26,0.16)',
          },
        },
        valueLabel: {
          background: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--glass-border)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: 'var(--glass-bg)',
          color: 'var(--text-secondary)',
          borderRadius: 999,
          fontWeight: 600,
          fontSize: 11,
        },
        outlined: { borderColor: 'var(--glass-border)' },
        colorPrimary: {
          background: 'var(--accent)',
          color: '#fff',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: 'var(--bg-overlay)',
          color: 'var(--text-primary)',
          border: '1px solid var(--glass-border)',
          fontSize: 11,
          borderRadius: 8,
          padding: '6px 10px',
        },
        arrow: { color: 'var(--bg-overlay)' },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          background: 'var(--bg-elevated)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px) saturate(140%)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-primary)',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        colorPrimary: { color: 'var(--accent)' },
      },
    },
  },
});

export default theme;
