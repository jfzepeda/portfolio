import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";

// Pro-mode-only Services section. Concrete deliverables, plain language,
// no jargon. Each service lists what the client actually gets.

interface Service {
  n: string;
  title: string;
  outcome: string;
  deliverables: string[];
  example: string;
}

const SERVICES: Service[] = [
  {
    n: "01",
    title: "Web & E-commerce",
    outcome:
      "Storefronts and web platforms that sell, schedule, and run the operation.",
    deliverables: [
      "Headless storefront with custom search and checkout",
      "Payment links and appointment scheduling",
      "Admin dashboards for the back-office team",
    ],
    example: "Yantissimo · Llantísimo storefront",
  },
  {
    n: "02",
    title: "Mobile Apps (iOS)",
    outcome:
      "Native iOS apps that work offline, send push, and feel like the platform — not a wrapped website.",
    deliverables: [
      "Customer-facing iOS app on TestFlight or the App Store",
      "Offline cache, push notifications, eternal session login",
      "Backend integration tested end-to-end",
    ],
    example: "Yantissimo iOS",
  },
  {
    n: "03",
    title: "AI Automation",
    outcome:
      "AI that does real work — not a chatbot demo. Document classification, sales follow-up, smart scheduling.",
    deliverables: [
      "Automated message triage and reply across WhatsApp / Telegram",
      "Knowledge base that answers across documents and spreadsheets",
      "Recommendation and routing engines tied to your real catalog",
    ],
    example: "Nexora Sales Agent · DataKnife",
  },
  {
    n: "04",
    title: "Enterprise Integrations",
    outcome:
      "I connect the tools you already pay for so they stop being silos.",
    deliverables: [
      "WhatsApp, Telegram, Email, and voice flows under one roof",
      "Shopify, payment, and accounting integrations",
      "Google Workspace + ERP bridges with audit logs",
    ],
    example: "WhatsApp Gateway · Shopify · Google Sheets bridge",
  },
  {
    n: "05",
    title: "Internal Systems",
    outcome:
      "ERPs, dashboards, and tooling tailored to how your team actually works.",
    deliverables: [
      "Order management, inventory, scheduling, and reporting",
      "Role-based access for ops, sales, and admin",
      "Real-time collaboration where it matters",
    ],
    example: "YSSM ERP",
  },
];

export function Services() {
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
        kicker="What I deliver"
        title={
          <>
            Five services. <em>Each one ships to production.</em>
          </>
        }
        subtitle="Plain deliverables, real recent examples. No jargon, no demos that never see customers."
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
                {s.title}
              </h3>
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: "var(--ink-2)",
                  margin: 0,
                }}
              >
                {s.outcome}
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
                    {d}
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
                  Recent example
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
