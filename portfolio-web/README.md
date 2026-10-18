# Juan Felipe Zepeda — Portfolio

A premium portfolio site for an AI & product engineer. Built with Next.js 15
(App Router), React 19, Tailwind CSS 4, and TypeScript. Optimized for human
recruiters, executives, and AI / LLM scrapers in equal measure.

## Highlights

- **Four screens, exactly 400svh**: Hero · Work · About · Contact. Each
  `.screen` is `height: 100svh`, so the page is never longer than four
  viewports on any device.
- **Glassmorphism, dark + light**: frosted-glass surfaces over drifting colour
  orbs. Theme follows the system preference on first visit, then the toggle
  (stored in `localStorage`).
- **Layered copy**: a headline first, detail behind a button or hover —
  staggered fade-in per screen, "+ More" on the hero, hover-reveal on project
  cards, project / bio / archive dialogs, tabs and accordions.
- **Two view modes**: Executive (Pro) vs. Technical (Tech). Both copies are
  rendered to HTML — CSS only toggles visibility — so AI scrapers see all of it.
- **Bilingual**: EN / ES via `useT()` + `bi()` and the `*.es.ts` data files.
- **Four-tier project data** (`src/data/projects*.ts`): 10 featured projects
  in the bento grid, the remaining ones in the "more projects" dialog.
- **AI / GEO / SEO files**: `agents.md`, `llms.txt`, `robots.txt`,
  `sitemap.xml`, and inline schema.org `Person` + `CollectionPage` JSON-LD.
- **No UI dependencies**: Next 15, React 19, Tailwind 4 reset only; all
  components and styles are in-repo (~150 KB First Load JS).

## Stack

- Next.js 15.5 (App Router, RSC), React 19, TypeScript
- Tailwind CSS 4 (CSS-variable theme tokens via `@theme`)
- Bun runtime / package manager
- Designed for Vercel (or any static host)

## Layout

```
src/
├── app/
│   ├── layout.tsx        — root layout, metadata, schema.org Person, fonts
│   ├── page.tsx          — composes the four screens + background orbs
│   ├── sitemap.ts        — sitemap (home + section anchors)
│   ├── icon.svg          — favicon
│   └── globals.css       — tokens (dark/light), glass primitives, all layout CSS
├── components/
│   ├── nav.tsx           — floating glass pill (+ bottom dock on phones), lang / mode / theme toggles
│   ├── hero.tsx          — screen 1: name, layered pitch, stats, brand marquee
│   ├── work.tsx          — screen 2: bento grid, hover-reveal cards, archive dialog
│   ├── project-dialog.tsx — per-project dialog (tabs: overview / details / stack)
│   ├── about.tsx         — screen 3: portrait, tabs (pillars | stack | experience), bio dialog
│   ├── contact.tsx       — screen 4: mailto / copy email / socials + footer
│   ├── screen.tsx · expand.tsx · tabs.tsx · glass-dialog.tsx · spotlight.tsx · icons.tsx — primitives
│   └── mode-script.tsx   — pre-hydration read of mode + theme
├── data/                 — projects(.es).ts, profile(.es).ts (single source of truth)
└── lib/                  — i18n.tsx (lang context + data hooks), layer.ts
public/
├── llms.txt · agents.md · robots.txt
└── images/projects/      — project screenshots & icons
```

## Develop

```bash
bun install
bun run dev   # http://localhost:4000
```

## Build

```bash
bun run build
bun run start
```

## Deploy

```bash
# Vercel (zero-config)
vercel
```

The site is fully static — works on any static host.

## Editing project content

All project metadata lives in `src/data/projects.ts`. Each project has
executive + technical copy, scale signals, stack, capabilities, and an
icon. Add a new project to either `tier1`/`tier2`/`tier3` (full card) or
`tier4` (carousel mini-card) — it'll automatically appear on the homepage,
in the schema.org collection, and in the sitemap.

## License

© Juan Felipe Zepeda. All rights reserved.
