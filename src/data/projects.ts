// =============================================================================
// PROJECT DATABASE
// Every featured project's metadata, summaries, and tech mapping.
// Sources: Local repo READMEs, package.json files, source code inspection.
// =============================================================================

export type Tier = 1 | 2 | 3 | 4;

export type Category =
  | "enterprise"
  | "ai"
  | "web"
  | "swift"
  | "automation"
  | "experimental";

export type Status = "production" | "active" | "prototype" | "experimental";

export interface Subproduct {
  name: string;
  role: string;
  stack: string[];
  scale: string;
  highlights: string[];
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  tier: Tier;
  category: Category;
  status: Status;
  year: number;
  recencyLabel: string; // e.g. "May 2026" — last meaningful activity
  icon: string; // emoji or short symbol
  accent: string; // tailwind color name for tier accent
  scaleSignal: string; // "450 files / 17k LOC"

  // ─── COPY ───
  executive: {
    headline: string;
    summary: string; // 2-4 sentences, business-focused, no jargon
    outcomes: string[]; // 3-5 outcome bullets
  };

  technical: {
    headline: string;
    summary: string; // 2-4 sentences, technical
    architecture: string; // paragraph
    highlights: string[]; // 4-7 implementation highlights
  };

  // ─── METADATA ───
  stack: string[]; // tech tags (canonical names)
  capabilities: string[]; // business capability tags (LLM-friendly)
  domain: string; // e.g. "Tire & Wheel Logistics"
  users: string; // who uses it

  // ─── ASSETS ───
  // Subproducts (only populated for Tier 1 platform projects)
  subproducts?: Subproduct[];
  screenshots?: string[]; // paths under /public
  hero?: string; // hero image path
  repoPath?: string; // original local path for provenance
}

// ─────────────────────────────────────────────────────────────────────────────
// TIER 1 — HERO: YANTISSIMO PLATFORM
// Bundles iOS app + Express backend + Next.js Shopify storefront as one
// end-to-end product case study.
// ─────────────────────────────────────────────────────────────────────────────

export const yantissimo: Project = {
  id: "yantissimo",
  slug: "yantissimo",
  name: "Yantissimo Platform",
  tagline:
    "End-to-end commerce platform for a tire and wheel distributor — native iOS app, Express API, headless Shopify storefront.",
  tier: 1,
  category: "enterprise",
  status: "production",
  year: 2026,
  recencyLabel: "May 2026",
  icon: "Y",
  accent: "amber",
  scaleSignal: "3 products · ~283 source files · ~14k+ LOC",
  executive: {
    headline: "A complete digital platform for a real automotive distributor.",
    summary:
      "Yantissimo is the customer-facing digital layer of Llantísimo, a tire and wheel distributor in Mexico. I built the entire stack: a native iOS app for end customers, an Express backend orchestrating Shopify, payments, and scheduling, and a Next.js storefront that lets customers find tires by vehicle (make / model / year). The platform handles the full commercial loop — product discovery, quotes, payments, appointments, loyalty, and post-service follow-up.",
    outcomes: [
      "Customers self-serve the entire path from quote to payment to appointment, freeing the team to focus on operations.",
      "Native iOS app with offline-first cache and 'eternal session' so customers never get logged out at the worst moment.",
      "Storefront search by vehicle (make / model / year) using Wheel-Size API — no more manual tire-size lookups in store.",
      "All three surfaces share one backend, one source of truth, one product catalog — Shopify-headless.",
      "Production deployed: backend on Railway, storefront and admin on Vercel, iOS app on TestFlight.",
    ],
  },
  technical: {
    headline: "Three coordinated products. One backend. Zero shortcuts.",
    summary:
      "Production-grade three-surface architecture. Each product is independently deployed and independently testable. The Express API is the single source of truth — Shopify Admin/Storefront, OpenAI, Backblaze B2, MySQL, Postgres, and Google Sheets all converge there. The iOS client uses zero external dependencies; the storefront extends Vercel's Next.js Commerce template with custom vehicle-search pipelines.",
    architecture:
      "Express + Postgres backend with 41 modular routes, JWT auth, per-feature middleware, scheduled jobs, and a real Jest + Supertest test suite. iOS client uses a hand-written APIClient with 401-refresh-retry, Keychain-backed sessions, Application Support cache hydration before fetch, and per-build-config backend URLs. Storefront is Next.js 15.6 + React 19 with a custom 'Por auto' flow wiring Wheel-Size API into the Shopify GraphQL catalog.",
    highlights: [
      "Express API: 167 source files, 41 routes, Jest + Supertest tests, modular middleware layer, async job queue.",
      "Shopify Admin & Storefront API integration with cookie-jar auth and signed webhook handling.",
      "iOS APIClient with one-shot 401 refresh retry, eternal session, and feature-flagged SMS-OTP.",
      "Application Support cache hydration so the iOS app opens with content even before the network call returns.",
      "Wheel-Size API integration for make/model/year → tire-size resolution on the storefront.",
      "OpenAI integration for sales recommendations and customer inquiry triage.",
      "Backblaze B2 for media, Google Sheets bridge for back-office reporting, Puppeteer for payment confirmation.",
    ],
  },
  stack: [
    "Swift 5.9",
    "SwiftUI",
    "Node.js 20",
    "Express",
    "TypeScript",
    "Next.js 15",
    "React 19",
    "Tailwind CSS 4",
    "PostgreSQL",
    "MySQL",
    "Shopify Admin API",
    "Shopify Storefront API",
    "OpenAI",
    "JWT",
    "Keychain",
    "Backblaze B2",
    "Google Sheets API",
    "Puppeteer",
    "Vercel",
    "Railway",
    "Jest",
    "Supertest",
  ],
  capabilities: [
    "E-commerce",
    "Native Mobile",
    "Headless Storefront",
    "Payment Links",
    "Appointment Scheduling",
    "Loyalty / Membership",
    "Vehicle Search",
    "AI Recommendations",
    "Media CDN",
    "Push Notifications",
  ],
  domain: "Tire & Wheel Distribution (B2C + B2B)",
  users: "End customers (iOS), web shoppers, internal sales team.",
  subproducts: [
    {
      name: "Yantissimo iOS",
      role: "Native customer-facing app",
      stack: [
        "Swift 5.9",
        "SwiftUI",
        "iOS 16+",
        "Network.framework",
        "Keychain",
        "APNs",
      ],
      scale: "68 Swift files · ~7.1k LOC · 541 LOC of tests",
      highlights: [
        "Zero external dependencies (no SPM, no CocoaPods).",
        "Custom APIClient with 401 refresh retry and eternal session.",
        "10+ feature modules: Onboarding, Home, Profile, Club, Convenios, Promotions, Reminders, Visits, Quotes, Postchecks.",
        "Offline cache hydrates UI before fetch.",
        "Feature flags (e.g. SMS-OTP gate) controlled at compile time via xcconfig.",
        "Push notifications wired through PushManager → backend device registration.",
      ],
    },
    {
      name: "Yantissimo Backend (yssm-backend)",
      role: "API + orchestration layer",
      stack: [
        "Node.js 20",
        "Express",
        "PostgreSQL",
        "MySQL",
        "Shopify SDKs",
        "OpenAI",
        "Puppeteer",
        "Jest",
        "Supertest",
      ],
      scale: "167 source files · ~7.3k LOC · 41 route modules",
      highlights: [
        "Modular routes: auth, mobile-app, services, quotes, ventas, dashboard, shopify, scrapper, calendar, formula, qr, cron, …",
        "Real test coverage with Jest + Supertest.",
        "Async job queue for long-running tasks.",
        "Direct Shopify Admin + Storefront integration with cookie-jar auth.",
        "Backblaze B2 for media, Google Sheets bridge for back-office reporting.",
        "OpenAI integration powering sales recommendations and message triage.",
      ],
    },
    {
      name: "Yantissimo Shop",
      role: "Headless storefront",
      stack: [
        "Next.js 15.6",
        "React 19",
        "TypeScript",
        "Tailwind CSS 4",
        "Shopify Storefront GraphQL",
        "Wheel-Size API",
        "Vercel",
      ],
      scale: "~116 source files · server components + edge middleware",
      highlights: [
        "Vehicle search ('Por auto') wired through Wheel-Size API into Shopify catalog.",
        "Server components, Server Actions, Suspense, useOptimistic.",
        "Edge middleware for routing and revalidation.",
        "Integrated with the same backend cart and checkout flow as the iOS app.",
      ],
    },
  ],
  hero: "/images/projects/yantissimo-hero.jpg",
  screenshots: [
    "/images/projects/yantissimo-shop-1.jpg",
    "/images/projects/yantissimo-shop-2.jpg",
    "/images/projects/yantissimo-shop-3.jpg",
  ],
  repoPath:
    "Swift/yantissimo + YSSM/(yaol)/backend-yssm + YSSM/(yaol)/shop-yaol",
};

