import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Method } from "@/components/Method";
import { Projects } from "@/components/Projects";
import { Ribbon } from "@/components/Ribbon";
import { ScrollEffects } from "@/components/ScrollEffects";
import { Services } from "@/components/Services";
import { Testimonials } from "@/components/Testimonials";
import { services } from "@/content/services";
import { site } from "@/lib/site";

const websiteLd = { "@context": "https://schema.org", "@type": "WebSite", name: site.name, url: site.url };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  url: site.url,
  image: `${site.url}/opengraph-image.png`,
  logo: `${site.url}/apple-icon.png`,
  description: `Développeur web freelance à ${site.city} : sites internet, boutiques en ligne, applications et outils sur mesure.`,
  email: site.email,
  founder: { "@type": "Person", name: site.owner, jobTitle: "Développeur web freelance" },
  address: { "@type": "PostalAddress", addressLocality: site.city, postalCode: site.postalCode, addressRegion: site.department, addressCountry: "FR" },
  areaServed: { "@type": "Country", name: "France" },
  sameAs: [site.linkedin, site.github],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services",
    itemListElement: services.map(s => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.label, description: s.desc } })),
  },
};

export default function Home() {
  return (
    <div>
      <Ribbon />

      <header className="top">
        <div className="wrap"><a className="brand" href="#top">{site.name}</a></div>
      </header>
      <a className="btn btn--solid btn--sm pill is-off" id="pill" href="#contact" data-umami-event="clic-reserver-flottant">Réserver une visio</a>

      <main id="top">
        <Hero />
        <Services />
        <Projects />
        <Method />
        <About />
        <Testimonials />
      </main>

      <div className="finale">
        <Contact />
        <Footer />
      </div>

      <ScrollEffects />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([websiteLd, jsonLd]).replace(/</g, "\\u003c") }} />
    </div>
  );
}
