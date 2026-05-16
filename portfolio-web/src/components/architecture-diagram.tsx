// Tech-mode-only architecture diagram for the Yantissimo platform.
// Pure ASCII box-drawing rendered in JetBrains Mono — no SVG, no canvas.
// Stays crisp at any zoom and renders identically across browsers.

const DIAGRAM = String.raw`
                          ┌──────────────────────────────────┐
                          │           CUSTOMERS               │
                          │   iOS app · Web shoppers · Sales  │
                          └───────────────┬──────────────────┘
                                          │
            ┌───────────────────┬─────────┴─────────┬───────────────────┐
            │                   │                   │                   │
            ▼                   ▼                   ▼                   ▼
   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
   │   YANTISSIMO     │  │   YANTISSIMO     │  │   YSSM ERP       │  │  NEXORA AGENT    │
   │   iOS APP        │  │   STOREFRONT     │  │   (back-office)  │  │  (sales agent)   │
   │                  │  │                  │  │                  │  │                  │
   │ Swift 5.9        │  │ Next.js 15.6     │  │ Next.js 16       │  │ Node.js          │
   │ SwiftUI          │  │ React 19         │  │ App Router       │  │ Telegram + WA    │
   │ APIClient w/     │  │ Server Comps     │  │ MUI · Tailwind   │  │ OpenAI tools     │
   │  401 retry       │  │ Edge middleware  │  │ Socket.io        │  │ Cron reminders   │
   │ Keychain · Cache │  │ Wheel-Size API   │  │ GitHub Actions   │  │                  │
   │ APNs             │  │                  │  │ CI / Vercel      │  │                  │
   └─────────┬────────┘  └─────────┬────────┘  └─────────┬────────┘  └─────────┬────────┘
             │                     │                     │                     │
             └─────────────────────┴──────────┬──────────┴─────────────────────┘
                                              │   HTTPS / JSON / JWT
                                              ▼
                          ┌──────────────────────────────────┐
                          │      EXPRESS API (Node 20)        │
                          │   yssm-backend · 167 files        │
                          │                                  │
                          │   41 routes  ·  middleware stack │
                          │   JWT auth   ·  401 refresh      │
                          │   Job queue  ·  scheduled cron   │
                          │   Jest + Supertest tests         │
                          └────┬──────┬──────┬───────┬──────┘
                               │      │      │       │
       ┌───────────────────────┘      │      │       └──────────────────────────┐
       │                              │      │                                  │
       ▼                              ▼      ▼                                  ▼
┌──────────────┐            ┌──────────────┐  ┌──────────────┐         ┌──────────────┐
│  PostgreSQL  │            │    MySQL     │  │   Shopify    │         │   OpenAI     │
│  (primary)   │            │ (legacy ETL) │  │  Admin + SF  │         │  GPT + tools │
│  pg-format   │            │              │  │   GraphQL    │         │              │
└──────────────┘            └──────────────┘  └──────────────┘         └──────────────┘

┌──────────────┐            ┌──────────────┐  ┌──────────────┐         ┌──────────────┐
│  Backblaze   │            │  Google      │  │   Puppeteer  │         │   APNs       │
│  B2 (media)  │            │  Sheets      │  │   (payment   │         │   (push)     │
│              │            │  bridge      │  │   verify)    │         │              │
└──────────────┘            └──────────────┘  └──────────────┘         └──────────────┘

         Deploy:  Backend → Railway        Storefront / ERP → Vercel
                  iOS → TestFlight         Auth keys → Keychain (iOS) / Postgres (server)
`;

export function ArchitectureDiagram() {
  return (
    <div
      className="only-technical"
      style={{
        marginTop: "clamp(32px, 4vw, 48px)",
        padding: "clamp(24px, 3vw, 36px)",
        background: "var(--paper-3)",
        border: "1px solid var(--rule)",
        borderRadius: 6,
        overflowX: "auto",
        position: "relative",
      }}
      aria-label="Yantissimo platform architecture diagram"
    >
      <div
        className="kicker"
        style={{
          position: "absolute",
          top: 14,
          left: 18,
          color: "var(--accent)",
          fontSize: 10.5,
        }}
      >
        ▣ system topology
      </div>
      <pre
        style={{
          margin: 0,
          marginTop: 24,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          lineHeight: 1.45,
          color: "var(--ink)",
          whiteSpace: "pre",
          letterSpacing: 0,
        }}
      >
        {DIAGRAM}
      </pre>
    </div>
  );
}