// ─────────────────────────────────────────────────────────────────────────────
// TIER 2 — FEATURED DEEP
// ─────────────────────────────────────────────────────────────────────────────

export const fitnessCopilot: Project = {
  id: "fitness-copilot",
  slug: "fitness-copilot",
  name: "Fitness Copilot",
  tagline:
    "AI-assisted fitness, nutrition, and training companion for iOS, backed by Supabase + Claude.",
  tier: 2,
  category: "swift",
  status: "active",
  year: 2026,
  recencyLabel: "May 2026",
  icon: "F",
  accent: "emerald",
  scaleSignal: "26 Swift files · 8.3k LOC · 6 tabs · Supabase + Claude Edge",
  executive: {
    headline: "A personal AI coach for diet, training, and recovery.",
    summary:
      "Fitness Copilot is an iOS app that combines macro tracking, weekly training plans, lab-result reading, and an AI coach in one place. The app is bilingual-ready (currently Spanish) and designed around how athletes actually use their phone — quick logging, glanceable timelines, and AI conversations that have real context about your goals, allergies, and recent labs.",
    outcomes: [
      "All your fitness context — diet, workouts, labs, supplements — lives in one place the AI can reason over.",
      "Daily timeline view shows what's next without forcing the user to navigate menus.",
      "Supplement suggestions are generated by Claude with full dietary and lab context.",
      "Card visual style is user-switchable at runtime (shadow / border / flat).",
    ],
  },
  technical: {
    headline: "Modern SwiftUI + Supabase + Anthropic Edge Functions.",
    summary:
      "Tab-based SwiftUI with a clean MVVM layer. Auth bootstraps via a centralized AuthService injected through a custom environment key. The backend (Supabase) holds dietary plans, lab reports, supplement schemas, and HealthKit-synced metrics. An Edge Function calls Claude with rich dietary context to generate supplement suggestions.",
    architecture:
      "FitnessApp bootstraps AuthService via @StateObject. Repository is injected via a custom EnvironmentKey (\\.repository) so views can swap between live and mock implementations cleanly. Theme tokens (Tokens / F / CardStyle) are abstracted away from views. NEXT_STEPS roadmap details HealthKit observable wiring, supplement RLS policies, and the Claude Edge Function contract.",
    highlights: [
      "Six-tab SwiftUI layout: Dieta · Ejercicios · IA · Cronograma · Perfil · Suplementos.",
      "MVVM with environment-driven dependency injection (\\.repository) for testable views.",
      "Theme tokens abstracted into Tokens / F / CardStyle — runtime-switchable card visual style.",
      "Supabase backend with HealthKit-synced metrics (daily_energy, exercise_minutes, HRV, weight).",
      "Anthropic Edge Function (functions/suggest_supplements) for dietary context-aware suggestions.",
      "Bundle id com.zepedajuanfe.Fitness; iOS 18 deployment target; Swift 5.",
    ],
  },
  stack: [
    "Swift 5",
    "SwiftUI",
    "iOS 18",
    "Supabase",
    "Anthropic Claude",
    "Edge Functions",
    "HealthKit",
  ],
  capabilities: [
    "AI Coaching",
    "Health Tracking",
    "Macro Logging",
    "Lab Report Analysis",
    "Supplement Suggestions",
  ],
  domain: "Health & Fitness",
  users: "Athletes and quantified-self enthusiasts.",
  hero: "/images/projects/fitness-copilot-hero.png",
  repoPath: "Swift/fitness_copilot",
};

