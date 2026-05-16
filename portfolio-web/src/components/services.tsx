"use client";

import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";
import { useT, bi, type L } from "@/lib/i18n";

interface Service {
  n: string;
  title: L<string>;
  outcome: L<string>;
  deliverables: L<string>[];
  example: string;
}

const SERVICES: Service[] = [
  {
    n: "01",
    title: bi("Web & E-commerce", "Web y E-commerce"),
    outcome: bi(
      "Storefronts and web platforms that sell, schedule, and run the operation.",
      "Storefronts y plataformas web que venden, agendan y operan el negocio.",
    ),
    deliverables: [
      bi(
        "Headless storefront with custom search and checkout",
        "Storefront headless con búsqueda y checkout custom",
      ),
      bi(
        "Payment links and appointment scheduling",
        "Links de pago y agenda de citas",
      ),
      bi(
        "Admin dashboards for the back-office team",
        "Dashboards administrativos para el equipo de back-office",
      ),
    ],
    example: "Yantissimo · Yantissimo storefront",
  },
  {
    n: "02",
    title: bi("Mobile Apps (iOS)", "Apps Móviles (iOS)"),
    outcome: bi(
      "Native iOS apps that work offline, send push, and feel like the platform — not a wrapped website.",
      "Apps iOS nativas que funcionan offline, envían push y se sienten como la plataforma — no como un sitio web envuelto.",
    ),
    deliverables: [
      bi(
        "Customer-facing iOS app on TestFlight or the App Store",
        "App iOS de cara al cliente en TestFlight o la App Store",
      ),
      bi(
        "Offline cache, push notifications, eternal session login",
        "Caché offline, push notifications, sesión eterna",
      ),
      bi(
        "Backend integration tested end-to-end",
        "Integración con backend probada de extremo a extremo",
      ),
    ],
    example: "Yantissimo iOS",
  },
  {
    n: "03",
    title: bi("AI Automation", "Automatización con IA"),
    outcome: bi(
      "AI that does real work — not a chatbot demo. Document classification, sales follow-up, smart scheduling.",
      "IA que hace trabajo real — no un demo de chatbot. Clasificación de documentos, seguimiento de ventas, agendado inteligente.",
    ),
    deliverables: [
      bi(
        "Automated message triage and reply across WhatsApp / Telegram",
        "Triage y respuesta automatizada de mensajes en WhatsApp / Telegram",
      ),
      bi(
        "Knowledge base that answers across documents and spreadsheets",
        "Base de conocimiento que responde sobre documentos y hojas de cálculo",
      ),
      bi(
        "Recommendation and routing engines tied to your real catalog",
        "Motores de recomendación y routing conectados a tu catálogo real",
      ),
    ],
    example: "Nexora Sales Agent · DataKnife",
  },
  {
    n: "04",
    title: bi("Enterprise Integrations", "Integraciones Empresariales"),
    outcome: bi(
      "I connect the tools you already pay for so they stop being silos.",
      "Conecto las herramientas por las que ya pagas para que dejen de ser silos.",
    ),
    deliverables: [
      bi(
        "WhatsApp, Telegram, Email, and voice flows under one roof",
        "Flujos de WhatsApp, Telegram, Email y voz bajo un solo techo",
      ),
      bi(
        "Shopify, payment, and accounting integrations",
        "Integraciones con Shopify, pagos y contabilidad",
      ),
      bi(
        "Google Workspace + ERP bridges with audit logs",
        "Puentes Google Workspace + ERP con logs de auditoría",
      ),
    ],
    example: "WhatsApp Gateway · Shopify · Google Sheets bridge",
  },
  {
    n: "05",
    title: bi("Internal Systems", "Sistemas Internos"),
    outcome: bi(
      "ERPs, dashboards, and tooling tailored to how your team actually works.",
      "ERPs, dashboards y herramientas hechas a la medida de cómo realmente trabaja tu equipo.",
    ),
    deliverables: [
      bi(
        "Order management, inventory, scheduling, and reporting",
        "Gestión de órdenes, inventario, agendas y reportería",
      ),
      bi(
        "Role-based access for ops, sales, and admin",
        "Acceso por rol para operaciones, ventas y administración",
      ),
      bi(
        "Real-time collaboration where it matters",
        "Colaboración en tiempo real donde importa",
      ),
    ],
    example: "YSSM ERP",
  },
];

export function Services() {
  const t = useT();
  return (
    <section
      id="services"
      className="only-executive"
      style={{
        padding: "var(--section-y) clamp(20px, 4vw, 40px)",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <SectionHeader
        n="02"
        kicker={t(bi("What I deliver", "Lo que entrego"))}
        title={
          <>
            {t(bi("Five services. ", "Cinco servicios. "))}
            <em>
              {t(
                bi(
                  "Each one ships to production.",
                  "Cada uno llega a producción.",
                ),
              )}
            </em>
          </>
        }
        subtitle={t(
          bi(
            "Plain deliverables, real recent examples. No jargon, no demos that never see customers.",
            "Entregables claros, ejemplos recientes reales. Sin jerga, sin demos que nunca ven clientes.",
          ),
        )}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "var(--gap)",
        }}
      >
        {SERVICES.map((s, i) => (
          <Reveal key={s.n} delay={i * 60}>
            <article
              className="paper-card paper-card-hover"
              style={{
                padding: "clamp(22px, 2.2vw, 30px)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  className="kicker"
                  style={{ color: "var(--accent)", fontSize: 12 }}
                >
                  § {s.n}
                </span>
                <span
                  aria-hidden
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: "var(--accent)",
                  }}
                />
              </div>
              <h3
                className="text-display"
                style={{
                  fontSize: "clamp(22px, 2.2vw, 28px)",
                  lineHeight: 1.1,
                  margin: 0,
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                }}
              >
                {t(s.title)}
              </h3>
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: "var(--ink-2)",
                  margin: 0,
                }}
              >
                {t(s.outcome)}
              </p>

              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                {s.deliverables.map((d, j) => (
                  <li
                    key={j}
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
                    {t(d)}
                  </li>
                ))}
              </ul>

              <div
                style={{
                  marginTop: "auto",
                  paddingTop: 14,
                  borderTop: "1px solid var(--rule)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span className="kicker" style={{ fontSize: 10 }}>
                  {t(bi("Recent example", "Ejemplo reciente"))}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--ink)",
                    textAlign: "right",
                  }}
                >
                  {s.example}
                </span>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
