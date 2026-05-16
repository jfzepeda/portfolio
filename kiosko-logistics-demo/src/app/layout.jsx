import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import { inter, jetbrainsMono } from "./fonts";
import "../globals.css";
import Script from "next/script";
import DashboardShell from "../components/DashboardShell";
import { DashboardStateProvider } from "../components/DashboardStateProvider";
import { ThemeModeProvider } from "../components/ui/useThemeMode";

export const metadata = {
  title: "KIOSKO — Rutas y Empaque",
  description: "Dashboard web para optimización de rutas y empaque",
};

const ANTI_FOUC_SCRIPT = `(function(){try{var m=localStorage.getItem('kiosko_theme');if(m!=='dark'&&m!=='light')m=window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';document.documentElement.setAttribute('data-theme',m);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      data-theme="dark"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: ANTI_FOUC_SCRIPT }} />
      </head>
      <body>
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="afterInteractive"
        />
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ThemeModeProvider>
              <DashboardStateProvider>
                <DashboardShell>{children}</DashboardShell>
              </DashboardStateProvider>
            </ThemeModeProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