export const kioskoLogistics: Project = {
  id: "kiosko-logistics",
  slug: "kiosko-logistics",
  name: "Kiosko Logistics",
  tagline:
    "Vehicle Routing Problem (VRP) visualizer with smooth MapKit truck animation, scoring formulas, and threshold tuning.",
  tier: 2,
  category: "swift",
  status: "active",
  year: 2026,
  recencyLabel: "Apr 2026",
  icon: "K",
  accent: "sky",
  scaleSignal: "40 Swift files · 3.3k LOC · Observable + MapKit",
  executive: {
    headline:
      "Operational tool for visualizing and tuning delivery route plans.",
    summary:
      "Kiosko Logistics is a route-planning dashboard for fleet operators. It animates trucks along their assigned routes on a real map, shows live scoring against custom formulas, and lets operators tune the constraints (time windows, capacity, distance weighting) without touching a config file.",
    outcomes: [
      "Operators can see a route plan come alive — trucks animate smoothly along their actual paths.",
      "Scoring formulas are user-editable; thresholds for 'good / acceptable / poor' are tunable presets.",
      "Visual feedback replaces guess-and-check tuning of the underlying VRP solver.",
    ],
  },
  technical: {
    headline:
      "MapKit + smooth interpolation + the modern Swift Observable pattern.",
    summary:
      "VRP is NP-hard; the app is the visual & tuning surface for an upstream solver. The dashboard models VRP configuration, solution parsing, formula presets, and scoring thresholds as separate domain objects. Truck animation interpolates positions along route polylines without map jank.",
    architecture:
      "Observable view models (modern Swift macro-based observation, not @ObservableObject) for VRPConfig, Dashboard, and RouteAnimation. RouteAnimationViewModel runs an async loop with Task.sleep(for: .milliseconds(50)) to walk truck position along the route polyline. Formula presets and threshold configs are value types so they can be diffed and persisted.",
    highlights: [
      "Smooth route animation using Task.sleep + interpolation along CoreLocation polylines.",
      "Modern Swift Observable pattern (not legacy ObservableObject).",
      "Domain-rich models: VRPConfig, VRPSolution, FormulaPreset, ScoreThreshold.",
      "MapKit overlays for routes, stops, and live truck position.",
      "Test scaffolding present (UI tests + unit tests).",
    ],
  },
  stack: [
    "Swift",
    "SwiftUI",
    "Observable",
    "MapKit",
    "CoreLocation",
    "iOS 17+",
  ],
  capabilities: [
    "Route Optimization (VRP)",
    "Logistics Visualization",
    "Map Animation",
    "Constraint Tuning",
  ],
  domain: "Logistics & Fleet Operations",
  users: "Fleet operators and route planners.",
  hero: "/images/projects/kiosko-hero.png",
  repoPath: "Swift/kiosko-logistics",
};

export const companyBrain: Project = {
  id: "company-brain",
  slug: "company-brain",
  name: "DataKnife (Company Brain)",
  tagline:
    "Hybrid RAG platform: documents → OpenAI Vector Store, structured data → Supabase, all answered through one ChatKit interface.",
  tier: 2,
  category: "ai",
  status: "active",
  year: 2026,
  recencyLabel: "May 2026",
  icon: "DK",
  accent: "violet",
  scaleSignal: "Next.js 16 · OpenAI ChatKit · Supabase RPC",
  executive: {
    headline: "Conversational interface for everything a company knows.",
    summary:
      "DataKnife is a single chat surface that answers questions across both unstructured documents (PDFs, contracts, manuals) and structured data (CSVs, Excel, database tables). Documents are vectorized; tabular data is queried via SQL. The user just asks the question — the system routes it correctly.",
    outcomes: [
      "One chat answers across documents, spreadsheets, and databases.",
      "SQL queries are validated server-side: SELECT-only, LIMIT enforced — safe for non-technical users.",
      "OpenAI Vector Store handles document semantics; Supabase handles structured truth.",
      "Production-ready ChatKit UI with streaming responses.",
    ],
  },
  technical: {
    headline:
      "Dual-track ingestion + custom SQL function-call tool with safety guards.",
    summary:
      "Documents are uploaded, classified, and pushed to an OpenAI Vector Store ready for ChatKit retrieval. Structured files (CSV/Excel) hit a Supabase RPC. The custom sql-tool function call validates that every query is SELECT-only or WITH ... SELECT, force-injects LIMIT when missing, and executes via supabase.rpc against a security-definer Postgres function.",
    architecture:
      "Next.js 16 App Router with React 19. OpenAI ChatKit React SDK is mounted in a right-side panel. onClientTool registers a custom 'execute_sql' tool. The tool route (/api/tools/sql) parses the SQL with a regex/tokenizer pass to enforce SELECT-only + LIMIT, then calls Supabase via the service role key (server-only). The vector ingestion route (/api/uploads/documents) classifies file types and routes to either the Vector Store API or the structured pipeline placeholder.",
    highlights: [
      "Custom OpenAI ChatKit tool ('execute_sql') registered via onClientTool.",
      "SELECT-only / WITH-only SQL guard with auto LIMIT enforcement.",
      "Supabase security-definer Postgres function executed via RPC (service role key, server-side only).",
      "Document classification → OpenAI Vector Store with metadata tagging.",
      "Spanish-language UI; designed for real Mexican enterprise users.",
      "Modern stack: Next.js 16.2 + React 19.2 + Tailwind 4 + shadcn primitives.",
    ],
  },
  stack: [
    "Next.js 16",
    "React 19",
    "TypeScript",
    "Tailwind CSS 4",
    "OpenAI ChatKit",
    "OpenAI Vector Store",
    "Supabase",
    "PostgreSQL",
    "shadcn/ui",
  ],
  capabilities: [
    "RAG",
    "Hybrid Document + SQL Search",
    "Function Calling",
    "Conversational BI",
    "Data Ingestion",
    "Vector Search",
  ],
  domain: "Enterprise Knowledge & BI",
  users: "Business analysts, ops teams, executives querying their own data.",
  hero: "/images/projects/dataknife-home-final.png",
  screenshots: [
    "/images/projects/dataknife-home-final.png",
    "/images/projects/dataknife-home-final-2.png",
    "/images/projects/dataknife-home.png",
  ],
  repoPath: "ai-lab/company-brain",
};

