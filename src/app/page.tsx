import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { BrandStrip } from "@/components/brand-strip";
import { About } from "@/components/about";
import { Services } from "@/components/services";
import { Process } from "@/components/process";
import { SkillsMatrix } from "@/components/skills-matrix";
import { Experience } from "@/components/experience";
import { YantissimoCaseStudy } from "@/components/yantissimo-case-study";
import { FeaturedGrid } from "@/components/featured-grid";
import { Tier4Carousel } from "@/components/tier4-carousel";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { featuredProjects, tier4 } from "@/data/projects";

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

// Composition for both views. Each section internally hides itself in the
// wrong mode via .only-executive / .only-technical, so we render the union
// — same HTML for SEO/LLMs — and let CSS swap visibility.
//
// Pro view sequence    : Hero · Brands · Services · Process · About · Yantissimo · Projects · More · Contact
// Tech view sequence   : Hero · Brands · Tech Stack · Experience · About · Yantissimo · Projects · More · Contact
//
// We render Services + Process (Pro-only) and Tech Stack + Experience
// (Tech-only) in the order they should APPEAR for their respective viewer.
// In the DOM, Services/Process come before Tech Stack/Experience; this
// matches the Pro flow naturally and the Tech-only blocks just slot in.
export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <BrandStrip />
        <About />
        {/* § 02 — Services (Pro) / Tech Stack (Tech) */}
        <Services />
        <SkillsMatrix />
        {/* § 03 — Process (Pro) / Experience (Tech) */}
        <Process />
        <Experience />
        <YantissimoCaseStudy />
        <FeaturedGrid />
        <Tier4Carousel />
        <Contact />
      </main>
      <Footer />
      <CollectionSchema />
    </>
  );
}
