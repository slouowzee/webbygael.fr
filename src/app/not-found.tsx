import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Ribbon } from "@/components/Ribbon";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Page introuvable" };

const WORDS = ["404", "PERDU"];

export default function NotFound() {
  return (
    <div>
      <Ribbon words={WORDS} />

      <header className="top">
        <div className="wrap"><Link className="brand" href="/">{site.name}</Link></div>
      </header>

      <main id="top">
        <section className="hero wrap">
          <h1 className="d">
            <span className="line"><span>Cette page</span></span>
            <span className="line"><span>est introuvable.</span></span>
          </h1>
          <div className="hero-foot">
            <p className="soft">L&apos;adresse est fausse, ou la page a été déplacée. Le reste du site, lui, est toujours là.</p>
            <div className="cta-row">
              <Link className="btn btn--solid" href="/">Retour à l&apos;accueil</Link>
            </div>
          </div>
          <div className="slot" data-slot data-rx=".62" data-rz="-.32" data-k="1.12" />
        </section>
      </main>

      <Footer />
    </div>
  );
}
