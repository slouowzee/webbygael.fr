# webbygael.fr

Site vitrine de **Le web by Gaël**, développeur web freelance à La Rochelle.

## Technique

- [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript
- [Tailwind CSS 4](https://tailwindcss.com), plus une feuille de style globale (`src/app/globals.css`)
- [GSAP](https://gsap.com) et ScrollTrigger pour les effets de défilement
- [Three.js](https://threejs.org) pour le ruban 3D
- [Nodemailer](https://nodemailer.com) pour l'envoi du formulaire
- [Bun](https://bun.sh) comme gestionnaire de paquets

## Lancer le site en local

```bash
bun install
bun run dev
```

Le site est alors sur http://localhost:3000. Pour tester le formulaire ou l'agenda, créez un fichier `.env` à la racine avec les variables décrites plus bas.

| Commande | Rôle |
|---|---|
| `bun run dev` | serveur de développement |
| `bun run build` | construction du site |
| `bun run start` | site construit, en production |
| `bun run lint` | vérification du code |
| `bun test src` | tests des règles du formulaire |

## Configuration

| Variable | Rôle |
|---|---|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | compte qui envoie les messages du formulaire |
| `CONTACT_TO` | adresse qui les reçoit |
| `CAL_USERNAME`, `CAL_EVENT_SLUG` | lien de réservation public Cal.com (`cal.com/NOM/TYPE`) |
| `UMAMI_SCRIPT_URL`, `UMAMI_WEBSITE_ID` | mesure d'audience Umami, facultative |

## Docker

```bash
docker build --build-arg UMAMI_SCRIPT_URL=... --build-arg UMAMI_WEBSITE_ID=... -t webbygael .
docker run -p 3000:3000 --env-file .env webbygael
```

Les deux variables Umami sont lues à la construction de l'image. Les autres (SMTP, `CONTACT_TO`, Cal.com) sont lues au démarrage du conteneur. Le serveur tourne sous Node.

## Organisation

```
src/
  app/
    page.tsx            accueil
    [slug]/page.tsx     pages légales
    not-found.tsx       page 404
    actions.ts          envoi du formulaire, créneaux et réservation
    layout.tsx          polices, titre, description
    sitemap.ts, robots.ts
  components/           une section par fichier, ruban, agenda, formulaire
  content/              textes des services, de la méthode, des projets
  content/legal/        mentions légales, confidentialité, CGV (Markdown)
  lib/                  coordonnées du site, règles du formulaire, API Cal.com
```

## Modifier le contenu

- **Ville, email, SIRET, réseaux** : `src/lib/site.ts`.
- **Services, étapes de la méthode, projets** : `src/content/`.
- **Témoignages** : `src/content/testimonials.ts`. La section n'apparaît sur le site que s'il y en a au moins un.
- **Pages légales** : les fichiers Markdown de `src/content/legal/`.

## Licence

Code, textes et visuels : tous droits réservés, Gaël Pilet.
