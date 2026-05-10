import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";

// Pro-mode-only Process section — 6 numbered steps showing how a project
// actually moves from first conversation to live system. Lowers risk
// perception for non-technical buyers.

interface Step {
  n: string;
  title: string;
  blurb: string;
  artifact: string; // what the client receives at this stage
}

const STEPS: Step[] = [
  {
    n: "01",
    title: "Análisis",
    blurb:
      "Una llamada larga sobre el problema real: quién lo vive, qué cuesta hoy, qué pasa si no se resuelve. Mapeo procesos y datos antes de hablar de tecnología.",
    artifact: "Diagnóstico escrito · 1–3 días",
  },
  {
    n: "02",
    title: "Propuesta",
    blurb:
      "Alcance, entregables, hitos y precio cerrado. Sin sorpresas a mitad del proyecto. Si algo crece, se renegocia explícitamente.",
    artifact: "Propuesta + plan de hitos",
  },
  {
    n: "03",
    title: "Desarrollo",
    blurb:
      "Itero en sprints cortos, mostrando avances reales en cada uno. Tu equipo ve el sistema crecer; nada de cajas negras.",
    artifact: "Acceso a versión de pruebas desde la semana 1",
  },
  {
    n: "04",
    title: "Testing",
    blurb:
      "Pruebas con datos reales, casos límite, y los flujos que tu operación ejecuta a diario. Cuando algo se rompe, tiene que romperse aquí — no en producción.",
    artifact: "Reporte de pruebas + ajustes",
  },
  {
    n: "05",
    title: "Despliegue",
    blurb:
      "Salida controlada con rollback listo. Te entrego la documentación de operación y un walkthrough en vivo con tu equipo.",
    artifact: "Sistema en producción + documentación",
  },
  {
    n: "06",
    title: "Soporte",
    blurb:
      "Acompañamiento posterior con SLA acordado. Resolución rápida, mejoras priorizadas, y reportes mensuales si los necesitas.",
    artifact: "SLA + canal directo de comunicación",
  },
];

export function Process() {
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
        kicker="How I work"
        title="Six steps from first call to live system."
        subtitle="Sin sorpresas, sin cajas negras. Cada hito tiene un entregable concreto."
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
                  Paso {i + 1} de {STEPS.length}
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
                {s.title}
              </h3>
              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  color: "var(--ink-2)",
                  margin: 0,
                }}
              >
                {s.blurb}
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
                ↳ {s.artifact}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
