import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";
import { techStack } from "@/data/profile";

// Tech-mode-only categorized stack. Domain-based (Backend / Frontend /
// Mobile / AI / Real-time / Cloud / Data / Auth) with a "shipped in"
// production-credit line per group. No proficiency dots, no skill bars —
// recruiters want concrete deployments, not self-reported levels.

export function SkillsMatrix() {
  return (
    <section
      id="skills"
      className="only-technical"
      style={{
        padding: "var(--section-y) clamp(20px, 4vw, 40px)",
        maxWidth: 1180,
        margin: "0 auto",
      }}
    >
      <SectionHeader
        n="02"
        kicker="Tech stack"
        title="What I work with — by domain, with proof of production."
        subtitle="No skill bars. Each group lists where it's shipped, in production, today."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "var(--gap)",
        }}
      >
        {techStack.map((g, i) => (
          <Reveal key={g.domain} delay={i * 50}>
            <article
              className="paper-card paper-card-hover"
              style={{
                padding: "clamp(20px, 2vw, 28px)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  className="kicker"
                  style={{
                    color: "var(--accent)",
                    letterSpacing: "0.16em",
                    fontSize: 11,
                  }}
                >
                  {String(i + 1).padStart(2, "0")} · {g.domain}
                </div>
                <span
                  aria-hidden
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: "var(--accent)",
                  }}
                />
              </div>
              <h3
                className="text-display"
                style={{
                  fontSize: 22,
                  lineHeight: 1.05,
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                  margin: 0,
                }}
              >
                {g.domain}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: "var(--ink-2)",
                  margin: 0,
                }}
              >
                {g.blurb}
              </p>

              {/* tag cloud — monospace */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {g.items.map((s) => (
                  <span
                    key={s}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      padding: "3px 9px",
                      color: "var(--ink-2)",
                      border: "1px solid var(--rule)",
                      borderRadius: 999,
                      background: "var(--paper)",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* production credit */}
              <div
                style={{
                  marginTop: "auto",
                  paddingTop: 12,
                  borderTop: "1px solid var(--rule)",
                }}
              >
                <div
                  className="kicker"
                  style={{ fontSize: 9.5, marginBottom: 6 }}
                >
                  Shipped in
                </div>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  {g.shippedIn.map((s) => (
                    <li
                      key={s}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        lineHeight: 1.5,
                        color: "var(--ink-3)",
                      }}
                    >
                      → {s}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
