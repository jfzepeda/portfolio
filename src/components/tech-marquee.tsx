// Tech-stack marquee — infinite horizontal scroll showing canonical stack tags.
// Pauses on hover. Mask-fades on edges. Minimal cognitive load, premium texture.

const TECH_RIBBON = [
  "Next.js 16",
  "React 19",
  "Swift 5.9",
  "SwiftUI",
  "TypeScript",
  "Tailwind CSS 4",
  "Node.js 20",
  "Express",
  "PostgreSQL",
  "Supabase",
  "OpenAI",
  "Anthropic Claude",
  "Model Context Protocol",
  "OpenAI Realtime API",
  "Yjs CRDTs",
  "CodeMirror 6",
  "Network.framework",
  "Keychain",
  "MapKit",
  "Photos.framework",
  "HealthKit",
  "APNs",
  "Shopify",
  "Twilio",
  "Baileys",
  "Bun",
  "Vercel",
  "Railway",
  "Electron",
  "Turbo",
  "JWT (RS256)",
  "iron-session",
  "Tectonic",
  "Backblaze B2",
  "Google Workspace APIs",
];

export function TechMarquee() {
  return (
    <section
      aria-label="Technology stack"
      className="py-12 lg:py-16"
      style={{
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="mx-auto max-w-[1400px] relative">
        <div
          className="px-6 lg:px-10 mb-6 flex items-center gap-3"
          aria-hidden
        >
          <span
            className="dot"
            style={{ background: "var(--accent)" }}
          />
          <span
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{ color: "var(--fg-subtle)" }}
          >
            Working stack — always live
          </span>
        </div>

        <div className="marquee">
          <div className="marquee-track">
            {[...TECH_RIBBON, ...TECH_RIBBON].map((tech, i) => (
              <span
                key={i}
                className="text-[20px] lg:text-[28px] flex-shrink-0 inline-flex items-center gap-3 whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--fg)",
                  letterSpacing: "-0.01em",
                }}
                aria-hidden={i >= TECH_RIBBON.length || undefined}
              >
                <span
                  aria-hidden
                  className="text-[14px]"
                  style={{ color: "var(--accent)" }}
                >
                  ✦
                </span>
                <span style={{ color: "var(--fg-muted)" }}>{tech}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
