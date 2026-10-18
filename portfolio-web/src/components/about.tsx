"use client";

import { useState } from "react";
import Image from "next/image";
import { Screen } from "./screen";
import { Tabs } from "./tabs";
import { Expand } from "./expand";
import { GlassDialog, openDialog } from "./glass-dialog";
import { Icon } from "./icons";
import {
  useProfile,
  useExperience,
  useTechStack,
  useCapabilityPillars,
  useT,
  bi,
} from "@/lib/i18n";
import { layer } from "@/lib/layer";

function Pillars() {
  const pillars = useCapabilityPillars();
  const [open, setOpen] = useState(0);
  return (
    <div className="pillars">
      {pillars.map((p, i) => (
        <div key={p.id} className="pillar spot" data-n={`0${i + 1}`} data-open={open === i ? "1" : "0"}>
          <button
            type="button"
            className="pillar-head"
            aria-expanded={open === i}
            aria-controls={`pillar-${p.id}`}
            onClick={() => setOpen(i)}
            onMouseEnter={() => setOpen(i)}
          >
            <span className="pillar-n">0{i + 1}</span>
            <span className="pillar-t">{p.title}</span>
          </button>
          <Expand id={`pillar-${p.id}`} open={open === i}>
            <div className="pillar-body">
              <p>{p.description}</p>
              <div className="chips">
                {p.examples.map((e) => (
                  <span key={e} className="chip">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </Expand>
        </div>
      ))}
    </div>
  );
}

function Stack() {
  const t = useT();
  const groups = useTechStack();
  const [sel, setSel] = useState(0);
  return (
    <div className="stack">
      <div className="stack-list" role="tablist" aria-orientation="vertical" aria-label="Stack">
        {groups.map((g, i) => (
          <button
            key={g.domain}
            type="button"
            role="tab"
            id={`stack-tab-${i}`}
            aria-selected={sel === i}
            aria-controls={`stack-panel-${i}`}
            className="stack-item"
            onClick={() => setSel(i)}
            onMouseEnter={() => setSel(i)}
          >
            {g.domain}
          </button>
        ))}
      </div>
      <div>
        {groups.map((g, i) => (
          <div
            key={g.domain}
            role="tabpanel"
            id={`stack-panel-${i}`}
            aria-labelledby={`stack-tab-${i}`}
            className="stack-detail"
            hidden={sel !== i}
          >
            <h4>{g.domain}</h4>
            <p>{g.blurb}</p>
            <div className="chips">
              {g.items.map((it) => (
                <span key={it} className="chip">
                  {it}
                </span>
              ))}
            </div>
            <p className="kicker" style={{ marginTop: 18 }}>
              {t(bi("Shipped in", "Usado en"))}
            </p>
            <ul className="shipped">
              {g.shippedIn.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function Experience() {
  const rows = useExperience();
  const [open, setOpen] = useState(0);
  return (
    <ul className="xp">
      {rows.map((r, i) => (
        <li key={`${r.role}-${r.when}`} className="xp-row" data-open={open === i ? "1" : "0"}>
          <button
            type="button"
            className="xp-head"
            aria-expanded={open === i}
            aria-controls={`xp-${i}`}
            onClick={() => setOpen(open === i ? -1 : i)}
          >
            <span>
              <b>{r.role}</b>
              <small>
                {r.org} · {r.when}
              </small>
            </span>
            <span className="more" aria-hidden>
              <span className="plus">
                <Icon name="plus" size={12} />
              </span>
            </span>
          </button>
          <Expand id={`xp-${i}`} open={open === i}>
            <ul className="xp-body">
              {r.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </Expand>
        </li>
      ))}
    </ul>
  );
}

export function About() {
  const t = useT();
  const profile = useProfile();

  return (
    <Screen id="about" label={t(bi("About", "Sobre mí"))}>
      <div className="screen-head layer" style={layer(0)}>
        <h2 className="h2">
          {t(bi("Who’s ", "Quién "))}
          <em>{t(bi("behind it", "está detrás"))}</em>
        </h2>
      </div>

      <div className="about-grid">
        <aside className="me glass spot layer" style={layer(1)}>
          <div className="me-top">
            <div className="portrait">
              <Image
                src="/images/projects/about-pic.jpeg"
                alt={t(bi("Portrait of Juan Felipe Zepeda", "Retrato de Juan Felipe Zepeda"))}
                fill
                sizes="(max-width: 900px) 64px, 330px"
              />
            </div>
            <div>
              <h3>{profile.name}</h3>
              <p className="me-role">{profile.role} · {profile.location}</p>
            </div>
          </div>
          <p className="me-bio">{profile.bio[0]}</p>
          <button type="button" className="more" onClick={() => openDialog("bio")}>
            <span className="plus">
              <Icon name="plus" size={12} />
            </span>
            {t(bi("Full story", "Historia completa"))}
          </button>
        </aside>

        <div className="panel glass layer" style={layer(2)}>
          <Tabs
            idBase="about"
            items={[
              {
                id: "focus",
                label: (
                  <>
                    <span className="only-executive">{t(bi("What I do", "Qué hago"))}</span>
                    <span className="only-technical">Stack</span>
                  </>
                ),
                panel: (
                  <>
                    <div className="only-executive">
                      <Pillars />
                    </div>
                    <div className="only-technical">
                      <Stack />
                    </div>
                  </>
                ),
              },
              {
                id: "experience",
                label: t(bi("Experience", "Experiencia")),
                panel: <Experience />,
              },
            ]}
          />
        </div>
      </div>

      <GlassDialog id="bio">
        <h2 id="bio-title" className="dlg-title">
          {profile.name}
        </h2>
        <p className="dlg-sub">{profile.role}</p>
        {profile.bio.map((para) => (
          <p key={para.slice(0, 24)} className="dlg-p">
            {para}
          </p>
        ))}
        <p className="dlg-p" style={{ color: "var(--accent)" }}>
          {profile.availability}
        </p>
        <div className="dlg-foot">
          <a href={profile.social.email} className="btn btn-primary">
            {t(bi("Email me", "Escríbeme"))}
            <Icon name="arrow-right" className="arr" />
          </a>
        </div>
      </GlassDialog>
    </Screen>
  );
}
