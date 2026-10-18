<claude-mem-context>
# Memory Context

# [portfolio] recent context, 2026-10-18 2:34pm CST

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (16,235t read) | 819,816t work | 98% savings

### May 16, 2026
S963 Portfolio monorepo: all demos committed; primary session pivoting to explore new kiosko logistics project as potential additional demo (May 16 at 1:28 PM)
S965 Portfolio monorepo: yantissimo-shop-demo committed (7 demos total); primary session now bootstrapping kiosko-demo (VRP logistics) as 8th demo (May 16 at 1:28 PM)
S964 Portfolio monorepo: primary session investigating kiosko logistics project for potential 8th demo addition (May 16 at 1:29 PM)
S967 Portfolio monorepo: bootstrap kiosko-logistics-demo + fix projects.ts/es.ts kioskoLogistics entry (was wrongly describing a Swift iOS app) (May 16 at 1:33 PM)
S980 User asked if the demo can be deployed to Vercel via MCP — new deployment intent following completed mock data expansion (May 16 at 1:33 PM)
S981 User asked about deploying yantissimo-demo to Vercel via MCP — Claude explained how Vercel MCP works and recommended committing changes to git first (May 16 at 2:13 PM)
S975 Add extensive mock data for Yantissimo ERP demo by consulting the real backend at /Users/juanfelipezepeda/Developer/YSSM/(plataforma)/backend-yssm (May 16 at 2:30 PM)
S1228 Checking Vercel CLI availability in the portfolio project environment (May 16 at 2:36 PM)
### May 19, 2026
S1243 Deploy all portfolio demo projects to Vercel and wire live demo URLs into the portfolio website (May 19 at 12:32 PM)
4410 1:44p 🔵 karate-demo Re-linked with Explicit --project Flag to Fix Generic Name
4412 1:45p ⚖️ karate-demo .vercel Unlinked from apps/web — Strategy Change
4414 " ✅ karate-demo vercel.json Created for Turborepo Monorepo Deploy
4416 " ✅ karate-demo vercel.json Revised — rootDirectory Removed, Full Package Filter Used
4418 1:46p 🔵 karate-demo apps/web/src/app Directory Inaccessible — Possible Unbuilt Workspace
4419 " 🔵 karate-demo next.config.mjs Has KARATE_EXPORT Static Mode + transpilePackages
4420 1:47p ✅ karate-demo vercel.json Switched to Static Export Mode (KARATE_EXPORT=1)
4421 " ✅ karate-demo vercel.json Sets framework: null to Prevent Next.js Detection
4422 1:48p 🔴 karate-demo Build Succeeded But out/ Not Found — outputDirectory Path Wrong
4423 " 🔵 karate-demo turbo.json Outputs .next/** — Not out/** — Explains Missing out/ Directory
4424 " 🔴 karate-demo Bypasses Turbo — Uses pnpm --filter exec next build Directly
4426 1:49p 🟣 karate-demo Deployed to Vercel — Static Export Live After Turbo Bypass
4427 " 🔵 vercel promote Requires Interactive Confirmation for Non-Production Deploys
4428 " 🟣 karate-demo Promoted to Production via echo y | vercel promote
4429 " 🔵 karate-demo.vercel.app Alias Not Auto-Assigned After Promote
4430 " 🟣 karate-demo Deployed to Production — Aliased to karate-demo.vercel.app
4431 1:50p 🟣 crispdm-demo Linked to Vercel; Deployment Pipeline Advancing
4432 1:51p 🟣 crispdm-demo Deployed to Vercel — Live at crispdm-demo.vercel.app
4433 " 🟣 dataknife-demo Deployed to Vercel — All 6 Demos Now Live
4434 " 🟣 Portfolio wiring phase started — reading Project interface to add demoUrl field
4435 1:52p 🔵 projects.ts Full Structure Read — Project Interface Has No demoUrl Field
4439 " ⚖️ User Intent: Deploy Demos to Vercel and Link from Portfolio
4441 1:54p 🟣 Portfolio llms.txt updated with Vercel demo URLs for CRISP-DM and Karate Tournament
4444 1:55p 🟣 ProjectCard component gained conditional "View live demo" button
4445 " 🟣 Yantissimo case study sidebar gained "Live demos" section with ERP and Storefront links
4446 " 🔵 portfolio-web uses Bun as package manager, runs on port 4000
4447 1:56p 🟣 portfolio-web production build passes after demo URL changes
4448 " 🟣 All 6 Vercel demo URLs confirmed present in portfolio rendered HTML
4451 " 🔵 Only 1 "View live demo" label rendered in SSR HTML despite 6 demo URLs present
4452 " 🔵 Portfolio demo link rendering confirmed: 4 pill buttons + 2 Yantissimo text links = 6 total
4454 " 🔵 Yantissimo ERP demo (yantissimo-demo.vercel.app) reported broken despite being a full mock
4455 2:00p 🔵 yantissimo-demo.vercel.app returns HTTP 307 → /dashboard → 200, server is alive
4456 " 🔵 Yantissimo ERP demo renders shell but main content stuck at visibility:hidden "Loading..." — auth check failing client-side
4457 2:01p 🔵 Yantissimo demo auth gate is ProtectedClient component wrapping all (protected) routes, no middleware.ts
4458 " 🔵 ProtectedClient is already a mock bypass — renders children unconditionally and seeds MOCK_USER
4459 " 🔵 Yantissimo demo has conflicting root redirects: next.config.js sends / → /dashboard, page.jsx sends / → /cotizaciones
4460 " 🔵 Race condition: DashboardRouter reads session before ProtectedClient seeds MOCK_USER — shows "Loading..." permanently
4461 2:02p 🔵 Full bug trace: two compounding issues cause permanent "Loading..." on first visit to yantissimo demo
4476 2:03p 🔵 Yantissimo ERP demo /dashboard stuck on "Loading..." — React useEffect race condition
4477 " 🔴 Yantissimo ERP root redirect changed from /dashboard to /cotizaciones
4478 " ⚖️ Proposed fix for DashboardRouter race condition — synchronous MOCK_USER seeding
4480 2:10p 🔴 Yantissimo ERP demo production redirect confirmed live — / now lands on /cotizaciones
4481 2:25p 🔴 ProtectedClient.jsx — MOCK_USER seeding moved from useEffect to synchronous module-level guard
4482 " 🔴 HomepageLoaderGate.tsx — fixed React #418 hydration mismatch by initializing shouldShowLoader as false
4484 " 🔴 Yantissimo ERP demo — full fix deployed to Vercel preview with all three patches
4485 " 🔴 Yantissimo ERP all-fixes preview ready at yantissimo-demo-l3si954pe — awaiting production promotion
4483 2:27p ✅ next.config.mjs root redirect restored to /dashboard after ProtectedClient fix
4490 " 🔴 Yantissimo ERP full fix confirmed live in production — yantissimo-demo-annhh0wui is the new production deployment
4491 " 🔴 Yantissimo ERP /dashboard verified working in production — DashboardPage renders on first visit
4486 " 🔴 Yantissimo ERP full fix promoted to production — all three patches now live
S1252 Fix Yantissimo ERP demo at yantissimo-demo.vercel.app — broken on first visit despite being a full mock app (May 19 at 2:38 PM)
**Investigated**: - Confirmed deployment was live (Vercel status: Ready, no auth wall, x-vercel-cache: HIT)
    - Ran headless Chrome renders: /dashboard showed only "Loading..." + "Cargando" + 2 MuiButtons — no real content
    - Ran headless Chrome on /cotizaciones: rendered correctly with 6 MuiTypography elements and "Cotizaciones" — proving mock data, layout, and ProtectedClient all work
    - Captured React error #418 (hydration mismatch) from console on /dashboard load
    - Read ProtectedClient.jsx, DashboardRouter (dashboard/page.jsx), HomepageLoaderGate.tsx, session.js, mock-user.js, mocks/index.js, next.config.mjs

