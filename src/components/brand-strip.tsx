// Brand-recognition strip — well-known brands of the stack I work in.
// Uses CSS mask-image with Simple Icons CDN so brand silhouettes can be
// colored via background-color (ink color, terracotta on hover).
//
// Why mask-image: Simple Icons returns monochrome SVGs as single paths;
// using them as a mask lets us drive color from CSS without inlining 12
// brand path datasets.

interface Brand {
  label: string;
  slug: string;
}

// Curated brands — covers the user's named ones (iOS, OpenAI, JS, SQL,
// WhatsApp) plus the rest of the working stack.
const BRANDS: Brand[] = [
  { label: "iOS · Apple", slug: "apple" },
  { label: "Swift", slug: "swift" },
  { label: "OpenAI", slug: "openai" },
  { label: "Anthropic Claude", slug: "anthropic" },
  { label: "JavaScript", slug: "javascript" },
  { label: "TypeScript", slug: "typescript" },
  { label: "Next.js", slug: "nextdotjs" },
  { label: "React", slug: "react" },
  { label: "Node.js", slug: "nodedotjs" },
  { label: "PostgreSQL", slug: "postgresql" },
  { label: "WhatsApp API", slug: "whatsapp" },
  { label: "Shopify", slug: "shopify" },
  { label: "Vercel", slug: "vercel" },
  { label: "Tailwind CSS", slug: "tailwindcss" },
];

export function BrandStrip() {
  // Render twice for seamless infinite-scroll marquee
  const doubled = [...BRANDS, ...BRANDS];

  return (
    <section
      aria-label="Working brands and platforms"
      style={{
        padding: "clamp(28px, 4vw, 48px) 0",
        borderTop: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule)",
        background:
          "color-mix(in oklab, var(--paper) 60%, var(--paper-2) 40%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 40px)",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div className="kicker" style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "var(--accent)",
            }}
          />
          Tools &amp; platforms I work with
        </div>
        <div className="kicker" aria-hidden>
          ← scroll →
        </div>
      </div>

      <div className="brand-marquee">
        <div className="brand-marquee-track">
          {doubled.map((b, i) => (
            <div
              key={`${b.slug}-${i}`}
              className="brand-cell"
              aria-hidden={i >= BRANDS.length || undefined}
            >
              <span
                role="img"
                aria-label={b.label}
                className="brand-mark"
                style={{
                  WebkitMaskImage: `url(https://cdn.simpleicons.org/${b.slug})`,
                  maskImage: `url(https://cdn.simpleicons.org/${b.slug})`,
                }}
              />
              <span className="brand-label">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
