// app/(protected)/layout.tsx
"use client";

import { Box, CssBaseline } from "@mui/material";
import Sidebar from "~/components/sidebar";
import { ProtectedClient } from "~/components/ProtectedClient";
import "~/styles/global.css";
import { useAppTheme } from "~/theme";
import { ThemeProvider } from "@mui/material/styles";

export default function ProtectedLayout({ children }) {
  const theme = useAppTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ProtectedClient minRole={3}>
        <Box
          sx={{
            display: "sticky",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <Box sx={{ display: "flex", flexGrow: 1, mt: 0 }}>
            <Sidebar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: { xs: 0.5, md: 1.25 },
                ml: { xs: 0, md: 1.25 },
                mr: { xs: 0, md: 1.25 },
                mt: { xs: "64px", md: 0 },
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
