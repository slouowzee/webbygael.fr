import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="hero wrap">
      <h1 className="d">
        <span className="line"><span>Votre site</span></span>
        <span className="line"><span>travaille pour vous.</span></span>
      </h1>
      <div className="hero-foot">
        <p className="soft">Vous avez un métier et des clients à convaincre. Je suis développeur web freelance à {site.city}, et je construis le site ou l&apos;appli sur mesure qui va avec.</p>
        <div className="cta-row">
          <a className="btn btn--solid" href="#contact" data-umami-event="clic-reserver-hero">Réserver une visio</a>
          <a className="btn btn--ghost" href="#projets">Voir les projets</a>
        </div>
      </div>
      <div className="slot" data-slot data-rx=".62" data-rz="-.32" data-k="1.12" />
    </section>
  );
}
