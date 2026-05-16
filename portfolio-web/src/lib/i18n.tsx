"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "es";

// A localized value can be a plain string (same in both languages) or a pair.
export type L<T = string> = T | { en: T; es: T };

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
}>({
  lang: "en",
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const v = document.documentElement.getAttribute("data-lang");
    if (v === "es" || v === "en") setLangState(v);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.documentElement.setAttribute("data-lang", l);
    try {
      localStorage.setItem("jfz:lang", l);
    } catch {}
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

function isPair<T>(v: unknown): v is { en: T; es: T } {
  return (
    typeof v === "object" &&
    v !== null &&
    "en" in (v as object) &&
    "es" in (v as object)
  );
}

export function pick<T>(value: L<T>, lang: Lang): T {
  if (isPair<T>(value)) return value[lang];
  return value as T;
}

export function useT() {
  const { lang } = useLang();
  return useCallback(
    function t<T>(value: L<T>): T {
      return pick<T>(value, lang);
    },
    [lang],
  );
}

// Convenience constructor for bilingual values.
export function bi<T>(en: T, es: T): { en: T; es: T } {
  return { en, es };
}

// ─── Data resolver hooks ───
// These switch entire data objects between English and Spanish.
// Implemented as hooks so consumers re-render when locale changes.

import { profile as profileEn, experience as experienceEn, techStack as techStackEn, skillGroups as skillGroupsEn, capabilityPillars as capabilityPillarsEn } from "@/data/profile";
import { profile as profileEs, experience as experienceEs, techStack as techStackEs, skillGroups as skillGroupsEs, capabilityPillars as capabilityPillarsEs } from "@/data/profile.es";
import {
  yantissimo as yantissimoEn,
  tier1 as tier1En,
  tier2 as tier2En,
  tier3 as tier3En,
  tier4 as tier4En,
  featuredProjects as featuredProjectsEn,
  categoryLabels as categoryLabelsEn,
} from "@/data/projects";
import {
  yantissimo as yantissimoEs,
  tier1 as tier1Es,
  tier2 as tier2Es,
  tier3 as tier3Es,
  tier4 as tier4Es,
  featuredProjects as featuredProjectsEs,
  categoryLabels as categoryLabelsEs,
} from "@/data/projects.es";

export function useProfile() {
  const { lang } = useLang();
  return lang === "es" ? profileEs : profileEn;
}
export function useExperience() {
  const { lang } = useLang();
  return lang === "es" ? experienceEs : experienceEn;
}
export function useTechStack() {
  const { lang } = useLang();
  return lang === "es" ? techStackEs : techStackEn;
}
export function useSkillGroups() {
  const { lang } = useLang();
  return lang === "es" ? skillGroupsEs : skillGroupsEn;
}
export function useCapabilityPillars() {
  const { lang } = useLang();
  return lang === "es" ? capabilityPillarsEs : capabilityPillarsEn;
}
export function useYantissimo() {
  const { lang } = useLang();
  return lang === "es" ? yantissimoEs : yantissimoEn;
}
export function useTier1() {
  const { lang } = useLang();
  return lang === "es" ? tier1Es : tier1En;
}
export function useTier2() {
  const { lang } = useLang();
  return lang === "es" ? tier2Es : tier2En;
}
export function useTier3() {
  const { lang } = useLang();
  return lang === "es" ? tier3Es : tier3En;
}
export function useTier4() {
  const { lang } = useLang();
  return lang === "es" ? tier4Es : tier4En;
}
export function useFeaturedProjects() {
  const { lang } = useLang();
  return lang === "es" ? featuredProjectsEs : featuredProjectsEn;
}
export function useCategoryLabels() {
  const { lang } = useLang();
  return lang === "es" ? categoryLabelsEs : categoryLabelsEn;
}
