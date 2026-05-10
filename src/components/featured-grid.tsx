import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";
import { tier2, tier3 } from "@/data/projects";
import { ProjectCard } from "./project-card";

// Tier 2 + Tier 3 — paper case-study grid.

export function FeaturedGrid() {
  return (
    <section
      id="projects"
      style={{
        padding: "var(--section-y) clamp(20px, 4vw, 40px)",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <SectionHeader
        n="05"
        kicker="Selected work"
        title="Things I've built recently."
        subtitle="Each one is a real product: shipped, used, and built end-to-end. Toggle Technical for stack and architecture detail."
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "clamp(28px, 3.5vw, 44px)",
        }}
      >
        {/* TIER 2 */}
        <div>
          <Reveal>
            <div
              className="kicker"
              style={{
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ color: "var(--accent)" }}>✦</span>
              Featured deep
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "var(--gap)",
            }}
          >
            {tier2.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        </div>

        {/* TIER 3 */}
        <div>
          <Reveal>
            <div
              className="kicker"
              style={{
                marginBottom: 16,
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ color: "var(--accent)" }}>✦</span>
              Featured
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "var(--gap)",
            }}
          >
            {tier3.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
