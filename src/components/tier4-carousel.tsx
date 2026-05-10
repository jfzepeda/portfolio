import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";
import { tier4, categoryLabels } from "@/data/projects";
import type { Tier4Project, Category } from "@/data/projects";

function CategoryGlyph({ category }: { category: Category }) {
  const props = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (category) {
    case "enterprise":
      return (
        <svg {...props}>
          <rect x="4" y="4" width="7" height="7" />
          <rect x="13" y="4" width="7" height="7" />
          <rect x="4" y="13" width="7" height="7" />
          <rect x="13" y="13" width="7" height="7" />
        </svg>
      );
    case "ai":
      return (
        <svg {...props}>
          <path d="M12 3 l2.2 5.6 L20 11 l-5.8 2.4 L12 19 l-2.2 -5.6 L4 11 l5.8 -2.4 z" />
        </svg>
      );
    case "web":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12 h17 M12 3.5 a13 13 0 0 1 0 17 M12 3.5 a13 13 0 0 0 0 17" />
        </svg>
      );
    case "swift":
      return (
        <svg {...props}>
          <path d="M5 7 q7 4 14 13" />
          <path d="M5 17 q7 -4 14 -13" />
        </svg>
      );
    case "automation":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3 v3 M12 18 v3 M3 12 h3 M18 12 h3 M5.5 5.5 l2.1 2.1 M16.4 16.4 l2.1 2.1 M5.5 18.5 l2.1 -2.1 M16.4 7.6 l2.1 -2.1" />
        </svg>
      );
    case "experimental":
      return (
        <svg {...props}>
          <path d="M9 3 h6 M10 3 v6 l-5 9 a2 2 0 0 0 1.8 3 h10.4 a2 2 0 0 0 1.8 -3 l-5 -9 v-6" />
        </svg>
      );
  }
}

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
          title={
            <>
              {Math.floor(tier4.length / 5) * 5}+ smaller pieces, prototypes,
              and tools.
            </>
          }
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

function Tier4Card({
  project,
  index,
}: {
  project: Tier4Project;
  index: number;
}) {
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
          color: "var(--ink-2)",
        }}
      >
        <CategoryGlyph category={project.category} />
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
