import type { MetadataRoute } from "next";
import { featuredProjects } from "@/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://juanfe.dev";
  const today = new Date().toISOString();

  return [
    { url: base, lastModified: today, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/#yantissimo`,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${base}/#work`,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...featuredProjects.map((p) => ({
      url: `${base}/#${p.slug}`,
      lastModified: today,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${base}/#more`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/#skills`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/#about`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
