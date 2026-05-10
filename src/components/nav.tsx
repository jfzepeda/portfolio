"use client";

import { useEffect, useState } from "react";

const links: [string, string][] = [
  ["About", "about"],
  ["Skills", "skills"],
  ["Work", "experience"],
  ["Projects", "projects"],
  ["More", "more"],
  ["Contact", "contact"],
];

type Mode = "executive" | "technical";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mode, setMode] = useState<Mode>("executive");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const v = document.documentElement.getAttribute("data-mode");
    setMode(v === "technical" ? "technical" : "executive");
    setMounted(true);
  }, []);

  function changeMode(next: Mode) {
    setMode(next);
    document.documentElement.setAttribute("data-mode", next);
    try {
      localStorage.setItem("jfz:mode", next);
    } catch {}
  }

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        backdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
        background: scrolled
          ? "color-mix(in oklab, var(--paper) 80%, transparent)"
          : "transparent",
        borderBottom: scrolled
          ? "1px solid var(--rule)"
          : "1px solid transparent",
        transition:
          "background 200ms, border-color 200ms, backdrop-filter 200ms",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "14px clamp(20px, 4vw, 40px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <a
          href="#top"
          aria-label="Home"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "var(--ink)",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--accent)",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              letterSpacing: "0.04em",
            }}
          >
            jfz
          </span>
        </a>

        <nav
          aria-label="Primary"
          style={{
            display: "flex",
            gap: "clamp(12px, 2vw, 22px)",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {links.map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              className="nav-link"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11.5,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--ink-2)",
              }}
            >
              {label}
            </a>
          ))}

          {/* Executive ↔ Technical mode toggle */}
          <div
            role="radiogroup"
            aria-label="View mode"
            suppressHydrationWarning
            style={{
              position: "relative",
              display: "inline-flex",
              padding: 2,
              borderRadius: 999,
              background: "var(--paper-3)",
              border: "1px solid var(--rule)",
              userSelect: "none",
              marginLeft: 6,
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: 2,
                bottom: 2,
                left:
                  mounted && mode === "technical"
                    ? "calc(2px + 50%)"
                    : "2px",
                width: "calc(50% - 2px)",
                background: "var(--ink)",
                borderRadius: 999,
                transition: "left 180ms cubic-bezier(.3,.7,.4,1)",
              }}
            />
            {(["executive", "technical"] as const).map((m) => {
              const active = mounted && mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => changeMode(m)}
                  style={{
                    position: "relative",
                    zIndex: 1,
                    border: 0,
                    background: "transparent",
                    color: active ? "var(--paper)" : "var(--ink-2)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {m === "executive" ? "Pro" : "Tech"}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