// ─────────────────────────────────────────────────────────────────────────────
// TIER 3 — FEATURED
// ─────────────────────────────────────────────────────────────────────────────

export const crispDm: Project = {
  id: "crisp-dm-2",
  slug: "crisp-dm-2",
  name: "CRISP-DM Workbench",
  tagline:
    "Dual-LLM (Claude + GPT-4o) workbench for the CRISP-DM data-mining lifecycle, with a Python pipeline for prep, modeling, and evaluation.",
  tier: 3,
  category: "ai",
  status: "active",
  year: 2026,
  recencyLabel: "May 2026",
  icon: "CR",
  accent: "fuchsia",
  scaleSignal: "Next.js 16 · Anthropic + OpenAI · Python ML pipeline",
  executive: {
    headline: "An LLM-native workbench for the CRISP-DM data lifecycle.",
    summary:
      "CRISP-DM is the industry-standard process for data-mining projects (Business Understanding → Data Understanding → Preparation → Modeling → Evaluation → Deployment). This workbench gives an analyst LLM-assisted help at every stage, switching between Claude 3.5 and GPT-4o depending on the task.",
    outcomes: [
      "Analysts move through the full CRISP-DM cycle with model help at each stage.",
      "Switch between Claude 3.5 Sonnet and GPT-4o per task — the right model for the right step.",
      "Python pipeline (analyzer / processor / modeler) handles compute outside the LLM.",
    ],
  },
  technical: {
    headline:
      "Dual SDK abstraction with Python compute isolation and streaming.",
    summary:
      "Direct Anthropic SDK 0.78 and OpenAI SDK 6.29 — no chat-wrapper. The UI surfaces a model-selector and per-stage prompt templates. A Python pipeline (analyzer.py, processor.py, modeler.py) handles preprocessing, modeling, and evaluation.",
    architecture:
      "Next.js 16 + React 19 frontend with file uploads via Multer. Streaming responses from both providers. Recharts for evaluation visualizations. Python ML stack invoked via subprocess (numpy / pandas implied by processor signatures).",
    highlights: [
      "Direct Anthropic + OpenAI SDK use, not a wrapper library.",
      "Per-stage prompt templates aligned to CRISP-DM phases.",
      "Python compute layer for heavy preprocessing and modeling.",
      "Streaming-aware UI with Recharts evaluation views.",
      "ESM Next.js 16 + React 19 + Tailwind 4.",
    ],
  },
  stack: [
    "Next.js 16",
    "React 19",
    "Anthropic SDK",
    "OpenAI SDK",
    "Python",
    "pandas",
    "numpy",
    "Recharts",
    "Multer",
  ],
  capabilities: [
    "Data Mining (CRISP-DM)",
    "Multi-LLM",
    "Streaming",
    "Python Compute Isolation",
    "Evaluation Charts",
  ],
  domain: "Data Science & Analytics",
  users: "Data scientists and analysts running CRISP-DM projects.",
  hero: "/images/projects/crisp-dm-hero.png",
  repoPath: "ai-lab/crisp-dm-2",
};

export const whatsappGateway: Project = {
  id: "whatsapp-gateway",
  slug: "whatsapp-gateway",
  name: "WhatsApp Gateway",
  tagline:
    "Self-hosted multi-tenant WhatsApp message broker with token-scoped REST API and a read-only monitoring dashboard.",
  tier: 3,
  category: "automation",
  status: "production",
  year: 2026,
  recencyLabel: "May 2026",
  icon: "WA",
  accent: "teal",
  scaleSignal: "pnpm workspaces · Baileys + Express · Neon Postgres · Railway",
  executive: {
    headline: "WhatsApp infrastructure for an entire fleet of agents.",
    summary:
      "Instead of paying a third-party WhatsApp gateway per agent, this is a single self-hosted broker that any number of internal projects (CRMs, agents, automation flows) can talk to. Each project gets its own token; some projects can read replies, others only send. The dashboard monitors all of it in one place.",
    outcomes: [
      "Replaces an expensive per-agent WhatsApp BSP with one shared self-hosted gateway.",
      "Multi-tenant by design — each agent has scoped credentials and its own session graph.",
      "Inbound messages are delivered exactly-once via the unread-poll pattern.",
      "Powers downstream agents like yantissimo-crm and kiosko-logistics.",
    ],
  },
  technical: {
    headline: "Token-scoped multi-tenant message broker with exactly-once read.",
    summary:
      "Two-service pnpm workspace: an Express server that talks WhatsApp via Baileys and persists everything to Neon Postgres, and a Next.js 15 dashboard that consumes the gateway's own REST API. Authentication is three-header: master token, project token, project name.",
    architecture:
      "Express + Baileys server with rate-limiting (1 send/sec). Sessions are auto-created per phone+project; subsequent sends reuse the session unless explicitly forced fresh. The /messages/session/:id/unread endpoint marks-as-read on the same call — guaranteeing exactly-once inbound delivery to subscribed agents. SSL is auto-detected based on the Postgres host (Railway internal vs public TCP proxy). Persisted Baileys session lives in a Railway volume for reconnect-after-restart.",
    highlights: [
      "Express server + Baileys WhatsApp SDK + Neon Postgres + Next.js 15 dashboard.",
      "Three-header auth: X-Master-Token + X-Project-Token + X-Project-Name.",
      "--store-replies flag at registration controls whether a project receives inbound.",
      "Unread-poll endpoint flips read state on the same call — exactly-once delivery.",
      "Auto-detect SSL based on host (Railway internal vs public TCP proxy).",
      "Production deployed on Railway with persisted volume for Baileys session recovery.",
      "First-class REST API designed for internal agents (curl-friendly).",
    ],
  },
  stack: [
    "Node.js",
    "Express",
    "Baileys",
    "PostgreSQL (Neon)",
    "Next.js 15",
    "pnpm Workspaces",
    "TypeScript",
    "Railway",
  ],
  capabilities: [
    "Messaging Infrastructure",
    "Multi-tenant API",
    "Exactly-Once Delivery",
    "Session Management",
    "Self-Hosted",
  ],
  domain: "Messaging Infrastructure",
  users: "Internal agents and CRM systems across the org.",
  hero: "/images/projects/whatsapp-gateway-hero.png",
  repoPath: "Web/whatsapp-gateway",
};

