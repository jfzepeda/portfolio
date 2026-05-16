# Juan Felipe Zepeda — Portfolio

A premium portfolio site for an AI & product engineer. Built with Next.js 15
(App Router), React 19, Tailwind CSS 4, and TypeScript. Optimized for human
recruiters, executives, and AI / LLM scrapers in equal measure.

## Highlights

- **Two view modes**: Executive vs. Technical. Both copies are rendered to
  HTML — the toggle just controls visibility — so AI scrapers see all of it.
- **Four-tier project hierarchy**:
  - Tier 1 — Yantissimo Platform full case study (3 subproducts).
  - Tier 2 — 3 featured-deep projects.
  - Tier 3 — 6 featured projects with expandable architecture detail.
  - Tier 4 — 25+ projects in a horizontal carousel.
- **Premium design system**: Fraunces (display) + Inter (body) + JetBrains Mono.
  Dark-first with light-mode toggle. CSS variables, no runtime theming overhead.
- **AI / GEO / SEO files**: `agents.md`, `llms.txt`, `robots.txt`,
  `sitemap.xml`, and inline schema.org `Person` + `CollectionPage` JSON-LD.
- **Pre-hydration mode + theme** read from localStorage to avoid flash.
- **Static-first**: ~883 B page JS, all routes pre-rendered, ~102 KB First Load JS.

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
│   ├── page.tsx          — homepage (composes all sections)
│   ├── sitemap.ts        — programmatic sitemap from project data
│   └── globals.css       — design tokens, mode/theme CSS, utilities
├── components/
│   ├── nav.tsx           — sticky nav + ModeToggle + ThemeToggle
│   ├── hero.tsx          — hero with mode-swappable pitch
│   ├── capability-pillars.tsx
│   ├── yantissimo-case-study.tsx — Tier 1 hero platform
│   ├── featured-grid.tsx — Tier 2 + Tier 3 cards
│   ├── project-card.tsx  — reusable card with executive/technical accordion
│   ├── tier4-carousel.tsx — horizontal carousel for remaining projects
│   ├── skills-matrix.tsx
│   ├── about.tsx
│   ├── footer.tsx
│   ├── toggles.tsx       — Executive/Technical + Light/Dark client toggles
│   └── mode-script.tsx   — pre-hydration localStorage read
├── data/
│   ├── projects.ts       — every project's metadata + copy (single source of truth)
│   └── profile.ts        — identity, skills matrix, capability pillars
public/
├── llms.txt              — canonical plain-text portfolio summary for LLMs
├── agents.md             — agent indexing guidance
├── robots.txt            — explicit allow for AI/LLM crawlers
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
