import { useEffect, useMemo, useState } from "react";
import { createTheme, darken, alpha, lighten } from "@mui/material/styles";

export const DEFAULT_PRIMARY_MAIN = "#fac65f";
const DEFAULT_PRIMARY_DARK = "#A97820";
const PROFILE_STORAGE_KEY = "userProfile";
const BACKGROUND_COLOR = "#f3eee4";
const BORDER_COLOR = "#cccccc";
const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const makeVar = (name) => `var(--app-${name})`;

export const APP_COLOR_VARS = {
  primary: {
    main: makeVar("primary-main"),
    dark: makeVar("primary-dark"),
    light: makeVar("primary-light"),
    soft: makeVar("primary-soft"),
    softStrong: makeVar("primary-soft-strong"),
    border: makeVar("primary-border"),
  },
  surface: {
    page: makeVar("surface-page"),
    card: makeVar("surface-card"),
    muted: makeVar("surface-muted"),
    soft: makeVar("surface-soft"),
    inverse: makeVar("surface-inverse"),
  },
  text: {
    primary: makeVar("text-primary"),
    secondary: makeVar("text-secondary"),
    muted: makeVar("text-muted"),
    inverse: makeVar("text-inverse"),
  },
  border: {
    subtle: makeVar("border-subtle"),
    muted: makeVar("border-muted"),
    strong: makeVar("border-strong"),
    inverse: makeVar("border-inverse"),
  },
  overlay: {
    scrim: makeVar("overlay-scrim"),
    soft: makeVar("overlay-soft"),
    medium: makeVar("overlay-medium"),
    strong: makeVar("overlay-strong"),
    primarySoft: makeVar("overlay-primary-soft"),
    primaryMedium: makeVar("overlay-primary-medium"),
  },
  shadow: {
    sm: makeVar("shadow-sm"),
    md: makeVar("shadow-md"),
    lg: makeVar("shadow-lg"),
    inset: makeVar("shadow-inset"),
  },
  neutral: {
    50: makeVar("neutral-50"),
    100: makeVar("neutral-100"),
    200: makeVar("neutral-200"),
    300: makeVar("neutral-300"),
    400: makeVar("neutral-400"),
    500: makeVar("neutral-500"),
    700: makeVar("neutral-700"),
    900: makeVar("neutral-900"),
  },
  semantic: {
    success: makeVar("success-main"),
    successSoft: makeVar("success-soft"),
    warning: makeVar("warning-main"),
    warningSoft: makeVar("warning-soft"),
    error: makeVar("error-main"),
    errorSoft: makeVar("error-soft"),
    info: makeVar("info-main"),
    infoSoft: makeVar("info-soft"),
  },
  status: {
    cold: makeVar("status-cold"),
    scheduled: makeVar("status-scheduled"),
    info: makeVar("status-info"),
    warning: makeVar("status-warning"),
    active: makeVar("status-active"),
    archived: makeVar("status-archived"),
    progress: makeVar("status-progress"),
    danger: makeVar("status-danger"),
  },
  calendar: {
    bg: makeVar("calendar-bg"),
    cell: makeVar("calendar-cell"),
    cellHasLead: makeVar("calendar-cell-has-lead"),
    cellPast: makeVar("calendar-cell-past"),
    gridLine: makeVar("calendar-grid-line"),
    header: makeVar("calendar-header"),
    headerSub: makeVar("calendar-header-sub"),
    weekend: makeVar("calendar-weekend"),
    day: makeVar("calendar-day"),
    dayPast: makeVar("calendar-day-past"),
    today: makeVar("calendar-today"),
    hover: makeVar("calendar-hover"),
    active: makeVar("calendar-active"),
    indicatorMuted: makeVar("calendar-indicator-muted"),
    popperBg: makeVar("calendar-popper-bg"),
    popperBorder: makeVar("calendar-popper-border"),
    popperText: makeVar("calendar-popper-text"),
  },
  earth: {
    paperBg: makeVar("earth-paper-bg"),
    surface1: makeVar("earth-surface-1"),
    surface2: makeVar("earth-surface-2"),
    surface3: makeVar("earth-surface-3"),
    border1: makeVar("earth-border-1"),
    border2: makeVar("earth-border-2"),
    textPrimary: makeVar("earth-text-primary"),
    textSecondary: makeVar("earth-text-secondary"),
    textMuted: makeVar("earth-text-muted"),
  },
  accents: {
    ocean: makeVar("accent-ocean"),
    oceanBg: makeVar("accent-ocean-bg"),
    oceanRgb: makeVar("accent-ocean-rgb"),
    danger: makeVar("accent-danger"),
    danger2: makeVar("accent-danger-2"),
    dangerBg: makeVar("accent-danger-bg"),
    dangerRgb: makeVar("accent-danger-rgb"),
    warn: makeVar("accent-warn"),
    warn2: makeVar("accent-warn-2"),
    warnBg: makeVar("accent-warn-bg"),
    warnRgb: makeVar("accent-warn-rgb"),
    ok: makeVar("accent-ok"),
    okBg: makeVar("accent-ok-bg"),
    okRgb: makeVar("accent-ok-rgb"),
    plum: makeVar("accent-plum"),
    plumBg: makeVar("accent-plum-bg"),
    plumRgb: makeVar("accent-plum-rgb"),
  },
  fonts: {
    serif: makeVar("font-serif"),
    sans: makeVar("font-sans"),
    mono: makeVar("font-mono"),
  },
  promo: {
    high: makeVar("promo-high"),
    highSoft: makeVar("promo-high-soft"),
    highBar: makeVar("promo-high-bar"),
    medium: makeVar("promo-medium"),
    mediumSoft: makeVar("promo-medium-soft"),
    mediumBar: makeVar("promo-medium-bar"),
    low: makeVar("promo-low"),
    lowSoft: makeVar("promo-low-soft"),
    lowBar: makeVar("promo-low-bar"),
    sold: makeVar("promo-sold"),
    soldSoft: makeVar("promo-sold-soft"),
    soldBar: makeVar("promo-sold-bar"),
    shell: makeVar("promo-shell"),
    shellMuted: makeVar("promo-shell-muted"),
    shellStrong: makeVar("promo-shell-strong"),
    shellTint: makeVar("promo-shell-tint"),
    chip: makeVar("promo-chip"),
    chipBorder: makeVar("promo-chip-border"),
  },
  contrast: {
    main: makeVar("contrast-main"),
    light: makeVar("contrast-light"),
    contrastText: makeVar("contrast-contrastText"),
  },
};

