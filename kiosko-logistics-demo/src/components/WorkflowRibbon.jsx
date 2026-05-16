"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Box } from "@mui/material";
import GlassCard from "./ui/GlassCard";

const STAGES = [
  {
    id: "datos",
    label: "Datos",
    href: "/configurar-rutas",
    icon: "📂",
    num: 1,
  },
  {
    id: "configurar",
    label: "Configurar",
    href: "/configurar-rutas",
    icon: "⚙️",
    num: 2,
  },
  { id: "testing", label: "Testing", href: "/testing", icon: "🧪", num: 3 },
  { id: "rutas", label: "Rutas", href: "/rutas", icon: "🗺️", num: 4 },
  { id: "produccion", label: "Producción", href: "/rutas", icon: "✅", num: 5 },
];

/**
 * Devuelve el índice (0-based) del stage "actual" según el pathname.
 * Los stages anteriores al actual son "done", el actual es "current",
 * los siguientes son "pending".
 */
function getCurrentIndex(pathname) {
  if (pathname === "/configurar-rutas") return 1; // stages 0 y 1 activos → 1 es "current"
  if (pathname === "/testing") return 2; // stages 0-2 activos → 2 es "current"
  if (pathname === "/rutas") return 4; // todos activos → 4 es "current"
  return 0; // default: stage 0 es "current"
}

function getStageStatus(stageIndex, currentIndex) {
  if (stageIndex < currentIndex) return "done";
  if (stageIndex === currentIndex) return "current";
  return "pending";
}

const COLOR = {
  done: "var(--success)",
  current: "var(--accent)",
  pending: "var(--text-subtle)",
};

export default function WorkflowRibbon() {
  const pathname = usePathname();
  const currentIndex = getCurrentIndex(pathname);

  return (
    <GlassCard padding="4px 14px">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          height: 40,
          gap: 0,
          overflow: "hidden",
        }}
      >
        {STAGES.map((stage, i) => {
          const status = getStageStatus(i, currentIndex);
          const color = COLOR[status];
          const isDone = status === "done";
          const isCurrent = status === "current";

          return (
            <Box
              key={stage.id}
              sx={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                minWidth: 0,
              }}
            >
              {/* Node + label */}
              <Box
                component={Link}
                href={stage.href}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                  textDecoration: "none",
                  flexShrink: 0,
                  cursor: "pointer",
                }}
              >
                {/* Circle */}
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    lineHeight: 1,
                    background: isCurrent
                      ? "var(--accent)"
                      : isDone
                      ? "transparent"
                      : "transparent",
                    border: `2px solid ${color}`,
                    color: isCurrent ? "#fff" : color,
                    boxShadow: isCurrent ? "var(--shadow-glow)" : "none",
                    transition:
                      "border-color .2s, background .2s, box-shadow .2s",
                    "&:hover": {
                      borderColor: isCurrent
                        ? "var(--accent-2)"
                        : "var(--accent)",
                    },
                  }}
                >
                  {isDone ? "✓" : stage.num}
                </Box>

                {/* Label */}
                <Box
                  component="span"
                  sx={{
                    fontSize: 9,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color,
                    whiteSpace: "nowrap",
                    transition: "color .2s",
                  }}
                >
                  {stage.label}
                </Box>
              </Box>

              {/* Connecting line (not after last stage) */}
              {i < STAGES.length - 1 && (
                <Box
                  sx={{
                    flex: 1,
                    height: 2,
                    mx: "4px",
                    borderRadius: 1,
                    background:
                      i < currentIndex
                        ? "var(--success)"
                        : i === currentIndex
                        ? `linear-gradient(to right, var(--accent), var(--text-subtle))`
                        : "var(--text-subtle)",
                    opacity: 0.45,
                    transition: "background .3s",
                    alignSelf: "flex-start",
                    mt: "11px", // center on circle (24px circle / 2 = 12px - 1px half line)
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </GlassCard>
  );
}
