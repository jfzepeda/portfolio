// Sidebar verde con documentos relacionados
"use client";
import { useEffect, useState } from "react";
import {
  Badge,
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import HomeIcon from "@mui/icons-material/Home";
import { useQuickQuote } from "~/lib/QuickQuoteContext.jsx";

const SIDEBAR_WIDTH = 220; // ancho expandido
const SIDEBAR_WIDTH_COLLAPSED = 72; // ancho colapsado

export default function DocSidebar({
  doctypes = [],
  active,
  onSelect,
  counter,
  handleNavBack,
  widthEventName = "yssm:sidebar:width",
  quickCountKey = "pre",
}) {
  const muiTheme = useTheme();
  const PRIMARY_COLOR = muiTheme.palette.primary.main;
  const { count } = useQuickQuote();
  const quickCount = counter ?? count;
  // Autocolapso por hover habilitado
  const [collapsed, setCollapsed] = useState(true);
  const hoverCollapseEnabled = true; // colapsado
  const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH;

  // Notificar ancho actual a quien lo necesite (AppBar/layout)
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(widthEventName, { detail: { width } })
      );
    }
  }, [width, widthEventName]);

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      onMouseEnter={() => hoverCollapseEnabled && setCollapsed(false)}
      onMouseLeave={() => hoverCollapseEnabled && setCollapsed(true)}
      sx={{
        width,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width,
          boxSizing: "border-box",
          bgcolor: PRIMARY_COLOR,
          borderRight: "1px solid var(--app-border-muted)",
          // Asegura que el Sidebar quede por encima del AppBar
          zIndex: (theme) => theme.zIndex.appBar + 1,
        },
      }}
    >
      {/* <Toolbar /> */}
      <Box sx={{ overflow: "auto", px: 1 }}>
        <List>
          <div key={"home"}>
            <ListItemButton
              onClick={handleNavBack}
              sx={{
                height: "3rem",
                "&.Mui-selected": {
                  bgcolor: "#fff",
                },
                "&.Mui-selected:hover": {
                  bgcolor: "#eee",
                },
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
                borderRadius: 1,
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
                <HomeIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary={"Volver a Inicio"} />}
            </ListItemButton>
          </div>
          {doctypes.map((it) => (
            <div key={it.key}>
              <ListItemButton
                selected={active === it.key}
                onClick={() => onSelect(it.key)}
                sx={{
                  height: "3rem",
                  "&.Mui-selected": {
                    bgcolor: "#fff",
                  },
                  "&.Mui-selected:hover": {
                    bgcolor: "#eee",
                  },
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
                  borderRadius: 1,
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
                  {it.key === quickCountKey && quickCount > 0 ? (
                    <Badge color="warning" badgeContent={quickCount}>
                      {it.icon}
                    </Badge>
                  ) : (
                    it.icon
                  )}
                </ListItemIcon>
                {!collapsed && <ListItemText primary={it.label} />}
              </ListItemButton>
            </div>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
