import React from "react";
import { Box, Typography } from "@mui/material";
import NextLink from "next/link";
import { APP_COLOR_VARS } from "~/theme";

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 18l6-6-6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DefaultIcon = () => (
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
    <circle cx="12" cy="12" r="3" />
    <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
  </svg>
);

export const ConfigButton = ({ title, description, onClick, icon, href }) => {
  return (
    <Box
      component={href ? NextLink : "button"}
      href={href}
      onClick={onClick}
      type={href ? undefined : "button"}
      role="link"
      sx={{
        width: { xs: "100%", sm: 380 },
        height: 84,
        padding: "0 20px",
        borderRadius: "14px",
        cursor: "pointer",
        textAlign: "left",
        textDecoration: "none",
        backgroundColor: "background.paper",
        border: `1px solid ${APP_COLOR_VARS.border.subtle}`,
        boxShadow: APP_COLOR_VARS.shadow.sm,
        display: "flex",
        alignItems: "center",
        gap: "14px",
        transition: "all 0.18s ease",
        position: "relative",
        overflow: "hidden",
        appearance: "none",
        WebkitAppearance: "none",
        outline: "none",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "3px",
          backgroundColor: "primary.main",
          transform: "scaleY(0)",
          transformOrigin: "center",
          transition: "transform 0.18s ease",
        },
        "&:hover": {
          boxShadow: APP_COLOR_VARS.shadow.md,
          transform: "translateY(-2px)",
          "& .cfg-icon": {
            backgroundColor: APP_COLOR_VARS.primary.softStrong,
          },
          "&::before": {
            transform: "scaleY(1)",
          },
        },
        "&:focus-visible": {
          boxShadow: `0 0 0 3px ${APP_COLOR_VARS.primary.softStrong}`,
        },
      }}
    >
      <Box
        className="cfg-icon"
        sx={{
          width: 44,
          height: 44,
          borderRadius: "10px",
          backgroundColor: APP_COLOR_VARS.primary.soft,
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background-color 0.18s ease",
        }}
      >
        {icon ?? <DefaultIcon />}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "13.5px",
            fontWeight: 700,
            color: "text.primary",
            letterSpacing: "0.04em",
            mb: 0.3,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: "12px",
            color: "text.secondary",
            lineHeight: 1.4,
          }}
        >
          {description}
        </Typography>
      </Box>

      <Box sx={{ color: "text.secondary" }}>
        <ChevronRight />
      </Box>
    </Box>
  );
};

export default ConfigButton;
