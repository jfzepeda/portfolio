# CLAUDE.md

Monorepo: `portfolio-web/` is the marketing site; every `*-demo/` folder is an
independent mock-data demo with its own `package.json` and Vercel project.
There is no root install — `cd <folder> && bun install`.

## portfolio-web (Next 15 · React 19 · Tailwind 4 · TypeScript · Bun)

```bash
cd portfolio-web
bun install
bun run dev          # http://localhost:4000
bun run typecheck    # tsc --noEmit
bun run build && bun run start
```

### Design contract (do not break)

- **Total height = 400svh.** Exactly four `.screen` sections (Hero, Work, About,
  Contact), each `height: 100svh` (`min-height: 560px`). New content must fit
  inside a screen: use dialogs, tabs, accordions (`Expand`) or hover layers —
  never add a fifth screen or let a screen grow.
- **Layered text.** Headline first; detail behind a button/hover/tab. Stagger
  entrance with `.layer` + `style={layer(i)}` (`src/lib/layer.ts`); `Screen`
  sets `data-in="1"` on first view.
- **Glass system** lives in `src/app/globals.css`: `.glass`, `.spot` (cursor
  sheen, fed by `<Spotlight/>`), `.lift`, `.chip`, `.btn`, `.more`. Colours are
  CSS variables; light theme overrides them under `[data-theme="light"]`.
  Do not hardcode colours in components.
- **Dialogs are native `<dialog>`** via `GlassDialog` + `openDialog(id)`;
  content stays in server-rendered HTML even while closed (SEO). Children must
  render an element with `id={`${id}-title`}`.
- **Executive/Technical modes**: render both copies, tag with
  `.only-executive` / `.only-technical`; CSS swaps visibility
  (`html[data-mode]`). Exec view shows capabilities, tech view shows stack.
- **i18n**: UI strings with `t(bi("en", "es"))`; data via the hooks in
  `src/lib/i18n.tsx`. Every data change must be mirrored in the `*.es.ts` file.
- Theme/mode/lang are restored pre-hydration by `mode-script.tsx` /
  `lang-script.tsx` (keys `jfz:theme`, `jfz:mode`, `jfz:lang`).
- No UI library dependencies on purpose; keep it that way unless asked.

### Verifying UI changes

Build, start, then check in a real browser (Playwright/Chromium is
pre-installed) that `document.documentElement.scrollHeight / innerHeight === 4`
at 1440×900, 1366×768, 390×844 and 360×640, in dark and light. Kill the old
`next-server` by PID before restarting (port 4000), or you will test a stale build.

### Content / data

- `src/data/projects.ts` (+ `.es.ts`): tiers 1–3 are the 10 featured projects,
  `tier4` feeds the "more projects" dialog. `demoUrl` adds the Live demo button.
- `src/data/profile.ts` (+ `.es.ts`): identity, credibility stats, stack,
  experience, capability pillars. `profile.social.*` still holds placeholder
  GitHub/LinkedIn URLs — replace with real ones.
- The contact section is mailto/copy-email only (the previous form never sent
  anything). Add a real backend/service before reintroducing a form.
- `public/llms.txt`, `agents.md` and `sitemap.ts` must stay consistent with the data.
