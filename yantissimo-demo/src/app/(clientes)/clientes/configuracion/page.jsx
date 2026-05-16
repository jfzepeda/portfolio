"use client";
import api from "~/lib/api";
import React from "react";
import { Button, Box, Typography, Grid2 } from "@mui/material";
import { useRouter } from "next/navigation";
import { ConfigButton } from "~/components/configButton";
import { getUserProfile, ROLES } from "~/utils/session";
import { ROLE_LABELS } from "~/utils/global";
import Header from "~/components/header";

const GestionIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#555"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="2" width="6" height="4" rx="1" />
    <rect x="2" y="16" width="6" height="4" rx="1" />
    <rect x="16" y="16" width="6" height="4" rx="1" />
    <path d="M12 6v4M5 16v-3a1 1 0 011-1h12a1 1 0 011 1v3" />
  </svg>
);

const userProfile = getUserProfile();
const curRole = userProfile ? userProfile.role : null;

const SettingsPage = () => {
  const router = useRouter();

  const handleLogout = () => {
    if (window.confirm("¿Está seguro de que desea cerrar sesión?")) {
      api("/auth/logout", { method: "POST" });
      localStorage.clear();
      router.replace("/login");
    }
  };

  return (
    <Box>
      <Header
        title="Configuración"
        actions={
          <Button
            variant="contained"
            color="error"
            onClick={() => handleLogout()}
            sx={{ minWidth: 120 }}
          >
            Cerrar sesión
          </Button>
        }
      />
      <Box sx={{ borderBottom: 1, borderColor: "#FFC600", mb: 3 }} />

      {userProfile && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 4,
            p: 2,
            backgroundColor: "rgba(255,198,0,0.04)",
            border: "1px solid rgba(255,198,0,0.14)",
            borderRadius: "12px",
          }}
        >
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: "11px",
              backgroundColor: "#FFC600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "16px",
              color: "#111",
              flexShrink: 0,
              userSelect: "none",
            }}
          >
            {(userProfile.username ?? "??").slice(0, 2).toUpperCase()}
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "15px",
                color: "#111",
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              {userProfile.username}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 0.75,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Box
                component="span"
                sx={{
                  backgroundColor: "rgba(255,198,0,0.18)",
                  color: "#7a4f00",
                  fontSize: "11px",
                  fontWeight: 600,
                  px: 1,
                  py: "2px",
                  borderRadius: "6px",
                  lineHeight: 1.5,
                }}
              >
                {ROLE_LABELS[userProfile.role] ?? userProfile.role}
              </Box>
              {userProfile.company_id && (
                <Typography sx={{ fontSize: "12px", color: "#999" }}>
                  · {userProfile.company_id}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {curRole === ROLES.CLIENT_ADMIN && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Bienvenido a la configuración. Aquí puedes ajustar las opciones
            según tus necesidades.
          </Typography>
          <Grid2 container spacing={2} sx={{ mb: 4, mt: 2 }}>
            <Grid2 item>
              <ConfigButton
                href="/clientes/configuracion/gestion"
                title="GESTION"
                description="Alta, edición y control de distribuidores"
                icon={<GestionIcon />}
              />
            </Grid2>
          </Grid2>
        </Box>
      )}
    </Box>
  );
};

export default SettingsPage;
