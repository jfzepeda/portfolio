# AGENTS.md

This file gives AI coding agents the minimum context needed to work safely and quickly in this repository.

## Project Summary

- Name: `erp-yssm`
- Stack: Next.js App Router (`next@16`), React 18, MUI, plain JS/JSX (TypeScript deps exist but app code is mostly JS)
- Domain: ERP/CRM for sales, quotes, orders, inventory, distributor/client portals, and agent inbox/chat workflows
- Language: UI copy and business terms are mostly Spanish

## Runbook

- Install deps: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Start production build: `npm run start`
- Lint: `npm run lint`

Notes:

- There is no formal test suite configured (no Jest/Cypress/Playwright setup detected).
- `node_modules/` is already present in local workspace for many sessions, but do not assume globally.

## Environment

Primary client env vars used by the app:

- `NEXT_PUBLIC_API_URL` (required): backend base URL used by `src/lib/api.js`
- `NEXT_PUBLIC_AGENT_URL` (required for agent chat/widget flows)
- `NEXT_PUBLIC_BACKBLAZE_PUBLIC_BASE_URL` (used for file/image URL composition)
- `NEXT_PUBLIC_NODE_ENV` (used for conditional debug logs)

Local `.env` exists in repo root; do not commit secrets.

## High-Level Architecture

- App routes live in `src/app/` using route groups:
  - `src/app/(public)` -> public views (`/login`, `/widget`)
  - `src/app/(protected)` -> internal authenticated app
  - `src/app/(clientes)` -> distributor/client portal
- Shared components: `src/components/`
- Domain/API helpers: `src/lib/`
- Session and global constants: `src/utils/session.js`, `src/utils/global.js`
- App-wide toast system: `src/resources/ToastProvider.jsx` (exposes `window.showToast`)

Path aliases:

- `~/*` -> `src/*`
- `@/*` -> `src/app/(protected)/*`

## Auth and Session Model

- Login posts to `/auth/login` and stores `user` in localStorage via `saveUserProfile`.
- Protected views use `src/components/ProtectedClient.jsx`:
  - Checks local user profile and role thresholds.
  - Calls `/me` on route changes.
  - Redirects to `/login` on 401.
- API wrapper (`src/lib/api.js`) auto-attempts `/auth/refresh` on 401 and retries once.

## Key Product Areas

Major protected modules (not exhaustive):

- Dashboard: `src/app/(protected)/dashboard`
- Quotes: `src/app/(protected)/cotizaciones`
- Orders: `src/app/(protected)/ordenes`
- Inventory: `src/app/(protected)/inventario`
- Team/users: `src/app/(protected)/equipo`, `src/app/(protected)/configuracion/usuarios`
- Pricing/formulas/promos: `src/app/(protected)/configuracion/formula`
- Distributor management: `src/app/(protected)/configuracion/distribuidores`
- Agent inbox/chat: `src/app/(protected)/agent`
- Client portal: `src/app/(clientes)/clientes/*`

## API Integration Conventions

- Most requests go through `src/lib/api.js` using `fetch` with `credentials: include`.
- Many modules call backend endpoints directly (e.g. `/api/quotes/*`, `/api/orders/*`, `/api/dist/*`).
- UI feedback convention is toast-first (`window.showToast`) with occasional loading overlays (`showLoadingOverlay`).
- Error handling is mixed; preserve existing behavior when patching adjacent code.

## UI and State Conventions

- MUI is the main component library (`ThemeProvider` in protected/client layouts).
- Legacy patterns exist: some files force `window.location.reload()` after mutations.
- Business constants (roles, branches, doctypes) are centralized in `src/utils/global.js`.

## Important Files to Read Before Large Changes

- `src/lib/api.js`
- `src/components/ProtectedClient.jsx`
- `src/utils/session.js`
- `src/utils/global.js`
- `src/app/(protected)/layout.jsx`
- `src/app/(clientes)/clientes/layout.jsx`
- `docs/agent-inbox-ux.md` (agent module UX/architecture notes)
- `ui_changes.md` (recent API/UI change notes for distributor panel and flows)

## Agent Working Guidelines (Repo-Specific)

- Prefer minimal, local changes; this codebase has repeated patterns across modules.
- Keep Spanish UX copy consistent with surrounding screens.
- Reuse existing helpers in `src/lib/` before creating new API wrappers.
- Preserve role-based access assumptions (`ROLES` values are business-critical).
- When touching route-group files with parentheses in shell commands, quote paths.
  - Example: `sed -n '1,120p' 'src/app/(protected)/layout.jsx'`
- If modifying API-dependent UI, include manual verification steps in your summary because automated tests are limited.

## Manual QA Checklist Template

When shipping non-trivial changes, validate:

1. Login and protected route access by role.
2. Main happy path for edited module (create/update/read).
3. Error toast behavior for failed backend responses.
4. No regressions in navigation/sidebar/layout for affected route group.

## Known Constraints / Risks

- README is mostly default Next.js boilerplate and does not describe business architecture.
- Some naming inconsistencies exist (`loadigOverlay.jsx`, mixed English/Spanish identifiers).
- Lint is available, but project contains legacy patterns; avoid broad refactors unless requested.
