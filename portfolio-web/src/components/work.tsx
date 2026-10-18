"use client";

import { useState } from "react";
import Image from "next/image";
import { Screen } from "./screen";
import { GlassDialog, openDialog } from "./glass-dialog";
import { ProjectDialog, dialogId } from "./project-dialog";
import { Icon } from "./icons";
import {
  useFeaturedProjects,
  useTier4,
  useCategoryLabels,
  useT,
  bi,
} from "@/lib/i18n";
import { layer } from "@/lib/layer";
import type { Category } from "@/data/projects";

const SHORT: Record<Category, { en: string; es: string }> = {
  enterprise: { en: "Enterprise", es: "Empresa" },
  ai: { en: "AI", es: "IA" },
  web: { en: "Web", es: "Web" },
  swift: { en: "Apple", es: "Apple" },
  automation: { en: "Automation", es: "Automatización" },
  experimental: { en: "R&D", es: "I+D" },
};

export function Work() {
  const t = useT();
  const featured = useFeaturedProjects();
  const more = useTier4();
  const labels = useCategoryLabels();
  const [filter, setFilter] = useState<Category | "all">("all");

  const total = featured.length + more.length;
  const cats = Object.keys(labels) as Category[];
  const short = (c: Category) => t(SHORT[c]);

  return (
    <Screen id="work" label={t(bi("Selected work", "Proyectos destacados"))}>
      <div className="screen-head layer" style={layer(0)}>
        <h2 className="h2">
          {t(bi("Selected ", "Proyectos "))}
          <em>{t(bi("work", "destacados"))}</em>
        </h2>
        <p className="kicker">
          {featured.length} {t(bi("featured", "destacados"))} · {total} {t(bi("total", "en total"))}
        </p>
      </div>

      <ul className="work-grid">
        {featured.map((p, i) => {
          const feature = i === 0;
          return (
            <li
              key={p.id}
              className={`card glass spot lift layer${feature ? " card-feature" : ""}`}
              style={layer(1 + i * 0.6)}
              data-cat={p.category}
            >
              {feature && !p.thumbnail && p.hero && (
                <div className="card-media" aria-hidden>
                  <Image src={p.hero} alt="" fill sizes="(max-width: 1000px) 100vw, 40vw" />
                </div>
              )}
              {p.thumbnail && (
                <div className="card-thumbnail" aria-hidden>
                  <Image
                    src={p.thumbnail}
                    alt=""
                    fill
                    sizes={feature ? "(max-width: 640px) 100vw, (max-width: 1000px) 67vw, 40vw" : "(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 20vw"}
                  />
                </div>
              )}
              <div className="card-top">
                <span className="card-icon" aria-hidden>
                  {p.icon}
                </span>
                <span className="chip">
                  <i className="chip-dot" />
                  {short(p.category)}
                </span>
              </div>
              <div className="card-title">
                <h3>
                  <button type="button" className="card-open" onClick={() => openDialog(dialogId(p.slug))}>
                    {p.name}
                  </button>
                </h3>
                <p className="card-sub">{p.domain}</p>
              </div>
              <div className="card-reveal" aria-hidden>
                <div>
                  <h3>{p.name}</h3>
                  <p className="card-sub">{p.domain}</p>
                </div>
                <p>
                  <span className="only-executive">{p.executive.headline}</span>
                  <span className="only-technical">{p.technical.headline}</span>
                </p>
                <span className="go">
                  {t(bi("Open", "Abrir"))} <Icon name="arrow-right" size={13} />
                </span>
              </div>
            </li>
          );
        })}

        <li
          className="card card-cta glass spot lift layer"
          style={layer(1 + featured.length * 0.6)}
        >
          <span className="card-icon" aria-hidden>
            <Icon name="grid" />
          </span>
          <h3>
            <button type="button" className="card-open" onClick={() => openDialog("archive")}>
              <strong className="numerals">+{more.length}</strong>
              <span className="card-sub" style={{ display: "block" }}>
                {t(bi("more projects", "proyectos más"))}
              </span>
            </button>
          </h3>
        </li>
      </ul>

      {featured.map((p) => (
        <ProjectDialog key={p.id} p={p} categoryLabel={labels[p.category]} />
      ))}

      <GlassDialog id="archive" wide>
        <h2 id="archive-title" className="dlg-title" style={{ marginBottom: 16 }}>
          {t(bi("More projects", "Más proyectos"))}
        </h2>
        <div className="filters" role="group" aria-label={t(bi("Filter by category", "Filtrar por categoría"))}>
          <button type="button" className="filter" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
            {t(bi("All", "Todos"))}
          </button>
          {cats.map((c) => (
            <button key={c} type="button" className="filter" aria-pressed={filter === c} onClick={() => setFilter(c)}>
              {short(c)}
            </button>
          ))}
        </div>
        <ul className="archive">
          {more.map((m) => (
            <li key={m.id} className="arch" data-cat={m.category} hidden={filter !== "all" && filter !== m.category}>
              <span className="card-icon" aria-hidden>
                {m.icon}
              </span>
              <div>
                <b>{m.name}</b>
                {m.year && <small>{m.year}</small>}
                <p>{m.description}</p>
                {m.stack && (
                  <div className="chips only-technical">
                    {m.stack.map((s) => (
                      <span key={s} className="chip">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </GlassDialog>
    </Screen>
  );
}
