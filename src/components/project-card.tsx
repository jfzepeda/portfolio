import type { Project } from "@/data/projects";

// Reusable project card for Tier 2 / Tier 3.
// Shows executive copy by default, swap with [data-mode="technical"] in CSS.
// Always renders BOTH variants for SEO/LLM scrapers.

export function ProjectCard({ project }: { project: Project }) {
  const tier = project.tier;
  return (
    <article
      id={project.slug}
      className={`tier-${tier} surface premium-card relative overflow-hidden`}
      style={{ borderRadius: "var(--radius-xl)" }}
      itemScope
      itemType="https://schema.org/CreativeWork"
    >
      {/* top accent bar (tier color via --tier-grad), subtly animated */}
      <div
        aria-hidden
        className="tier-bar absolute top-0 left-0 right-0 h-[2px] z-10"
      />

      <div className="grid lg:grid-cols-[280px_1fr] gap-0">
        {/* identity column */}
        <div
          className="p-8 lg:p-10 flex flex-col justify-between gap-8"
          style={{ borderRight: "1px solid var(--border)" }}
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span
                aria-hidden
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-[15px] font-semibold"
                style={{
                  background: "var(--tier-grad)",
                  color: "white",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {project.icon}
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.14em]"
                style={{ color: "var(--fg-subtle)" }}
              >
                Tier {tier} ·{" "}
                <span style={{ color: "var(--fg-muted)" }}>
                  {project.recencyLabel}
                </span>
              </span>
            </div>

            <h3
              className="text-[26px] lg:text-[30px] leading-[1.05] mb-3"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
                color: "var(--fg)",
              }}
              itemProp="name"
            >
              {project.name}
            </h3>

            <p
              className="text-[13px] leading-[1.55] mb-6"
              style={{ color: "var(--fg-muted)" }}
              itemProp="description"
            >
              {project.tagline}
            </p>

            {/* status pills */}
            <div className="flex flex-wrap gap-1.5">
              <span className="tag tag-accent">{project.status}</span>
              <span className="tag">{project.domain}</span>
            </div>
          </div>

          {/* scale signal */}
          <dl
            className="text-[11px] space-y-1.5 pt-6"
            style={{
              borderTop: "1px solid var(--border)",
              color: "var(--fg-muted)",
            }}
          >
            <div className="flex justify-between gap-2">
              <dt style={{ color: "var(--fg-subtle)" }}>Scale</dt>
              <dd
                className="text-right text-mono"
                style={{ color: "var(--fg)" }}
              >
                {project.scaleSignal}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt style={{ color: "var(--fg-subtle)" }}>Year</dt>
              <dd
                className="text-right text-mono"
                style={{ color: "var(--fg)" }}
                itemProp="dateCreated"
              >
                {project.year}
              </dd>
            </div>
          </dl>
        </div>

        {/* content column */}
        <div className="p-8 lg:p-10">
          {/* EXECUTIVE VARIANT */}
          <div className="only-executive">
            <h4
              className="text-[14px] mb-2"
              style={{ color: "var(--accent)" }}
            >
              {project.executive.headline}
            </h4>
            <p
              className="text-[15px] leading-[1.65] mb-6"
              style={{ color: "var(--fg)" }}
            >
              {project.executive.summary}
            </p>
            <ul className="space-y-2">
              {project.executive.outcomes.map((o, i) => (
                <li
                  key={i}
                  className="text-[13.5px] leading-[1.55] flex gap-3"
                  style={{ color: "var(--fg-muted)" }}
                >
                  <span
                    className="dot mt-[8px]"
                    aria-hidden
                    style={{ flexShrink: 0 }}
                  />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* TECHNICAL VARIANT */}
          <div className="only-technical">
            <h4
              className="text-[14px] mb-2"
              style={{ color: "var(--accent)" }}
            >
              {project.technical.headline}
            </h4>
            <p
              className="text-[15px] leading-[1.65] mb-5"
              style={{ color: "var(--fg)" }}
            >
              {project.technical.summary}
            </p>

            <details>
              <summary
                className="inline-flex items-center gap-2 text-[12px] py-2"
                style={{ color: "var(--fg-muted)" }}
              >
                <span className="chevron" aria-hidden>
                  ›
                </span>
                <span>Architecture &amp; implementation</span>
              </summary>
              <div className="mt-3 space-y-4">
                <p
                  className="text-[13.5px] leading-[1.65]"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {project.technical.architecture}
                </p>
                <ul
                  className="text-[13px] leading-[1.5] space-y-2"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {project.technical.highlights.map((h, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        aria-hidden
                        style={{ color: "var(--accent)", flexShrink: 0 }}
                      >
                        ›
                      </span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {project.stack.slice(0, 12).map((s) => (
                <span key={s} className="tag">
                  {s}
                </span>
              ))}
              {project.stack.length > 12 && (
                <span className="tag">+{project.stack.length - 12}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SEO/GEO machine-readable layer (always rendered, not visible) */}
      <div className="sr-only">
        <span itemProp="creator" itemScope itemType="https://schema.org/Person">
          <span itemProp="name">Juan Felipe Zepeda</span>
        </span>
        {project.stack.map((s) => (
          <span key={s} itemProp="keywords">
            {s}
          </span>
        ))}
        {project.capabilities.map((c) => (
          <span key={c} itemProp="keywords">
            {c}
          </span>
        ))}
      </div>
    </article>
  );
}
