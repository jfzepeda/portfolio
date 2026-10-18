// =============================================================================
// PROFILE DATA — Spanish version. Mirrors the structure of profile.ts.
// =============================================================================

import type { StackGroup, SkillGroup, ExperienceRow } from "./profile";

export const profile = {
  name: "Juan Felipe Zepeda",
  shortName: "Juanfe",
  handle: "juanfe",
  email: "zepedajuanfe9@gmail.com",
  location: "México",
  timezone: "America/Mexico_City",

  role: "Ingeniero de IA y Producto",

  pitch:
    "Construyo productos AI-native de extremo a extremo — iOS nativo, APIs de servidor, sistemas agénticos y la infraestructura que los une. Entrego plataformas completas, no presentaciones.",

  bio: [
    "Soy ingeniero de IA y producto basado en México. Construyo plataformas completas — front-end, back-end, móvil, agentes y la infraestructura que los conecta. Mi trabajo abarca iOS nativo (SwiftUI), Next.js, Node.js, sistemas en tiempo real (Yjs CRDTs, OpenAI Realtime) y arquitecturas AI-native (RAG, function-calling, servidores MCP, orquestación multi-agente).",
    "Mi proyecto insignia es la plataforma Yantissimo — el stack digital completo de un distribuidor de llantas y rines: app iOS nativa, backend en Express, storefront headless con Shopify. Construí los tres. También desarrollo herramientas internas y automatizaciones: un gateway de WhatsApp auto-hospedado, un editor LaTeX local-first estilo Overleaf con servidor MCP, y agentes de IA que manejan ventas y atención al cliente en Telegram y WhatsApp.",
    "Prefiero el apalancamiento sobre la superficie. Un solo gateway auto-hospedado en vez de un BSP por agente. Un paquete core de lógica pura en vez de UI duplicada. Un APIClient escrito a mano para iOS en vez de un SDK de terceros. El trabajo lo demuestra.",
  ],

  social: {
    github: "https://github.com/",
    linkedin: "https://linkedin.com/in/",
    email: "mailto:zepedajuanfe9@gmail.com",
  },

  availability:
    "Abierto a roles senior de producto / ingeniería de IA y a contratos de alto apalancamiento.",

  credibility: [
    { label: "Plataformas en producción", value: "3+" },
    { label: "Agentes de IA en producción", value: "5+" },
    { label: "Proyectos destacados (Tier 1-3)", value: "10" },
    { label: "Proyectos totales en portafolio", value: "40+" },
  ],
};

export type Proficiency = "expert" | "strong" | "working";

export const techStack: StackGroup[] = [
  {
    domain: "Backend",
    blurb:
      "APIs Express en producción con cobertura de pruebas real, jobs asíncronos y middleware modular.",
    items: [
      "Node.js 20+",
      "Express",
      "Bun",
      "Fastify",
      "Multer",
      "Jest + Supertest",
    ],
    shippedIn: [
      "Yantissimo Backend (167 archivos / 7.3k LOC, 41 rutas)",
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
      "YSSM ERP (450 archivos)",
      "Overtree",
      "DataKnife",
    ],
  },
  {
    domain: "Móvil",
    blurb: "iOS nativo, MVVM, cero dependencias externas donde importa.",
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
      "Yantissimo iOS (68 archivos, 0 SPM/Cocoapods)",
      "Smoke Signals (protocolo Signal)",
      "Vydas",
    ],
  },
  {
    domain: "IA",
    blurb:
      "Uso directo de SDK (no wrappers). Function calling con guardas de seguridad, RAG híbrido, MCP.",
    items: [
      "OpenAI SDK",
      "Anthropic Claude SDK",
      "OpenAI ChatKit",
      "Vector Stores",
      "Realtime API",
      "Model Context Protocol (MCP)",
      "RAG Híbrido",
    ],
    shippedIn: [
      "DataKnife (vector + SQL híbrido)",
      "Overtree (servidor MCP de 12 herramientas)",
      "Nexora Sales Agent",
    ],
  },
  {
    domain: "Tiempo Real",
    blurb: "CRDTs, WebSockets, voz, mensajería multicanal.",
    items: [
      "Yjs (CRDTs)",
      "y-codemirror.next",
      "y-websocket",
      "ws",
      "Baileys (WhatsApp)",
      "Twilio Voice / Studio / Flex",
    ],
    shippedIn: [
      "Overtree (multicursor en LAN)",
      "WhatsApp Gateway (multi-tenant)",
      "Smoke Signals",
    ],
  },
  {
    domain: "Cloud / DevOps",
    blurb:
      "Despliegues de producción en Vercel + Railway. CI/CD vía GitHub Actions, Electron para escritorio.",
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
    domain: "Datos",
    blurb:
      "Postgres-first, Supabase RPC con funciones security-definer, Shopify GraphQL, diseño de esquema.",
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
    domain: "Auth y Seguridad",
    blurb:
      "JWT RS256 con generación de keypair en dispositivo, Keychain en iOS, iron-session en web.",
    items: [
      "JWT (RS256)",
      "bcrypt",
      "iron-session",
      "Keychain (iOS)",
      "401 refresh-retry",
      "Protocolo Signal (Smoke Signals)",
    ],
    shippedIn: [
      "Yantissimo iOS",
      "Karate (keypair RS256 en primer arranque)",
      "Smoke Signals",
    ],
  },
];

