"use client";

import { useEffect, useState } from "react";
import { useLang, useT, bi } from "@/lib/i18n";
import { Icon } from "./icons";

type Mode = "executive" | "technical";
type Theme = "dark" | "light";

const IDS = ["top", "work", "about", "contact"] as const;

function persist(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

export function Nav() {
  const t = useT();
  const { lang, setLang } = useLang();
  const [mode, setMode] = useState<Mode>("executive");
  const [theme, setTheme] = useState<Theme>("dark");
  const [active, setActive] = useState<string>("top");

  const links: Record<(typeof IDS)[number], string> = {
    top: t(bi("Home", "Inicio")),
    work: t(bi("Work", "Proyectos")),
    about: t(bi("About", "Sobre mí")),
    contact: t(bi("Contact", "Contacto")),
  };

  useEffect(() => {
    const root = document.documentElement;
    setMode(root.getAttribute("data-mode") === "technical" ? "technical" : "executive");
    setTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark");
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { threshold: 0.5 },
    );
    IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  function changeMode(next: Mode) {
    setMode(next);
    document.documentElement.setAttribute("data-mode", next);
    persist("jfz:mode", next);
  }

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    persist("jfz:theme", next);
  }

  const linkEls = IDS.map((id) => (
    <a
      key={id}
      href={`#${id}`}
      className="nav-link"
      aria-current={active === id ? "true" : undefined}
    >
      {links[id]}
    </a>
  ));

  return (
    <>
      <header className="nav glass">
        <a href="#top" className="nav-brand" aria-label="Juan Felipe Zepeda">
          <i aria-hidden />
          <span>Juanfe</span>
        </a>

        <nav className="nav-links" aria-label={t(bi("Sections", "Secciones"))}>
          {linkEls}
        </nav>

        <div className="nav-tools">
          <div
            className="seg"
            role="group"
            aria-label={t(bi("Language", "Idioma"))}
            data-i={lang === "es" ? 1 : 0}
          >
            <span className="seg-thumb" aria-hidden />
            <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
              EN
            </button>
            <button type="button" aria-pressed={lang === "es"} onClick={() => setLang("es")}>
              ES
            </button>
          </div>
          <div
            className="seg"
            role="group"
            aria-label={t(bi("View mode", "Modo de vista"))}
            data-i={mode === "technical" ? 1 : 0}
          >
            <span className="seg-thumb" aria-hidden />
            <button type="button" aria-pressed={mode === "executive"} onClick={() => changeMode("executive")}>
              Pro
            </button>
            <button type="button" aria-pressed={mode === "technical"} onClick={() => changeMode("technical")}>
              Tech
            </button>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={t(
              theme === "dark"
                ? bi("Switch to light theme", "Cambiar a tema claro")
                : bi("Switch to dark theme", "Cambiar a tema oscuro"),
            )}
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} />
          </button>
        </div>
      </header>

      <nav className="dock glass" aria-label={t(bi("Sections", "Secciones"))}>
        {linkEls}
      </nav>
    </>
  );
}