const normalizeHexColor = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const candidate = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return HEX_COLOR_PATTERN.test(candidate) ? candidate : null;
};

const getProfilePrimaryColor = (profile) =>
  normalizeHexColor(
    profile?.company?.color ??
      profile?.company?.colors ??
      profile?.color ??
      profile?.colors ??
      null
  );

const getCompanyPrimaryColor = () => {
  if (typeof window === "undefined") return null;

  try {
    const rawProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!rawProfile) return null;
    const profile = JSON.parse(rawProfile);
    return getProfilePrimaryColor(profile);
  } catch (_error) {
    return null;
  }
};

const buildColorSystem = (primaryMain) => {
  const primaryDark =
    primaryMain === DEFAULT_PRIMARY_MAIN
      ? DEFAULT_PRIMARY_DARK
      : darken(primaryMain, 0.18);
  const primaryLight = lighten(primaryMain, 0.3);

  const neutral = {
    50: BACKGROUND_COLOR,
    100: "#F4F2EE",
    200: "#F5F5F5",
    300: BORDER_COLOR,
    400: "#9E9A92",
    500: "#6B6760",
    700: "#3E3C38",
    900: "#5c544a",
  };

  const semantic = {
    success: { main: "#2E7D52", dark: "#1A5C39", soft: "#DDF0E4" },
    warning: { main: "#B07A10", dark: "#7A5400", soft: "#FFF3CC" },
    error: { main: "#B03A3A", dark: "#852020", soft: "#FCDEDE" },
    info: { main: "#1A7A6E", dark: "#0F5549", soft: "#D0EEEA" },
  };

  const status = {
    cold: "#3293cb",
    scheduled: "#6366F1",
    info: semantic.info.main,
    warning: semantic.warning.main,
    active: "#22C55E",
    archived: neutral[500],
    progress: "#0EA5E9",
    danger: semantic.error.main,
  };

  const promo = {
    high: "#A32D2D",
    highSoft: "#FCEBEB",
    highBar: "#E24B4A",
    medium: "#854F0B",
    mediumSoft: "#FAEEDA",
    mediumBar: "#EF9F27",
    low: "#185FA5",
    lowSoft: "#E6F1FB",
    lowBar: "#378ADD",
    sold: "#3B6D11",
    soldSoft: "#EAF3DE",
    soldBar: "#3B6D11",
    shell: "#F4F3F0",
    shellMuted: "#F8F7F4",
    shellStrong: "#EEECE7",
    shellTint: "#F5F3EE",
    chip: "#F0EDE6",
    chipBorder: "#DEDAD2",
  };

  const calendar = {
    bg: "#F5F4FF",
    cell: "#FFFFFF",
    cellHasLead: "#F0EEFF",
    cellPast: "#FAFAFA",
    gridLine: alpha(status.scheduled, 0.09),
    header: "#1E1B4B",
    headerSub: "#1E1B4B",
    weekend: "#C4B5FD",
    day: neutral[700],
    dayPast: neutral[300],
    today: status.scheduled,
    hover: alpha(status.scheduled, 0.08),
    active: alpha(status.scheduled, 0.13),
    indicatorMuted: alpha(status.scheduled, 0.5),
    popperBg: "#FFFFFF",
    popperBorder: alpha("#FFFFFF", 0.08),
    popperText: neutral[700],
  };

  const earth = {
    paperBg: "#faf7f2",
    surface1: "#ffffff",
    surface2: "#f3eee4",
    surface3: "#ebe4d3",
    border1: "#e5dcc8",
    border2: "#d4c8ad",
    textPrimary: "#26211d",
    textSecondary: "#5c544a",
    textMuted: "#8a8073",
  };

  const accents = {
    ocean: "#355d6b",
    oceanBg: "#dce8ec",
    oceanRgb: "53,93,107",
    danger: "#cb4532",
    danger2: "#a93820",
    dangerBg: "#f8e2dc",
    dangerRgb: "203,69,50",
    warn: "#c89519",
    warn2: "#a37a10",
    warnBg: "#f7e9c6",
    warnRgb: "200,149,25",
    ok: "#5d7c4c",
    okBg: "#e6efdc",
    okRgb: "93,124,76",
    plum: "#7a3a52",
    plumBg: "#efe0e7",
    plumRgb: "122,58,82",
  };

  const fonts = {
    serif: "'Fraunces', Georgia, serif",
    sans: "'Inter Tight', system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  };

  return {
    primaryMain,
    primaryDark,
    primaryLight,
    neutral,
    semantic,
    status,
    promo,
    calendar,
    earth,
    accents,
    fonts,
    surface: {
      page: neutral[50],
      card: "#FFFFFF",
      muted: neutral[100],
      soft: neutral[50],
      inverse: "#18181A",
    },
    text: {
      primary: neutral[900],
      secondary: neutral[500],
      muted: neutral[400],
      inverse: "#FFFFFF",
    },
    border: {
      subtle: neutral[200],
      muted: neutral[300],
      strong: neutral[400],
      inverse: alpha("#FFFFFF", 0.6),
    },
    overlay: {
      scrim: alpha("#000000", 0.35),
      soft: alpha("#000000", 0.06),
      medium: alpha("#000000", 0.1),
      strong: alpha("#000000", 0.18),
      primarySoft: alpha(primaryMain, 0.08),
      primaryMedium: alpha(primaryMain, 0.13),
    },
    shadow: {
      sm: "0 1px 3px rgba(0,0,0,0.08)",
      md: "0 4px 12px rgba(0,0,0,0.1)",
      lg: "0 8px 24px rgba(0,0,0,0.14)",
      inset: "0 0 0 1px rgba(0,0,0,0.04) inset",
    },
    badge: {
      newBg: semantic.info.soft,
      newText: semantic.info.dark,
      testBg: semantic.success.soft,
      testText: semantic.success.main,
      modifiedBg: "#EEE8FF",
      modifiedText: "#5B21B6",
      errorBg: semantic.error.soft,
      errorText: semantic.error.dark,
    },
    sidebar: {
      text: neutral[900],
      icon: neutral[900],
      selected: alpha("#FFFFFF", 0.85),
      selectedHover: alpha("#FFFFFF", 0.9),
      hover: alpha("#FFFFFF", 0.35),
      nested: alpha("#FFFFFF", 0.08),
      nestedHover: alpha("#FFFFFF", 0.25),
      border: "#FFFFFF",
      shadow: "0 1px 4px rgba(0,0,0,0.06)",
      mobileShadow: "0 2px 8px rgba(0,0,0,0.18)",
      drawerShadow: "1px 0 8px rgba(0,0,0,0.06)",
    },
    config: {
      accentText: "#7A5400",
    },
    white: "#FFFFFF",
    black: "#000000",
    contrast: {
      main: "#2C3E50",
      light: "#466280",
      contrastText: "#FFFFFF",
    },
    ramps: {
      A: "#00BF5E",
      B: "#0097B2",
      C: "#006FBF",
      D: "#8C52FF",
    },
    inventario: {
      main: "#DE5A02",
    },
  };
};

const buildCssVarMap = (colors) => ({
  "--app-primary-main": colors.primaryMain,
  "--app-primary-dark": colors.primaryDark,
  "--app-primary-light": colors.primaryLight,
  "--app-primary-soft": alpha(colors.primaryMain, 0.1),
  "--app-primary-soft-strong": alpha(colors.primaryMain, 0.18),
  "--app-primary-border": alpha(colors.primaryMain, 0.14),
  "--app-surface-page": colors.surface.page,
  "--app-surface-card": colors.surface.card,
  "--app-surface-muted": colors.surface.muted,
  "--app-surface-soft": colors.surface.soft,
  "--app-surface-inverse": colors.surface.inverse,
  "--app-text-primary": colors.text.primary,
  "--app-text-secondary": colors.text.secondary,
  "--app-text-muted": colors.text.muted,
  "--app-text-inverse": colors.text.inverse,
  "--app-border-subtle": colors.border.subtle,
  "--app-border-muted": colors.border.muted,
  "--app-border-strong": colors.border.strong,
  "--app-border-inverse": colors.border.inverse,
  "--app-overlay-scrim": colors.overlay.scrim,
  "--app-overlay-soft": colors.overlay.soft,
  "--app-overlay-medium": colors.overlay.medium,
  "--app-overlay-strong": colors.overlay.strong,
  "--app-overlay-primary-soft": colors.overlay.primarySoft,
  "--app-overlay-primary-medium": colors.overlay.primaryMedium,
  "--app-shadow-sm": colors.shadow.sm,
  "--app-shadow-md": colors.shadow.md,
  "--app-shadow-lg": colors.shadow.lg,
  "--app-shadow-inset": colors.shadow.inset,
  "--app-neutral-50": colors.neutral[50],
  "--app-neutral-100": colors.neutral[100],
  "--app-neutral-200": colors.neutral[200],
  "--app-neutral-300": colors.neutral[300],
  "--app-neutral-400": colors.neutral[400],
  "--app-neutral-500": colors.neutral[500],
  "--app-neutral-700": colors.neutral[700],
  "--app-neutral-900": colors.neutral[900],
  "--app-success-main": colors.semantic.success.main,
  "--app-success-dark": colors.semantic.success.dark,
  "--app-success-soft": colors.semantic.success.soft,
  "--app-warning-main": colors.semantic.warning.main,
  "--app-warning-dark": colors.semantic.warning.dark,
  "--app-warning-soft": colors.semantic.warning.soft,
  "--app-error-main": colors.semantic.error.main,
  "--app-error-dark": colors.semantic.error.dark,
  "--app-error-soft": colors.semantic.error.soft,
  "--app-info-main": colors.semantic.info.main,
  "--app-info-dark": colors.semantic.info.dark,
  "--app-info-soft": colors.semantic.info.soft,
  "--app-status-cold": colors.status.cold,
  "--app-status-scheduled": colors.status.scheduled,
  "--app-status-info": colors.status.info,
  "--app-status-warning": colors.status.warning,
  "--app-status-active": colors.status.active,
  "--app-status-archived": colors.status.archived,
  "--app-status-progress": colors.status.progress,
  "--app-status-danger": colors.status.danger,
  "--app-calendar-bg": colors.calendar.bg,
  "--app-calendar-cell": colors.calendar.cell,
  "--app-calendar-cell-has-lead": colors.calendar.cellHasLead,
  "--app-calendar-cell-past": colors.calendar.cellPast,
  "--app-calendar-grid-line": colors.calendar.gridLine,
  "--app-calendar-header": colors.calendar.header,
  "--app-calendar-header-sub": colors.calendar.headerSub,
  "--app-calendar-weekend": colors.calendar.weekend,
  "--app-calendar-day": colors.calendar.day,
  "--app-calendar-day-past": colors.calendar.dayPast,
  "--app-calendar-today": colors.calendar.today,
  "--app-calendar-hover": colors.calendar.hover,
  "--app-calendar-active": colors.calendar.active,
  "--app-calendar-indicator-muted": colors.calendar.indicatorMuted,
  "--app-calendar-popper-bg": colors.calendar.popperBg,
  "--app-calendar-popper-border": colors.calendar.popperBorder,
  "--app-calendar-popper-text": colors.calendar.popperText,
  "--app-promo-high": colors.promo.high,
  "--app-promo-high-soft": colors.promo.highSoft,
  "--app-promo-high-bar": colors.promo.highBar,
  "--app-promo-medium": colors.promo.medium,
  "--app-promo-medium-soft": colors.promo.mediumSoft,
  "--app-promo-medium-bar": colors.promo.mediumBar,
  "--app-promo-low": colors.promo.low,
  "--app-promo-low-soft": colors.promo.lowSoft,
  "--app-promo-low-bar": colors.promo.lowBar,
  "--app-promo-sold": colors.promo.sold,
  "--app-promo-sold-soft": colors.promo.soldSoft,
  "--app-promo-sold-bar": colors.promo.soldBar,
  "--app-promo-shell": colors.promo.shell,
  "--app-promo-shell-muted": colors.promo.shellMuted,
  "--app-promo-shell-strong": colors.promo.shellStrong,
  "--app-promo-shell-tint": colors.promo.shellTint,
  "--app-promo-chip": colors.promo.chip,
  "--app-promo-chip-border": colors.promo.chipBorder,
  "--app-earth-paper-bg": colors.earth.paperBg,
  "--app-earth-surface-1": colors.earth.surface1,
  "--app-earth-surface-2": colors.earth.surface2,
  "--app-earth-surface-3": colors.earth.surface3,
  "--app-earth-border-1": colors.earth.border1,
  "--app-earth-border-2": colors.earth.border2,
  "--app-earth-text-primary": colors.earth.textPrimary,
  "--app-earth-text-secondary": colors.earth.textSecondary,
  "--app-earth-text-muted": colors.earth.textMuted,
  "--app-accent-ocean": colors.accents.ocean,
  "--app-accent-ocean-bg": colors.accents.oceanBg,
  "--app-accent-ocean-rgb": colors.accents.oceanRgb,
  "--app-accent-danger": colors.accents.danger,
  "--app-accent-danger-2": colors.accents.danger2,
  "--app-accent-danger-bg": colors.accents.dangerBg,
  "--app-accent-danger-rgb": colors.accents.dangerRgb,
  "--app-accent-warn": colors.accents.warn,
  "--app-accent-warn-2": colors.accents.warn2,
  "--app-accent-warn-bg": colors.accents.warnBg,
  "--app-accent-warn-rgb": colors.accents.warnRgb,
  "--app-accent-ok": colors.accents.ok,
  "--app-accent-ok-bg": colors.accents.okBg,
  "--app-accent-ok-rgb": colors.accents.okRgb,
  "--app-accent-plum": colors.accents.plum,
  "--app-accent-plum-bg": colors.accents.plumBg,
  "--app-accent-plum-rgb": colors.accents.plumRgb,
  "--app-font-serif": colors.fonts.serif,
  "--app-font-sans": colors.fonts.sans,
  "--app-font-mono": colors.fonts.mono,
  "--app-contrast-main": colors.contrast.main,
});

export const createAppTheme = (inputPrimaryColor = null) => {
  const primaryMain =
    normalizeHexColor(inputPrimaryColor) || DEFAULT_PRIMARY_MAIN;
  const colors = buildColorSystem(primaryMain);
  const cssVars = buildCssVarMap(colors);

  return createTheme({
    palette: {
      mode: "light",
      primary: {
        main: colors.primaryMain,
        dark: colors.primaryDark,
        light: colors.primaryLight,
        contrastText: colors.text.primary,
        shadow: colors.overlay.primarySoft,
        border: alpha(colors.primaryMain, 0.14),
        badge: alpha(colors.primaryMain, 0.18),
      },
      secondary: {
        main: colors.contrast.main,
        contrastText: colors.text.inverse,
      },
      success: {
        main: colors.semantic.success.main,
        dark: colors.semantic.success.dark,
        light: colors.semantic.success.soft,
        contrastText: colors.text.inverse,
      },
      warning: {
        main: colors.semantic.warning.main,
        dark: colors.semantic.warning.dark,
        light: colors.semantic.warning.soft,
        contrastText: colors.text.primary,
      },
      error: {
        main: colors.semantic.error.main,
        dark: colors.semantic.error.dark,
        light: colors.semantic.error.soft,
        contrastText: colors.text.inverse,
      },
      info: {
        main: colors.semantic.info.main,
        dark: colors.semantic.info.dark,
        light: colors.semantic.info.soft,
        contrastText: colors.text.inverse,
      },
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
        disabled: colors.neutral[400],
        inverse: colors.text.inverse,
        main: "#FDFFFC",
      },
      background: {
        default: colors.surface.page,
        paper: colors.surface.card,
        main: colors.surface.card,
        muted: colors.surface.muted,
        subtle: colors.surface.soft,
      },
      divider: colors.border.subtle,
      border: colors.border,
      overlay: colors.overlay,
      shadow: colors.shadow,
      surface: colors.surface,
      neutral: colors.neutral,
      status: colors.status,
      promo: colors.promo,
      calendar: colors.calendar,
      badge: colors.badge,
      sidebar: colors.sidebar,
      config: colors.config,
      inventario: colors.inventario,
      white: {
        main: colors.white,
      },
      contrast: colors.contrast,
      ramps: colors.ramps,
      earth: colors.earth,
      accents: colors.accents,
      fonts: colors.fonts,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ":root": cssVars,
          "html, body": {
            backgroundColor: colors.surface.page,
            color: colors.text.primary,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& .MuiTableRow-root": {
              backgroundColor: colors.contrast.main,
            },
            "& .MuiTableCell-root": {
              fontWeight: 700,
              color: colors.neutral[50],
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:not(.MuiTableHead-root .MuiTableRow-root)": {
              "&:nth-of-type(odd)": {
                backgroundColor: "#F5F5F5",
              },
              "&:nth-of-type(even)": {
                backgroundColor: "#FFFFFF",
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            border: "none",
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
            overflow: "hidden",
            border: "none",
            boxShadow: colors.shadow.sm,
            border: `1px solid ${BORDER_COLOR}`,
          },
        },
      },
    },
  });
};

export const useAppTheme = () => {
  const [primaryColor, setPrimaryColor] = useState(() =>
    getCompanyPrimaryColor()
  );

  useEffect(() => {
    const syncThemeColor = () => {
      setPrimaryColor(getCompanyPrimaryColor());
    };

    syncThemeColor();
    window.addEventListener("storage", syncThemeColor);
    window.addEventListener("user-profile-updated", syncThemeColor);
    return () => {
      window.removeEventListener("storage", syncThemeColor);
      window.removeEventListener("user-profile-updated", syncThemeColor);
    };
  }, []);

  return useMemo(() => createAppTheme(primaryColor), [primaryColor]);
};

const theme = createAppTheme(getCompanyPrimaryColor());

export const toggleStyle = {
  "&.Mui-selected": {
    backgroundColor: "primary.main",
    color: "text.primary",
    "&:hover": {
      backgroundColor: "primary.dark",
    },
  },
};

export default theme;
