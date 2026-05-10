import { ModeToggle, ThemeToggle } from "./toggles";
import { profile } from "@/data/profile";

const links = [
  { href: "#work", label: "Work" },
  { href: "#yantissimo", label: "Yantissimo" },
  { href: "#skills", label: "Skills" },
  { href: "#about", label: "About" },
];

export function Nav() {
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{
        background:
          "color-mix(in srgb, var(--bg) 85%, transparent)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 h-16 flex items-center justify-between gap-6">
        <a
          href="#top"
          className="flex items-center gap-2.5 group"
          aria-label="Home"
        >
          <span
            aria-hidden
            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-[12px] font-semibold"
            style={{
              background: "var(--accent)",
              color: "#0a0a0a",
              fontFamily: "var(--font-mono)",
            }}
          >
            jfz
          </span>
          <span className="hidden sm:inline text-sm font-medium">
            {profile.name}
          </span>
        </a>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-1 text-[13px]"
          style={{ color: "var(--fg-muted)" }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-md transition-colors hover:text-[color:var(--fg)]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ModeToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