export const overtree: Project = {
  id: "overtree",
  slug: "overtree",
  name: "Overtree",
  tagline:
    "Local-first LaTeX editor with LAN collaboration, an MCP server, and the Tectonic compiler — Overleaf, but everything lives on your machine.",
  tier: 3,
  category: "web",
  status: "active",
  year: 2026,
  recencyLabel: "May 2026",
  icon: "OT",
  accent: "orange",
  scaleSignal: "Next.js 16 · Yjs CRDTs · MCP server · Tectonic subprocess",
  executive: {
    headline: "Overleaf, but local-first and AI-native.",
    summary:
      "Overtree is a LaTeX editor that runs on your laptop. Files are real folders you can git, back up, or copy. Anyone on your network joins by URL. And — most distinctive — Claude Desktop, ChatGPT Desktop, and Claude Code can connect directly via MCP to read, edit, and compile your projects, with edits appearing live in the editor.",
    outcomes: [
      "Replaces Overleaf for users who want local-first ownership of their files.",
      "Real-time multicursor collaboration on a LAN — no cloud, no per-seat fee.",
      "AI clients can edit your LaTeX directly through MCP — edits land live in connected browsers.",
      "PDF preview powered by Tectonic, the modern self-contained LaTeX engine.",
    ],
  },
  technical: {
    headline:
      "Yjs CRDT collaboration + MCP server with three transports + Tectonic subprocess.",
    summary:
      "Next.js 16 App Router app with a custom server that hosts both the Yjs WebSocket sync protocol and the MCP server. CodeMirror 6 with stex (LaTeX) syntax. Iron-session for auth. Three MCP transports run simultaneously: stdio for Claude Desktop and Claude Code, HTTP/SSE for ChatGPT Desktop, and Node.js direct for in-process tools.",
    architecture:
      "Next.js 16 + React 19 + CodeMirror 6 frontend bound to a Yjs document via y-codemirror.next. Server-side Yjs WebSocket protocol handler (y-websocket) plus a chokidar file watcher that reflects on-disk changes back into the shared CRDT — meaning AI edits propagate instantly to connected editors. MCP server exposes 12 tools: list_projects, create_project, delete_project, list_files, read_file, write_file, edit_file, delete_file, compile, get_compile_log, get_pdf, get_project_info, list_templates. Tectonic invoked via subprocess; PDFs rendered with pdf.js.",
    highlights: [
      "Yjs CRDTs with WebSocket sync (y-codemirror.next + y-websocket + y-protocols).",
      "MCP server with 12 tools, three simultaneous transports (stdio, HTTP/SSE, in-process).",
      "Chokidar file watcher syncs disk → CRDT → connected editors.",
      "Tectonic LaTeX engine invoked via subprocess; pdf.js for in-browser PDF preview.",
      "Iron-session auth with per-project name + password.",
      "LAN-friendly: prints local IP on startup; firewall guidance documented.",
      "Templates: article, beamer, report, letter, ieee, blank.",
      "Electron desktop wrapper builds via electron-builder for macOS distribution.",
    ],
  },
  stack: [
    "Next.js 16",
    "React 19",
    "TypeScript",
    "Yjs",
    "CodeMirror 6",
    "MCP SDK",
    "Tectonic",
    "iron-session",
    "Electron",
    "Bun",
  ],
  capabilities: [
    "Collaborative Editing (CRDTs)",
    "Local-First",
    "MCP Server",
    "LaTeX Compilation",
    "AI-Native",
    "Desktop App",
  ],
  domain: "Developer Tools / Writing",
  users: "Researchers, students, and writers who want local LaTeX with AI.",
  hero: "/images/projects/overtree-hero.png",
  repoPath: "Web/overtree",
};

