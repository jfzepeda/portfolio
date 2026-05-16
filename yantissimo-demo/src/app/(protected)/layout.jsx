// app/(protected)/layout.tsx
"use client";

import { Box, CssBaseline } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "~/components/sidebar";
import { ProtectedClient } from "~/components/ProtectedClient";
import "~/styles/global.css";
import { useAppTheme } from "~/theme";
import { ThemeProvider } from "@mui/material/styles";
import { ROLES } from "~/utils/global";

const PADDINGLESS_ROUTES = [
  "/claude",
  "/promo-tracker",
  "/auditoria",
  "/garantias",
];

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useAppTheme();
  const isClaudeRoute = pathname?.startsWith("/claude");
  const isPromoTrackerRoute = pathname?.includes("/promo-tracker");
  const isPaddingLess = PADDINGLESS_ROUTES.some((r) => pathname?.startsWith(r));
  const mainOverflowX = isPaddingLess ? "hidden" : "visible";
  const mainOverflowY =
    isClaudeRoute || isPromoTrackerRoute ? "hidden" : "visible";
  const backgroundColor = isClaudeRoute
    ? "var(--app-promo-shell-muted)"
    : isPromoTrackerRoute
    ? "var(--app-promo-shell)"
    : "background.default";

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key?.toLowerCase() !== "k") {
        return;
      }

      if (!(event.metaKey || event.ctrlKey)) {
        return;
      }

      if (event.repeat) {
        return;
      }

      const target = event.target;
      const isEditable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (isEditable) {
        return;
      }

      event.preventDefault();
      if (pathname === "/inventario") {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push("/");
        }
        return;
      }

      router.push("/inventario");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, pathname]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ProtectedClient minRole={ROLES.MYR_HELPER}>
        <Box
          sx={{
            display: "sticky",
            flexDirection: "column",
            minHeight: "100vh",
            backgroundColor,
          }}
        >
          <Box sx={{ display: "flex", flexGrow: 1, mt: 0 }}>
            <Sidebar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: isPaddingLess ? 0 : { xs: 0.5, md: 1.25 },
                ml: isPaddingLess ? 0 : { xs: 0, md: 1.25 },
                mr: isPaddingLess ? 0 : { xs: 0, md: 1.25 },
                mt: { xs: "64px", md: 0 },
                backgroundColor: isPaddingLess
                  ? backgroundColor
                  : "transparent",
                overflowX: mainOverflowX,
                overflowY: mainOverflowY,
              }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </ProtectedClient>
    </ThemeProvider>
  );
}
