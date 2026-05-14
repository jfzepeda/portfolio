import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";

// Pro-mode-only Process section — 6 numbered steps showing how a project
// actually moves from first conversation to live system. Lowers risk
// perception for non-technical buyers.

interface Step {
  n: string;
  title: string;
  blurb: string;
  artifact: string; // what the client receives at this stage
}

const STEPS: Step[] = [
  {
    n: "01",
    title: "Analysis",
    blurb:
      "A long call about the real problem: who lives with it, what it costs today, what happens if it isn't solved. I map processes and data before talking about technology.",
    artifact: "Written diagnosis · 1–3 days",
  },
  {
    n: "02",
    title: "Proposal",
    blurb:
      "Scope, deliverables, milestones, and a fixed price. No surprises mid-project. If something grows, it gets renegotiated explicitly.",
    artifact: "Proposal + milestone plan",
  },
  {
    n: "03",
    title: "Development",
    blurb:
      "I iterate in short sprints, showing real progress in every one. Your team watches the system grow; no black boxes.",
    artifact: "Access to a test build from week 1",
  },
  {
    n: "04",
    title: "Testing",
    blurb:
      "Tests with real data, edge cases, and the flows your operation runs daily. When something breaks, it has to break here — not in production.",
    artifact: "Test report + fixes",
  },
  {
    n: "05",
    title: "Deployment",
    blurb:
      "Controlled rollout with rollback ready. I hand over operations documentation and a live walkthrough with your team.",
    artifact: "System in production + documentation",
  },
  {
    n: "06",
    title: "Support",
    blurb:
      "Post-launch support with an agreed SLA. Fast resolution, prioritized improvements, and monthly reports if you need them.",
    artifact: "SLA + direct communication channel",
  },
];

export function Process() {
  return (
    <section
      id="process"
      className="only-executive"
      style={{
        padding: "var(--section-y) clamp(20px, 4vw, 40px)",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <SectionHeader
        n="03"
        kicker="How I work"
        title="Six steps from first call to live system."
        subtitle="No surprises, no black boxes. Every milestone ships a concrete deliverable."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "clamp(16px, 2vw, 20px)",
        }}
      >
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 50}>
            <article
              className="paper-card"
              style={{
                padding: "clamp(20px, 2vw, 26px)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <span
                  className="text-display"
                  style={{
                    fontSize: 38,
                    color: "var(--accent)",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.n}
                </span>
                <span aria-hidden className="kicker" style={{ fontSize: 10 }}>
                  Step {i + 1} of {STEPS.length}
                </span>
              </div>
              <h3
                className="text-display"
                style={{
                  fontSize: 22,
                  lineHeight: 1.1,
                  margin: 0,
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  color: "var(--ink-2)",
                  margin: 0,
                }}
              >
                {s.blurb}
              </p>
              <div
                style={{
                  marginTop: "auto",
                  paddingTop: 12,
                  borderTop: "1px solid var(--rule)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--ink-3)",
                  letterSpacing: "0.04em",
                }}
              >
                ↳ {s.artifact}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
