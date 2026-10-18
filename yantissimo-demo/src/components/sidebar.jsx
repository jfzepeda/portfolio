// src/components/Sidebar.jsx
"use client";
import React, { useEffect, useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  IconButton,
  Collapse,
  useMediaQuery,
  Badge,
} from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import SettingsIcon from "@mui/icons-material/Settings";
import StorageIcon from "@mui/icons-material/Storage";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SpeedIcon from "@mui/icons-material/Speed";
import SearchIcon from "@mui/icons-material/Search";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import MenuIcon from "@mui/icons-material/Menu";
import WidgetsIcon from "@mui/icons-material/Widgets";
import CloseIcon from "@mui/icons-material/Close";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import EventNoteIcon from "@mui/icons-material/EventNote";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CampaignIcon from "@mui/icons-material/Campaign";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { getUserProfile, ROLES } from "~/utils/session";
import { styled, useTheme } from "@mui/material/styles";
import { useNotifications } from "~/hooks/useNotifications";

// const DEFAULT_LOGO = "/logo.svg";
// const SELECTED_BG_COLOR = "#000000";
// const SELECTED_ICON_COLOR = "#ffffff";
// const ICON_COLOR = "#000000";

const DEFAULT_LOGO = "/logo.svg";
const SELECTED_BG_COLOR = "var(--app-primary-main)";
const BG_COLOR = "#fff";
const SELECTED_ICON_COLOR = "#5c544a";
const ICON_COLOR = "#5c544a";
const CONTRAST_MENU_ICON_ROUTES = ["/garantias"];

const CustomListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "selected",
})(({ selected }) => ({
  maxHeight: "48px",
  borderRadius: "8px",
  margin: "4px 8px",
  backgroundColor: selected ? SELECTED_BG_COLOR : "transparent",

  transition: "all 0.2s ease",
  "& .MuiListItemIcon-root": {
    color: selected ? SELECTED_ICON_COLOR : ICON_COLOR,
    transition: "transform 0.2s ease",
  },
  "& .MuiTypography-root": {
    color: selected ? SELECTED_ICON_COLOR : "var(--app-text-primary)",
    fontWeight: 400,
    fontSize: "0.94rem",
    letterSpacing: "0.01em",
  },
  "&:hover": {
    backgroundColor: selected ? SELECTED_BG_COLOR : "rgba(0,0,0,0.06)",
    boxShadow: "var(--app-shadow-sm)",
  },
}));

const CustomListItem = styled(ListItem)({
  maxHeight: "48px",
  padding: "0px",
});

const NestedListItemButton = styled(CustomListItemButton, {
  shouldForwardProp: (prop) => prop !== "selected",
})(({ selected }) => ({
  margin: "2px 8px 2px 20px",
  borderRadius: "8px",
  backgroundColor: selected ? SELECTED_BG_COLOR : "rgba(255,255,255,0.06)",
  "& .MuiListItemIcon-root": {
    minWidth: "32px",
  },
  "& .MuiTypography-root": {
    fontSize: "0.92rem",
  },
  "&:hover": {
    backgroundColor: selected ? SELECTED_BG_COLOR : "rgba(0,0,0,0.06)",
  },
}));

const ROLES_PROTECTED = [
  ROLES.OWNER,
  ROLES.ADMIN,
  ROLES.MARKETING,
  ROLES.MANAGER,
  ROLES.SELLER,
  ROLES.MYR_MANAGER,
  ROLES.MYR_SELLER,
  ROLES.MYR_HELPER,
];

const ROLES_PATIO = [
  ROLES.OWNER,
  ROLES.ADMIN,
  ROLES.MARKETING,
  ROLES.MANAGER,
  ROLES.SELLER,
];

const ROLES_MYR = [ROLES.MYR_MANAGER, ROLES.MYR_SELLER, ROLES.MYR_HELPER];

const ROLES_CORP = [ROLES.OWNER, ROLES.ADMIN, ROLES.MARKETING];

const ROLES_CLIENTS = [ROLES.CLIENT_ADMIN, ROLES.CLIENT];

