import { Reveal } from "./reveal";
import { SectionHeader, PaperPlaceholder } from "./section-header";
import { ArchitectureDiagram } from "./architecture-diagram";
import { CodeSnippet } from "./code-snippet";
import { yantissimo } from "@/data/projects";

// Tier-1 hero case study, warm-paper style. Wide intro + 3 subproduct rows
// + (Tech) full case-study breakdown + (Pro) before/after value table.

export function YantissimoCaseStudy() {
  const p = yantissimo;

  return (
    <section
      id="yantissimo"
      style={{
        padding: "var(--section-y) clamp(20px, 4vw, 40px)",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <SectionHeader
        n="04"
        kicker="Flagship platform"
        title={
          <>
            Yantissimo. <em>One platform,</em> every surface.
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
                ["Surfaces", "ERP · Backend · iOS · Storefront"],
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
            Four coordinated products
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
                    {p.screenshots?.[i] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.screenshots[i]}
                        alt={`Product 0${i + 1}`}
                        loading="lazy"
                        decoding="async"
                        style={{
                          display: "block",
                          width: "100%",
                          height: "auto",
                        }}
                      />
                    ) : (
                      <PaperPlaceholder
                        label={`Product 0${i + 1}`}
                        ratio="4/3"
                      />
                    )}
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
                    {/* EXECUTIVE: business-oriented bullets. Outcome-led,
                        jargon-free. Sourced from sp.professionalHighlights,
                        rendered as a parallel list to the technical view
                        but a touch larger for executive scanning. */}
                    <ul
                      className="only-executive"
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {sp.professionalHighlights.map((h, j) => (
                        <li
                          key={j}
                          style={{
                            fontSize: 15,
                            lineHeight: 1.55,
                            color: "var(--ink)",
                            paddingLeft: 18,
                            position: "relative",
                            textWrap: "pretty",
                          }}
                        >
                          <span
                            aria-hidden
                            style={{
                              position: "absolute",
                              left: 0,
                              top: 11,
                              width: 10,
                              height: 1,
                              background: "var(--accent)",
                            }}
                          />
                          {h}
                        </li>
                      ))}
                    </ul>

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

      {/* ───── PRO: Before / After ───── */}
      <div
        className="only-executive"
        style={{ marginTop: "clamp(48px, 6vw, 80px)" }}
      >
        <Reveal>
          <div
            className="kicker"
            style={{
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ color: "var(--accent)" }}>✦</span>
            Before vs after — the operational impact
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div
            className="paper-card collapse-mobile"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              padding: 0,
              overflow: "hidden",
            }}
          >
            <BeforeAfterColumn
              kind="before"
              title="Before — manual operations"
              points={[
                "Customer support tied to business hours on WhatsApp.",
                "No app — customers couldn't see vehicles, appointments, or status.",
                "Quotes and bookings done by hand, in spreadsheets and messages.",
                "Catalog and pricing lived only in the sales team's heads.",
                "Payments coordinated manually, with no direct link.",
              ]}
            />
            <BeforeAfterColumn
              kind="after"
              title="Today — platform running 24/7"
              points={[
                "Customers self-serve 24/7: they browse, quote, book, and pay.",
                "Native iOS app with an eternal session and push reminders.",
                "Public storefront with vehicle search (make/model/year).",
                "Single Shopify catalog, synced across all three surfaces.",
                "AI agent on WhatsApp / Telegram triages and responds nonstop.",
              ]}
            />
          </div>
        </Reveal>
      </div>

      {/* ───── TECH: Problem · Tradeoffs · Results · Learnings ───── */}
      <div
        className="only-technical"
        style={{ marginTop: "clamp(56px, 7vw, 96px)" }}
      >
        <Reveal>
          <div
            className="kicker"
            style={{
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ color: "var(--accent)" }}>✦</span>
            Case study — engineering depth
          </div>
        </Reveal>

        <CaseStudyBlock
          n="A"
          title="Problem"
          body={
            <>
              The distributor had a real catalog, real customers on WhatsApp,
              and zero coordinated digital surface. Sales lived in the heads
              of three people; pricing changes lived in a spreadsheet;
              appointments were booked verbally. Building a unified front-end
              wasn't enough — the system had to integrate with the existing
              Shopify catalog, persist a session graph for thousands of
              customers, and stay reliable enough that an iOS client could
              cache it and open offline.
            </>
          }
        />

        <ArchitectureDiagram />

        <CaseStudyBlock
          n="B"
          title="Tradeoffs"
          body={
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {[
                [
                  "Express over Nest/Fastify",
                  "I traded a heavier framework's structure for surgical control over middleware and route composition. With 41 routes and a real test suite, the trade has paid off in audit speed.",
                ],
                [
                  "Zero-dep iOS APIClient",
                  "Skipped Alamofire/Moya so I owned the 401 refresh-retry semantics, the cache hydration order, and the eternal-session contract. Worth the extra ~300 LOC.",
                ],
                [
                  "Postgres + MySQL coexisting",
                  "Postgres for the new transactional layer; MySQL kept for legacy ETL while we migrate. Cheaper than a big-bang and recoverable per-table.",
                ],
                [
                  "Headless Shopify, not custom checkout",
                  "Shopify is the source of truth for catalog/checkout — building those from scratch would've been a year of compliance work. Storefront API + custom search wins instead.",
                ],
                [
                  "OpenAI tools with explicit budget",
                  "The Nexora agent uses OpenAI tool calling, but every conversation has hard turn + cost ceilings. Cheaper than fine-tuning and easier to iterate.",
                ],
              ].map(([k, v]) => (
                <li
                  key={k}
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.6,
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
                  <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
                    {k}.
                  </strong>{" "}
                  {v}
                </li>
              ))}
            </ul>
          }
        />

        <CaseStudyBlock
          n="C"
          title="Implementation snippets"
          body={
            <>
              <p
                style={{
                  margin: 0,
                  fontSize: 14.5,
                  lineHeight: 1.65,
                  color: "var(--ink-2)",
                }}
              >
                Two of the highest-leverage decisions in code. Both are
                simplified for legibility — the actual implementations have
                additional logging, retries, and instrumentation.
              </p>

              <CodeSnippet
                lang="Swift"
                file="yantissimo/Core/Network/APIClient.swift"
                caption={`401 → /auth/refresh → retry once. If the refresh itself fails, the user is bounced to Welcome — never two consecutive failures, never silent token expiry.`}
                code={`func send<T: Decodable>(_ ep: APIEndpoint) async throws -> T {
    var req = try await build(ep)
    let (data, resp) = try await URLSession.shared.data(for: req)

    guard let http = resp as? HTTPURLResponse else { throw APIError.transport }
    if http.statusCode == 401, !ep.isAuthRoute, await refreshOnce() {
        // refresh succeeded → re-sign and retry exactly once
        req = try await build(ep)
        let (data2, resp2) = try await URLSession.shared.data(for: req)
        return try decode(T.self, data2, resp2)
    }
    return try decode(T.self, data, resp)
}

// shared single-flight refresh — concurrent 401s share one round-trip
private func refreshOnce() async -> Bool {
    if let inflight = self.refreshTask { return await inflight.value }
    let task = Task<Bool, Never> {
        defer { self.refreshTask = nil }
        return await self.performRefresh()
    }
    self.refreshTask = task
    return await task.value
}`}
              />

              <CodeSnippet
                lang="TypeScript"
                file="company-brain/src/lib/openai/sql-tool.js"
                caption={`OpenAI ChatKit tool that lets a non-technical user ask in plain language. SELECT-only guard + auto LIMIT means the worst case is "wrong answer", never "dropped table".`}
                code={`export async function onSqlTool({ sql }) {
  const trimmed = sql.trim().replace(/;\\s*$/, "");
  if (!/^\\s*(select|with)\\b/i.test(trimmed)) {
    return { error: "Only SELECT (or WITH … SELECT) is allowed." };
  }

  // force LIMIT when missing — runaway scans are the #1 OOM cause here
  const sqlWithLimit = /\\blimit\\s+\\d+/i.test(trimmed)
    ? trimmed
    : \`\${trimmed} LIMIT 200\`;

  // server-only: service role key never reaches the client
  const { data, error } = await supabase.rpc(SQL_RPC, {
    [SQL_ARG]: sqlWithLimit,
  });
  if (error) return { error: error.message };

  return { rows: data, rowCount: Array.isArray(data) ? data.length : 0 };
}`}
              />
            </>
          }
        />

        <CaseStudyBlock
          n="D"
          title="Results"
          body={
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
              {[
                "Customers self-serve the full quote → payment → appointment loop without a sales rep on the line.",
                "iOS app opens with content even before the first network call — Application Support cache hydrates the views on launch.",
                "Backend test suite (Jest + Supertest) gates merges on Railway via a small CI script; no test, no deploy.",
                "Storefront 'By vehicle' search resolves car → tire-size → in-stock SKUs in <300 ms thanks to a thin GraphQL projection over Shopify.",
                "Nexora agent handles routine inbound on Telegram + WhatsApp 24/7, escalating to humans only when the conversation enters a configured trigger set.",
              ].map((r, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.6,
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
                  {r}
                </li>
              ))}
            </ul>
          }
        />

        <CaseStudyBlock
          n="E"
          title="Learnings"
          body={
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
              {[
                "Owning the network layer end-to-end on iOS paid back instantly — every bug after launch has been a 5-minute breakpoint, not a third-party SDK detective hunt.",
                "A modest test suite at the API boundary catches more regressions than fine-grained unit tests of business logic. Boundary-first.",
                "Shopify's webhook contract is more reliable than its REST poll path — webhook-driven sync + idempotency keys removed an entire class of inventory drift.",
                "OpenAI tool calling beats prompt-only RAG when the answer needs to mutate state. The agent that books a service is more useful than the one that describes it.",
                "When the operations team can edit a JSON file, they don't need a feature request. Admin panel JSON editor saved at least a sprint.",
              ].map((r, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.6,
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
                  {r}
                </li>
              ))}
            </ul>
          }
        />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

interface CaseStudyBlockProps {
  n: string;
  title: string;
  body: React.ReactNode;
}

function CaseStudyBlock({ n, title, body }: CaseStudyBlockProps) {
  return (
    <Reveal>
      <div
        style={{
          marginTop: "clamp(28px, 3.5vw, 48px)",
          paddingTop: "clamp(24px, 3vw, 36px)",
          borderTop: "1px solid var(--rule)",
          display: "grid",
          gridTemplateColumns: "120px 1fr",
          gap: "clamp(20px, 3vw, 40px)",
        }}
        className="exp-row"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span
            className="text-display"
            style={{
              fontSize: 36,
              color: "var(--accent)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {n}
          </span>
          <span className="kicker" style={{ fontSize: 10 }}>
            {title}
          </span>
        </div>
        <div>{body}</div>
      </div>
    </Reveal>
  );
}

interface BeforeAfterColumnProps {
  kind: "before" | "after";
  title: string;
  points: string[];
}

function BeforeAfterColumn({ kind, title, points }: BeforeAfterColumnProps) {
  const isAfter = kind === "after";
  return (
    <div
      style={{
        padding: "clamp(20px, 2.5vw, 32px)",
        background: isAfter ? "var(--paper-2)" : "var(--paper-3)",
        borderRight: isAfter ? "none" : "1px solid var(--rule)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        className="kicker"
        style={{
          color: isAfter ? "var(--accent)" : "var(--ink-3)",
          letterSpacing: "0.18em",
          fontSize: 10,
        }}
      >
        {kind === "before" ? "→ Before" : "→ Today"}
      </div>
      <h4
        className="text-display"
        style={{
          margin: 0,
          fontSize: 22,
          lineHeight: 1.1,
          color: "var(--ink)",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h4>
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
        {points.map((p, i) => (
          <li
            key={i}
            style={{
              fontSize: 14,
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
                top: 10,
                width: 8,
                height: 1,
                background: isAfter ? "var(--accent)" : "var(--ink-3)",
              }}
            />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