export const swipeFotos: Project = {
  id: "swipe-fotos",
  slug: "swipe-fotos",
  name: "Swipe Fotos",
  tagline:
    "Photo library organizer with a swipe-deck UI, month bucketing, and persistent progress tracking.",
  tier: 3,
  category: "swift",
  status: "active",
  year: 2026,
  recencyLabel: "May 2026",
  icon: "SF",
  accent: "rose",
  scaleSignal: "18 Swift files · ~2k LOC · MVVM + Photos.framework",
  executive: {
    headline:
      "Tinder for your camera roll — clear out years of photos, fast.",
    summary:
      "Swipe Fotos lets you organize your photo library by swiping through it month by month. Progress is saved, so you can stop and resume. The UI is intentionally minimal — one photo at a time, two gestures, nothing else.",
    outcomes: [
      "Decide thousands of photos quickly with two gestures.",
      "Pick up where you left off — progress per-month is persisted.",
      "Browse by album or by month bucket.",
    ],
  },
  technical: {
    headline:
      "Clean MVVM + Photos.framework + a custom swipe-deck gesture component.",
    summary:
      "Lean SwiftUI MVVM. PhotoLibraryService wraps PHAsset enumeration + permissions. ProgressStore persists per-month decisions to Application Support. Three view models (SwipeDeck, AlbumList, MonthBrowser) keep responsibilities tight.",
    architecture:
      "PermissionView gates the rest of the app on Photos.framework authorization. SwipeDeckView is a custom gesture-driven card stack. Month bucketing uses a separate MonthBrowser + MonthBucket model so the UI doesn't fight the data model.",
    highlights: [
      "Photos.framework integration with permission gating.",
      "Custom SwipeDeckView with gesture state and physics-feeling deck.",
      "ProgressStore serializes per-month decisions to Application Support.",
      "Lean MVVM split: 5 views · 4 view models · 4 models · 2 services.",
    ],
  },
  stack: [
    "Swift",
    "SwiftUI",
    "Photos.framework",
    "Application Support",
    "MVVM",
  ],
  capabilities: [
    "Photo Library Organization",
    "Gesture-Driven UI",
    "Progress Persistence",
  ],
  domain: "Personal Productivity",
  users: "Anyone with too many photos.",
  hero: "/images/projects/swipe-fotos-hero.png",
  repoPath: "Swift/swipe-fotos",
};

export const karate: Project = {
  id: "karate",
  slug: "karate",
  name: "Karate Tournament",
  tagline:
    "Distributable role-aware tournament scoring system: Next.js web + Express server + Electron desktop, single binary.",
  tier: 3,
  category: "web",
  status: "active",
  year: 2026,
  recencyLabel: "May 2026",
  icon: "KT",
  accent: "yellow",
  scaleSignal:
    "Turbo monorepo · 3 apps + 1 core package · ~10k files · 17k LOC",
  executive: {
    headline:
      "A complete offline tournament platform that ships as a single binary.",
    summary:
      "Run a karate tournament without a cloud account. Superadmins set up categories, competitors, areas, and seeding from one screen. Referees sign in with their assigned area and start scoring. The audience scoreboard updates live in a separate window. Everything works offline, on a laptop, in a gym with no Wi-Fi.",
    outcomes: [
      "One install per laptop runs the entire tournament — no cloud required.",
      "Three roles (superadmin / referee / audience) with appropriate access controls.",
      "Areas auto-distributed by a balanced bin-packer the superadmin can override.",
      "Audience display anonymous and fullscreen-ready.",
    ],
  },
  technical: {
    headline:
      "Turbo monorepo with pure-logic core, JWT RS256 auth, and an Electron wrapper.",
    summary:
      "Three apps + one shared core package. The core is pure logic (no React, no DOM) so it can be reused. The server is Express with JWT signed RS256 from a keypair generated on first launch. The Electron wrapper spawns the server in-process on a random localhost port and serves the Next.js static export from the same origin.",
    architecture:
      "Turbo monorepo. apps/web (Next.js 15 App Router + Tailwind), apps/server (Express + JWT RS256 + bcrypt + admin panel), apps/desktop (Electron wrapper + electron-builder). packages/core holds typed domain logic (bracket seeding, area distribution, tiebreakers). Tokens are renewed silently after 20h of a 24h TTL. Cross-window state syncs via BroadcastChannel + localStorage. Data + RSA keys + activity log persist under ~/.karate-tournament/.",
    highlights: [
      "Turbo monorepo with pure-logic shared package (no DOM dependencies).",
      "JWT RS256 with keypair generated on first launch.",
      "Greedy bin-packer distributes subcategories across competition areas.",
      "Electron wrapper bundles server in-process; serves static Next.js from same origin.",
      "BroadcastChannel + localStorage sync between admin / private / public windows.",
      "Activity log: login attempts, renewals, user mutations, IP addresses.",
      "Builds .dmg / .exe (NSIS) / .AppImage installers.",
    ],
  },
  stack: [
    "Next.js 15",
    "React",
    "Tailwind CSS",
    "Express",
    "JWT (RS256)",
    "bcrypt",
    "Electron",
    "electron-builder",
    "Turbo",
    "TypeScript",
  ],
  capabilities: [
    "Offline Desktop App",
    "Role-Based Access Control",
    "Tournament Domain Logic",
    "Cross-Platform Distribution",
  ],
  domain: "Sports Tournament Management",
  users: "Tournament organizers, referees, and audience displays.",
  hero: "/images/projects/karate-hero.png",
  repoPath: "Web/karate",
};

