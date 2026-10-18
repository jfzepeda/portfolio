"use client";

import { useState } from "react";
import Image from "next/image";
import { GlassDialog } from "./glass-dialog";
import { Expand } from "./expand";
import { Tabs } from "./tabs";
import { Icon } from "./icons";
import { useT, bi } from "@/lib/i18n";
import type { Project } from "@/data/projects";

export const dialogId = (slug: string) => `proj-${slug}`;

const isGlyph = (src: string) => /icon|logo/.test(src);

export function ProjectDialog({
  p,
  categoryLabel,
}: {
  p: Project;
  categoryLabel: string;
}) {
  const t = useT();
  const [arch, setArch] = useState(false);
  const id = dialogId(p.slug);
  const shots = p.screenshots && p.screenshots.length > 1 ? p.screenshots : p.hero ? [p.hero] : [];

  return (
    <GlassDialog
      id={id}
      wide
      action={
        p.demoUrl && (
          <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            {t(bi("Live demo", "Demo en vivo"))}
            <Icon name="arrow-up-right" className="arr-up arr" />
          </a>
        )
      }
    >
      <div className="dlg-head" data-cat={p.category}>
        <span className="card-icon" aria-hidden>
          {p.icon}
        </span>
        <div>
          <h2 id={`${id}-title`} className="dlg-title">
            {p.name}
          </h2>
          <p className="dlg-sub">{p.domain}</p>
        </div>
      </div>

      <div className="dlg-meta">
        <span className="chip">{categoryLabel}</span>
        <span className="chip">{p.status}</span>
        <span className="chip">{p.recencyLabel}</span>
        <span className="chip only-technical">{p.scaleSignal}</span>
      </div>

      <div className="dlg-body">
      {shots.length > 0 && (
        <div className="gallery">
          {shots.map((src) => (
            <div key={src} className={`shot${isGlyph(src) ? " shot-contain" : ""}`}>
              <Image src={src} alt="" fill sizes="(max-width: 800px) 80vw, 420px" />
            </div>
          ))}
        </div>
      )}

      <Tabs
        idBase={id}
        stacked
        items={[
          {
            id: "overview",
            label: t(bi("Overview", "Resumen")),
            panel: (
              <>
                <div className="only-executive">
                  <h3 className="dlg-h">{p.executive.headline}</h3>
                  <p className="dlg-p">{p.executive.summary}</p>
                </div>
                <div className="only-technical">
                  <h3 className="dlg-h">{p.technical.headline}</h3>
                  <p className="dlg-p">{p.technical.summary}</p>
                </div>
                <dl className="dl">
                  <div>
                    <dt>{t(bi("Used by", "Lo usan"))}</dt>
                    <dd>{p.users}</dd>
                  </div>
                </dl>
              </>
            ),
          },
          {
            id: "details",
            label: t(bi("Details", "Detalles")),
            panel: (
              <>
                <ul className="bullets only-executive">
                  {p.executive.outcomes.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
                <div className="only-technical">
                  <ul className="bullets">
                    {p.technical.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="more"
                    style={{ marginTop: 14 }}
                    aria-expanded={arch}
                    aria-controls={`${id}-arch`}
                    onClick={() => setArch((v) => !v)}
                  >
                    <span className="plus">
                      <Icon name="plus" size={12} />
                    </span>
                    {t(bi("Architecture", "Arquitectura"))}
                  </button>
                  <Expand id={`${id}-arch`} open={arch}>
                    <p className="dlg-p">{p.technical.architecture}</p>
                  </Expand>
                </div>

                {p.subproducts && (
                  <div className="subs">
                    {p.subproducts.map((s) => (
                      <div key={s.name} className="sub">
                        <b>{s.name}</b>
                        <small>
                          {s.role}
                          <span className="only-technical"> · {s.scale}</span>
                        </small>
                        <span className="only-executive">{s.professionalHighlights[0]}</span>
                        <span className="only-technical">{s.highlights[0]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ),
          },
          {
            id: "stack",
            label: (
              <>
                <span className="only-executive">{t(bi("Capabilities", "Capacidades"))}</span>
                <span className="only-technical">Stack</span>
              </>
            ),
            panel: (
              <>
                <ul className="bullets only-executive">
                  {p.capabilities.map((c) => (
                    <li key={c} className="cap">
                      {c}
                      <Icon name="check" size={14} />
                    </li>
                  ))}
                </ul>
                <ul className="bullets only-technical">
                  {p.stack.map((s) => (
                    <li key={s} className="cap">
                      {s}
                      <Icon name="check" size={14} />
                    </li>
                  ))}
                </ul>
              </>
            ),
          },
        ]}
      />
      </div>
    </GlassDialog>
  );
}
