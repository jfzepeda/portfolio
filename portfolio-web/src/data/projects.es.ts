// =============================================================================
// PROJECT DATABASE — Spanish version. Mirrors projects.ts structure.
// =============================================================================

import type { Project, Tier4Project, Category } from "./projects";

export const yantissimo: Project = {
  id: "yantissimo",
  slug: "yantissimo",
  name: "Plataforma Yantissimo",
  tagline:
    "ERP empresarial a medida para un distribuidor de llantas y rines — 24+ módulos en auditoría, ventas, agendas, productividad y garantías, más la API, app iOS nativa y storefront que alimenta.",
  tier: 1,
  category: "enterprise",
  status: "production",
  year: 2026,
  recencyLabel: "May 2026",
  icon: "Y",
  accent: "amber",
  scaleSignal:
    "4 superficies · ~800+ archivos fuente · 24+ módulos ERP · 60 pruebas de auditoría · uso diario en producción",
  executive: {
    headline:
      "El backbone operativo de un negocio de distribución automotriz completo.",
    summary:
      "Plataforma Yantissimo es el ERP empresarial a medida que construí para Yantissimo, un distribuidor de llantas y rines en México — junto con el backend satélite y el storefront que alimenta. La plataforma opera el día a día: parsea exportaciones de Microsip para auditorías del día siguiente, calcula productividad de técnicos y vendedores, genera cotizaciones y facturas, agenda instalaciones, gestiona órdenes de mayoreo y menudeo, da seguimiento a garantías y muestra KPIs en vivo. Toda la organización trabaja dentro de ella.",
    outcomes: [
      "Reemplaza un stack de hojas de cálculo, exportaciones de Microsip y herramientas ad-hoc con un solo sistema operativo de uso diario.",
      "El módulo de auditoría diario lee datos de Microsip, valida desempeño de técnicos/vendedores, permite a admins reasignar mano de obra (MO) y justificar excepciones — con soft-block antes del cierre del día.",
      "Dashboards de productividad en vivo para vendedores y técnicos; PDFs de cotizaciones y revisiones post-servicio generados dentro de la app.",
      "Colaboración en tiempo real vía Socket.io — varios miembros del equipo trabajan las mismas órdenes y auditorías simultáneamente.",
      "El storefront para clientes y las apps río abajo comparten el mismo backend y modelo de datos — una sola fuente de verdad.",
      "Desplegado en producción: ERP y storefront en Vercel con CI de PR-preview, backend en Railway, app iOS nativa en TestFlight, todo detrás de un solo Postgres.",
    ],
  },
  technical: {
    headline:
      "Un ERP de 24 módulos en Next.js 16, un backend de orquestación en Express, un cliente iOS nativo en SwiftUI y un storefront headless con Shopify — un solo Postgres, un solo equipo.",
    summary:
      "Plataforma de cuatro superficies en producción. El ERP es una app Next.js 16 (App Router + Turbopack) con route groups para personal protegido, portales de cliente y superficies públicas, más 24+ módulos de funcionalidad que van desde auditoría (parser de Microsip + motor de KPIs + flujo de reasignación) hasta suite (ventas / cotizaciones / pagos / facturas), mayoreo, calendarios, equipo, garantías y un panel embebido de agente IA. El backend Express es la API que el ERP, el cliente iOS y el storefront consumen. El cliente iOS está escrito a mano en SwiftUI con cero dependencias externas. El storefront es un front-end Next.js headless de Shopify con búsqueda por vehículo conectada vía Wheel-Size API.",
    architecture:
      "ERP YSSM (plataforma): Next.js 16.0 App Router con Turbopack, route groups para (protected)/(clientes)/(public)/api, Material UI + HeroUI + tokens custom en Tailwind 4, FullCalendar + react-big-calendar + react-date-range para agendas, Recharts para KPIs, react-dnd para drag-and-drop, Socket.io para colaboración en tiempo real, jspdf + jspdf-autotable para generación de PDF dentro de la app, xlsx para import/export Excel, libphonenumber-js para normalización de teléfonos, bcrypt para auth. El módulo de auditoría tiene su propia capa de cálculo de función pura (lib/excel/parseAuditoria.js, lib/calc/reasigMO.js), estado vía AuditoriaContext con persistencia patchSession, y una suite de 60 pruebas bajo tests/auditoria/ ejecutada vía node --import register. El backend (yssm-backend) es Express + Postgres + MySQL con 41 rutas modulares, SDKs Shopify Admin/Storefront, OpenAI, Backblaze B2, Google Sheets, Puppeteer y pruebas Jest + Supertest. El storefront extiende la plantilla Next.js Commerce de Vercel con un flujo custom 'Por auto'.",
    highlights: [
      "447 archivos fuente sólo en el ERP; 24+ módulos de funcionalidad bajo (protected)/ — auditoría, ventas, suite, mayoreo, ordenes, cotizaciones, calendario, equipo, dashboard, agent, claude, campanas, configuracion, garantias, inventario, reports, ramps, seguimiento, todo, snapshots, administracion, myr, más un portal (clientes).",
      "Colaboración multiusuario en tiempo real vía socket.io-client a lo largo de los paneles.",
      "Módulo auditoría: parser Excel de Microsip (parseAuditoria.js, ~550 LOC), helpers de reasignación de función pura (reasigMO.js), estado con persistencia patchSession, flujo de soft-block para cierre del día, 60 pruebas bajo tests/auditoria/.",
      "Generación de PDF dentro de la app con jspdf + jspdf-autotable (cotizaciones, revisiones post-servicio, facturas).",
      "Import/export Excel con xlsx; integración Microsip vía puente parser custom.",
      "FullCalendar + react-big-calendar + react-date-range para agenda de servicios y calendarios de equipo.",
      "Dashboards Recharts para KPIs de productividad de vendedores y técnicos.",
      "Material UI + HeroUI + Tailwind 4 — librería custom pesada bajo src/components/{suite,mayoreo,orders,client,tables,modal,ItemModal}.",
      "Backend Express: 167 archivos, 41 rutas, cobertura de pruebas Jest + Supertest, cola de jobs asíncronos.",
      "Panel de agente IA embebido dentro del ERP (/agent route) más una ruta /claude — el personal interno obtiene ayuda LLM en contexto.",
      "CI de PR-preview vía GitHub Actions en el repo del ERP.",
    ],
  },
  stack: [
    "Next.js 16",
    "React 18",
    "TypeScript",
    "Turbopack",
    "Tailwind CSS 4",
    "Material UI",
    "HeroUI",
    "FullCalendar",
    "react-big-calendar",
    "react-dnd",
    "Recharts",
    "Socket.io",
    "jspdf",
    "xlsx",
    "Swift 5.9",
    "SwiftUI",
    "Network.framework",
    "Keychain",
    "APNs",
    "Node.js 20",
    "Express",
    "PostgreSQL",
    "MySQL",
    "Shopify Admin API",
    "Shopify Storefront API",
    "OpenAI",
    "JWT",
    "bcrypt",
    "Backblaze B2",
    "Google Sheets API",
    "Puppeteer",
    "Wheel-Size API",
    "Vercel",
    "Railway",
    "Jest",
    "Supertest",
    "GitHub Actions",
  ],
  capabilities: [
    "ERP Empresarial",
    "Colaboración en Tiempo Real",
    "Flujo de Auditoría",
    "Dashboards de Productividad",
    "Generación de Cotizaciones y Facturas",
    "Agenda de Servicios",
    "Órdenes Mayoreo + Menudeo",
    "Seguimiento de Garantías",
    "Integración Microsip",
    "Generación de PDF",
    "Import/Export Excel",
    "Storefront Headless",
    "Búsqueda por Vehículo",
    "Agente IA Embebido",
    "Portal de Cliente",
    "Móvil Nativo",
    "Caché Offline",
    "Push Notifications",
  ],
  domain:
    "Distribución de Llantas y Rines — Operaciones, Ventas, Móvil y Storefront",
  users:
    "Personal interno en equipos de auditoría, ventas, servicio y administración; clientes de mayoreo vía portal; clientes minoristas vía la app iOS y el storefront.",
  subproducts: [
    {
      name: "Plataforma Yantissimo (ERP YSSM)",
      role: "ERP operativo — backbone diario del negocio",
      stack: [
        "Next.js 16",
        "React 18",
        "Turbopack",
        "Material UI",
        "HeroUI",
        "Tailwind CSS 4",
        "FullCalendar",
        "Recharts",
        "Socket.io",
        "react-dnd",
        "jspdf",
        "xlsx",
        "PostgreSQL",
        "Vercel",
      ],
      scale: "447 archivos fuente · 24+ módulos · 60 pruebas de auditoría",
      highlights: [
        "24+ módulos bajo (protected)/: auditoría, ventas, suite, mayoreo, ordenes, cotizaciones, calendario, equipo, dashboard, agent, claude, campañas, configuración, garantías, inventario, reports, ramps, seguimiento, todo, snapshots, administración, myr — más un portal (clientes).",
        "Auditoría: parser Excel de Microsip + helpers de reasignación de MO de función pura + estado con persistencia patchSession + suite de 60 pruebas.",
        "Colaboración en tiempo real con Socket.io — edición multiusuario de auditorías, órdenes y dashboards.",
        "Agente IA embebido (/agent) y ruta /claude — el personal interno obtiene ayuda LLM en contexto.",
        "Generación de PDF (jspdf + jspdf-autotable) para cotizaciones, facturas y revisiones post-servicio.",
        "FullCalendar + react-big-calendar + react-date-range para agenda de servicios.",
        "Dashboards Recharts: KPIs en vivo de productividad de vendedores y técnicos.",
        "Gestión de órdenes con drag-and-drop vía react-dnd.",
        "CI de PR-preview vía GitHub Actions.",
      ],
      professionalHighlights: [
        "Operaciones centralizadas — cada equipo trabaja dentro de un solo sistema de uso diario en lugar de un stack de hojas de cálculo, exportaciones e hilos de chat.",
        "Fuente única de verdad para órdenes, inventario, auditorías, precios y clientes — nada que conciliar entre departamentos.",
        "Colaboración multiusuario en tiempo real mantiene a auditoría, ventas y servicio sincronizados sin llamadas ni conflictos de versiones.",
        "Flujo de auditoría diario con soft-block al cierre del día atrapa errores antes de que salgan del edificio.",
        "Cotizaciones, facturas y reportes generados dentro de la app — sin herramientas de papeleo de terceros ni add-ons externos.",
        "La asistencia IA embebida mantiene al personal productivo sin salir de la plataforma para cambiar de herramienta.",
      ],
    },
    {
      name: "Yantissimo Backend (yssm-backend)",
      role: "Capa API + orquestación que alimenta al ERP, la app iOS y el storefront",
      stack: [
        "Node.js 20",
        "Express",
        "PostgreSQL",
        "MySQL",
        "Shopify SDKs",
        "OpenAI",
        "Backblaze B2",
        "Google Sheets",
        "Puppeteer",
        "Jest",
        "Supertest",
        "Railway",
      ],
      scale: "167 archivos fuente · ~7.3k LOC · 41 módulos de rutas",
      highlights: [
        "41 rutas modulares: auth, mobile-app, services, quotes, ventas, dashboard, shopify, scrapper, calendar, formula, qr, cron, liquidaciones, invoices, snapshot, …",
        "Cobertura de pruebas real con Jest + Supertest; ESLint + Prettier configurados.",
        "Integración directa con Shopify Admin + Storefront con auth tipo cookie-jar y webhooks firmados.",
        "Backblaze B2 para medios; puente con Google Sheets para reportería de back-office.",
        "Integración con OpenAI que alimenta recomendaciones de ventas y triage de mensajes de clientes.",
        "Cola de jobs asíncronos para tareas largas; módulo cron para jobs programados.",
      ],
      professionalHighlights: [
        "Un solo backend alimenta cada superficie hacia el cliente — sin sistemas paralelos que el equipo deba mantener sincronizados.",
        "Sincronización automatizada de catálogo y stock con Shopify mantiene precios y disponibilidad consistentes en todos lados, en tiempo real.",
        "Workflows en segundo plano manejan tareas largas sin frenar la experiencia del cliente.",
        "El triage de mensajes con IA filtra el tráfico rutinario antes de que llegue a un vendedor.",
        "Despliegues con gate de pruebas protegen las operaciones diarias de regresiones — código roto nunca llega a producción.",
        "Construido para escalar — diseñado para miles de clientes concurrentes a través de móvil, web y personal interno.",
      ],
    },
    {
      name: "Yantissimo Shop",
      role: "Storefront headless de cara al cliente",
      stack: [
        "Next.js 15.6",
        "React 19",
        "TypeScript",
        "Tailwind CSS 4",
        "Shopify Storefront GraphQL",
        "Wheel-Size API",
        "Vercel",
      ],
      scale: "~116 archivos fuente · server components + edge middleware",
      highlights: [
        "Búsqueda por vehículo ('Por auto') conectada vía Wheel-Size API al catálogo Shopify — los clientes encuentran llantas por marca / modelo / año.",
        "React Server Components, Server Actions, Suspense, useOptimistic.",
        "Edge middleware para routing y revalidación.",
        "Integrado con el mismo carrito, checkout y registro de cliente que el ERP y el cliente iOS.",
      ],
      professionalHighlights: [
        "Los clientes encuentran la llanta correcta por vehículo (marca / modelo / año) — sin necesidad de experticia o llamada de venta.",
        "Navegación y checkout self-service 24/7 elimina el cuello de botella del vendedor y desbloquea ingresos de fin de semana.",
        "Catálogo de productos compartido con el ERP y la app iOS — un precio, una descripción, cada canal.",
        "Páginas server-rendered capturan tráfico orgánico de búsqueda sin herramientas de SEO extras.",
        "Storefront mobile-first optimizado para el dispositivo en el que los clientes realmente compran.",
        "Diseñado para expandirse — nuevas bases de datos de vehículos o mercados geográficos se conectan limpiamente.",
      ],
    },
    {
      name: "Yantissimo iOS",
      role: "App iOS nativa de cara al cliente",
      stack: [
        "Swift 5.9",
        "SwiftUI",
        "iOS 16+",
        "Network.framework",
        "Keychain",
        "Application Support",
        "APNs",
        "xcconfig",
      ],
      scale: "68 archivos Swift · ~7.1k LOC · 541 LOC de pruebas",
      highlights: [
        "Cero dependencias externas — sin paquetes SPM, sin CocoaPods.",
        "APIClient custom con reintento 401 one-shot y 'sesión eterna' para que los clientes nunca pierdan sesión en el peor momento.",
        "10+ módulos de funcionalidad: Onboarding, Home, Profile, Club, Convenios, Promociones, Recordatorios, Visitas, Cotizaciones, Postchecks.",
        "Caché Application Support hidrata la UI antes de la llamada de red — la app abre con contenido incluso offline.",
        "Feature flags (ej. SMS-OTP) controlados a compile-time vía xcconfig.",
        "Push notifications conectadas vía PushManager → registro de dispositivo en backend.",
        "URLs de backend por build-config (Debug → localhost, Release → Railway).",
      ],
      professionalHighlights: [
        "Experiencia iOS nativa que los clientes esperan — rápida, pulida y entregada vía App Store / TestFlight.",
        "Lista para offline — los clientes pueden navegar vehículos, citas e historial incluso con señal intermitente.",
        "Las push notifications impulsan engagement recurrente con recordatorios de servicio y promociones.",
        "Una sola cuenta compartida con el storefront — un login, cada superficie.",
        "Lealtad, recordatorios y seguimiento post-servicio construyen valor a largo plazo del cliente.",
        "Construida para white-label — la misma base de código puede servir a distribuidores adicionales con un cambio de config.",
      ],
    },
  ],
  hero: "/images/projects/plataforma-y.png",
  screenshots: [
    "/images/projects/plataforma-y.png",
    "/images/projects/back-y.png",
    "/images/projects/shop-y.png",
    "/images/projects/ios-y.jpeg",
  ],
  repoPath:
    "YSSM/(plataforma)/erp-yssm + YSSM/(yaol)/backend-yssm + YSSM/(yaol)/shop-yaol",
};