const menuItems = [
  {
    key: "dashboard",
    path: "/dashboard",
    icon: <SpeedIcon />,
    label: "Dashboard",
    roles: ROLES_PROTECTED,
  },
  {
    key: "inventario",
    path: "/inventario",
    icon: <SearchIcon />,
    label: "Inventario",
    roles: ROLES_PROTECTED,
    children: [
      {
        key: "promo-tracker",
        path: "/inventario/promo-tracker",
        icon: <LocalOfferIcon />,
        label: "Promo Tracker",
        roles: ROLES_CORP,
      },
      {
        key: "auditoria",
        path: "/auditoria",
        icon: <VerifiedUserIcon />,
        label: "Auditoría",
        roles: ROLES_CORP,
      },
      {
        key: "inv-existencias",
        path: "/inventario/existencias",
        icon: <WidgetsIcon />,
        label: "Existencias",
        roles: ROLES_CORP,
      },
    ],
  },
  // -------------------------
  // ZONA DE PATIO
  {
    key: "cotizaciones",
    path: "/cotizaciones",
    icon: <AttachMoneyIcon />,
    label: "Cotizaciones",
    roles: ROLES_PATIO,
    children: [
      {
        key: "seguimiento",
        path: "/seguimiento",
        icon: <NotificationsActiveIcon />,
        label: "Seguimiento",
        roles: ROLES_PATIO,
      },
      {
        key: "garantias",
        path: "/garantias",
        icon: <WorkspacePremiumIcon />,
        label: "Garantías",
        roles: ROLES_PATIO,
      },
    ],
  },
  {
    key: "calendario",
    path: "/calendario",
    icon: <EventNoteIcon />,
    label: "Calendario",
    roles: ROLES_PATIO,
  },
  // ZONA DE PATIO
  // -------------------------
  {
    key: "ventas",
    path: "/ventas",
    icon: <ReceiptIcon />,
    label: "Ventas",
    roles: [...ROLES_CORP],
  },
  // -------------------------
  // ZONA DE MAYOREO
  {
    key: "myr",
    icon: <LocalShippingIcon />,
    label: "Mayoreo",
    roles: ROLES_CORP,
    children: [
      {
        key: "cotizaciones-myr",
        path: "/myr/cotizaciones",
        icon: <AttachMoneyIcon />,
        label: "Cotizaciones",
        roles: ROLES_CORP,
      },
      {
        key: "pedidos-myr",
        path: "/myr/pedidos",
        icon: <LocalMallIcon />,
        label: "Pedidos",
        roles: ROLES_CORP,
      },
      {
        key: "clientes-myr",
        path: "/myr/clientes",
        icon: <PeopleAltIcon />,
        label: "Clientes",
        roles: ROLES_CORP,
      },
    ],
  },
  {
    key: "pedidos-myr",
    path: "/myr/pedidos",
    icon: <LocalMallIcon />,
    label: "Pedidos",
    roles: ROLES_MYR,
  },
  {
    key: "ventas-myr",
    icon: <ReceiptIcon />,
    label: "Ventas",
    path: "/ventas",
    roles: ROLES_MYR,
    children: [
      {
        key: "cotizaciones-myr",
        path: "/myr/cotizaciones",
        icon: <AttachMoneyIcon />,
        label: "Cotizaciones",
        roles: ROLES_MYR,
      },
      {
        key: "clientes-myr",
        path: "/myr/clientes",
        icon: <PeopleAltIcon />,
        label: "Clientes",
        roles: ROLES_MYR,
      },
    ],
  },
  // ZONA DE MAYOREO
  // -------------------------
  {
    key: "claude",
    path: "/claude",
    icon: (
      <Image
        width="24"
        height="24"
        alt="Anthropic Star"
        src="/claude-logo.svg"
      />
    ),
    label: "Claude",
    roles: ROLES_PATIO,
  },
  {
    key: "agent",
    path: "/agent",
    icon: <SupportAgentIcon />,
    label: "Chats CRM",
    roles: ROLES_PATIO,
    children: [
      {
        key: "campanas-qr",
        path: "/campanas/qr",
        icon: <CampaignIcon />,
        label: "Campañas QR",
        roles: ROLES_CORP,
      },
    ],
  },
  {
    key: "database",
    path: "/excel",
    icon: <StorageIcon />,
    label: "Base de datos",
    roles: ROLES_CORP,
  },
  {
    key: "configuracion",
    path: "/configuracion",
    icon: <SettingsIcon />,
    label: "Configuración",
    roles: ROLES_PROTECTED,
  },
  // -------------------------
  // ZONA DE CLIENTES
  {
    key: "inventario-clientes",
    path: "/clientes/inventario",
    icon: <SearchIcon />,
    label: "Inventario",
    roles: ROLES_CLIENTS,
  },
  {
    key: "pedidos-clientes",
    path: "/clientes/pedidos",
    icon: <AttachMoneyIcon />,
    label: "Pedidos",
    roles: ROLES_CLIENTS,
  },
  {
    key: "configuracion-clientes",
    path: "/clientes/configuracion",
    icon: <SettingsIcon />,
    label: "Configuración",
    roles: ROLES_CLIENTS,
  },
  // ZONA DE CLIENTES
  // -------------------------
];

