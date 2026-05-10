import { Reveal } from "./reveal";
import { profile } from "@/data/profile";

export function Hero() {
  return (
    <section
      id="top"
      style={{
        minHeight: "100vh",
        padding:
          "calc(var(--section-y) * 1.1) clamp(20px, 4vw, 40px) var(--section-y)",
        maxWidth: 1400,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <Reveal>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 28,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              background: "var(--accent)",
              borderRadius: "50%",
              boxShadow:
                "0 0 0 4px color-mix(in oklab, var(--accent) 22%, transparent)",
              animation: "pulse 2.4s ease-in-out infinite",
            }}
          />
          Available for collaborations · 2026
        </div>
      </Reveal>

      <Reveal delay={80}>
        <h1
          className="text-display"
          style={{
            fontSize: "clamp(64px, 11vw, 168px)",
            lineHeight: 0.92,
            letterSpacing: "-0.025em",
            margin: 0,
            color: "var(--ink)",
          }}
        >
          Juan Felipe
          <br />
          <span className="italic-display">Zepeda.</span>
        </h1>
      </Reveal>

      <Reveal delay={160}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(16px, 4vw, 56px)",
            alignItems: "flex-start",
            marginTop: "clamp(28px, 4vw, 48px)",
            paddingTop: 28,
            borderTop: "1px solid var(--rule)",
          }}
        >
          <div style={{ flex: "0 0 auto", minWidth: 220 }}>
            <div className="kicker" style={{ marginBottom: 10 }}>
              Role
            </div>
            <div
              className="only-executive"
              style={{ fontSize: 18, color: "var(--ink)", lineHeight: 1.4 }}
            >
              AI &amp; product engineer
              <br />
              shipping complete platforms
            </div>
            <div
              className="only-technical"
              style={{ fontSize: 18, color: "var(--ink)", lineHeight: 1.4 }}
            >
              AI &amp; product engineer
              <br />
              Next.js · SwiftUI · Node · MCP
            </div>
          </div>

          <div style={{ flex: "1 1 380px", maxWidth: 640 }}>
            <div className="kicker" style={{ marginBottom: 10 }}>
              En sus propias palabras
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "var(--display-italic)",
                fontWeight: "var(--display-weight)" as unknown as number,
                fontSize: "clamp(20px, 2.4vw, 28px)",
                lineHeight: 1.35,
                color: "var(--ink)",
                margin: 0,
                textWrap: "pretty",
              }}
            >
              &ldquo;Innovation distinguishes between a leader and a
              follower&rdquo; ~ Steve Jobs.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={240}>
        <div
          style={{
            position: "absolute",
            bottom: "clamp(32px, 5vh, 64px)",
            left: "clamp(20px, 4vw, 40px)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span>Scroll</span>
          <span
            aria-hidden
            style={{ width: 32, height: 1, background: "var(--ink-3)" }}
          />
        </div>
      </Reveal>

      {/* hidden contact for SEO */}
      <span className="sr-only">{profile.email}</span>
    </section>
  );
}