export const fitnessCopilot: Project = {
  id: "fitness-copilot",
  slug: "fitness-copilot",
  name: "Fitness Copilot",
  tagline:
    "Compañero de fitness, nutrición y entrenamiento asistido por IA para iOS, respaldado por Supabase + Claude.",
  tier: 2,
  category: "swift",
  status: "active",
  year: 2026,
  recencyLabel: "May 2026",
  icon: "F",
  accent: "emerald",
  scaleSignal: "26 archivos Swift · 8.3k LOC · 6 pestañas · Supabase + Claude Edge",
  executive: {
    headline:
      "Un coach personal de IA para dieta, entrenamiento y recuperación.",
    summary:
      "Fitness Copilot es una app iOS que combina seguimiento de macros, planes semanales de entrenamiento, lectura de resultados de laboratorio y un coach IA en un solo lugar. La app está lista para bilingüe (actualmente en español) y diseñada en torno a cómo los atletas realmente usan su teléfono — registro rápido, líneas de tiempo de un vistazo y conversaciones IA con contexto real de tus metas, alergias y laboratorios recientes.",
    outcomes: [
      "Todo tu contexto de fitness — dieta, entrenamientos, laboratorios, suplementos — vive en un solo lugar donde la IA puede razonar sobre él.",
      "Vista de timeline diaria muestra qué sigue sin forzar al usuario a navegar menús.",
      "Las sugerencias de suplementos las genera Claude con contexto dietético y de laboratorio completo.",
      "El estilo visual de las tarjetas se puede cambiar en tiempo de ejecución (sombra / borde / plano).",
    ],
  },
  technical: {
    headline: "SwiftUI moderno + Supabase + Edge Functions de Anthropic.",
    summary:
      "SwiftUI basado en pestañas con una capa MVVM limpia. El auth bootstrapea vía un AuthService centralizado inyectado por un environment key custom. El backend (Supabase) guarda planes dietéticos, reportes de laboratorio, esquemas de suplementos y métricas sincronizadas con HealthKit. Una Edge Function llama a Claude con contexto dietético rico para generar sugerencias de suplementos.",
    architecture:
      "FitnessApp bootstrapea AuthService vía @StateObject. El Repository se inyecta vía un EnvironmentKey custom (\\.repository) para que las vistas puedan alternar entre implementaciones reales y mock limpiamente. Los tokens de tema (Tokens / F / CardStyle) están abstraídos lejos de las vistas. El roadmap NEXT_STEPS detalla el cableado observable de HealthKit, las policies RLS de suplementos y el contrato de la Edge Function de Claude.",
    highlights: [
      "Layout SwiftUI de seis pestañas: Dieta · Ejercicios · IA · Cronograma · Perfil · Suplementos.",
      "MVVM con inyección de dependencias por environment (\\.repository) para vistas testeables.",
      "Tokens de tema abstraídos en Tokens / F / CardStyle — estilo visual de tarjetas intercambiable en runtime.",
      "Backend Supabase con métricas sincronizadas de HealthKit (daily_energy, exercise_minutes, HRV, peso).",
      "Edge Function de Anthropic (functions/suggest_supplements) para sugerencias conscientes del contexto dietético.",
      "Bundle id com.zepedajuanfe.Fitness; deployment target iOS 18; Swift 5.",
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
    "Coaching IA",
    "Seguimiento de Salud",
    "Registro de Macros",
    "Análisis de Reportes de Laboratorio",
    "Sugerencias de Suplementos",
  ],
  domain: "Salud y Fitness",
  users: "Atletas y entusiastas del quantified-self.",
  hero: "/images/projects/fitness-icon.png",
  repoPath: "Swift/fitness_copilot",
};

export const kioskoLogistics: Project = {
  id: "kiosko-logistics",
  slug: "kiosko-logistics",
  name: "Kiosko Logistics",
  tagline:
    "Dashboard de Vehicle Routing Problem: solvers en Python (savings, sweep, Fisher–Jaikumar, granular tabu, genético) alimentando un mapa + lab en Next.js para experimentación de sweeps y fronteras Pareto.",
  tier: 2,
  category: "web",
  status: "active",
  year: 2026,
  recencyLabel: "May 2026",
  icon: "K",
  accent: "sky",
  scaleSignal: "Next.js 15 + suite VRP en Python · ~400 tiendas · demo de 8 rutas",
  executive: {
    headline:
      "Stack VRP completo — solver, visualizador y lab de experimentos — para una red de distribución de tiendas de conveniencia.",
    summary:
      "Kiosko Logistics resuelve la ruteo de última milla para una red de ~400 tiendas. Un backend en Python implementa cinco heurísticas VRP clásicas (savings, sweep, Fisher–Jaikumar, granular tabu, genético) con restricciones configurables de capacidad / ventanas de tiempo / peso por distancia; un dashboard Next.js renderiza las rutas resultantes en un mapa Leaflet, anima la corrida y expone un lab para sweeps de parámetros y fronteras Pareto entre corridas.",
    outcomes: [
      "Una sola UI para comparar salidas de solvers lado a lado sobre la misma instancia — usada para escoger la heurística correcta por región.",
      "Dashboard de lab corre sweeps de parámetros y surface la frontera Pareto contra costo, km totales y violaciones de regla de 8h.",
      "Demo pre-computado en el deploy público (8 rutas, ~2,300 km) con coordenadas anonimizadas (~50 m de su posición real).",
    ],
  },
  technical: {
    headline:
      "Solvers VRP en Python detrás de un servidor FastAPI; dashboard Next.js 15 + Leaflet + MUI con un lab para sweeps y gráficas Pareto.",
    summary:
      "VRP es NP-hard, así que el sistema se divide: una suite de solvers Python que opera sobre un plan maestro (Excel/CSV) y produce JSON de rutas, y un servidor delgado que expone runs/configs/jobs al dashboard. El dashboard separa la vista operativa (mapa + KPIs de la corrida activa) del lab (gráficas de elbow, clustering, sweeps de parámetros, Pareto).",
    architecture:
      "Core en Python bajo algoritmos/ con cinco familias de solver (savings, sweep, Fisher–Jaikumar, granular tabu, genético) y un compositor cluster-then-solve; servidor FastAPI (server/app.py) envuelve runs, jobs, configs, plan maestro y endpoints de lab. Frontend Next.js 15 (React 19, MUI 6, Leaflet, framer-motion) con un Workflow Ribbon orquestando vistas Rutas → Configurar → Comparar → Lab. Los resultados de corrida cargan un bloque legacy_vrp_output que el mapa renderiza directamente.",
    highlights: [
      "Cinco familias de solver heurístico + composición cluster-then-solve.",
      "Herramientas Pareto y de sweep para escoger la heurística correcta por instancia.",
      "Demo live empaca corrida pre-computada + tiendas anonimizadas; script Python de anonimización (mueve coords 30–70 m random por tienda) commit junto.",
      "CSV de lab (5k SKUs × inventario) viaja en el deploy público para el dashboard de volumen.",
      "Opera sobre planes maestros reales (PMO.xlsx) vía upload de Excel en producción.",
    ],
  },
  stack: [
    "Next.js 15",
    "React 19",
    "MUI 6",
    "Leaflet",
    "Google Maps",
    "Python",
    "FastAPI",
    "Heurísticas VRP",
  ],
  capabilities: [
    "Optimización de Rutas (VRP)",
    "Comparación de Algoritmos",
    "Lab de Sweep / Pareto",
    "Visualización Logística",
    "Tuning de Restricciones",
  ],
  domain: "Logística y Operaciones de Flota",
  users: "Operadores de flota, planificadores de rutas y analistas logísticos.",
  hero: "/images/projects/kiosko-icon.png",
  repoPath: "TEC/kiosko",
};

export const companyBrain: Project = {
  id: "company-brain",
  slug: "company-brain",
  name: "DataKnife (Cerebro Corporativo)",
  tagline:
    "Plataforma RAG híbrida: documentos → OpenAI Vector Store, datos estructurados → Supabase, todo respondido por una sola interfaz ChatKit.",
  tier: 2,
  category: "ai",
  status: "active",
  year: 2026,
  recencyLabel: "May 2026",
  icon: "DK",
  accent: "violet",
  scaleSignal: "Next.js 16 · OpenAI ChatKit · Supabase RPC",
  executive: {
    headline: "Interfaz conversacional para todo lo que una empresa sabe.",
    summary:
      "DataKnife es una superficie de chat única que responde preguntas sobre documentos no estructurados (PDFs, contratos, manuales) y datos estructurados (CSVs, Excel, tablas de base de datos). Los documentos se vectorizan; los datos tabulares se consultan vía SQL. El usuario solo hace la pregunta — el sistema enruta correctamente.",
    outcomes: [
      "Un chat responde sobre documentos, hojas de cálculo y bases de datos.",
      "Las queries SQL se validan en el servidor: SELECT-only, LIMIT forzado — seguro para usuarios no técnicos.",
      "OpenAI Vector Store maneja la semántica de documentos; Supabase maneja la verdad estructurada.",
      "UI ChatKit lista para producción con respuestas streaming.",
    ],
  },
  technical: {
    headline:
      "Ingesta dual + tool call SQL custom con guardas de seguridad.",
    summary:
      "Los documentos se suben, clasifican y empujan a un OpenAI Vector Store listo para retrieval de ChatKit. Los archivos estructurados (CSV/Excel) llegan a un RPC de Supabase. La función custom sql-tool valida que cada query sea SELECT-only o WITH ... SELECT, inyecta LIMIT a la fuerza cuando falta, y ejecuta vía supabase.rpc contra una función Postgres security-definer.",
    architecture:
      "Next.js 16 App Router con React 19. El SDK React de OpenAI ChatKit está montado en un panel lateral derecho. onClientTool registra una herramienta custom 'execute_sql'. La ruta de la herramienta (/api/tools/sql) parsea el SQL con un pase regex/tokenizer para forzar SELECT-only + LIMIT, luego llama a Supabase vía la service role key (solo servidor). La ruta de ingesta vectorial (/api/uploads/documents) clasifica tipos de archivo y enruta o al Vector Store API o al placeholder del pipeline estructurado.",
    highlights: [
      "Tool custom de OpenAI ChatKit ('execute_sql') registrado vía onClientTool.",
      "Guarda SQL SELECT-only / WITH-only con forzado automático de LIMIT.",
      "Función Postgres security-definer de Supabase ejecutada vía RPC (service role key, solo server-side).",
      "Clasificación de documentos → OpenAI Vector Store con tagging de metadata.",
      "UI en español; diseñada para usuarios empresariales mexicanos reales.",
      "Stack moderno: Next.js 16.2 + React 19.2 + Tailwind 4 + primitives shadcn.",
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
    "Búsqueda Híbrida Documento + SQL",
    "Function Calling",
    "BI Conversacional",
    "Ingesta de Datos",
    "Búsqueda Vectorial",
  ],
  domain: "Conocimiento Empresarial y BI",
  users:
    "Analistas de negocio, equipos de operaciones y ejecutivos consultando sus propios datos.",
  hero: "/images/projects/dataknife.jpg",
  repoPath: "ai-lab/company-brain",
};

export const crispDm: Project = {
  id: "crisp-dm-2",
  slug: "crisp-dm-2",
  name: "Workbench CRISP-DM",
  tagline:
    "Workbench dual-LLM (Claude + GPT-4o) para el ciclo CRISP-DM de minería de datos, con pipeline Python para preparación, modelado y evaluación.",
  tier: 3,
  category: "ai",
  status: "active",
  year: 2026,
  recencyLabel: "May 2026",
  icon: "CR",
  accent: "fuchsia",
  scaleSignal: "Next.js 16 · Anthropic + OpenAI · pipeline ML en Python",
  executive: {
    headline:
      "Un workbench LLM-native para el ciclo de datos CRISP-DM.",
    summary:
      "CRISP-DM es el proceso estándar de la industria para proyectos de minería de datos (Entendimiento del Negocio → Entendimiento de Datos → Preparación → Modelado → Evaluación → Despliegue). Este workbench le da a un analista ayuda asistida por LLM en cada etapa, alternando entre Claude 3.5 y GPT-4o según la tarea.",
    outcomes: [
      "Los analistas avanzan por el ciclo CRISP-DM completo con ayuda del modelo en cada etapa.",
      "Alternar entre Claude 3.5 Sonnet y GPT-4o por tarea — el modelo correcto para el paso correcto.",
      "El pipeline Python (analyzer / processor / modeler) maneja el cómputo fuera del LLM.",
    ],
  },
  technical: {
    headline:
      "Abstracción dual de SDK con aislamiento de cómputo en Python y streaming.",
    summary:
      "SDK Anthropic 0.78 y OpenAI SDK 6.29 directos — sin chat-wrapper. La UI muestra un selector de modelo y plantillas de prompt por etapa. Un pipeline Python (analyzer.py, processor.py, modeler.py) maneja preprocesamiento, modelado y evaluación.",
    architecture:
      "Frontend Next.js 16 + React 19 con uploads de archivos vía Multer. Respuestas streaming de ambos providers. Recharts para visualizaciones de evaluación. Stack ML Python invocado vía subprocess (numpy / pandas implícitos por las firmas del processor).",
    highlights: [
      "Uso directo de SDKs Anthropic + OpenAI, no una librería wrapper.",
      "Plantillas de prompt por etapa alineadas a las fases CRISP-DM.",
      "Capa de cómputo Python para preprocesamiento pesado y modelado.",
      "UI consciente del streaming con vistas de evaluación en Recharts.",
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
    "Minería de Datos (CRISP-DM)",
    "Multi-LLM",
    "Streaming",
    "Aislamiento de Cómputo Python",
    "Gráficas de Evaluación",
  ],
  domain: "Ciencia de Datos y Analítica",
  users: "Científicos de datos y analistas ejecutando proyectos CRISP-DM.",
  hero: "/images/projects/crispdm.jpg",
  repoPath: "ai-lab/crisp-dm-2",
};

export const whatsappGateway: Project = {
  id: "whatsapp-gateway",
  slug: "whatsapp-gateway",
  name: "WhatsApp Gateway",
  tagline:
    "Broker de mensajes WhatsApp multi-tenant auto-hospedado con API REST con scope por token y dashboard de monitoreo de solo lectura.",
  tier: 3,
  category: "automation",
  status: "production",
  year: 2026,
  recencyLabel: "May 2026",
  icon: "WA",
  accent: "teal",
  scaleSignal: "pnpm workspaces · Baileys + Express · Neon Postgres · Railway",
  executive: {
    headline: "Infraestructura WhatsApp para una flota entera de agentes.",
    summary:
      "En lugar de pagar un gateway de WhatsApp de terceros por agente, este es un solo broker auto-hospedado al que cualquier número de proyectos internos (CRMs, agentes, flujos de automatización) puede hablar. Cada proyecto tiene su propio token; algunos proyectos pueden leer respuestas, otros solo enviar. El dashboard monitorea todo en un solo lugar.",
    outcomes: [
      "Reemplaza un costoso BSP de WhatsApp por agente con un solo gateway compartido auto-hospedado.",
      "Multi-tenant por diseño — cada agente tiene credenciales con scope y su propio grafo de sesión.",
      "Los mensajes entrantes se entregan exactly-once vía patrón unread-poll.",
      "Alimenta agentes río abajo como yantissimo-crm y kiosko-logistics.",
    ],
  },
  technical: {
    headline:
      "Broker de mensajes multi-tenant con scope por token y lectura exactly-once.",
    summary:
      "Workspace pnpm de dos servicios: un server Express que habla WhatsApp vía Baileys y persiste todo a Neon Postgres, y un dashboard Next.js 15 que consume la propia API REST del gateway. La autenticación es de tres-headers: master token, project token, project name.",
    architecture:
      "Server Express + Baileys con rate-limiting (1 envío/seg). Las sesiones se auto-crean por teléfono+proyecto; envíos subsecuentes reutilizan la sesión salvo que explícitamente se fuerce una fresca. El endpoint /messages/session/:id/unread marca como leído en la misma llamada — garantizando entrega exactly-once a agentes suscritos. El SSL se auto-detecta basándose en el host Postgres (Railway interno vs proxy TCP público). La sesión Baileys persistida vive en un volumen Railway para reconexión tras reinicio.",
    highlights: [
      "Server Express + SDK Baileys de WhatsApp + Neon Postgres + dashboard Next.js 15.",
      "Auth de tres headers: X-Master-Token + X-Project-Token + X-Project-Name.",
      "Flag --store-replies en registro controla si un proyecto recibe entrantes.",
      "Endpoint unread-poll cambia el estado de lectura en la misma llamada — entrega exactly-once.",
      "Auto-detección de SSL según host (Railway interno vs proxy TCP público).",
      "Desplegado en producción en Railway con volumen persistido para recuperación de sesión Baileys.",
      "API REST de primera clase diseñada para agentes internos (curl-friendly).",
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
    "Infraestructura de Mensajería",
    "API Multi-tenant",
    "Entrega Exactly-Once",
    "Gestión de Sesiones",
    "Auto-Hospedado",
  ],
  domain: "Infraestructura de Mensajería",
  users: "Agentes internos y sistemas CRM en toda la organización.",
  hero: "/images/projects/wagateway.jpg",
  repoPath: "Web/whatsapp-gateway",
};

export const overtree: Project = {
  id: "overtree",
  slug: "overtree",
  name: "Overtree",
  tagline:
    "Editor LaTeX local-first con colaboración LAN, servidor MCP y compilador Tectonic — Overleaf, pero todo vive en tu máquina.",
  tier: 2,
  category: "web",
  status: "active",
  year: 2026,
  recencyLabel: "May 2026",
  icon: "OT",
  accent: "orange",
  scaleSignal: "Next.js 16 · Yjs CRDTs · servidor MCP · subprocess Tectonic",
  executive: {
    headline: "Overleaf, pero local-first y AI-native.",
    summary:
      "Overtree es un editor LaTeX que corre en tu laptop. Los archivos son carpetas reales que puedes commitear a git, respaldar o copiar. Cualquiera en tu red se une por URL. Y — lo más distintivo — Claude Desktop, ChatGPT Desktop y Claude Code se pueden conectar directamente vía MCP para leer, editar y compilar tus proyectos, con edits apareciendo en vivo en el editor.",
    outcomes: [
      "Reemplaza Overleaf para usuarios que quieren propiedad local-first de sus archivos.",
      "Colaboración multicursor en tiempo real en una LAN — sin cloud, sin tarifa por usuario.",
      "Clientes IA pueden editar tu LaTeX directamente vía MCP — los edits aterrizan en vivo en los navegadores conectados.",
      "Vista previa de PDF impulsada por Tectonic, el motor LaTeX moderno auto-contenido.",
    ],
  },
  technical: {
    headline:
      "Colaboración CRDT con Yjs + servidor MCP con tres transports + subprocess Tectonic.",
    summary:
      "App Next.js 16 App Router con un server custom que hospeda tanto el protocolo WebSocket de sync de Yjs como el servidor MCP. CodeMirror 6 con sintaxis stex (LaTeX). Iron-session para auth. Tres transports MCP corren simultáneamente: stdio para Claude Desktop y Claude Code, HTTP/SSE para ChatGPT Desktop y Node.js directo para herramientas in-process.",
    architecture:
      "Frontend Next.js 16 + React 19 + CodeMirror 6 ligado a un documento Yjs vía y-codemirror.next. Handler del protocolo WebSocket Yjs server-side (y-websocket) más un file watcher chokidar que refleja cambios en disco de vuelta al CRDT compartido — significando que los edits de IA se propagan instantáneamente a los editores conectados. El servidor MCP expone 12 herramientas: list_projects, create_project, delete_project, list_files, read_file, write_file, edit_file, delete_file, compile, get_compile_log, get_pdf, get_project_info, list_templates. Tectonic invocado vía subprocess; PDFs renderizados con pdf.js.",
    highlights: [
      "CRDTs Yjs con sync WebSocket (y-codemirror.next + y-websocket + y-protocols).",
      "Servidor MCP con 12 herramientas, tres transports simultáneos (stdio, HTTP/SSE, in-process).",
      "File watcher Chokidar sincroniza disco → CRDT → editores conectados.",
      "Motor LaTeX Tectonic invocado vía subprocess; pdf.js para vista previa de PDF en navegador.",
      "Auth Iron-session con nombre + password por proyecto.",
      "LAN-friendly: imprime la IP local al arrancar; guía de firewall documentada.",
      "Plantillas: article, beamer, report, letter, ieee, blank.",
      "Wrapper Electron para escritorio compila vía electron-builder para distribución macOS.",
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
    "Edición Colaborativa (CRDTs)",
    "Local-First",
    "Servidor MCP",
    "Compilación LaTeX",
    "AI-Native",
    "App de Escritorio",
  ],
  domain: "Herramientas para Devs / Escritura",
  users: "Investigadores, estudiantes y escritores que quieren LaTeX local con IA.",
  hero: "/images/projects/overtree-logo.png",
  repoPath: "Web/overtree",
};

export const swipeFotos: Project = {
  id: "swipe-fotos",
  slug: "swipe-fotos",
  name: "Swipe Fotos",
  tagline:
    "Organizador de biblioteca de fotos con UI de swipe-deck, agrupación por mes y seguimiento persistente de progreso.",
  tier: 3,
  category: "swift",
  status: "active",
  year: 2026,
  recencyLabel: "May 2026",
  icon: "SF",
  accent: "rose",
  scaleSignal: "18 archivos Swift · ~2k LOC · MVVM + Photos.framework",
  executive: {
    headline:
      "Tinder para tu rollo de cámara — limpia años de fotos, rápido.",
    summary:
      "Swipe Fotos te permite organizar tu biblioteca de fotos haciendo swipe mes por mes. El progreso se guarda, así puedes pausar y reanudar. La UI es intencionalmente mínima — una foto a la vez, dos gestos, nada más.",
    outcomes: [
      "Decide miles de fotos rápidamente con dos gestos.",
      "Continúa donde lo dejaste — el progreso por-mes se persiste.",
      "Navega por álbum o por bucket de mes.",
    ],
  },
  technical: {
    headline:
      "MVVM limpio + Photos.framework + un componente custom de gesto swipe-deck.",
    summary:
      "MVVM SwiftUI ligero. PhotoLibraryService envuelve enumeración PHAsset + permisos. ProgressStore persiste decisiones por-mes a Application Support. Tres view models (SwipeDeck, AlbumList, MonthBrowser) mantienen responsabilidades acotadas.",
    architecture:
      "PermissionView restringe el resto de la app a la autorización Photos.framework. SwipeDeckView es un stack de tarjetas custom impulsado por gestos. La agrupación por mes usa un modelo MonthBrowser + MonthBucket separado para que la UI no pelee con el modelo de datos.",
    highlights: [
      "Integración Photos.framework con gating de permisos.",
      "SwipeDeckView custom con estado de gestos y feel físico del deck.",
      "ProgressStore serializa decisiones por-mes a Application Support.",
      "Split MVVM ligero: 5 vistas · 4 view models · 4 modelos · 2 servicios.",
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
    "Organización de Biblioteca de Fotos",
    "UI por Gestos",
    "Persistencia de Progreso",
  ],
  domain: "Productividad Personal",
  users: "Cualquiera con demasiadas fotos.",
  hero: "/images/projects/swipefotos.jpg",
  repoPath: "Swift/swipe-fotos",
};

export const karate: Project = {
  id: "karate",
  slug: "karate",
  name: "Torneo de Karate",
  tagline:
    "Sistema de scoring distribuible role-aware para torneos: web Next.js + server Express + escritorio Electron, binario único.",
  tier: 3,
  category: "web",
  status: "active",
  year: 2026,
  recencyLabel: "May 2026",
  icon: "KT",
  accent: "yellow",
  scaleSignal:
    "Monorepo Turbo · 3 apps + 1 paquete core · ~10k archivos · 17k LOC",
  executive: {
    headline:
      "Una plataforma de torneo offline completa que se distribuye como binario único.",
    summary:
      "Corre un torneo de karate sin cuenta cloud. Los superadmins configuran categorías, competidores, áreas y seeding desde una sola pantalla. Los árbitros entran con su área asignada y empiezan a scorear. El scoreboard de audiencia se actualiza en vivo en una ventana separada. Todo funciona offline, en una laptop, en un gimnasio sin WiFi.",
    outcomes: [
      "Una instalación por laptop corre el torneo entero — sin cloud requerido.",
      "Tres roles (superadmin / árbitro / audiencia) con controles de acceso apropiados.",
      "Áreas auto-distribuidas por un bin-packer balanceado que el superadmin puede sobrescribir.",
      "Display de audiencia anónimo y listo para pantalla completa.",
    ],
  },
  technical: {
    headline:
      "Monorepo Turbo con core de lógica pura, auth JWT RS256 y wrapper Electron.",
    summary:
      "Tres apps + un paquete core compartido. El core es lógica pura (sin React, sin DOM) para ser reutilizable. El server es Express con JWT firmado RS256 desde un keypair generado en primer arranque. El wrapper Electron levanta el server in-process en un puerto localhost aleatorio y sirve el export estático Next.js desde el mismo origen.",
    architecture:
      "Monorepo Turbo. apps/web (Next.js 15 App Router + Tailwind), apps/server (Express + JWT RS256 + bcrypt + panel admin), apps/desktop (wrapper Electron + electron-builder). packages/core tiene lógica de dominio tipada (seeding de brackets, distribución de áreas, desempates). Los tokens se renuevan silenciosamente tras 20h de un TTL de 24h. El estado entre ventanas se sincroniza vía BroadcastChannel + localStorage. Datos + llaves RSA + log de actividad persisten bajo ~/.karate-tournament/.",
    highlights: [
      "Monorepo Turbo con paquete compartido de lógica pura (sin dependencias DOM).",
      "JWT RS256 con keypair generado en primer arranque.",
      "Bin-packer greedy distribuye subcategorías a través de áreas de competencia.",
      "Wrapper Electron empaqueta server in-process; sirve Next.js estático desde mismo origen.",
      "BroadcastChannel + localStorage sync entre ventanas admin / privada / pública.",
      "Log de actividad: intentos de login, renovaciones, mutaciones de usuario, IPs.",
      "Compila instaladores .dmg / .exe (NSIS) / .AppImage.",
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
    "App de Escritorio Offline",
    "Control de Acceso por Rol",
    "Lógica de Dominio de Torneo",
    "Distribución Multi-Plataforma",
  ],
  domain: "Gestión de Torneos Deportivos",
  users: "Organizadores de torneo, árbitros y displays de audiencia.",
  hero: "/images/projects/karate.jpg",
  repoPath: "Web/karate",
};

export const smokeSignals: Project = {
  id: "smoke-signals",
  slug: "smoke-signals",
  name: "Smoke Signals",
  tagline:
    "Cliente de chat iOS encriptado de extremo a extremo basado en el protocolo Signal — LibSignal, Network.framework, Keychain, APNs.",
  tier: 3,
  category: "swift",
  status: "prototype",
  year: 2025,
  recencyLabel: "Jun 2025",
  icon: "SS",
  accent: "indigo",
  scaleSignal: "127 archivos Swift · 12.8k LOC · LibSignal + signal-protocol-c",
  executive: {
    headline:
      "Chat encriptado de extremo a extremo hecho bien — protocolo Signal, Network.framework, Keychain.",
    summary:
      "Smoke Signals es un cliente iOS de chat construido sobre el mismo protocolo que usa Signal Messenger. Los mensajes se encriptan en tu dispositivo y se desencriptan en el del destinatario — nunca legibles por ningún servidor. Todo el stack de red está construido sobre el propio Network.framework de Apple con WebSocket; las claves de identidad viven en el Keychain.",
    outcomes: [
      "Encriptación de extremo a extremo real — el servidor nunca tiene texto plano.",
      "Red nativa de Apple (Network.framework + NWConnection) — sin librerías WebSocket de terceros.",
      "Material de identidad respaldado por Keychain y nunca sale del dispositivo.",
    ],
  },
  technical: {
    headline:
      "Protocolo Signal sobre un WebSocket Network.framework, con publishers Combine y APNs.",
    summary:
      "LibSignalClient v0.75 + un submódulo git de signal-protocol-c. El singleton SignalClient envuelve setup de sesión, encrypt y decrypt. ChatViewModel orquesta el loop de recepción y la cola de mensajes. WebSocketClient gestiona el lifecycle NWConnection, headers de auth con token y poll async de recepción. PushManager maneja registro de dispositivo con APNs.",
    architecture:
      "Integración C FFI para signal-protocol-c (proyecto más grande del portafolio por conteo de archivos y complejidad). Network.framework vía WebSocketClient custom (NWConnection + publishers Combine). Identidad, prekeys y estado de sesión persistidos en Keychain. UI tests + unit tests presentes.",
    highlights: [
      "LibSignalClient v0.75 + submódulo git signal-protocol-c (C FFI).",
      "Cliente WebSocket custom construido sobre NWConnection + Combine.",
      "Identidad, prekeys y estado de sesión respaldados por Keychain.",
      "Registro de dispositivo APNs vía PushManager.",
      "MVVM con ChatViewModel orquestando setup de sesión, envío y recepción.",
      "Cobertura completa de UI + unit tests scaffolded.",
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
    "Encriptación de Extremo a Extremo",
    "Protocolo Signal",
    "WebSocket en Tiempo Real",
    "Push Notifications",
    "Gestión Criptográfica de Claves",
  ],
  domain: "Comunicaciones Seguras",
  users:
    "Usuarios enfocados en privacidad; implementación de referencia para chat seguro.",
  hero: "/images/projects/smoke-signals-icon.svg",
  repoPath: "Swift/Smoke Singals",
};

export const tier1: Project[] = [yantissimo];
export const tier2: Project[] = [
  fitnessCopilot,
  kioskoLogistics,
  companyBrain,
  overtree,
];
export const tier3: Project[] = [
  crispDm,
  whatsappGateway,
  swipeFotos,
  karate,
  smokeSignals,
];

export const featuredProjects: Project[] = [...tier1, ...tier2, ...tier3];

export const tier4: Tier4Project[] = [
  {
    id: "agent-yssm",
    name: "Nexora Agent",
    category: "ai",
    icon: "AY",
    description:
      "Agente de ventas IA multicanal — Telegram + WhatsApp, tool calling de OpenAI, recordatorios programados.",
    stack: ["Node.js", "OpenAI", "PostgreSQL", "Telegram", "Twilio"],
    year: 2026,
  },
  {
    id: "agente-dist-yssm",
    name: "Nexora Distribución",
    category: "ai",
    icon: "AD",
    description:
      "Variante de canal mayorista de Nexora — órdenes en bulk, precios por nivel, workflows B2B.",
    stack: ["Node.js", "OpenAI", "PostgreSQL"],
    year: 2025,
  },
  {
    id: "scrapper-yssm",
    name: "YSSM Scraper",
    category: "automation",
    icon: "SC",
    description:
      "ETL de inteligencia competitiva — scrapers Puppeteer + Cheerio alimentando pipelines de precios.",
    stack: ["Node.js", "Puppeteer", "Cheerio", "p-limit", "PostgreSQL"],
    year: 2025,
  },
  {
    id: "mati-data",
    name: "Mati Data",
    category: "web",
    icon: "MD",
    description:
      "Ingesta de datos tabulares + visualización — pipeline CSV/Excel con worker threads (Comlink).",
    stack: ["Next.js 16", "React 19", "Papa Parse", "Recharts", "Comlink"],
    year: 2026,
  },
  {
    id: "agente-proveedores",
    name: "Agente de Proveedores",
    category: "ai",
    icon: "AP",
    description:
      "Agente de proveedores full-stack type-safe — tRPC + Supabase + ingesta WhatsApp.",
    stack: ["Next.js", "tRPC", "Supabase", "Baileys", "OpenAI", "Zod"],
    year: 2026,
  },
  {
    id: "onedrive-retriever",
    name: "OneDrive Retriever",
    category: "ai",
    icon: "OD",
    description:
      "Agente de WhatsApp que trae contexto de OneDrive / Google Drive bajo demanda.",
    stack: ["Node.js", "Baileys", "OpenAI", "Google Auth"],
    year: 2026,
  },
  {
    id: "restaurant-waster",
    name: "Restaurant Waster",
    category: "experimental",
    icon: "RW",
    description:
      "Scaffold monorepo (pnpm + Vitest + Prisma) para una app de herramientas de restaurante.",
    stack: ["pnpm Workspaces", "TypeScript", "Vitest", "Prisma"],
    year: 2026,
  },
  {
    id: "mootie",
    name: "Mootie POS",
    category: "web",
    icon: "MO",
    description:
      "Punto de venta para cafetería — workspaces (server / client / shared).",
    stack: ["Node.js Workspaces", "TypeScript"],
    year: 2026,
  },
  {
    id: "plick-clone",
    name: "Clon de Plick",
    category: "web",
    icon: "PL",
    description:
      "Monorepo Turbo de dos apps — frontends de menú + admin compartiendo un paquete workspace.",
    stack: ["Next.js 15", "React 19", "Tailwind 4", "Turbo"],
    year: 2026,
  },
  {
    id: "pagares",
    name: "Pagarés",
    category: "web",
    icon: "PG",
    description: "App web de gestión de pagarés.",
    stack: ["Next.js", "TypeScript"],
    year: 2026,
  },
  {
    id: "padelon",
    name: "Padelón",
    category: "web",
    icon: "PD",
    description: "Sitio estático tipo evento/landing con estructura multipágina.",
    stack: ["HTML5", "CSS"],
    year: 2026,
  },
  {
    id: "batch",
    name: "Batch",
    category: "experimental",
    icon: "BA",
    description: "Scaffold de utilidad de procesamiento batch.",
    stack: ["Node.js"],
    year: 2025,
  },
  {
    id: "intercambio",
    name: "Intercambio",
    category: "experimental",
    icon: "IN",
    description: "Prototipo de intercambio / trueque.",
    stack: ["Web"],
    year: 2025,
  },
  {
    id: "cotizador-nexora",
    name: "Cotizador Nexora",
    category: "web",
    icon: "CN",
    description: "UI constructora de cotizaciones para el pipeline de ventas Nexora.",
    stack: ["Web"],
    year: 2025,
  },
  {
    id: "eigenvalues",
    name: "Eigenvalores",
    category: "experimental",
    icon: "EV",
    description: "Experimento de álgebra lineal / numérico.",
    stack: ["Web"],
    year: 2025,
  },
  {
    id: "food-healer",
    name: "Food Healer",
    category: "web",
    icon: "FH",
    description: "Prototipo de recomendación de alimentos / nutrición.",
    stack: ["Web"],
    year: 2025,
  },
  {
    id: "investigacion-interface",
    name: "Interfaz de Investigación",
    category: "experimental",
    icon: "II",
    description: "Prototipo de interfaz de investigación para un estudio UX.",
    stack: ["Web"],
    year: 2025,
  },
  {
    id: "nextjs-dashboard",
    name: "Next.js Dashboard",
    category: "web",
    icon: "ND",
    description: "Referencia de dashboard administrativo.",
    stack: ["Next.js"],
    year: 2025,
  },
  {
    id: "termo-sapiens",
    name: "Termo Sapiens",
    category: "experimental",
    icon: "TS",
    description: "Herramienta de termodinámica / educativa.",
    stack: ["Web"],
    year: 2025,
  },
  {
    id: "microsip",
    name: "Microsip Sync",
    category: "automation",
    icon: "MS",
    description: "Puente entre el ERP Microsip y sistemas río abajo.",
    stack: ["Node.js"],
    year: 2025,
  },
  {
    id: "agro-commerce",
    name: "AFFIN Agro",
    category: "swift",
    icon: "AC",
    description:
      "Prototipo iOS B2C de recompensas / lealtad agrícola con hooks de Firebase.",
    stack: ["SwiftUI", "Firebase"],
    year: 2025,
  },
  {
    id: "nutrigen",
    name: "NutriGen",
    category: "swift",
    icon: "NG",
    description: "Prototipo iOS de tracker nutricional con UI de cotizaciones/agente.",
    stack: ["SwiftUI", "Keychain"],
    year: 2025,
  },
  {
    id: "altozano",
    name: "Altozano",
    category: "swift",
    icon: "AL",
    description:
      "App SwiftUI con auth con estado global y credenciales en Keychain.",
    stack: ["SwiftUI", "Keychain"],
    year: 2025,
  },
  {
    id: "delitec",
    name: "Delitec",
    category: "swift",
    icon: "DL",
    description: "Prototipo iOS de delivery de comida / órdenes de restaurante.",
    stack: ["SwiftUI", "MVVM"],
    year: 2025,
  },
  {
    id: "base-ai-agent",
    name: "Base AI Agent",
    category: "ai",
    icon: "BA",
    description:
      "Scaffold base de agente de ventas multicanal — Telegram + Twilio + Postgres.",
    stack: ["Node.js", "OpenAI", "Telegram", "Twilio"],
    year: 2026,
  },
  {
    id: "executive-agent-tree",
    name: "Agente Ejecutivo YARVIS",
    category: "ai",
    icon: "EA",
    description:
      "Asistente ejecutivo — Google Calendar + Gmail + Contactos + Twilio.",
    stack: ["Node.js", "OpenAI", "Google APIs", "Telegram"],
    year: 2025,
  },
  {
    id: "test-agent",
    name: "Agente de Pruebas",
    category: "ai",
    icon: "TA",
    description:
      "Agente multi-tool con Perplexity, Gmail, WhatsApp y APIs de inventario.",
    stack: ["Node.js", "OpenAI", "Perplexity", "Baileys", "Google APIs"],
    year: 2025,
  },
  {
    id: "laptop-suport",
    name: "Bot de Soporte para Laptops",
    category: "automation",
    icon: "LS",
    description: "Flujo de soporte por WhatsApp construido sobre bot-whatsapp / Baileys.",
    stack: ["Node.js", "Baileys", "bot-whatsapp"],
    year: 2026,
  },
];

export const categoryLabels: Record<Category, string> = {
  enterprise: "Experiencia Empresarial Real",
  ai: "Ingeniería de IA",
  web: "Ingeniería Web",
  swift: "Swift / Ecosistema Apple",
  automation: "Automatización e Infraestructura",
  experimental: "Experimental e I+D",
};
