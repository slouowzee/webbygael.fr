import { site } from "@/lib/site";

export function About() {
  return (
    <section className="sec wrap" id="apropos">
      <div className="about">
        <div>
          <p className="big">Moi, c&apos;est Gaël, développeur web freelance à {site.city}. Que vous soyez artisan, indépendant ou à la tête d&apos;une PME, vous m&apos;expliquez votre idée, je la construis, et je ne vous lâche pas avant la fin. Du premier appel au dernier détail, c&apos;est à moi que vous parlez.</p>
          <p className="about-note">Basé à {site.city}, en {site.department}. Je travaille à distance partout en France, sur devis.</p>
        </div>
        <div className="slot about-slot" data-slot data-rx="1.25" data-rz="-.2" />
      </div>
    </section>
  );
}
