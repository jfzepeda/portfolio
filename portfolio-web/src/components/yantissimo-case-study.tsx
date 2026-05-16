"use client";

import { Reveal } from "./reveal";
import { SectionHeader, PaperPlaceholder } from "./section-header";
import { ArchitectureDiagram } from "./architecture-diagram";
import { CodeSnippet } from "./code-snippet";
import { useYantissimo, useT, bi } from "@/lib/i18n";

// Tier-1 hero case study, warm-paper style. Wide intro + 3 subproduct rows
// + (Tech) full case-study breakdown + (Pro) before/after value table.

export function YantissimoCaseStudy() {
  const t = useT();
  const p = useYantissimo();

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
        kicker={t(bi("Flagship platform", "Plataforma insignia"))}
        title={
          <>
            Yantissimo.{" "}
            <em>{t(bi("One platform,", "Una plataforma,"))}</em>{" "}
            {t(bi("every surface.", "cada superficie."))}
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
              {t(bi("At a glance", "De un vistazo"))}
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
              {(
                [
                  { id: "domain", label: t(bi("Domain", "Dominio")), value: p.domain },
                  { id: "status", label: t(bi("Status", "Estado")), value: p.status },
                  { id: "year", label: t(bi("Year", "Año")), value: String(p.year) },
                  {
                    id: "surfaces",
                    label: t(bi("Surfaces", "Superficies")),
                    value: "ERP · Backend · iOS · Storefront",
                  },
                ] as const
              ).map(({ id, label, value }) => (
                <div
                  key={id}
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
                    {label}
                  </dt>
                  <dd
                    style={{
                      margin: 0,
                      textAlign: "right",
                      color:
                        id === "status" ? "var(--accent)" : "var(--ink)",
                      fontFamily:
                        id === "year" ? "var(--font-mono)" : undefined,
                      fontSize: id === "year" ? 11 : 13,
                    }}
                  >
                    {value}
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
                  {t(bi("Scale", "Escala"))}
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
            {t(bi("Four coordinated products", "Cuatro productos coordinados"))}
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
            {t(
              bi(
                "Before vs after — the operational impact",
                "Antes vs después — el impacto operativo",
              ),
            )}
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
              title={t(bi("Before — manual operations", "Antes — operación manual"))}
              points={[
                t(
                  bi(
                    "Customer support tied to business hours on WhatsApp.",
                    "Atención al cliente atada a horario laboral por WhatsApp.",
                  ),
                ),
                t(
                  bi(
                    "No app — customers couldn't see vehicles, appointments, or status.",
                    "Sin app — los clientes no podían ver vehículos, citas ni estatus.",
                  ),
                ),
                t(
                  bi(
                    "Quotes and bookings done by hand, in spreadsheets and messages.",
                    "Cotizaciones y reservas hechas a mano, en hojas y mensajes.",
                  ),
                ),
                t(
                  bi(
                    "Catalog and pricing lived only in the sales team's heads.",
                    "Catálogo y precios solo en cabeza del equipo de ventas.",
                  ),
                ),
                t(
                  bi(
                    "Payments coordinated manually, with no direct link.",
                    "Pagos coordinados manualmente, sin link directo.",
                  ),
                ),
              ]}
            />
            <BeforeAfterColumn
              kind="after"
              title={t(bi("Today — platform running 24/7", "Hoy — plataforma operando 24/7"))}
              points={[
                t(
                  bi(
                    "Customers self-serve 24/7: they browse, quote, book, and pay.",
                    "Clientes se autoatienden 24/7: ven, cotizan, agendan y pagan.",
                  ),
                ),
                t(
                  bi(
                    "Native iOS app with an eternal session and push reminders.",
                    "App iOS nativa con sesión eterna y push de recordatorios.",
                  ),
                ),
                t(
                  bi(
                    "Public storefront with vehicle search (make/model/year).",
                    "Storefront público con búsqueda por auto (marca/modelo/año).",
                  ),
                ),
                t(
                  bi(
                    "Single Shopify catalog, synced across all three surfaces.",
                    "Catálogo único en Shopify, sincronizado en los tres frentes.",
                  ),
                ),
                t(
                  bi(
                    "AI agent on WhatsApp / Telegram triages and responds nonstop.",
                    "Agente IA en WhatsApp / Telegram filtra y atiende sin parar.",
                  ),
                ),
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
            {t(
              bi(
                "Case study — engineering depth",
                "Caso de estudio — profundidad técnica",
              ),
            )}
          </div>
        </Reveal>

        <CaseStudyBlock
          n="A"
          title={t(bi("Problem", "Problema"))}
          body={
            <>
              {t(
                bi(
                  "The distributor had a real catalog, real customers on WhatsApp, and zero coordinated digital surface. Sales lived in the heads of three people; pricing changes lived in a spreadsheet; appointments were booked verbally. Building a unified front-end wasn't enough — the system had to integrate with the existing Shopify catalog, persist a session graph for thousands of customers, and stay reliable enough that an iOS client could cache it and open offline.",
                  "El distribuidor tenía un catálogo real, clientes reales en WhatsApp y cero superficie digital coordinada. Las ventas vivían en la cabeza de tres personas; los cambios de precio vivían en una hoja de cálculo; las citas se reservaban verbalmente. Construir un front-end unificado no era suficiente — el sistema tenía que integrarse con el catálogo Shopify existente, persistir un grafo de sesiones para miles de clientes y mantenerse confiable lo suficiente para que un cliente iOS pudiera cachearlo y abrir offline.",
                ),
              )}
            </>
          }
        />

        <ArchitectureDiagram />

        <CaseStudyBlock
          n="B"
          title={t(bi("Tradeoffs", "Tradeoffs"))}
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
                  t(bi("Express over Nest/Fastify", "Express en lugar de Nest/Fastify")),
                  t(
                    bi(
                      "I traded a heavier framework's structure for surgical control over middleware and route composition. With 41 routes and a real test suite, the trade has paid off in audit speed.",
                      "Cambié la estructura de un framework más pesado por control quirúrgico sobre el middleware y la composición de rutas. Con 41 rutas y una suite de pruebas real, el intercambio ha valido la pena en velocidad de auditoría.",
                    ),
                  ),
                ],
                [
                  t(bi("Zero-dep iOS APIClient", "APIClient iOS cero-dependencias")),
                  t(
                    bi(
                      "Skipped Alamofire/Moya so I owned the 401 refresh-retry semantics, the cache hydration order, and the eternal-session contract. Worth the extra ~300 LOC.",
                      "Salté Alamofire/Moya para ser dueño de la semántica de refresh-retry en 401, el orden de hidratación de caché y el contrato de sesión eterna. Vale los ~300 LOC extras.",
                    ),
                  ),
                ],
                [
                  t(bi("Postgres + MySQL coexisting", "Postgres + MySQL coexistiendo")),
                  t(
                    bi(
                      "Postgres for the new transactional layer; MySQL kept for legacy ETL while we migrate. Cheaper than a big-bang and recoverable per-table.",
                      "Postgres para la nueva capa transaccional; MySQL se mantiene para el ETL legacy mientras migramos. Más barato que un big-bang y recuperable por tabla.",
                    ),
                  ),
                ],
                [
                  t(
                    bi(
                      "Headless Shopify, not custom checkout",
                      "Shopify headless, no checkout custom",
                    ),
                  ),
                  t(
                    bi(
                      "Shopify is the source of truth for catalog/checkout — building those from scratch would've been a year of compliance work. Storefront API + custom search wins instead.",
                      "Shopify es la fuente de verdad para catálogo/checkout — construirlos desde cero hubiera sido un año de trabajo de cumplimiento. Storefront API + búsqueda custom gana en cambio.",
                    ),
                  ),
                ],
                [
                  t(
                    bi(
                      "OpenAI tools with explicit budget",
                      "Herramientas OpenAI con presupuesto explícito",
                    ),
                  ),
                  t(
                    bi(
                      "The Nexora agent uses OpenAI tool calling, but every conversation has hard turn + cost ceilings. Cheaper than fine-tuning and easier to iterate.",
                      "El agente Nexora usa tool calling de OpenAI, pero cada conversación tiene techos duros de turnos + costo. Más barato que fine-tuning y más fácil de iterar.",
                    ),
                  ),
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
          title={t(bi("Implementation snippets", "Snippets de implementación"))}
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
                {t(
                  bi(
                    "Two of the highest-leverage decisions in code. Both are simplified for legibility — the actual implementations have additional logging, retries, and instrumentation.",
                    "Dos de las decisiones de mayor apalancamiento en código. Ambas están simplificadas para legibilidad — las implementaciones reales tienen logging, retries e instrumentación adicionales.",
                  ),
                )}
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
          title={t(bi("Results", "Resultados"))}
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
                t(
                  bi(
                    "Customers self-serve the full quote → payment → appointment loop without a sales rep on the line.",
                    "Los clientes se autoatienden el ciclo completo cotización → pago → cita sin un vendedor en la línea.",
                  ),
                ),
                t(
                  bi(
                    "iOS app opens with content even before the first network call — Application Support cache hydrates the views on launch.",
                    "La app iOS abre con contenido incluso antes de la primera llamada de red — el caché de Application Support hidrata las vistas al lanzar.",
                  ),
                ),
                t(
                  bi(
                    "Backend test suite (Jest + Supertest) gates merges on Railway via a small CI script; no test, no deploy.",
                    "La suite de pruebas del backend (Jest + Supertest) hace gate de los merges en Railway vía un script CI pequeño; sin pruebas, no hay deploy.",
                  ),
                ),
                t(
                  bi(
                    "Storefront 'By vehicle' search resolves car → tire-size → in-stock SKUs in <300 ms thanks to a thin GraphQL projection over Shopify.",
                    "La búsqueda 'Por auto' del storefront resuelve auto → medida de llanta → SKUs en stock en <300 ms gracias a una proyección GraphQL ligera sobre Shopify.",
                  ),
                ),
                t(
                  bi(
                    "Nexora agent handles routine inbound on Telegram + WhatsApp 24/7, escalating to humans only when the conversation enters a configured trigger set.",
                    "El agente Nexora maneja entrantes rutinarios en Telegram + WhatsApp 24/7, escalando a humanos solo cuando la conversación entra en un set configurado de triggers.",
                  ),
                ),
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
          title={t(bi("Learnings", "Aprendizajes"))}
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
                t(
                  bi(
                    "Owning the network layer end-to-end on iOS paid back instantly — every bug after launch has been a 5-minute breakpoint, not a third-party SDK detective hunt.",
                    "Ser dueño de la capa de red de extremo a extremo en iOS rindió frutos instantáneamente — cada bug post-lanzamiento ha sido un breakpoint de 5 minutos, no una cacería detectivesca por un SDK de terceros.",
                  ),
                ),
                t(
                  bi(
                    "A modest test suite at the API boundary catches more regressions than fine-grained unit tests of business logic. Boundary-first.",
                    "Una suite de pruebas modesta en el límite de la API atrapa más regresiones que pruebas unitarias finas de lógica de negocio. Primero el límite.",
                  ),
                ),
                t(
                  bi(
                    "Shopify's webhook contract is more reliable than its REST poll path — webhook-driven sync + idempotency keys removed an entire class of inventory drift.",
                    "El contrato de webhooks de Shopify es más confiable que su ruta de poll REST — el sync impulsado por webhook + idempotency keys eliminó toda una clase de drift de inventario.",
                  ),
                ),
                t(
                  bi(
                    "OpenAI tool calling beats prompt-only RAG when the answer needs to mutate state. The agent that books a service is more useful than the one that describes it.",
                    "El tool calling de OpenAI le gana al RAG-solo-prompt cuando la respuesta necesita mutar estado. El agente que reserva un servicio es más útil que el que lo describe.",
                  ),
                ),
                t(
                  bi(
                    "When the operations team can edit a JSON file, they don't need a feature request. Admin panel JSON editor saved at least a sprint.",
                    "Cuando el equipo de operaciones puede editar un archivo JSON, no necesita un feature request. El editor de JSON del panel admin ahorró al menos un sprint.",
                  ),
                ),
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
  const t = useT();
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
        {kind === "before"
          ? `→ ${t(bi("Before", "Antes"))}`
          : `→ ${t(bi("Today", "Hoy"))}`}
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
