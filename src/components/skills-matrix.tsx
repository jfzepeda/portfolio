import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";
import { skillGroups } from "@/data/profile";

// Warm-paper card grid. Mono header + accent dot + display-font group title +
// monospace tag pills, paired with proficiency dots in tabular numerals.

const profDots: Record<"expert" | "strong" | "working", string> = {
  expert: "●●●",
  strong: "●●○",
  working: "●○○",
};

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
        kicker="Stack"
        title="The tools, in plain language."
        subtitle="Working stack across AI, web, native, and infrastructure. Marker reads — ●●● expert · ●●○ strong · ●○○ working."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "var(--gap)",
        }}
      >
        {skillGroups.map((g, i) => (
          <Reveal key={g.name} delay={i * 60}>
            <div
              className="paper-card paper-card-hover"
              style={{
                padding: "clamp(20px, 2vw, 28px)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 16,
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
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--ink-3)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {String(skillGroups.length).padStart(2, "0")}
                </div>
                <span
                  aria-hidden
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--accent)",
                  }}
                />
              </div>
              <div
                className="text-display"
                style={{
                  fontSize: 26,
                  lineHeight: 1.1,
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                }}
              >
                {g.name}
              </div>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: "var(--ink-2)",
                  margin: 0,
                }}
              >
                {g.description}
              </p>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginTop: 4,
                }}
              >
                {g.skills.map((s) => (
                  <li
                    key={s.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 12,
                      paddingTop: 8,
                      borderTop: "1px solid var(--rule)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--ink)",
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.name}
                    </span>
                    <span
                      title={s.proficiency}
                      aria-label={`${s.proficiency} proficiency`}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        letterSpacing: "0.04em",
                        color:
                          s.proficiency === "expert"
                            ? "var(--accent)"
                            : "var(--ink-3)",
                        flexShrink: 0,
                      }}
                    >
                      {profDots[s.proficiency]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
