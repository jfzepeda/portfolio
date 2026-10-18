# portfolio

Monorepo for the marketing site and every public live demo of my work.

Each subfolder is a fully self-contained project with its own `package.json`, lockfile, and Vercel project. Versions never collide — Next.js 15 and 16, React 18 and 19, can coexist without conflict.

## Layout

| Folder | What it is | Deploy target |
|---|---|---|
| `portfolio-web/` | The marketing site at `jfzepeda.com` | Vercel (this repo, root dir = `portfolio-web`) |
| `yantissimo-demo/` | Live mock-data demo of the Yantissimo ERP (forked from `yssm-erp@demo`) | Vercel (this repo, root dir = `yantissimo-demo`) |

Demos run with no login and stubbed data — every backend call resolves to a local JSON fixture or a success-shaped no-op. Visitors can click around safely; no real customer data, no API costs.

## Develop

```bash
cd <folder> && npm install && npm run dev
```

Each folder is independent — there is no root `npm install`.

## Adding a new demo

1. Fork the upstream project's source into a new sibling folder (e.g., `dataknife-demo/`).
2. Apply the demo pattern: auth bypass, stub the data layer, fixtures, disable any external-service-dependent routes.
3. Create a new Vercel project pointing at this repo with `Root Directory` set to the new folder. No env vars unless something genuinely needs them.
4. Add `liveDemoUrl` to the corresponding entry in `portfolio-web/src/data/projects.ts` (and `.es.ts`).

Demo source is forked once at bootstrap time. Drift from upstream prod is accepted.
