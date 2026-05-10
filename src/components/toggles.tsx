"use client";

import { useEffect, useState } from "react";

// =============================================================================
// MODE TOGGLE (Executive ↔ Technical) — content layer.
// THEME TOGGLE (Light ↔ Dark) — visual layer.
// Both persist in localStorage; both are read pre-hydration by ModeScript.
// =============================================================================

type Mode = "executive" | "technical";
type Theme = "light" | "dark";

function readMode(): Mode {
  if (typeof window === "undefined") return "executive";
  const v = window.document.documentElement.getAttribute("data-mode");
  return v === "technical" ? "technical" : "executive";
}

function readTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const v = window.document.documentElement.getAttribute("data-theme");
  return v === "light" ? "light" : "dark";
}

export function ModeToggle() {
  const [mode, setMode] = useState<Mode>("executive");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMode(readMode());
    setMounted(true);
  }, []);

  function set(next: Mode) {
    setMode(next);
    document.documentElement.setAttribute("data-mode", next);
    try {
      localStorage.setItem("jfz:mode", next);
    } catch {}
  }

  return (
    <div
      role="tablist"
      aria-label="View mode"
      className="inline-flex items-center gap-0.5 rounded-full p-0.5 text-[12px]"
      style={{
        background: "var(--bg-overlay)",
        border: "1px solid var(--border)",
      }}
      suppressHydrationWarning
    >
      <button
        role="tab"
        aria-selected={mode === "executive"}
        onClick={() => set("executive")}
        className="px-3 py-1.5 rounded-full transition-all"
        style={{
          background:
            mounted && mode === "executive" ? "var(--fg)" : "transparent",
          color:
            mounted && mode === "executive" ? "var(--bg)" : "var(--fg-muted)",
          fontWeight: mounted && mode === "executive" ? 600 : 500,
        }}
      >
        Executive
      </button>
      <button
        role="tab"
        aria-selected={mode === "technical"}
        onClick={() => set("technical")}
        className="px-3 py-1.5 rounded-full transition-all"
        style={{
          background:
            mounted && mode === "technical" ? "var(--fg)" : "transparent",
          color:
            mounted && mode === "technical" ? "var(--bg)" : "var(--fg-muted)",
          fontWeight: mounted && mode === "technical" ? 600 : 500,
        }}
      >
        Technical
      </button>
    </div>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("jfz:theme", next);
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-all"
      style={{
        background: "var(--bg-overlay)",
        border: "1px solid var(--border)",
        color: "var(--fg-muted)",
      }}
      suppressHydrationWarning
    >
      <span aria-hidden className="text-[14px]">
        {mounted ? (theme === "dark" ? "○" : "●") : "○"}
      </span>
    </button>
  );
}
