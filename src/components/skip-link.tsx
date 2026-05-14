"use client";

import { useT, bi } from "@/lib/i18n";

export function SkipLink() {
  const t = useT();
  return (
    <a href="#top" className="skip-link">
      {t(bi("Skip to content", "Saltar al contenido"))}
    </a>
  );
}
