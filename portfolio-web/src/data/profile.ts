// =============================================================================
// PROFILE DATA — Identity, contact, narrative, skills matrix.
// Used across the portfolio (hero, about, footer) and SEO/GEO files.
// =============================================================================

export const profile = {
  name: "Juan Felipe Zepeda",
  shortName: "Juanfe",
  handle: "juanfe",
  email: "ze_zepedajf@outlook.com",
  location: "Mexico",
  timezone: "America/Mexico_City",

  // Used as the H1 / hero one-liner
  role: "AI & Product Engineer",

  // Two-sentence positioning
  pitch:
    "I build end-to-end AI-native products — native iOS, server APIs, agentic systems, and the infrastructure that ties them together. I ship complete platforms, not slide decks.",

  // Long-form positioning (for /about and llms.txt)
  bio: [
    "I am a Mexico-based AI and product engineer who builds complete platforms — front-end, back-end, mobile, agents, and the infrastructure that ties them together. My work spans native iOS (SwiftUI), Next.js, Node.js, real-time systems (Yjs CRDTs, OpenAI Realtime), and AI-native architectures (RAG, function-calling, MCP servers, multi-agent orchestration).",
    "My flagship work is the Yantissimo platform — a tire and wheel distributor's complete digital stack: native iOS app, Express backend, headless Shopify storefront. I built all three. I also build internal tooling and automation: a self-hosted WhatsApp gateway, an Overleaf-style local-first LaTeX editor with an MCP server, and AI agents handling sales and customer support across Telegram and WhatsApp.",
    "I prefer leverage over surface area. A single self-hosted gateway over per-agent BSPs. A pure-logic core package over duplicated UI logic. A hand-written iOS APIClient over a third-party SDK. The work shows.",
  ],

  social: {
    github: "https://github.com/",
    linkedin: "https://linkedin.com/in/",
    email: "mailto:ze_zepedajf@outlook.com",
  },

  availability:
    "Open to senior product / AI engineering roles & high-leverage contract work.",

  // Concrete credibility numbers
  credibility: [
    { label: "Production platforms shipped", value: "5+" },
    { label: "AI agents in production", value: "3" },
    { label: "Featured projects", value: "10" },
    { label: "Total projects in portfolio", value: "40+" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SKILLS MATRIX — grouped by domain, with proficiency signals.
// proficiency: "expert" | "strong" | "working"
// ─────────────────────────────────────────────────────────────────────────────

export type Proficiency = "expert" | "strong" | "working";

export interface SkillGroup {
  name: string;
  description: string;
  skills: { name: string; proficiency: Proficiency; note?: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIZED TECH STACK — for the Tech recruiter view.
// Domain-based, not "skill-bar" framing. Each group lists production-shipped
// projects as social proof.
// ─────────────────────────────────────────────────────────────────────────────

export interface StackGroup {
  domain: string;
  blurb: string;
  items: string[];
  shippedIn: string[]; // project names
}

export const techStack: StackGroup[] = [
  {
    domain: "Backend",
    blurb:
      "Production Express APIs with real test coverage, async jobs, modular middleware.",
    items: [
      "Node.js 20+",
      "Express",
      "Bun",
      "Fastify",
      "Multer",
      "Jest + Supertest",
    ],
    shippedIn: [
      "Yantissimo Backend (167 files / 7.3k LOC, 41 routes)",
      "WhatsApp Gateway",
    ],
  },
  {
    domain: "Frontend",
    blurb:
      "Next.js App Router + React 19 + TypeScript + Tailwind. Server Components, edge middleware.",
    items: [
      "Next.js 15 / 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS 4",
      "shadcn/ui",
      "CodeMirror 6",
      "Recharts",
    ],
    shippedIn: [
      "Yantissimo Shop",
      "YSSM ERP (450 files)",
      "Overtree",
      "DataKnife",
    ],
  },
  {
    domain: "Mobile",
    blurb: "Native iOS, MVVM, zero external deps where it matters.",
    items: [
      "Swift 5.9",
      "SwiftUI (iOS 16+ / 18)",
      "Network.framework / NWConnection",
      "Keychain",
      "MapKit",
      "Photos.framework",
      "HealthKit",
      "APNs (Push)",
      "C FFI (LibSignal)",
    ],
    shippedIn: [
      "Yantissimo iOS (68 files, 0 SPM/Cocoapods)",
      "Smoke Signals (Signal protocol)",
      "Vydas",
    ],
  },
  {
    domain: "AI",
    blurb:
      "Direct SDK use (not wrappers). Function calling with safety guards, hybrid RAG, MCP.",
    items: [
      "OpenAI SDK",
      "Anthropic Claude SDK",
      "OpenAI ChatKit",
      "Vector Stores",
      "Realtime API",
      "Model Context Protocol (MCP)",
      "Hybrid RAG",
    ],
    shippedIn: [
      "DataKnife (vector + SQL hybrid)",
      "Overtree (12-tool MCP server)",
      "Nexora Sales Agent",
    ],
  },
  {
    domain: "Real-time",
    blurb: "CRDTs, WebSockets, voice, multi-channel messaging.",
    items: [
      "Yjs (CRDTs)",
      "y-codemirror.next",
      "y-websocket",
      "ws",
      "Baileys (WhatsApp)",
      "Twilio Voice / Studio / Flex",
    ],
    shippedIn: [
      "Overtree (LAN multicursor)",
      "WhatsApp Gateway (multi-tenant)",
      "Smoke Signals",
    ],
  },
  {
    domain: "Cloud / DevOps",
    blurb:
      "Vercel + Railway production deploys. CI/CD via GitHub Actions, Electron for desktop.",
    items: [
      "Vercel",
      "Railway",
      "GitHub Actions",
      "pnpm Workspaces",
      "Turbo",
      "Electron + electron-builder",
      "Backblaze B2",
    ],
    shippedIn: [
      "YSSM ERP (Vercel CI)",
      "Yantissimo Backend (Railway)",
      "Karate (.dmg/.exe/.AppImage)",
    ],
  },
  {
    domain: "Data",
    blurb:
      "Postgres-first, Supabase RPC for security-definer functions, Shopify GraphQL, schema design.",
    items: [
      "PostgreSQL",
      "MySQL",
      "Supabase (RPC, security definer)",
      "Shopify Admin & Storefront",
      "Wheel-Size API",
      "Google Workspace APIs",
    ],
    shippedIn: [
      "Yantissimo (PG + MySQL + Shopify)",
      "DataKnife (Supabase RPC)",
      "Nexora Agent",
    ],
  },
  {
    domain: "Auth & Security",
    blurb:
      "JWT RS256 with on-device keypair generation, Keychain on iOS, iron-session on web.",
    items: [
      "JWT (RS256)",
      "bcrypt",
      "iron-session",
      "Keychain (iOS)",
      "401 refresh-retry",
      "Signal protocol (Smoke Signals)",
    ],
    shippedIn: [
      "Yantissimo iOS",
      "Karate (RS256 keypair on first launch)",
      "Smoke Signals",
    ],
  },
];

// Legacy proficiency-based groups kept for reference but not rendered.
// (skill bars are explicitly de-prioritized for recruiters per current plan.)
export const skillGroups: SkillGroup[] = [
  {
    name: "AI Engineering",
    description: "LLM orchestration, RAG, agents, function-calling, realtime.",
    skills: [
      {
        name: "OpenAI SDK",
        proficiency: "expert",
        note: "Tool calling, streaming, vector store, ChatKit",
      },
      {
        name: "Anthropic Claude SDK",
        proficiency: "expert",
        note: "Direct SDK, not wrappers",
      },
      {
        name: "Model Context Protocol (MCP)",
        proficiency: "expert",
        note: "Custom server, 12 tools, 3 transports",
      },
      {
        name: "RAG (Hybrid)",
        proficiency: "strong",
        note: "Vector + structured SQL, function-call routing",
      },
      {
        name: "OpenAI Realtime API",
        proficiency: "strong",
        note: "WebRTC, voice agents, multi-modal",
      },
      { name: "Multi-agent orchestration", proficiency: "strong" },
      { name: "Prompt engineering", proficiency: "expert" },
    ],
  },
  {
    name: "Frontend",
    description: "Modern React, Next.js App Router, design systems.",
    skills: [
      {
        name: "Next.js 15 / 16",
        proficiency: "expert",
        note: "App Router, Server Components, Server Actions",
      },
      { name: "React 19", proficiency: "expert" },
      { name: "TypeScript", proficiency: "expert" },
      { name: "Tailwind CSS 4", proficiency: "expert" },
      { name: "shadcn/ui & Radix", proficiency: "strong" },
      {
        name: "CodeMirror 6",
        proficiency: "strong",
        note: "stex / LaTeX, custom extensions",
      },
      { name: "Recharts / Chart.js", proficiency: "strong" },
    ],
  },
  {
    name: "Backend",
    description: "Express APIs, Postgres, auth, async jobs.",
    skills: [
      { name: "Node.js 20+", proficiency: "expert" },
      {
        name: "Express",
        proficiency: "expert",
        note: "41-route production APIs",
      },
      { name: "PostgreSQL", proficiency: "expert" },
      { name: "MySQL", proficiency: "strong" },
      { name: "JWT (RS256)", proficiency: "strong" },
      { name: "Jest + Supertest", proficiency: "strong" },
      { name: "Bun", proficiency: "strong" },
    ],
  },
  {
    name: "Native iOS",
    description: "SwiftUI, Network.framework, Photos, MapKit, Keychain.",
    skills: [
      { name: "Swift 5.9", proficiency: "expert" },
      { name: "SwiftUI (iOS 16+)", proficiency: "expert" },
      { name: "Network.framework / NWConnection", proficiency: "strong" },
      { name: "Keychain", proficiency: "strong" },
      { name: "MapKit", proficiency: "strong" },
      { name: "Photos.framework", proficiency: "strong" },
      { name: "APNs (Push)", proficiency: "strong" },
      { name: "Modern Observable / MVVM", proficiency: "expert" },
      {
        name: "LibSignalClient (FFI)",
        proficiency: "working",
        note: "C FFI, signal-protocol-c submodule",
      },
    ],
  },
  {
    name: "Real-time & Collaboration",
    description: "CRDTs, WebSockets, multiplayer.",
    skills: [
      {
        name: "Yjs (CRDTs)",
        proficiency: "expert",
        note: "y-codemirror.next, y-websocket, y-protocols",
      },
      { name: "WebSockets (ws)", proficiency: "strong" },
      { name: "Baileys (WhatsApp)", proficiency: "expert" },
      { name: "Twilio Voice / Studio / Flex", proficiency: "strong" },
    ],
  },
  {
    name: "Infrastructure & DevOps",
    description: "Vercel, Railway, monorepos, build systems.",
    skills: [
      { name: "Vercel", proficiency: "expert" },
      { name: "Railway", proficiency: "expert" },
      {
        name: "Supabase",
        proficiency: "strong",
        note: "Auth, RPC, security definer functions",
      },
      { name: "pnpm Workspaces / Turbo", proficiency: "strong" },
      { name: "Electron + electron-builder", proficiency: "strong" },
      { name: "GitHub Actions", proficiency: "strong" },
      { name: "Backblaze B2", proficiency: "strong" },
    ],
  },
  {
    name: "Data & Integrations",
    description: "Shopify, Google Workspace, Puppeteer, scrapers.",
    skills: [
      { name: "Shopify Admin & Storefront APIs", proficiency: "expert" },
      {
        name: "Google Workspace APIs",
        proficiency: "strong",
        note: "Calendar, Gmail, Sheets, Contacts",
      },
      { name: "Wheel-Size API", proficiency: "strong" },
      { name: "Puppeteer", proficiency: "strong" },
      { name: "Cheerio + p-limit", proficiency: "strong" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CAPABILITY HEADLINES — for the "what I do" section.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIENCE TIMELINE — for the Work section
// ─────────────────────────────────────────────────────────────────────────────

export interface ExperienceRow {
  when: string;
  role: string;
  org: string;
  where: string;
  bullets: string[];
}

export const experience: ExperienceRow[] = [
  {
    when: "2025 — present",
    role: "AI & Product Engineer",
    org: "Yantissimo / Yantissimo",
    where: "Mexico · Hybrid",
    bullets: [
      "Built the customer-facing iOS app, Express backend, and headless Shopify storefront end-to-end — the company's complete digital surface.",
      "Shipped multi-channel AI sales agent across Telegram + WhatsApp with OpenAI tool calling, scheduled reminders, Backblaze media.",
      "Stack: Swift 5.9 / SwiftUI, Node.js 20 / Express, PostgreSQL, Shopify Admin & Storefront, OpenAI, Railway + Vercel.",
    ],
  },
  {
    when: "2025 — present",
    role: "Independent AI Engineer",
    org: "AI Lab (open / contract)",
    where: "Remote",
    bullets: [
      "Hybrid RAG platform (DataKnife) — vector store + Supabase RPC with custom SELECT-only SQL safety guards via OpenAI ChatKit.",
      "Local-first LaTeX editor (Overtree) with Yjs CRDT collaboration and an MCP server exposing 12 tools across 3 transports.",
      "Self-hosted multi-tenant WhatsApp gateway powering a fleet of internal agents — Baileys + Neon Postgres + Next.js dashboard.",
    ],
  },
  {
    when: "2024 — 2025",
    role: "Data Science Student",
    org: "[ University ]",
    where: "Mexico",
    bullets: [
      "Coursework in machine learning, statistics, and applied AI.",
      "Independent projects in LLM applications, retrieval systems, and data pipelines.",
    ],
  },
];

export const capabilityPillars = [
  {
    id: "platforms",
    title: "Complete Platforms",
    description:
      "I ship end-to-end products — iOS, web, backend, integrations — under one architectural vision. Yantissimo runs three coordinated surfaces; Karate ships as a single Electron binary; the WhatsApp gateway powers an entire fleet of internal agents.",
    examples: ["Yantissimo Platform", "Karate Tournament", "WhatsApp Gateway"],
  },
  {
    id: "ai",
    title: "AI-Native Systems",
    description:
      "Function calling with safety guards. Hybrid RAG that routes documents and SQL through one chat. MCP servers exposing local tools to Claude and ChatGPT. Multi-agent sales workflows in production on Telegram and WhatsApp.",
    examples: ["DataKnife", "CRISP-DM Workbench", "Overtree (MCP)"],
  },
  {
    id: "infra",
    title: "Self-Hosted Infrastructure",
    description:
      "When the per-seat SaaS bill stops making sense, I build the in-house version. WhatsApp gateway replaces a per-agent BSP. Overtree replaces Overleaf with local files and AI access.",
    examples: ["WhatsApp Gateway", "Overtree", "YSSM Backend"],
  },
  {
    id: "native",
    title: "Native iOS, Done Right",
    description:
      "Zero-dependency APIClient with 401 refresh retry. Application Support cache hydration. Keychain-backed sessions. Network.framework over WebSocket. MVVM with environment-driven dependency injection.",
    examples: ["Yantissimo iOS", "Smoke Signals", "Vydas"],
  },
];
