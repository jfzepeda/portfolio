"use client";

import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";
import { useT, bi, type L } from "@/lib/i18n";

interface Step {
  n: string;
  title: L<string>;
  blurb: L<string>;
  artifact: L<string>;
}

const STEPS: Step[] = [
  {
    n: "01",
    title: bi("Analysis", "Análisis"),
    blurb: bi(
      "A long call about the real problem: who lives with it, what it costs today, what happens if it isn't solved. I map processes and data before talking about technology.",
      "Una llamada larga sobre el problema real: quién lo vive, qué cuesta hoy, qué pasa si no se resuelve. Mapeo procesos y datos antes de hablar de tecnología.",
    ),
    artifact: bi(
      "Written diagnosis · 1–3 days",
      "Diagnóstico escrito · 1–3 días",
    ),
  },
  {
    n: "02",
    title: bi("Proposal", "Propuesta"),
    blurb: bi(
      "Scope, deliverables, milestones, and a fixed price. No surprises mid-project. If something grows, it gets renegotiated explicitly.",
      "Alcance, entregables, hitos y precio cerrado. Sin sorpresas a mitad del proyecto. Si algo crece, se renegocia explícitamente.",
    ),
    artifact: bi("Proposal + milestone plan", "Propuesta + plan de hitos"),
  },
  {
    n: "03",
    title: bi("Development", "Desarrollo"),
    blurb: bi(
      "I iterate in short sprints, showing real progress in every one. Your team watches the system grow; no black boxes.",
      "Itero en sprints cortos, mostrando avances reales en cada uno. Tu equipo ve el sistema crecer; nada de cajas negras.",
    ),
    artifact: bi(
      "Access to a test build from week 1",
      "Acceso a versión de pruebas desde la semana 1",
    ),
  },
  {
    n: "04",
    title: bi("Testing", "Pruebas"),
    blurb: bi(
      "Tests with real data, edge cases, and the flows your operation runs daily. When something breaks, it has to break here — not in production.",
      "Pruebas con datos reales, casos límite, y los flujos que tu operación ejecuta a diario. Cuando algo se rompe, tiene que romperse aquí — no en producción.",
    ),
    artifact: bi("Test report + fixes", "Reporte de pruebas + ajustes"),
  },
  {
    n: "05",
    title: bi("Deployment", "Despliegue"),
    blurb: bi(
      "Controlled rollout with rollback ready. I hand over operations documentation and a live walkthrough with your team.",
      "Salida controlada con rollback listo. Te entrego la documentación de operación y un walkthrough en vivo con tu equipo.",
    ),
    artifact: bi(
      "System in production + documentation",
      "Sistema en producción + documentación",
    ),
  },
  {
    n: "06",
    title: bi("Support", "Soporte"),
    blurb: bi(
      "Post-launch support with an agreed SLA. Fast resolution, prioritized improvements, and monthly reports if you need them.",
      "Acompañamiento posterior con SLA acordado. Resolución rápida, mejoras priorizadas, y reportes mensuales si los necesitas.",
    ),
    artifact: bi(
      "SLA + direct communication channel",
      "SLA + canal directo de comunicación",
    ),
  },
];

export function Process() {
  const t = useT();
  return (
    <section
      id="process"
      className="only-executive"
      style={{
        padding: "var(--section-y) clamp(20px, 4vw, 40px)",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <SectionHeader
        n="03"
        kicker={t(bi("How I work", "Cómo trabajo"))}
        title={t(
          bi(
            "Six steps from first call to live system.",
            "Seis pasos desde la primera llamada hasta el sistema en vivo.",
          ),
        )}
        subtitle={t(
          bi(
            "No surprises, no black boxes. Every milestone ships a concrete deliverable.",
            "Sin sorpresas, sin cajas negras. Cada hito tiene un entregable concreto.",
          ),
        )}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "clamp(16px, 2vw, 20px)",
        }}
      >
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 50}>
            <article
              className="paper-card"
              style={{
                padding: "clamp(20px, 2vw, 26px)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <span
                  className="text-display"
                  style={{
                    fontSize: 38,
                    color: "var(--accent)",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.n}
                </span>
                <span aria-hidden className="kicker" style={{ fontSize: 10 }}>
                  {t(bi("Step", "Paso"))} {i + 1} {t(bi("of", "de"))}{" "}
                  {STEPS.length}
                </span>
              </div>
              <h3
                className="text-display"
                style={{
                  fontSize: 22,
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
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  color: "var(--ink-2)",
                  margin: 0,
                }}
              >
                {t(s.blurb)}
              </p>
              <div
                style={{
                  marginTop: "auto",
                  paddingTop: 12,
                  borderTop: "1px solid var(--rule)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--ink-3)",
                  letterSpacing: "0.04em",
                }}
              >
                ↳ {t(s.artifact)}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