**Learned**: - Root cause 1 (race condition): React fires child useEffects before parent useEffects (bottom-up ordering). ProtectedClient (parent) seeded MOCK_USER in a useEffect; DashboardRouter (child) read getUserProfile() in its own useEffect — finding null because the parent hadn't run yet. Profile stayed null → permanent "Loading..." state. React Strict Mode double-invokes effects in dev, masking this bug entirely in local development.
    - Root cause 2 (hydration mismatch): HomepageLoaderGate initialized useState with a lazy initializer that read document.cookie synchronously — returns null on SSR, boolean on client. This divergence triggered React error #418, breaking hydration on heavy pages like /dashboard.
    - /cotizaciones works because it bypasses DashboardRouter's profile gate entirely — rendered directly from its route file.
    - The mock system (src/mocks/index.js) is fully self-contained with 24 JSON fixtures; zero real network calls occur.
    - next.config.mjs (ESM format) contains the root redirect, not next.config.js.

**Completed**: - Fixed ProtectedClient.jsx: moved MOCK_USER seeding from useEffect to module-level synchronous guard (`if (typeof window !== "undefined" && !getUserProfile()) saveUserProfile(MOCK_USER)`). Removed useEffect and React import entirely.
    - Fixed HomepageLoaderGate.tsx: changed useState initializer from `boolean | null` lazy initializer (reads document.cookie) to `useState&lt;boolean&gt;(false)` — identical on server and client. Removed the `shouldShowLoader === null` branch that rendered visibility:hidden. Cookie check now happens only in useEffect on mount.
    - Restored next.config.mjs root redirect to `/dashboard` (had been temporarily changed to `/cotizaciones` as a workaround before the real fixes were applied).
    - Deployed all three fixes to Vercel preview (yantissimo-demo-l3si954pe), then promoted to production (yantissimo-demo-annhh0wui, build ID: 5tcBcynhDxwji3A2Q7YJFPFU4f6o).
    - Verified production with headless Chrome: /dashboard now renders 22 MuiCard, 19 MuiTypography-root, "Dashboard", "Ventas", 4 Highchart elements. "h2>Loading" is absent. Root URL (/) also confirmed to land on working dashboard.

**Next Steps**: The Yantissimo ERP fix is complete and verified in production. No active work remaining on this issue. Other pending items from the broader session include: committing unstaged changes across the monorepo, adding env vars in Vercel dashboard for crispdm-demo and dataknife-demo, and optionally deleting the orphan "web" Vercel project.


Access 820k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>