const withBadge = (icon, count) =>
  count > 0 ? (
    <Badge badgeContent={count} color="error" max={99}>
      {icon}
    </Badge>
  ) : (
    icon
  );

const Sidebar = () => {
  const muiTheme = useTheme();
  const [colapsed, setColapsed] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const [curRole, setCurRole] = useState(null);
  const [curSuc, setCurSuc] = useState(null);
  const [sidebarColor, setSidebarColor] = useState(null);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Load user profile on the client to avoid SSR/CSR mismatch
    const profile = getUserProfile();
    // Demo: always render the sidebar as the highest role
    setCurRole(ROLES.ADMIN);
    setCurSuc(profile?.sucursal ?? null);
    setSidebarColor(profile?.color ?? null);
    if (profile?.logo_url) setLogoUrl(profile.logo_url);
    setUserProfile(profile);
  }, []);

  const { agentCount, ordersCount } = useNotifications(userProfile);

  const getBadgeCount = (key) => {
    if (key === "agent") return agentCount;
    if (key === "myr") return ordersCount;
    if (key === "pedidos-myr") return ordersCount;
    return 0;
  };

  const pathname = usePathname();
  const useContrastMenuIcon = CONTRAST_MENU_ICON_ROUTES.some(
    (route) => pathname === route || pathname?.startsWith(`${route}/`),
  );

  const isActivePath = (basePath) =>
    pathname === basePath || pathname?.startsWith(basePath + "/");

  const isExactPath = (path) => pathname === path;

  const isAnyChildActive = (children = []) =>
    children.some((child) => isActivePath(child.path));

  const isSidebarPinnedOpen = !colapsed;
  const shouldShowDesktopMenu = isSidebarPinnedOpen || isSidebarHovered;
  const drawerWidth = isSidebarPinnedOpen ? 240 : 72;
  const drawerLayoutWidth = isSidebarPinnedOpen ? drawerWidth : 0;
  const showItemLabels = isSidebarPinnedOpen;
  const showHoveredSidebar = () => {
    if (colapsed) setIsSidebarHovered(true);
  };
  const hideHoveredSidebar = () => {
    setIsSidebarHovered(false);
  };

  const visibleMenuItems = menuItems
    .filter((item) => !item.roles || item.roles.includes(curRole))
    .filter(
      (item) => ["ADMIN", item.onlySuc].includes(curSuc) || !item.onlySuc,
    );

  const renderMenuList = (mobile = false) => (
    <List>
      {visibleMenuItems.map((item) => {
        if (item.children?.length > 0) {
          const isParentActive = item?.path ? isActivePath(item?.path) : false;
          const isSubmenuOpen =
            openSubmenu === item.key ||
            isAnyChildActive(item?.children) ||
            isParentActive;
          return (
            <React.Fragment key={item.key}>
              <CustomListItem>
                <CustomListItemButton
                  {...(item.path
                    ? { component: NextLink, href: item.path }
                    : { component: "button" })}
                  onClick={() => {
                    setOpenSubmenu((v) => (v === item.key ? null : item.key));
                  }}
                  selected={item.path ? isExactPath(item.path) : false}
                  sx={{
                    borderBottom: isSubmenuOpen
                      ? "2px solid var(--app-primary-main)"
                      : "0px solid transparent",
                    borderRadius: isExactPath(item.path) ? 2 : 0,
                  }}
                >
                  <ListItemIcon>
                    {withBadge(
                      item.icon,
                      isSubmenuOpen ? 0 : getBadgeCount(item.key),
                    )}
                  </ListItemIcon>
                  {(showItemLabels || mobile) && (
                    <ListItemText primary={item.label} />
                  )}
                </CustomListItemButton>
              </CustomListItem>
              <Collapse
                in={(mobile || shouldShowDesktopMenu) && isSubmenuOpen}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {item.children
                    .filter(
                      (child) => !child.roles || child.roles.includes(curRole),
                    )
                    .map((child) => (
                      <CustomListItem key={child.key}>
                        <NestedListItemButton
                          sx={{
                            pl: 1.2,
                            // borderLeft: isSubmenuOpen
                            //   ? "2px solid var(--app-primary-main)"
                            //   : "0px solid transparent",
                          }}
                          component={NextLink}
                          href={child.path}
                          selected={isActivePath(child.path)}
                          onClick={() => {
                            if (mobile) setMobileMenuOpen(false);
                          }}
                        >
                          <ListItemIcon>
                            {withBadge(child.icon, getBadgeCount(child.key))}
                          </ListItemIcon>
                          {(showItemLabels || mobile) && (
                            <ListItemText primary={child.label} />
                          )}
                        </NestedListItemButton>
                      </CustomListItem>
                    ))}
                </List>
              </Collapse>
            </React.Fragment>
          );
        }
        return (
          <CustomListItem key={item.key}>
            <CustomListItemButton
              component={NextLink}
              onClick={() => {
                setOpenSubmenu(null);
                if (mobile) setMobileMenuOpen(false);
              }}
              href={item.path}
              selected={isActivePath(item.path)}
            >
              <ListItemIcon>
                {withBadge(item.icon, getBadgeCount(item.key))}
              </ListItemIcon>
              {(showItemLabels || mobile) && (
                <ListItemText primary={item.label} />
              )}
            </CustomListItemButton>
          </CustomListItem>
        );
      })}
    </List>
  );

  if (isMobile) {
    return (
      <>
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            height: 64,
            backgroundColor: sidebarColor || "surface.card",
            display: "flex",
            alignItems: "center",
            px: 1,
            boxShadow: "var(--app-shadow-lg)",
          }}
        >
          <IconButton
            sx={{ color: "text.primary" }}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <MenuIcon />
          </IconButton>
          <Box
            component="img"
            sx={{ height: 30, ml: 0.4 }}
            alt="Logo"
            src={logoUrl}
          />
        </Box>

        <Drawer
          anchor="top"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            zIndex: 1400,
            "& .MuiDrawer-paper": {
              width: "100vw",
              height: "100vh",
              backgroundColor: sidebarColor || "surface.card",
            },
          }}
        >
          <Toolbar sx={{ minHeight: "64px !important", px: 1 }}>
            <IconButton
              sx={{ color: "text.primary", ml: -1 }}
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Cerrar menu"
            >
              <CloseIcon />
            </IconButton>
            <Box
              component="img"
              sx={{ pl: 1, width: "100%", maxWidth: 160 }}
              alt="Logo"
              src={logoUrl}
            />
          </Toolbar>
          {curRole === null ? null : renderMenuList(true)}
        </Drawer>
      </>
    );
  }

  return (
    <Drawer
      variant="permanent"
      onMouseEnter={showHoveredSidebar}
      onMouseLeave={hideHoveredSidebar}
      PaperProps={{
        onMouseEnter: showHoveredSidebar,
        onMouseLeave: hideHoveredSidebar,
      }}
      sx={{
        width: drawerLayoutWidth,
        flexShrink: 0,
        zIndex: 900,
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: shouldShowDesktopMenu
            ? sidebarColor || BG_COLOR
            : "transparent",
          borderRight: shouldShowDesktopMenu
            ? "1px solid var(--app-border-muted)"
            : "1px solid transparent",
          boxShadow: shouldShowDesktopMenu ? "var(--app-shadow-sm)" : "none",
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          overflowX: "hidden",
          pointerEvents: shouldShowDesktopMenu ? "auto" : "none",
        },
      }}
    >
      <Toolbar>
        <IconButton
          sx={{
            color:
              useContrastMenuIcon && !isSidebarHovered
                ? "text.inverse"
                : "text.primary",
            ml: -1,
            mt: 2,
            pointerEvents: "auto",
            // border: "1px solid var(--app-border-muted)",
            // boxShadow: shouldShowDesktopMenu ? "none" : "var(--app-shadow-sm)",
            // "&:hover": {
            //   backgroundColor: sidebarColor || BG_COLOR,
            // },
          }}
          onMouseEnter={showHoveredSidebar}
          onClick={() => {
            setColapsed((value) => !value);
            setIsSidebarHovered(false);
          }}
        >
          {isSidebarPinnedOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
        {isSidebarPinnedOpen && (
          <Box
            component="img"
            sx={{ pr: 3, width: "100%" }}
            alt="Logo"
            src={logoUrl}
          />
        )}
      </Toolbar>
      {curRole === null || !shouldShowDesktopMenu
        ? null
        : renderMenuList(false)}
    </Drawer>
  );
};

export default Sidebar;
