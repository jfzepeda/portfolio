import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://juanfe.dev";
  const today = new Date().toISOString();

  return [
    { url: base, lastModified: today, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/#work`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/#about`, lastModified: today, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/#contact`, lastModified: today, changeFrequency: "monthly", priority: 0.5 },
  ];
}
