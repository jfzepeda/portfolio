// app/(protected)/layout.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, ROLES } from "~/utils/session.js";
import { ThemeProvider } from "@mui/material/styles";
import { useAppTheme } from "~/theme";
import "~/styles/global.css";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const theme = useAppTheme();

  useEffect(() => {
    const profile = getUserProfile();
    if (profile && profile?.role < ROLES.TECHNICIAN) {
      router.replace("/clientes/inventario/nueva/cartdraft");
    }
  }, [router]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