export const smokeSignals: Project = {
  id: "smoke-signals",
  slug: "smoke-signals",
  name: "Smoke Signals",
  tagline:
    "End-to-end encrypted iOS chat client built on the Signal protocol — LibSignal, Network.framework, Keychain, APNs.",
  tier: 3,
  category: "swift",
  status: "prototype",
  year: 2025,
  recencyLabel: "Jun 2025",
  icon: "SS",
  accent: "indigo",
  scaleSignal: "127 Swift files · 12.8k LOC · LibSignal + signal-protocol-c",
  executive: {
    headline:
      "End-to-end encrypted chat done the right way — Signal protocol, Network.framework, Keychain.",
    summary:
      "Smoke Signals is an iOS chat client built on the same protocol Signal Messenger uses. Messages are encrypted on your device and decrypted on the recipient's — never readable by any server. The whole networking stack is built on Apple's own Network.framework with WebSocket; identity keys live in the Keychain.",
    outcomes: [
      "True end-to-end encryption — server has no plaintext, ever.",
      "Apple-native networking (Network.framework + NWConnection) — no third-party WebSocket libraries.",
      "Identity material is Keychain-backed and never leaves the device.",
    ],
  },
  technical: {
    headline:
      "Signal protocol over a Network.framework WebSocket, with Combine publishers and APNs.",
    summary:
      "LibSignalClient v0.75 + a git submodule of signal-protocol-c. SignalClient singleton wraps session setup, encrypt, and decrypt. ChatViewModel orchestrates the receive loop and message queue. WebSocketClient manages NWConnection lifecycle, token auth headers, and async receive polling. PushManager handles APNs device registration.",
    architecture:
      "C FFI integration for signal-protocol-c (largest project in the portfolio by file count and complexity). Network.framework via custom WebSocketClient (NWConnection + Combine publishers). Identity, prekeys, and session state Keychain-persisted. UI tests + unit tests present.",
    highlights: [
      "LibSignalClient v0.75 + signal-protocol-c git submodule (C FFI).",
      "Custom WebSocket client built on NWConnection + Combine.",
      "Keychain-backed identity, prekeys, and session state.",
      "APNs device registration through PushManager.",
      "MVVM with ChatViewModel orchestrating session setup, send, and receive.",
      "Full UI + unit test coverage scaffolded.",
    ],
  },
  stack: [
    "Swift",
    "SwiftUI",
    "LibSignalClient",
    "signal-protocol-c",
    "Network.framework",
    "NWConnection",
    "Combine",
    "Keychain",
    "APNs",
    "CocoaPods",
  ],
  capabilities: [
    "End-to-End Encryption",
    "Signal Protocol",
    "WebSocket Realtime",
    "Push Notifications",
    "Cryptographic Key Management",
  ],
  domain: "Secure Communications",
  users: "Privacy-focused users; reference implementation for secure chat.",
  hero: "/images/projects/smoke-signals-hero.png",
  repoPath: "Swift/Smoke Singals",
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — Tier 1 / 2 / 3 ordered for display
// ─────────────────────────────────────────────────────────────────────────────

export const tier1: Project[] = [yantissimo];
export const tier2: Project[] = [fitnessCopilot, kioskoLogistics, companyBrain];
export const tier3: Project[] = [
  crispDm,
  whatsappGateway,
  overtree,
  swipeFotos,
  karate,
  smokeSignals,
];

export const featuredProjects: Project[] = [...tier1, ...tier2, ...tier3];

// ─────────────────────────────────────────────────────────────────────────────
// TIER 4 — CAROUSEL (icon + name + 1-line description)
// All remaining projects from scanned folders, minus OpenAI-named clones.
// ─────────────────────────────────────────────────────────────────────────────

export interface Tier4Project {
  id: string;
  name: string;
  category: Category;
  icon: string;
  description: string; // single line
  stack?: string[]; // shown on hover
  year?: number;
}

export const tier4: Tier4Project[] = [
  // ─── YSSM / Real Enterprise ───
  {
    id: "erp-yssm",
    name: "YSSM ERP",
    category: "enterprise",
    icon: "EY",
    description:
      "Enterprise ERP — orders, inventory, scheduling, financials. Next.js 16 + Vercel CI/CD.",
    stack: ["Next.js 16", "React 18", "MUI", "Tailwind 4", "PostgreSQL"],
    year: 2026,
  },
  {
    id: "agent-yssm",
    name: "Nexora Agent",
    category: "ai",
    icon: "AY",
    description:
      "Multi-channel AI sales agent — Telegram + WhatsApp, OpenAI tool-calling, scheduled reminders.",
    stack: ["Node.js", "OpenAI", "PostgreSQL", "Telegram", "Twilio"],
    year: 2026,
  },
  {
    id: "agente-dist-yssm",
    name: "Nexora Distribution",
    category: "ai",
    icon: "AD",
    description:
      "Wholesale-channel variant of Nexora — bulk orders, tiered pricing, B2B workflows.",
    stack: ["Node.js", "OpenAI", "PostgreSQL"],
    year: 2025,
  },
  {
    id: "scrapper-yssm",
    name: "YSSM Scraper",
    category: "automation",
    icon: "SC",
    description:
      "Competitive-intel ETL — Puppeteer + Cheerio scrapers feeding pricing pipelines.",
    stack: ["Node.js", "Puppeteer", "Cheerio", "p-limit", "PostgreSQL"],
    year: 2025,
  },

  // ─── ai-lab (non-OpenAI-named) ───
  {
    id: "mati-data",
    name: "Mati Data",
    category: "web",
    icon: "MD",
    description:
      "Tabular data ingestion + visualization — CSV/Excel pipeline with worker threads (Comlink).",
    stack: ["Next.js 16", "React 19", "Papa Parse", "Recharts", "Comlink"],
    year: 2026,
  },
  {
    id: "agente-proveedores",
    name: "Suppliers Agent",
    category: "ai",
    icon: "AP",
    description:
      "Type-safe full-stack supplier agent — tRPC + Supabase + WhatsApp ingestion.",
    stack: ["Next.js", "tRPC", "Supabase", "Baileys", "OpenAI", "Zod"],
    year: 2026,
  },
  {
    id: "onedrive-retriever",
    name: "OneDrive Retriever",
    category: "ai",
    icon: "OD",
    description:
      "WhatsApp agent that fetches context from OneDrive / Google Drive on demand.",
    stack: ["Node.js", "Baileys", "OpenAI", "Google Auth"],
    year: 2026,
  },
  {
    id: "restaurant-waster",
    name: "Restaurant Waster",
    category: "experimental",
    icon: "RW",
    description: "Monorepo scaffold (pnpm + Vitest + Prisma) for a restaurant tooling app.",
    stack: ["pnpm Workspaces", "TypeScript", "Vitest", "Prisma"],
    year: 2026,
  },

  // ─── Web ───
  {
    id: "mootie",
    name: "Mootie POS",
    category: "web",
    icon: "MO",
    description: "Cafeteria point-of-sale — workspaces (server / client / shared).",
    stack: ["Node.js Workspaces", "TypeScript"],
    year: 2026,
  },
  {
    id: "plick-clone",
    name: "Plick Clone",
    category: "web",
    icon: "PL",
    description:
      "Two-app Turbo monorepo — menu + admin frontends sharing a workspace package.",
    stack: ["Next.js 15", "React 19", "Tailwind 4", "Turbo"],
    year: 2026,
  },
  {
    id: "pagares",
    name: "Pagarés",
    category: "web",
    icon: "PG",
    description: "Promissory-note management web app.",
    stack: ["Next.js", "TypeScript"],
    year: 2026,
  },
  {
    id: "padelon",
    name: "Padelón",
    category: "web",
    icon: "PD",
    description: "Static event/landing site with multi-page structure.",
    stack: ["HTML5", "CSS"],
    year: 2026,
  },
  {
    id: "batch",
    name: "Batch",
    category: "experimental",
    icon: "BA",
    description: "Batch processing utility scaffold.",
    stack: ["Node.js"],
    year: 2025,
  },
  {
    id: "intercambio",
    name: "Intercambio",
    category: "experimental",
    icon: "IN",
    description: "Exchange / barter prototype.",
    stack: ["Web"],
    year: 2025,
  },
  {
    id: "cotizador-nexora",
    name: "Nexora Quoter",
    category: "web",
    icon: "CN",
    description: "Quote-builder UI for the Nexora sales pipeline.",
    stack: ["Web"],
    year: 2025,
  },
  {
    id: "eigenvalues",
    name: "Eigenvalues",
    category: "experimental",
    icon: "EV",
    description: "Linear algebra / numerical experiment.",
    stack: ["Web"],
    year: 2025,
  },
  {
    id: "food-healer",
    name: "Food Healer",
    category: "web",
    icon: "FH",
    description: "Food / nutrition recommendation prototype.",
    stack: ["Web"],
    year: 2025,
  },
  {
    id: "investigacion-interface",
    name: "Investigación Interface",
    category: "experimental",
    icon: "II",
    description: "Research-interface prototype for a UX study.",
    stack: ["Web"],
    year: 2025,
  },
  {
    id: "nextjs-dashboard",
    name: "Next.js Dashboard",
    category: "web",
    icon: "ND",
    description: "Admin dashboard reference.",
    stack: ["Next.js"],
    year: 2025,
  },
  {
    id: "termo-sapiens",
    name: "Termo Sapiens",
    category: "experimental",
    icon: "TS",
    description: "Thermodynamics / educational tool.",
    stack: ["Web"],
    year: 2025,
  },
  {
    id: "microsip",
    name: "Microsip Sync",
    category: "automation",
    icon: "MS",
    description: "Bridge between Microsip ERP and downstream systems.",
    stack: ["Node.js"],
    year: 2025,
  },

  // ─── Swift (non-featured) ───
  {
    id: "agro-commerce",
    name: "AFFIN Agro",
    category: "swift",
    icon: "AC",
    description:
      "Agricultural rewards / loyalty B2C iOS prototype with Firebase hooks.",
    stack: ["SwiftUI", "Firebase"],
    year: 2025,
  },
  {
    id: "nutrigen",
    name: "NutriGen",
    category: "swift",
    icon: "NG",
    description: "Nutrition tracker iOS prototype with quotes/agent UI.",
    stack: ["SwiftUI", "Keychain"],
    year: 2025,
  },
  {
    id: "altozano",
    name: "Altozano",
    category: "swift",
    icon: "AL",
    description: "Auth-gated SwiftUI app with global state and Keychain credentials.",
    stack: ["SwiftUI", "Keychain"],
    year: 2025,
  },
  {
    id: "delitec",
    name: "Delitec",
    category: "swift",
    icon: "DL",
    description: "Food delivery / restaurant ordering iOS prototype.",
    stack: ["SwiftUI", "MVVM"],
    year: 2025,
  },

  // ─── AGENTES ───
  {
    id: "base-ai-agent",
    name: "Base AI Agent",
    category: "ai",
    icon: "BA",
    description:
      "Multi-channel sales agent base scaffold — Telegram + Twilio + Postgres.",
    stack: ["Node.js", "OpenAI", "Telegram", "Twilio"],
    year: 2026,
  },
  {
    id: "executive-agent-tree",
    name: "YARVIS Executive Agent",
    category: "ai",
    icon: "EA",
    description:
      "Executive assistant — Google Calendar + Gmail + Contacts + Twilio.",
    stack: ["Node.js", "OpenAI", "Google APIs", "Telegram"],
    year: 2025,
  },
  {
    id: "test-agent",
    name: "Test Agent",
    category: "ai",
    icon: "TA",
    description:
      "Multi-tool agent with Perplexity, Gmail, WhatsApp, and inventory APIs.",
    stack: ["Node.js", "OpenAI", "Perplexity", "Baileys", "Google APIs"],
    year: 2025,
  },
  {
    id: "laptop-suport",
    name: "Laptop Support Bot",
    category: "automation",
    icon: "LS",
    description: "WhatsApp support flow built on bot-whatsapp / Baileys.",
    stack: ["Node.js", "Baileys", "bot-whatsapp"],
    year: 2026,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY METADATA
// ─────────────────────────────────────────────────────────────────────────────

export const categoryLabels: Record<Category, string> = {
  enterprise: "Real Enterprise Experience",
  ai: "AI Engineering",
  web: "Web Engineering",
  swift: "Swift / Apple Ecosystem",
  automation: "Automation & Infrastructure",
  experimental: "Experimental & R&D",
};

export const categoryColors: Record<Category, string> = {
  enterprise: "amber",
  ai: "violet",
  web: "orange",
  swift: "sky",
  automation: "teal",
  experimental: "neutral",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function getProjectBySlug(slug: string): Project | undefined {
  return featuredProjects.find((p) => p.slug === slug);
}

export const allProjectsCount =
  featuredProjects.length + tier4.length;
