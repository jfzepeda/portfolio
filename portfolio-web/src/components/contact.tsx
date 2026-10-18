"use client";

import { useState } from "react";
import { Screen } from "./screen";
import { Icon } from "./icons";
import { useProfile, useT, bi } from "@/lib/i18n";
import { layer } from "@/lib/layer";

export function Contact() {
  const t = useT();
  const profile = useProfile();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = profile.social.email;
    }
  }

  return (
    <Screen id="contact" className="contact" label={t(bi("Contact", "Contacto"))}>
      <p className="kicker layer" style={layer(0)}>
        {t(bi("Contact", "Contacto"))}
      </p>
      <h2 className="h2 layer" style={{ ...layer(1), marginTop: 14 }}>
        {t(bi("Let’s build ", "Construyamos "))}
        <em>{t(bi("something.", "algo."))}</em>
      </h2>
      <p className="contact-sub layer" style={layer(2)}>
        {profile.availability}
      </p>

      <div className="cta-row layer" style={layer(3)}>
        <a href={profile.social.email} className="btn btn-primary">
          <Icon name="mail" />
          {profile.email}
        </a>
        <button type="button" className="btn" onClick={copy} aria-live="polite">
          <Icon name={copied ? "check" : "copy"} />
          {copied ? t(bi("Copied", "Copiado")) : t(bi("Copy email", "Copiar correo"))}
        </button>
      </div>
      <div className="cta-row layer" style={{ ...layer(4), marginTop: 10 }}>
        <a href={profile.social.github} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
          GitHub <Icon name="arrow-up-right" size={14} className="arr arr-up" />
        </a>
        <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
          LinkedIn <Icon name="arrow-up-right" size={14} className="arr arr-up" />
        </a>
      </div>

      <footer className="foot layer" style={layer(5)}>
        <span>
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {profile.name} · {profile.location}
        </span>
        <a href="#top">
          {t(bi("Back to top", "Volver arriba"))} ↑
        </a>
      </footer>
    </Screen>
  );
}
