import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";
import { tier4, categoryLabels } from "@/data/projects";
import type { Tier4Project } from "@/data/projects";

// Compact horizontal carousel of all remaining projects.
// Mono labels, terracotta numerals, monospace stack list.

export function Tier4Carousel() {
  return (
    <section
      id="more"
      style={{
        padding: "var(--section-y) 0",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <div style={{ padding: "0 clamp(20px, 4vw, 40px)" }}>
        <SectionHeader
          n="06"
          kicker="More work"
          title={<>{tier4.length}+ smaller pieces, prototypes, and tools.</>}
          subtitle="Internal tools, prototypes, agents, and enterprise pieces. Each one shipped, demo'd, or used. Scroll to scan."
        />
      </div>

      <Reveal>
        <div
          className="carousel"
          style={{
            display: "flex",
            gap: 16,
            padding: "8px clamp(20px, 4vw, 40px) 24px",
            overflowX: "auto",
          }}
          aria-label="More projects"
        >
          {tier4.map((p, i) => (
            <Tier4Card key={p.id} project={p} index={i} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Tier4Card({ project, index }: { project: Tier4Project; index: number }) {
  return (
    <article
      className="paper-card paper-card-hover"
      style={{
        width: 290,
        padding: 22,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        cursor: "default",
      }}
      itemScope
      itemType="https://schema.org/CreativeWork"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--ink-3)",
        }}
      >
        <span style={{ color: "var(--accent)" }}>
          № {String(index + 1).padStart(2, "0")}
        </span>
        <span>{categoryLabels[project.category]}</span>
      </div>

      <div
        aria-hidden
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 38,
          height: 38,
          borderRadius: 8,
          background: "var(--paper)",
          border: "1px solid var(--rule)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 500,
          color: "var(--ink-2)",
        }}
      >
        {project.icon}
      </div>

      <div>
        <h3
          className="text-display"
          style={{
            fontSize: 20,
            lineHeight: 1.1,
            margin: "0 0 6px 0",
            color: "var(--ink)",
            letterSpacing: "-0.01em",
          }}
          itemProp="name"
        >
          {project.name}
        </h3>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.55,
            color: "var(--ink-2)",
            margin: 0,
          }}
          itemProp="description"
        >
          {project.description}
        </p>
      </div>

      {project.stack && (
        <div
          className="only-technical"
          style={{
            marginTop: "auto",
            paddingTop: 10,
            borderTop: "1px solid var(--rule)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.04em",
            color: "var(--ink-3)",
            lineHeight: 1.5,
          }}
        >
          {project.stack.slice(0, 3).join(" · ")}
          {project.stack.length > 3 && ` · +${project.stack.length - 3}`}
        </div>
      )}

      <span className="sr-only">
        {project.stack?.map((s) => (
          <span key={s} itemProp="keywords">
            {s}
          </span>
        ))}
      </span>
    </article>
  );
}