export const skillGroups: SkillGroup[] = [
  {
    name: "Ingeniería de IA",
    description:
      "Orquestación de LLMs, RAG, agentes, function-calling, tiempo real.",
    skills: [
      {
        name: "OpenAI SDK",
        proficiency: "expert",
        note: "Tool calling, streaming, vector store, ChatKit",
      },
      {
        name: "Anthropic Claude SDK",
        proficiency: "expert",
        note: "SDK directo, no wrappers",
      },
      {
        name: "Model Context Protocol (MCP)",
        proficiency: "expert",
        note: "Servidor custom, 12 herramientas, 3 transports",
      },
      {
        name: "RAG (Híbrido)",
        proficiency: "strong",
        note: "Vector + SQL estructurado, routing por function-call",
      },
      {
        name: "OpenAI Realtime API",
        proficiency: "strong",
        note: "WebRTC, agentes de voz, multimodal",
      },
      { name: "Orquestación multi-agente", proficiency: "strong" },
      { name: "Prompt engineering", proficiency: "expert" },
    ],
  },
  {
    name: "Frontend",
    description: "React moderno, Next.js App Router, sistemas de diseño.",
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
        note: "stex / LaTeX, extensiones custom",
      },
      { name: "Recharts / Chart.js", proficiency: "strong" },
    ],
  },
  {
    name: "Backend",
    description: "APIs en Express, Postgres, auth, jobs asíncronos.",
    skills: [
      { name: "Node.js 20+", proficiency: "expert" },
      {
        name: "Express",
        proficiency: "expert",
        note: "APIs de producción de 41 rutas",
      },
      { name: "PostgreSQL", proficiency: "expert" },
      { name: "MySQL", proficiency: "strong" },
      { name: "JWT (RS256)", proficiency: "strong" },
      { name: "Jest + Supertest", proficiency: "strong" },
      { name: "Bun", proficiency: "strong" },
    ],
  },
  {
    name: "iOS Nativo",
    description: "SwiftUI, Network.framework, Photos, MapKit, Keychain.",
    skills: [
      { name: "Swift 5.9", proficiency: "expert" },
      { name: "SwiftUI (iOS 16+)", proficiency: "expert" },
      { name: "Network.framework / NWConnection", proficiency: "strong" },
      { name: "Keychain", proficiency: "strong" },
      { name: "MapKit", proficiency: "strong" },
      { name: "Photos.framework", proficiency: "strong" },
      { name: "APNs (Push)", proficiency: "strong" },
      { name: "Observable / MVVM modernos", proficiency: "expert" },
      {
        name: "LibSignalClient (FFI)",
        proficiency: "working",
        note: "C FFI, submódulo signal-protocol-c",
      },
    ],
  },
  {
    name: "Tiempo Real y Colaboración",
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
    name: "Infraestructura y DevOps",
    description: "Vercel, Railway, monorepos, build systems.",
    skills: [
      { name: "Vercel", proficiency: "expert" },
      { name: "Railway", proficiency: "expert" },
      {
        name: "Supabase",
        proficiency: "strong",
        note: "Auth, RPC, funciones security definer",
      },
      { name: "pnpm Workspaces / Turbo", proficiency: "strong" },
      { name: "Electron + electron-builder", proficiency: "strong" },
      { name: "GitHub Actions", proficiency: "strong" },
      { name: "Backblaze B2", proficiency: "strong" },
    ],
  },
  {
    name: "Datos e Integraciones",
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

export const experience: ExperienceRow[] = [
  {
    when: "2025 — actualidad",
    role: "Ingeniero de IA y Producto",
    org: "Yantissimo / Yantissimo",
    where: "México · Híbrido",
    bullets: [
      "Construí de extremo a extremo la app iOS, el backend en Express y el storefront headless con Shopify — la superficie digital completa de la empresa.",
      "Lancé un agente de ventas con IA multicanal en Telegram + WhatsApp con tool calling de OpenAI, recordatorios programados y multimedia en Backblaze.",
      "Stack: Swift 5.9 / SwiftUI, Node.js 20 / Express, PostgreSQL, Shopify Admin & Storefront, OpenAI, Railway + Vercel.",
    ],
  },
  {
    when: "2025 — actualidad",
    role: "Ingeniero de IA Independiente",
    org: "AI Lab (open / contract)",
    where: "Remoto",
    bullets: [
      "Plataforma de RAG híbrido (DataKnife) — vector store + Supabase RPC con guardas custom SELECT-only para SQL vía OpenAI ChatKit.",
      "Editor LaTeX local-first (Overtree) con colaboración CRDT en Yjs y servidor MCP que expone 12 herramientas en 3 transports.",
      "Gateway de WhatsApp multi-tenant auto-hospedado que alimenta una flota de agentes internos — Baileys + Neon Postgres + dashboard Next.js.",
    ],
  },
  {
    when: "2024 — 2025",
    role: "Estudiante de Ciencia de Datos",
    org: "[ Universidad ]",
    where: "México",
    bullets: [
      "Cursos en machine learning, estadística e IA aplicada.",
      "Proyectos independientes en aplicaciones LLM, sistemas de recuperación y pipelines de datos.",
    ],
  },
];

export const capabilityPillars = [
  {
    id: "platforms",
    title: "Plataformas Completas",
    description:
      "Entrego productos de punta a punta — iOS, web, backend, integraciones — bajo una sola visión arquitectónica. Yantissimo opera tres superficies coordinadas; Karate se distribuye como un binario único de Electron; el gateway de WhatsApp alimenta una flota entera de agentes internos.",
    examples: ["Plataforma Yantissimo", "Torneo de Karate", "WhatsApp Gateway"],
  },
  {
    id: "ai",
    title: "Sistemas AI-Native",
    description:
      "Function calling con guardas de seguridad. RAG híbrido que enruta documentos y SQL en un solo chat. Servidores MCP que exponen herramientas locales a Claude y ChatGPT. Workflows de ventas multi-agente en producción en Telegram y WhatsApp.",
    examples: ["DataKnife", "Workbench CRISP-DM", "Overtree (MCP)"],
  },
  {
    id: "infra",
    title: "Infraestructura Auto-Hospedada",
    description:
      "Cuando el costo por usuario del SaaS deja de tener sentido, construyo la versión interna. El gateway de WhatsApp reemplaza un BSP por agente. Overtree reemplaza Overleaf con archivos locales y acceso IA.",
    examples: ["WhatsApp Gateway", "Overtree", "YSSM Backend"],
  },
  {
    id: "native",
    title: "iOS Nativo Bien Hecho",
    description:
      "APIClient cero-dependencias con reintento 401. Hidratación desde Application Support. Sesiones respaldadas por Keychain. Network.framework sobre WebSocket. MVVM con inyección de dependencias por environment.",
    examples: ["Yantissimo iOS", "Smoke Signals", "Vydas"],
  },
];
