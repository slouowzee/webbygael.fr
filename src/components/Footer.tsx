import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer>
      <div className="wrap foot">
        <div className="foot-top">
          <p>Développeur web freelance à {site.city}, en {site.department} ({site.departmentCode}). Sites internet, applications et outils sur mesure, partout en France.</p>
          <nav aria-label="Le site">
            <h3>Le site</h3>
            <ul>
              <li><Link href="/#top">Accueil</Link></li>
              <li><Link href="/#services">Services</Link></li>
              <li><Link href="/#projets">Projets</Link></li>
              <li><Link href="/#methode">Méthode</Link></li>
              <li><Link href="/#apropos">À propos</Link></li>
              <li><Link href="/#contact">Contact</Link></li>
            </ul>
          </nav>
          <nav aria-label="Contact">
            <h3>Contact</h3>
            <ul>
              <li><Link href="/#contact">Réserver une visio</Link></li>
              <li><Link href="/#contact">Envoyer un message</Link></li>
              <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
            </ul>
          </nav>
          <nav aria-label="Réseaux">
            <h3>Réseaux</h3>
            <ul>
              <li><a href={site.linkedin} target="_blank" rel="noopener">LinkedIn <span aria-hidden="true">↗</span></a></li>
              <li><a href={site.github} target="_blank" rel="noopener">GitHub <span aria-hidden="true">↗</span></a></li>
            </ul>
          </nav>
          <nav aria-label="Informations légales">
            <h3>Légal</h3>
            <ul>
              <li><Link href="/mentions-legales">Mentions légales</Link></li>
              <li><Link href="/politique-de-confidentialite">Politique de confidentialité</Link></li>
              <li><Link href="/cgv">Conditions générales de vente</Link></li>
            </ul>
          </nav>
        </div>
        <div className="mark">
          <div className="slot mark-ring" data-slot data-flat data-rx="-1.5708" data-rz="0" data-k="1.14" />
          <span className="d">{site.name}</span>
        </div>
        <div className="foot-end">
          <span>© 2026 {site.name}</span>
          <span>SIRET {site.siret}</span>
          <span>Mesure d&apos;audience sans cookies</span>
          <a href="#top">Haut de page ↑</a>
        </div>
      </div>
    </footer>
  );
}
