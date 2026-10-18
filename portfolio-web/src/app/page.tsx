import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Work } from "@/components/work";
import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Spotlight } from "@/components/spotlight";
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

// Four full-viewport screens (400svh): Hero · Work · About · Contact.
// Executive/Technical copy is rendered for both modes in the HTML; CSS
// (.only-executive / .only-technical) swaps visibility, so crawlers see it all.
export default function HomePage() {
  return (
    <>
      <div className="bg-orbs" aria-hidden>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <Nav />
      <main>
        <Hero />
        <Work />
        <About />
        <Contact />
      </main>
      <Spotlight />
      <CollectionSchema />
    </>
  );
}
