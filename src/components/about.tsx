import { Reveal } from "./reveal";
import { SectionHeader, PaperPlaceholder } from "./section-header";
import { profile } from "@/data/profile";

const QUICK_FACTS: [string, string][] = [
  ["Based in", profile.location],
  ["Open to", "Remote / Hybrid · Senior IC"],
  ["Studying", "Data Science"],
  ["Speaks", "ES · EN"],
];

export function About() {
  return (
    <section
      id="about"
      style={{
        padding: "var(--section-y) clamp(20px, 4vw, 40px)",
        maxWidth: 1180,
        margin: "0 auto",
      }}
    >
      <SectionHeader
        n="01"
        kicker="About"
        title={
          <>
            A builder of <em>useful</em> things — from native iOS to AI agents.
          </>
        }
      />

      <div
        className="collapse-mobile"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)",
          gap: "clamp(32px, 5vw, 80px)",
          alignItems: "start",
        }}
      >
        <Reveal>
          <div style={{ position: "sticky", top: 100 }}>
            <PaperPlaceholder label="Headshot · 4:5" ratio="4/5" />
            <div
              className="kicker"
              style={{ marginTop: 16, letterSpacing: "0.08em" }}
            >
              [ portrait placeholder ]
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--gap)",
            }}
          >
            <p
              style={{
                fontSize: "clamp(18px, 1.8vw, 22px)",
                lineHeight: 1.5,
                color: "var(--ink)",
                margin: 0,
                textWrap: "pretty",
              }}
            >
              I build complete platforms — front-end, back-end, mobile, agents,
              and the infrastructure that ties them together. Native iOS,
              Next.js, Node.js APIs, real-time systems, and AI-native
              architectures (RAG, function calling, MCP servers, multi-agent
              orchestration).
            </p>
            <p
              style={{
                fontSize: "clamp(16px, 1.4vw, 18px)",
                lineHeight: 1.65,
                color: "var(--ink-2)",
                margin: 0,
                textWrap: "pretty",
              }}
            >
              My flagship is the Yantissimo platform — a tire and wheel
              distributor's complete digital stack: native iOS app, Express
              backend, headless Shopify storefront. I built all three. I move
              and iterate fast. I prefer leverage over surface area: a single
              self-hosted gateway over per-agent BSPs, a pure-logic core
              package over duplicated UI logic, a hand-written iOS APIClient
              over a third-party SDK.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 24,
                marginTop: 16,
                paddingTop: 24,
                borderTop: "1px solid var(--rule)",
              }}
            >
              {QUICK_FACTS.map(([k, v]) => (
                <div key={k}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--ink-3)",
                      marginBottom: 6,
                    }}
                  >
                    {k}
                  </div>
                  <div style={{ fontSize: 15, color: "var(--ink)" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
