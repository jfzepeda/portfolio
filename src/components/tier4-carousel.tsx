import { tier4, categoryColors } from "@/data/projects";
import type { Tier4Project } from "@/data/projects";

// Compact carousel for ~25+ smaller projects.
// Horizontal scroll with snap, mini cards, hover reveal.

export function Tier4Carousel() {
  return (
    <section
      id="more"
      className="py-24 lg:py-28"
      aria-labelledby="more-title"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="px-6 lg:px-10 mb-10 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="h-[2px] w-12"
                style={{ background: "var(--fg-subtle)" }}
              />
              <span
                className="text-[11px] uppercase tracking-[0.18em]"
                style={{ color: "var(--fg-subtle)" }}
              >
                Tier 4 — More work
              </span>
            </div>
            <h2
              id="more-title"
              className="text-display"
              style={{ fontSize: "clamp(32px, 5vw, 56px)" }}
            >
              {tier4.length}+ more projects across the lab.
            </h2>
            <p
              className="mt-4 max-w-[640px] text-[15px] leading-[1.55]"
              style={{ color: "var(--fg-muted)" }}
            >
              Internal tools, prototypes, agents, and enterprise pieces. Each
              one shipped, demo'd, or used. Scroll to scan.
            </p>
          </div>
          <div
            className="text-[12px] flex items-center gap-2"
            style={{ color: "var(--fg-subtle)" }}
          >
            <span aria-hidden>←</span>
            <span>scroll</span>
            <span aria-hidden>→</span>
          </div>
        </div>

        <div
          className="carousel flex gap-4 px-6 lg:px-10 pb-8 overflow-x-auto"
          aria-label="More projects"
        >
          {tier4.map((p) => (
            <Tier4Card key={p.id} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Tier-color gradient lookup for the carousel cards.
const CATEGORY_GRADIENTS: Record<string, string> = {
  enterprise: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
  ai: "linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)",
  web: "linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)",
  swift: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
  automation: "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)",
  experimental: "linear-gradient(135deg, #78716c 0%, #44403c 100%)",
};

function Tier4Card({ project }: { project: Tier4Project }) {
  const cat = categoryColors[project.category];
  const grad =
    CATEGORY_GRADIENTS[project.category] ?? CATEGORY_GRADIENTS.experimental;
  return (
    <article
      className="surface premium-card w-[280px] p-6 flex flex-col gap-4"
      style={{
        borderRadius: "var(--radius-lg)",
        ["--tier-grad" as string]: grad,
      }}
      itemScope
      itemType="https://schema.org/CreativeWork"
    >
      <div className="flex items-start justify-between">
        <span
          aria-hidden
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-[12px] font-semibold relative overflow-hidden"
          style={{
            background: grad,
            color: "white",
            fontFamily: "var(--font-mono)",
          }}
        >
          {project.icon}
        </span>
        <span
          className="text-[10px] uppercase tracking-[0.14em]"
          style={{ color: `var(--fg-subtle)` }}
          aria-label={`Category ${project.category}`}
        >
          {cat}
        </span>
      </div>

      <div>
        <h3
          className="text-[17px] leading-[1.2] mb-1.5"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--fg)",
            letterSpacing: "-0.01em",
          }}
          itemProp="name"
        >
          {project.name}
        </h3>
        <p
          className="text-[12.5px] leading-[1.5]"
          style={{ color: "var(--fg-muted)" }}
          itemProp="description"
        >
          {project.description}
        </p>
      </div>

      {project.stack && (
        <div
          className="mt-auto pt-3 text-[10px] text-mono leading-[1.5]"
          style={{
            borderTop: "1px solid var(--border)",
            color: "var(--fg-subtle)",
          }}
        >
          {project.stack.slice(0, 3).join(" · ")}
          {project.stack.length > 3 && ` · +${project.stack.length - 3}`}
        </div>
      )}

      {/* hidden tags for SEO */}
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
