"use client";

import { Reveal } from "./reveal";
import { SectionHeader, PaperPlaceholder } from "./section-header";
import { useProfile, useT, bi } from "@/lib/i18n";

export function About() {
  const t = useT();
  const profile = useProfile();

  const QUICK_FACTS: [string, string][] = [
    [t(bi("Based in", "Basado en")), profile.location],
    [
      t(bi("Open to", "Abierto a")),
      t(bi("Remote / Hybrid · Senior IC", "Remoto / Híbrido · Senior IC")),
    ],
    [t(bi("Studying", "Estudiando")), t(bi("Data Science", "Ciencia de Datos"))],
    [t(bi("Speaks", "Habla")), "ES · EN"],
  ];

  return (
    <section
      id="about"
      style={{
        padding: "var(--section-y) clamp(20px, 4vw, 40px)",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <SectionHeader
        n="01"
        kicker={t(bi("About", "Sobre mí"))}
        title={
          <>
            {t(bi("A builder of ", "Un constructor de cosas "))}
            <em>{t(bi("useful", "útiles"))}</em>
            {t(
              bi(
                " things — from native iOS to AI agents.",
                " — desde iOS nativo hasta agentes de IA.",
              ),
            )}
          </>
        }
      />

      <div
        className="collapse-mobile"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)",
          gap: "clamp(32px, 5vw, 80px)",
          alignItems: "start",
        }}
      >
        <Reveal>
          <div style={{ position: "sticky", top: 100 }}>
            <PaperPlaceholder
              label={t(bi("Headshot · 4:5", "Retrato · 4:5"))}
              ratio="4/5"
              src="/images/projects/about-pic.jpeg"
            />
            <div
              className="kicker"
              style={{ marginTop: 16, letterSpacing: "0.08em" }}
            >
              [ {t(bi("portrait placeholder", "placeholder de retrato"))} ]
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--gap)",
            }}
          >
            <p
              style={{
                fontSize: "clamp(18px, 1.8vw, 22px)",
                lineHeight: 1.5,
                color: "var(--ink)",
                margin: 0,
                textWrap: "pretty",
              }}
            >
              {profile.bio[0]}
            </p>
            <p
              style={{
                fontSize: "clamp(16px, 1.4vw, 18px)",
                lineHeight: 1.65,
                color: "var(--ink-2)",
                margin: 0,
                textWrap: "pretty",
              }}
            >
              {profile.bio[1]}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 24,
                marginTop: 16,
                paddingTop: 24,
                borderTop: "1px solid var(--rule)",
              }}
            >
              {QUICK_FACTS.map(([k, v]) => (
                <div key={k}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--ink-3)",
                      marginBottom: 6,
                    }}
                  >
                    {k}
                  </div>
                  <div style={{ fontSize: 15, color: "var(--ink)" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
