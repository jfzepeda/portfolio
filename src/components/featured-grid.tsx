import { tier2, tier3 } from "@/data/projects";
import { ProjectCard } from "./project-card";

// Tier 2 + Tier 3 displayed as a single "Featured Work" section.
// Tier 2 cards are full-width; Tier 3 cards are full-width but visually
// lighter — controlled inside ProjectCard via tier-N CSS class.

export function FeaturedGrid() {
  return (
    <section
      id="work"
      className="py-24 lg:py-28"
      aria-labelledby="work-title"
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-8">
          <div
            className="h-[2px] w-12"
            style={{ background: "var(--accent)" }}
          />
          <span
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{ color: "var(--accent)" }}
          >
            Featured work
          </span>
        </div>
        <h2
          id="work-title"
          className="text-display max-w-[860px]"
          style={{ fontSize: "clamp(36px, 5.5vw, 64px)" }}
        >
          Nine featured projects beyond the flagship.
        </h2>
        <p
          className="mt-5 max-w-[680px] text-[15px] leading-[1.55]"
          style={{ color: "var(--fg-muted)" }}
        >
          <span className="only-executive">
            Each one is a real product: shipped, used, and built end-to-end.
            Toggle Technical for stack and architecture detail.
          </span>
          <span className="only-technical">
            Tap any card's “Architecture &amp; implementation” to expand the
            technical detail. Stacks are listed at the bottom of each card.
          </span>
        </p>

        {/* TIER 2 */}
        <div
          className="mt-14 mb-3 text-[11px] uppercase tracking-[0.18em]"
          style={{ color: "var(--fg-subtle)" }}
        >
          Tier 2 — Featured deep
        </div>
        <div className="space-y-5">
          {tier2.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>

        {/* TIER 3 */}
        <div
          className="mt-16 mb-3 text-[11px] uppercase tracking-[0.18em]"
          style={{ color: "var(--fg-subtle)" }}
        >
          Tier 3 — Featured
        </div>
        <div className="space-y-5">
          {tier3.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
