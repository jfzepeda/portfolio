import { skillGroups } from "@/data/profile";

const profFill: Record<"expert" | "strong" | "working", string> = {
  expert: "100%",
  strong: "66%",
  working: "33%",
};

const profLabel: Record<"expert" | "strong" | "working", string> = {
  expert: "Expert",
  strong: "Strong",
  working: "Working",
};

export function SkillsMatrix() {
  return (
    <section
      id="skills"
      className="py-24 lg:py-32"
      aria-labelledby="skills-title"
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-8">
          <div
            className="h-[2px] w-12"
            style={{ background: "var(--fg-subtle)" }}
          />
          <span
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{ color: "var(--fg-subtle)" }}
          >
            Skills matrix
          </span>
        </div>
        <h2
          id="skills-title"
          className="text-display max-w-[860px]"
          style={{ fontSize: "clamp(36px, 5.5vw, 64px)" }}
        >
          A working stack across AI, web, native, and infrastructure.
        </h2>
        <p
          className="mt-5 max-w-[680px] text-[15px] leading-[1.55]"
          style={{ color: "var(--fg-muted)" }}
        >
          A working stack across AI, web, native, and infrastructure. Proficiency:
          <span className="inline-flex items-center gap-1.5 ml-2">
            <span
              className="prof-bar"
              style={{ ["--prof-fill" as string]: "100%" } as React.CSSProperties}
            />
            <span style={{ color: "var(--fg)" }}>Expert</span>
          </span>
          <span className="inline-flex items-center gap-1.5 ml-2">
            <span
              className="prof-bar"
              style={{ ["--prof-fill" as string]: "66%" } as React.CSSProperties}
            />
            <span>Strong</span>
          </span>
          <span className="inline-flex items-center gap-1.5 ml-2">
            <span
              className="prof-bar"
              style={{ ["--prof-fill" as string]: "33%" } as React.CSSProperties}
            />
            <span>Working</span>
          </span>
          .
        </p>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {skillGroups.map((g) => (
            <div
              key={g.name}
              className="surface premium-card p-6"
              style={{
                borderRadius: "var(--radius-lg)",
                ["--tier-grad" as string]:
                  "linear-gradient(135deg, #f59e0b 0%, #a78bfa 100%)",
              }}
            >
              <h3
                className="text-[16px] mb-1"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.01em",
                  color: "var(--fg)",
                }}
              >
                {g.name}
              </h3>
              <p
                className="text-[12px] mb-5"
                style={{ color: "var(--fg-muted)" }}
              >
                {g.description}
              </p>
              <ul className="space-y-2.5">
                {g.skills.map((s) => (
                  <li
                    key={s.name}
                    className="flex justify-between items-center gap-3 text-[13px]"
                  >
                    <div className="min-w-0">
                      <div style={{ color: "var(--fg)" }}>{s.name}</div>
                      {s.note && (
                        <div
                          className="text-[11px] truncate"
                          style={{ color: "var(--fg-subtle)" }}
                        >
                          {s.note}
                        </div>
                      )}
                    </div>
                    <span
                      className="prof-bar flex-shrink-0"
                      title={profLabel[s.proficiency]}
                      aria-label={`${profLabel[s.proficiency]} proficiency`}
                      style={
                        {
                          ["--prof-fill"]: profFill[s.proficiency],
                        } as React.CSSProperties
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
