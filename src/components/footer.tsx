import { profile } from "@/data/profile";

export function Footer() {
  const year = new Date().getFullYear();
  const month = new Date().toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  return (
    <footer
      style={{
        padding: "60px clamp(20px, 4vw, 40px) 40px",
        maxWidth: 1180,
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
      <span>Designed + built with care · {month}</span>
      <a href="#top" style={{ color: "var(--ink-3)" }}>
        ↑ Back to top
      </a>
    </footer>
  );
}
