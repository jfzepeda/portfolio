import type { Metadata, Viewport } from "next";
import { ModeScript } from "@/components/mode-script";
import { profile } from "@/data/profile";
import "./globals.css";

const title = `${profile.name} — ${profile.role}`;
const description = profile.pitch;
const url = "https://juanfe.dev";

export const metadata: Metadata = {
  title: {
    default: title,
    template: `%s — ${profile.name}`,
  },
  description,
  applicationName: "Juan Felipe Zepeda — Portfolio",
  authors: [{ name: profile.name, url }],
  keywords: [
    "AI engineer",
    "product engineer",
    "Next.js",
    "Swift",
    "SwiftUI",
    "Anthropic Claude",
    "OpenAI",
    "MCP",
    "Yjs",
    "iOS engineer",
    "full-stack engineer",
    "Mexico engineer",
    "Yantissimo",
    "DataKnife",
    "Overtree",
  ],
  openGraph: {
    title,
    description,
    url,
    siteName: profile.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: url,
  },
  metadataBase: new URL(url),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
  ],
};

const FONTS_LINKS = (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossOrigin="anonymous"
    />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=JetBrains+Mono:wght@400;500&display=swap"
    />
  </>
);

const SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url,
  email: profile.email,
  jobTitle: profile.role,
  description: profile.pitch,
  knowsAbout: [
    "AI Engineering",
    "Product Engineering",
    "iOS Development",
    "Full-Stack Web Development",
    "Real-Time Systems",
    "RAG",
    "Function Calling",
    "Model Context Protocol",
    "Next.js",
    "SwiftUI",
    "Node.js",
    "PostgreSQL",
    "OpenAI",
    "Anthropic Claude",
  ],
  address: {
    "@type": "PostalAddress",
    addressCountry: "Mexico",
  },
  sameAs: [profile.social.github, profile.social.linkedin].filter(Boolean),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {FONTS_LINKS}
        <ModeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
        />
        <link rel="alternate" type="text/markdown" title="LLM-friendly summary" href="/llms.txt" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>
        <a href="#top" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
