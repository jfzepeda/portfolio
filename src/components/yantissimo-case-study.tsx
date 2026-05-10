import { Reveal } from "./reveal";
import { SectionHeader, PaperPlaceholder } from "./section-header";
import { yantissimo } from "@/data/projects";

// Tier-1 hero case study, warm-paper style. Wide intro + 3 subproduct rows.

export function YantissimoCaseStudy() {
  const p = yantissimo;

  return (
    <section
      id="yantissimo"
      style={{
        padding: "var(--section-y) clamp(20px, 4vw, 40px)",
        maxWidth: 1180,
        margin: "0 auto",
      }}
    >
      <SectionHeader
        n="04"
        kicker="Flagship platform"
        title={
          <>
            Yantissimo. <em>Three products,</em> one platform.
          </>
        }
        subtitle={p.tagline}
      />

      <div
        className="collapse-mobile"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: "clamp(32px, 5vw, 64px)",
          alignItems: "start",
          marginBottom: "clamp(48px, 6vw, 80px)",
        }}
      >
        <Reveal>
          <div
            className="only-executive"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--gap)",
            }}
          >
            <p
              style={{
                fontSize: "clamp(17px, 1.6vw, 20px)",
                lineHeight: 1.55,
                color: "var(--ink)",
                margin: 0,
                textWrap: "pretty",
              }}
            >
              {p.executive.headline}
            </p>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.65,
                color: "var(--ink-2)",
                margin: 0,
              }}
            >
              {p.executive.summary}
            </p>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {p.executive.outcomes.map((o, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.55,
                    color: "var(--ink-2)",
                    paddingLeft: 18,
                    position: "relative",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 11,
                      width: 8,
                      height: 1,
                      background: "var(--accent)",
                    }}
                  />
                  {o}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="only-technical"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--gap)",
            }}
          >
            <p
              style={{
                fontSize: "clamp(17px, 1.6vw, 20px)",
                lineHeight: 1.55,
                color: "var(--ink)",
                margin: 0,
                textWrap: "pretty",
              }}
            >
              {p.technical.headline}
            </p>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.65,
                color: "var(--ink-2)",
                margin: 0,
              }}
            >
              {p.technical.summary}
            </p>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.65,
                color: "var(--ink-2)",
                margin: 0,
              }}
            >
              {p.technical.architecture}
            </p>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {p.technical.highlights.map((h, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    color: "var(--ink-2)",
                    paddingLeft: 16,
                    position: "relative",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 9,
                      width: 8,
                      height: 1,
                      background: "var(--accent)",
                    }}
                  />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <aside
            className="paper-card"
            style={{
              padding: "clamp(20px, 2vw, 28px)",
              position: "sticky",
              top: 100,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--ink-3)",
                marginBottom: 14,
              }}
            >
              At a glance
            </div>
            <dl
              style={{
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                fontSize: 13,
              }}
            >
              {/* Domain / Status / Year / Surfaces — shown in BOTH modes */}
              {[
                ["Domain", p.domain],
                ["Status", p.status],
                ["Year", String(p.year)],
                ["Surfaces", "iOS · Backend · Storefront"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    paddingBottom: 8,
                    borderBottom: "1px solid var(--rule)",
                  }}
                >
                  <dt
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--ink-3)",
                      flexShrink: 0,
                    }}
                  >
                    {k}
                  </dt>
                  <dd
                    style={{
                      margin: 0,
                      textAlign: "right",
                      color:
                        k === "Status" ? "var(--accent)" : "var(--ink)",
                      fontFamily:
                        k === "Year" ? "var(--font-mono)" : undefined,
                      fontSize: k === "Year" ? 11 : 13,
                    }}
                  >
                    {v}
                  </dd>
                </div>
              ))}
              {/* Scale signal — TECHNICAL ONLY */}
              <div
                className="only-technical"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  paddingBottom: 8,
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                <dt
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--ink-3)",
                    flexShrink: 0,
                  }}
                >
                  Scale
                </dt>
                <dd
                  style={{
                    margin: 0,
                    textAlign: "right",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--ink)",
                  }}
                >
                  {p.scaleSignal}
                </dd>
              </div>
            </dl>
            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              {p.capabilities.slice(0, 8).map((c) => (
                <span key={c} className="tag tag-accent">
                  {c}
                </span>
              ))}
            </div>
          </aside>
        </Reveal>
      </div>

      {/* SUBPRODUCTS */}
      {p.subproducts && (
        <div>
          <div
            className="kicker"
            style={{
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ color: "var(--accent)" }}>✦</span>
            Three coordinated products
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "clamp(20px, 2vw, 24px)",
            }}
          >
            {p.subproducts.map((sp, i) => (
              <Reveal key={sp.name} delay={i * 60}>
                <article
                  className="paper-card collapse-mobile"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.6fr)",
                    gap: "clamp(20px, 3vw, 40px)",
                    padding: "clamp(20px, 2vw, 28px)",
                    alignItems: "start",
                  }}
                >
                  <div>
                    <PaperPlaceholder
                      label={`Product 0${i + 1}`}
                      ratio="4/3"
                    />
                    <div
                      className="kicker"
                      style={{ marginTop: 12, fontSize: 10 }}
                    >
                      {sp.role}
                    </div>
                    <h4
                      className="text-display"
                      style={{
                        marginTop: 4,
                        fontSize: 22,
                        lineHeight: 1.05,
                        color: "var(--ink)",
                      }}
                    >
                      {sp.name}
                    </h4>
                    {/* scale numbers — TECHNICAL ONLY */}
                    <div
                      className="only-technical"
                      style={{
                        marginTop: 6,
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--accent)",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {sp.scale}
                    </div>
                  </div>

                  <div>
                    {/* EXECUTIVE: only the first highlight as a one-line value
                        prop. No engineering bullets, no stack pills. */}
                    <p
                      className="only-executive"
                      style={{
                        margin: 0,
                        fontSize: 15,
                        lineHeight: 1.6,
                        color: "var(--ink)",
                      }}
                    >
                      {sp.highlights[0]}
                    </p>

                    {/* TECHNICAL: full highlight list + stack pills */}
                    <div className="only-technical">
                      <ul
                        style={{
                          margin: 0,
                          padding: 0,
                          listStyle: "none",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          marginBottom: 16,
                        }}
                      >
                        {sp.highlights.map((h, j) => (
                          <li
                            key={j}
                            style={{
                              fontSize: 14,
                              lineHeight: 1.55,
                              color: "var(--ink-2)",
                              paddingLeft: 16,
                              position: "relative",
                            }}
                          >
                            <span
                              aria-hidden
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 10,
                                width: 8,
                                height: 1,
                                background: "var(--accent)",
                              }}
                            />
                            {h}
                          </li>
                        ))}
                      </ul>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                        }}
                      >
                        {sp.stack.map((s) => (
                          <span
                            key={s}
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 11,
                              padding: "3px 8px",
                              color: "var(--ink-3)",
                              border: "1px solid var(--rule)",
                              borderRadius: 999,
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
