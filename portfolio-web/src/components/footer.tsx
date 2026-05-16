"use client";

import { useProfile, useT, bi } from "@/lib/i18n";

export function Footer() {
  const t = useT();
  const profile = useProfile();
  const year = new Date().getFullYear();
  const monthEn = new Date().toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  const monthEs = new Date().toLocaleDateString("es-MX", {
    month: "short",
    year: "numeric",
  });
  return (
    <footer
      style={{
        padding: "60px clamp(20px, 4vw, 40px) 40px",
        maxWidth: 1400,
        margin: "0 auto",
        borderTop: "1px solid var(--rule)",
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--ink-3)",
      }}
    >
      <span>
        © {year} {profile.name}
      </span>
      <span>
        {t(bi("Designed + built with care", "Diseñado + construido con cariño"))} ·{" "}
        {t(bi(monthEn, monthEs))}
      </span>
      <a href="#top" style={{ color: "var(--ink-3)" }}>
        ↑ {t(bi("Back to top", "Volver arriba"))}
      </a>
    </footer>
  );
}
