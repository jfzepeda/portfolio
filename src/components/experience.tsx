import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";
import { experience } from "@/data/profile";

export function Experience() {
  return (
    <section
      id="experience"
      style={{
        padding: "var(--section-y) clamp(20px, 4vw, 40px)",
        maxWidth: 1180,
        margin: "0 auto",
      }}
    >
      <SectionHeader n="03" kicker="Work" title="Where I've shipped." />

      <div style={{ display: "flex", flexDirection: "column" }}>
        {experience.map((row, i) => (
          <Reveal key={`${row.role}-${i}`} delay={i * 60}>
            <div
              className="exp-row"
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr auto",
                gap: "clamp(20px, 4vw, 56px)",
                padding: "clamp(28px, 3.5vw, 44px) 0",
                borderTop: "1px solid var(--rule)",
                borderBottom:
                  i === experience.length - 1 ? "1px solid var(--rule)" : "none",
                alignItems: "start",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  letterSpacing: "0.08em",
                  color: "var(--ink-3)",
                  paddingTop: 6,
                }}
              >
                {row.when}
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <h3
                    className="text-display"
                    style={{
                      fontSize: "clamp(24px, 2.6vw, 34px)",
                      lineHeight: 1.1,
                      letterSpacing: "-0.01em",
                      margin: 0,
                      color: "var(--ink)",
                    }}
                  >
                    {row.role}
                  </h3>
                  <span style={{ color: "var(--ink-3)" }}>·</span>
                  <span style={{ fontSize: 16, color: "var(--ink-2)" }}>
                    {row.org}
                  </span>
                </div>

                <ul
                  style={{
                    margin: "14px 0 0 0",
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {row.bullets.map((b, j) => {
                    // Hide bullets that lead with "Stack:" in Executive.
                    const isTech = /^stack[:.]/i.test(b.trim());
                    return (
                      <li
                        key={j}
                        className={isTech ? "only-technical" : undefined}
                        style={{
                          fontSize: 15,
                          lineHeight: 1.55,
                          color: "var(--ink-2)",
                          paddingLeft: 18,
                          position: "relative",
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 11,
                            width: 8,
                            height: 1,
                            background: "var(--accent)",
                          }}
                        />
                        {b}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--ink-3)",
                  paddingTop: 10,
                  textAlign: "right",
                }}
              >
                {row.where}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
