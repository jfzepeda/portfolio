"use client";

import { useState } from "react";
import { Screen } from "./screen";
import { Expand } from "./expand";
import { Icon } from "./icons";
import { DottedSurface } from "./dotted-surface";
import { useProfile, useT, bi } from "@/lib/i18n";
import { layer } from "@/lib/layer";

// Brand silhouettes drawn as CSS masks so colour follows the theme.
const BRANDS = [
  ["iOS · Apple", "apple"],
  ["Swift", "swift"],
  ["OpenAI", "openai"],
  ["Anthropic Claude", "anthropic"],
  ["TypeScript", "typescript"],
  ["Next.js", "nextdotjs"],
  ["React", "react"],
  ["Node.js", "nodedotjs"],
  ["PostgreSQL", "postgresql"],
  ["WhatsApp API", "whatsapp"],
  ["Shopify", "shopify"],
  ["Vercel", "vercel"],
] as const;

export function Hero() {
  const t = useT();
  const profile = useProfile();
  const [open, setOpen] = useState(false);
  const [first, ...rest] = profile.pitch.split(/(?<=\.)\s+/);
  const doubled = [...BRANDS, ...BRANDS];

  return (
    <Screen id="top" className="hero" label="Hero">
      <DottedSurface />
      <div className="hero-grid">
        <div>
          <p className="status glass layer" style={layer(0)}>
            <i aria-hidden />
            {t(bi("Available · 2026", "Disponible · 2026"))}
          </p>

          <h1 className="layer" style={layer(1)}>
            Juan Felipe
            <span>Zepeda.</span>
          </h1>

          <p className="hero-role layer" style={layer(2)}>
            {profile.role}
          </p>

          <p className="hero-pitch layer" style={layer(3)}>
            {first}
          </p>
          <Expand id="hero-more" open={open}>
            <div className="hero-more">
              <p>{rest.join(" ")}</p>
            </div>
          </Expand>

          <div className="cta-row layer" style={layer(4)}>
            <a href="#work" className="btn btn-primary">
              {t(bi("View work", "Ver proyectos"))}
              <Icon name="arrow-right" className="arr" />
            </a>
            <a href="#contact" className="btn">
              {t(bi("Contact", "Contacto"))}
            </a>
            <button
              type="button"
              className="more"
              aria-expanded={open}
              aria-controls="hero-more"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="plus">
                <Icon name="plus" size={12} />
              </span>
              {open ? t(bi("Less", "Menos")) : t(bi("More", "Ver más"))}
            </button>
          </div>
        </div>

        <ul className="stats layer" style={layer(5)}>
          {profile.credibility.map((c) => (
            <li key={c.label} className="stat glass spot lift">
              <b className="numerals">{c.value}</b>
              <span>{c.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="marquee-wrap layer" style={layer(6)}>
        <div
          className="brand-marquee"
          aria-label={t(
            bi(
              "Tools and platforms I work with",
              "Herramientas y plataformas con las que trabajo",
            ),
          )}
        >
          <div className="brand-marquee-track">
            {doubled.map(([label, slug], i) => {
              // Simple Icons dropped OpenAI, so it is served from /public.
              const src =
                slug === "openai"
                  ? "/icons/openai.svg"
                  : `https://cdn.simpleicons.org/${slug}`;
              return (
                <div
                  key={`${slug}-${i}`}
                  className="brand-cell"
                  aria-hidden={i >= BRANDS.length || undefined}
                >
                  <span
                    className="brand-mark"
                    style={{
                      WebkitMaskImage: `url(${src})`,
                      maskImage: `url(${src})`,
                    }}
                  />
                  <span className="brand-label">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Screen>
  );
}
