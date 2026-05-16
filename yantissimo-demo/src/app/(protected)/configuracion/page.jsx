"use client";
import api from "~/lib/api";
import React from "react";
import { Button, Box, Typography, Grid2 } from "@mui/material";
import { useRouter } from "next/navigation";
import { ConfigButton } from "~/components/configButton";
import { getUserProfile, ROLES, clearTokens } from "~/utils/session";
import { ROLE_LABELS } from "~/utils/global";
import Header from "~/components/header";

const FormulaIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <line
      x1="4"
      y1="20"
      x2="4"
      y2="4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line
      x1="4"
      y1="20"
      x2="20"
      y2="20"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M6 14 C8 14 8 10 11 10 C13 10 13 6 16 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const ServiciosIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

const UsuariosIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const DistribuidoresIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ProspeccionIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const RutasIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

const ImagenesIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const getConfigItemsForRole = (role) => {
  if (role >= ROLES.MARKETING) {
    return [
      {
        href: "/configuracion/formula",
        title: "FORMULA",
        description: "Parámetros de calculo de precios",
        icon: <FormulaIcon />,
      },
      {
        href: "/configuracion/servicios",
        title: "M.O. Y SERVICIOS",
        description: "Costos y tipos de mano de obra",
        icon: <ServiciosIcon />,
      },
      {
        href: "/configuracion/usuarios",
        title: "USUARIOS",
        description: "Gestión de accesos, roles y permisos",
        icon: <UsuariosIcon />,
      },
      {
        href: "/configuracion/distribuidores",
        title: "DISTRIBUIDORES Y MYR",
        description: "Alta y control de clientes con acceso a plataforma",
        icon: <DistribuidoresIcon />,
      },
      {
        href: "/configuracion/prospeccion",
        title: "PROSPECCIÓN",
        description: "Alta y control de prospectos",
        icon: <ProspeccionIcon />,
      },
      {
        href: "/configuracion/rutas",
        title: "RUTAS DE DISTRIBUCIÓN",
        description: "Asignación y optimización de rutas",
        icon: <RutasIcon />,
      },
      {
        href: "/configuracion/imagenes",
        title: "IMÁGENES",
        description: "Gestión de imágenes de productos",
        icon: <ImagenesIcon />,
      },
    ];
  }

  if ([ROLES.MYR_MANAGER, ROLES.MYR_SELLER, ROLES.MYR_HELPER].includes(role)) {
    return [
      {
        href: "/configuracion/distribuidores",
        title: "DISTRIBUIDORES Y MYR",
        description: "Alta y control de clientes con acceso a plataforma",
        icon: <DistribuidoresIcon />,
      },
      {
        href: "/configuracion/prospeccion",
        title: "PROSPECCIÓN",
        description: "Alta y control de prospectos",
        icon: <ProspeccionIcon />,
      },
      {
        href: "/configuracion/rutas",
        title: "RUTAS DE DISTRIBUCIÓN",
        description: "Asignación y optimización de rutas",
        icon: <RutasIcon />,
      },
    ];
  }

  return [];
};

const SettingsPage = () => {
  const router = useRouter();
  const userProfile = getUserProfile();
  const curRole = userProfile ? userProfile.role : null;
  const configItems = getConfigItemsForRole(curRole);

  const handleLogout = () => {
    if (window.confirm("¿Está seguro de que desea cerrar sesión?")) {
      api("/auth/logout", { method: "POST" });
      localStorage.clear();
      clearTokens();
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
      <Box sx={{ borderBottom: 1, borderColor: "primary.main", mb: 3 }} />

      {userProfile && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 4,
            p: 2,
            backgroundColor: "var(--app-primary-soft)",
            border: "1px solid var(--app-primary-border)",
            borderRadius: "12px",
          }}
        >
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: "11px",
              backgroundColor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "16px",
              color: "text.primary",
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
                color: "text.primary",
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
                  backgroundColor: "var(--app-primary-soft-strong)",
                  color: "var(--app-warning-dark)",
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
              {userProfile.sucursal && (
                <Typography sx={{ fontSize: "12px", color: "text.secondary" }}>
                  · {userProfile.sucursal}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {configItems.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Bienvenido a la configuración. Aquí puedes ajustar las opciones
            según tus necesidades.
          </Typography>
          <Grid2 container spacing={2} sx={{ mb: 4, mt: 2 }}>
            {configItems.map((item) => (
              <Grid2 key={item.href} item>
                <ConfigButton
                  href={item.href}
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                />
              </Grid2>
            ))}
          </Grid2>
        </Box>
      )}
    </Box>
  );
};

export default SettingsPage;
