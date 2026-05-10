import { capabilityPillars } from "@/data/profile";

// Bento-grid layout: first pillar is the "hero" (2x), rest are standard.
// Apple-style modular showcase.

const bentoLayout = [
  "lg:col-span-2 lg:row-span-2", // Complete Platforms — hero
  "lg:col-span-1 lg:row-span-1", // AI-Native
  "lg:col-span-1 lg:row-span-1", // Self-Hosted
  "lg:col-span-2 lg:row-span-1", // Native iOS — wide
];

export function CapabilityPillars() {
  return (
    <section
      id="what-i-do"
      className="py-24 lg:py-28 only-executive"
      aria-labelledby="pillars-title"
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
            What I do
          </span>
        </div>
        <h2
          id="pillars-title"
          className="text-display max-w-[860px]"
          style={{ fontSize: "clamp(36px, 5.5vw, 64px)" }}
        >
          End-to-end product engineering with an AI-native bias.
        </h2>

        <div className="mt-14 grid lg:grid-cols-3 lg:grid-rows-2 gap-4 lg:gap-5 auto-rows-fr">
          {capabilityPillars.map((p, i) => {
            const isHero = i === 0;
            return (
              <article
                key={p.id}
                className={`premium-card surface ${bentoLayout[i] ?? ""} p-7 lg:p-8 flex flex-col`}
                style={{
                  borderRadius: "var(--radius-xl)",
                  // hero gets accent gradient backdrop
                  ["--tier-grad" as string]: isHero
                    ? "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)"
                    : i === 1
                      ? "linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)"
                      : i === 2
                        ? "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)"
                        : "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
                }}
              >
                <div className="flex items-start justify-between mb-5">
                  <span
                    className="text-[10px] uppercase tracking-[0.18em]"
                    style={{ color: "var(--fg-subtle)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {isHero && (
                    <span
                      className="text-[10px] uppercase tracking-[0.14em]"
                      style={{ color: "var(--accent)" }}
                    >
                      ★ Featured
                    </span>
                  )}
                </div>
                <h3
                  className={`mb-3 ${isHero ? "text-[28px] lg:text-[34px]" : "text-[22px] lg:text-[24px]"}`}
                  style={{
                    fontFamily: "var(--font-display)",
                    letterSpacing: "-0.02em",
                    color: "var(--fg)",
                    lineHeight: 1.05,
                  }}
                >
                  {p.title}
                </h3>
                <p
                  className={`leading-[1.65] mb-5 ${isHero ? "text-[15px]" : "text-[13.5px]"}`}
                  style={{ color: "var(--fg-muted)" }}
                >
                  {p.description}
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5">
                  {p.examples.map((e) => (
                    <span key={e} className="tag tag-accent">
                      {e}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
