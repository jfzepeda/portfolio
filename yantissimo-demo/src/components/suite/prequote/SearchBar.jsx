// SearchBar.jsx
"use client";
import { Box, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useMemo, useRef, useState } from "react";
import { handleWrite } from "~/utils/formaters.js";
import { keyframes } from "@mui/system";

export default function SearchBar({ searchTerm, setSearchTerm, disabled }) {
  const muiTheme = useTheme();
  const PRIMARY_COLOR = muiTheme.palette.primary.main;
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  // Compacto cuando hay texto; grande cuando vacío
  const compact = useMemo(() => searchTerm.trim().length > 0, [searchTerm]);

  const heights = { large: 64, compact: 44 };
  const widths = { large: 880, compact: 640 };

  const handleClear = () => {
    setSearchTerm("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const pulseGlow1 = keyframes`
0%   { box-shadow: 0 1px 6px 1px ${PRIMARY_COLOR}55 }
50%  { box-shadow: 0 1px 6px 10px ${PRIMARY_COLOR}55 }
100% { box-shadow: 0 1px 6px 1px ${PRIMARY_COLOR}55 }
`;

  return (
    <Box
      role="search"
      aria-label="Buscar productos"
      sx={{
        width: "100%",
        maxWidth: compact ? widths.compact : widths.large,
        height: compact ? heights.compact : heights.large,
        borderRadius: 999,
        border: "1px solid rgba(0,0,0,0.12)",
        bgcolor: focused ? "#fff" : "#3277f8",
        boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
        transition:
          "max-width 320ms cubic-bezier(0.22, 1, 0.36, 1)," +
          "height 240ms cubic-bezier(0.22, 1, 0.36, 1)," +
          "box-shadow 180ms ease, margin 260ms ease, transform 260ms ease",
        px: compact ? 2 : 3,
        py: 0,
        mx: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        mt: compact ? 1 : 3,
        mb: compact ? 0 : 2,
        transform: focused ? "translateY(-2px)" : "none",
        position: "relative",
        overflow: "visible",
        // Soft heartbeat-style glow using a pseudo-element so we don't fight with transform
        "&::after": focused
          ? {
              content: '""',
              position: "absolute",
              inset: -2,
              borderRadius: 999,
              pointerEvents: "none",
              animation: `${pulseGlow1} 1600ms ease-out infinite`,
            }
          : { content: '""' },
      }}
    >
      {/* Icono izquierda */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: focused ? "rgba(0,0,0,0.54)" : "#fff",
          pl: 0.5,
        }}
      >
        <SearchIcon />
      </Box>

      {/* Input */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          component="input"
          ref={inputRef}
          type="text"
          value={searchTerm}
          disabled={disabled}
          onChange={(e) => handleWrite(e.target.value, setSearchTerm)}
          placeholder="Ej: 255/55R18; michelin"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          sx={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: compact ? "1rem" : "1.35rem",
            lineHeight: 1.2,
            padding: compact ? "10px 4px" : "16px 8px",
            textAlign: compact ? "left" : "center",
            transition:
              "font-size 220ms ease, padding 220ms ease, text-align 200ms ease",
            "&::placeholder": {
              color: focused ? "#aaa" : "#fff",
              opacity: 1,
            },
            color: focused ? "#000" : "#fff",
          }}
        />
      </Box>

      {/* Limpiar */}
      <Box sx={{ width: 36, display: "flex", justifyContent: "center" }}>
        {compact && (
          <IconButton
            aria-label="Limpiar búsqueda"
            size="small"
            onClick={handleClear}
            sx={{ color: "rgba(0,0,0,0.45)" }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
