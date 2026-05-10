import { profile } from "@/data/profile";

export function Hero() {
  return (
    <section
      id="top"
      className="relative pt-20 lg:pt-32 pb-16 lg:pb-24"
      aria-labelledby="hero-title"
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        {/* status row */}
        <div className="flex items-center gap-2 mb-10 text-[12px] subtle">
          <span
            className="dot"
            aria-hidden
            style={{ background: "#10b981" }}
          />
          <span style={{ color: "var(--fg-muted)" }}>{profile.availability}</span>
        </div>

        {/* main headline */}
        <h1
          id="hero-title"
          className="text-display"
          style={{ fontSize: "clamp(48px, 9vw, 128px)" }}
        >
          <span style={{ color: "var(--fg)" }}>Juan Felipe</span>
          <br />
          <span style={{ color: "var(--fg-subtle)" }}>Zepeda — </span>
          <span style={{ color: "var(--accent)" }}>{profile.role}</span>
          <span style={{ color: "var(--fg-subtle)" }}>.</span>
        </h1>

        {/* pitch — duplicated for executive vs technical */}
        <p
          className="only-executive mt-10 max-w-[680px] text-[18px] lg:text-[20px] leading-[1.55]"
          style={{ color: "var(--fg-muted)" }}
        >
          I ship complete platforms — native iOS, web apps, server APIs, AI agents,
          and the infrastructure that ties them together. From customer-facing
          storefronts to internal automation, I build end-to-end products that
          run in production.
        </p>

        <p
          className="only-technical mt-10 max-w-[760px] text-[18px] lg:text-[20px] leading-[1.55]"
          style={{ color: "var(--fg-muted)" }}
        >
          AI &amp; product engineer. Stack: Next.js 16 / React 19, Swift 5.9 /
          SwiftUI, Node.js 20 / Express, Postgres, Shopify, OpenAI &amp;
          Anthropic SDKs (direct, not wrapped), MCP servers, Yjs CRDTs,
          Network.framework, Twilio, Baileys. I ship to Vercel and Railway and
          self-host the rest.
        </p>

        {/* credibility bar */}
        <div
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-6 max-w-[680px]"
          aria-label="Portfolio statistics"
        >
          {profile.credibility.map((c) => (
            <div key={c.label}>
              <div
                className="text-[28px] lg:text-[32px] numerals"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--fg)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {c.value}
              </div>
              <div
                className="mt-2 text-[12px] uppercase tracking-wider"
                style={{ color: "var(--fg-subtle)" }}
              >
                {c.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <a
            href="#yantissimo"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full text-[13px] font-medium transition-all"
            style={{
              background: "var(--accent)",
              color: "#0a0a0a",
            }}
          >
            See the flagship platform <span aria-hidden>→</span>
          </a>
          <a
            href="#work"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full text-[13px] font-medium transition-all"
            style={{
              background: "transparent",
              color: "var(--fg)",
              border: "1px solid var(--border-strong)",
            }}
          >
            All work
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full text-[13px] font-medium"
            style={{ color: "var(--fg-muted)" }}
          >
            {profile.email}
          </a>
        </div>
      </div>
    </section>
  );
}
