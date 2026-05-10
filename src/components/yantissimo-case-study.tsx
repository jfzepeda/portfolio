import { yantissimo } from "@/data/projects";

// Tier-1 hero case study. Detail every product as its own subsection.

export function YantissimoCaseStudy() {
  const p = yantissimo;

  return (
    <section
      id="yantissimo"
      className="relative py-24 lg:py-32"
      aria-labelledby="yantissimo-title"
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        {/* section eyebrow */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="h-[2px] w-12"
            style={{ background: "var(--accent)" }}
          />
          <span
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{ color: "var(--accent)" }}
          >
            Tier 1 — Hero Platform · {p.recencyLabel}
          </span>
        </div>

        {/* HERO */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-10 lg:gap-16 items-start mb-20">
          <div>
            <h2
              id="yantissimo-title"
              className="text-display"
              style={{ fontSize: "clamp(40px, 7vw, 88px)" }}
            >
              {p.name}
            </h2>
            <p
              className="mt-6 text-[18px] lg:text-[20px] leading-[1.5]"
              style={{ color: "var(--fg-muted)" }}
            >
              {p.tagline}
            </p>

            {/* split copy */}
            <div className="mt-10">
              <div className="only-executive">
                <h3
                  className="text-[15px] mb-3"
                  style={{ color: "var(--accent)" }}
                >
                  {p.executive.headline}
                </h3>
                <p
                  className="text-[16px] lg:text-[17px] leading-[1.7] max-w-[680px]"
                  style={{ color: "var(--fg)" }}
                >
                  {p.executive.summary}
                </p>
                <ul className="mt-8 space-y-3 max-w-[680px]">
                  {p.executive.outcomes.map((o, i) => (
                    <li
                      key={i}
                      className="text-[15px] leading-[1.6] flex gap-3"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      <span
                        aria-hidden
                        className="mt-[10px] inline-block w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: "var(--accent)" }}
                      />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="only-technical">
                <h3
                  className="text-[15px] mb-3"
                  style={{ color: "var(--accent)" }}
                >
                  {p.technical.headline}
                </h3>
                <p
                  className="text-[16px] lg:text-[17px] leading-[1.7] max-w-[680px]"
                  style={{ color: "var(--fg)" }}
                >
                  {p.technical.summary}
                </p>
                <p
                  className="mt-5 text-[15px] leading-[1.7] max-w-[680px]"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {p.technical.architecture}
                </p>
                <ul
                  className="mt-6 text-[14px] leading-[1.6] space-y-2 max-w-[680px]"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {p.technical.highlights.map((h, i) => (
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
            </div>
          </div>

          {/* right: facts panel */}
          <aside
            className="surface p-6 lg:p-7 sticky top-24"
            style={{ borderRadius: "var(--radius-xl)" }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.18em] mb-4"
              style={{ color: "var(--fg-subtle)" }}
            >
              At a glance
            </div>
            <dl className="space-y-3 text-[13px]">
              <FactRow label="Domain" value={p.domain} />
              <FactRow label="Status" value={p.status} accent />
              <FactRow label="Year" value={String(p.year)} mono />
              <FactRow label="Scale" value={p.scaleSignal} mono small />
              <FactRow label="Surfaces" value="iOS · Backend · Storefront" />
              <FactRow label="Users" value={p.users} small />
            </dl>

            <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
              <div
                className="text-[10px] uppercase tracking-[0.18em] mb-3"
                style={{ color: "var(--fg-subtle)" }}
              >
                Capabilities
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.capabilities.map((c) => (
                  <span key={c} className="tag">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* SUBPRODUCTS */}
        {p.subproducts && (
          <div className="mt-16">
            <div
              className="text-[11px] uppercase tracking-[0.18em] mb-8"
              style={{ color: "var(--fg-subtle)" }}
            >
              Three products, one platform
            </div>
            <div className="space-y-6">
              {p.subproducts.map((sp, i) => (
                <article
                  key={sp.name}
                  className="surface premium-card p-7 lg:p-9 grid lg:grid-cols-[200px_1fr] gap-6 lg:gap-10"
                  style={{
                    borderRadius: "var(--radius-xl)",
                    ["--tier-grad" as string]:
                      i === 0
                        ? "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)"
                        : i === 1
                          ? "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)"
                          : "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)",
                  }}
                >
                  <div>
                    <div
                      className="text-[10px] uppercase tracking-[0.18em] mb-2"
                      style={{ color: "var(--fg-subtle)" }}
                    >
                      Product {i + 1}
                    </div>
                    <h4
                      className="text-[22px] lg:text-[26px] leading-[1.05]"
                      style={{
                        fontFamily: "var(--font-display)",
                        letterSpacing: "-0.02em",
                        color: "var(--fg)",
                      }}
                    >
                      {sp.name}
                    </h4>
                    <p
                      className="mt-2 text-[12px]"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      {sp.role}
                    </p>
                    <p
                      className="mt-3 text-[11px] text-mono"
                      style={{ color: "var(--accent)" }}
                    >
                      {sp.scale}
                    </p>
                  </div>

                  <div>
                    <ul
                      className="text-[14px] leading-[1.6] space-y-2 mb-5"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      {sp.highlights.map((h, hi) => (
                        <li key={hi} className="flex gap-3">
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
                    <div className="flex flex-wrap gap-1.5">
                      {sp.stack.map((s) => (
                        <span key={s} className="tag">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function FactRow({
  label,
  value,
  mono,
  accent,
  small,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3 items-baseline">
      <dt
        className="text-[10px] uppercase tracking-[0.14em] flex-shrink-0"
        style={{ color: "var(--fg-subtle)" }}
      >
        {label}
      </dt>
      <dd
        className={`text-right ${small ? "text-[12px]" : "text-[13px]"}`}
        style={{
          color: accent ? "var(--accent)" : "var(--fg)",
          fontFamily: mono ? "var(--font-mono)" : undefined,
          fontSize: mono ? 11 : undefined,
        }}
      >
        {value}
      </dd>
    </div>
  );
}
