"use client";

import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";
import { useTier2, useTier3, useT, bi } from "@/lib/i18n";
import { ProjectCard } from "./project-card";

export function FeaturedGrid() {
  const t = useT();
  const tier2 = useTier2();
  const tier3 = useTier3();
  return (
    <section
      id="projects"
      style={{
        padding: "var(--section-y) clamp(20px, 4vw, 40px)",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <SectionHeader
        n="05"
        kicker={t(bi("Selected work", "Trabajo seleccionado"))}
        title={t(
          bi(
            "Things I've built recently.",
            "Cosas que he construido recientemente.",
          ),
        )}
        subtitle={t(
          bi(
            "Each one is a real product: shipped, used, and built end-to-end. Toggle Technical for stack and architecture detail.",
            "Cada uno es un producto real: entregado, usado y construido de extremo a extremo. Activa Technical para detalle de stack y arquitectura.",
          ),
        )}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "clamp(28px, 3.5vw, 44px)",
        }}
      >
        <div>
          <Reveal>
            <div
              className="kicker"
              style={{
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ color: "var(--accent)" }}>✦</span>
              {t(bi("Featured deep", "Destacados a profundidad"))}
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "var(--gap)",
            }}
          >
            {tier2.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        </div>

        <div>
          <Reveal>
            <div
              className="kicker"
              style={{
                marginBottom: 16,
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ color: "var(--accent)" }}>✦</span>
              {t(bi("Featured", "Destacados"))}
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "var(--gap)",
            }}
          >
            {tier3.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
