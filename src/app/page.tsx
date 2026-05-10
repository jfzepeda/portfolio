import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { CapabilityPillars } from "@/components/capability-pillars";
import { TechMarquee } from "@/components/tech-marquee";
import { YantissimoCaseStudy } from "@/components/yantissimo-case-study";
import { FeaturedGrid } from "@/components/featured-grid";
import { Tier4Carousel } from "@/components/tier4-carousel";
import { SkillsMatrix } from "@/components/skills-matrix";
import { About } from "@/components/about";
import { Footer } from "@/components/footer";
import { featuredProjects, tier4 } from "@/data/projects";

// Schema.org collection (machine-readable summary of the whole portfolio)
function CollectionSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Juan Felipe Zepeda — Portfolio",
    hasPart: [
      ...featuredProjects.map((p) => ({
        "@type": "CreativeWork",
        name: p.name,
        description: p.tagline,
        about: p.domain,
        keywords: [...p.stack, ...p.capabilities].join(", "),
        creator: { "@type": "Person", name: "Juan Felipe Zepeda" },
        dateCreated: String(p.year),
      })),
      ...tier4.map((p) => ({
        "@type": "CreativeWork",
        name: p.name,
        description: p.description,
        keywords: (p.stack ?? []).join(", "),
        creator: { "@type": "Person", name: "Juan Felipe Zepeda" },
        dateCreated: p.year ? String(p.year) : undefined,
      })),
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <CapabilityPillars />
        <YantissimoCaseStudy />
        <TechMarquee />
        <FeaturedGrid />
        <Tier4Carousel />
        <SkillsMatrix />
        <About />
      </main>
      <Footer />
      <CollectionSchema />
    </>
  );
}
