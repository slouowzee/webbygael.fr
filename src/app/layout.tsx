import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import Script from "next/script";
import { site } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const title = `Développeur web freelance à ${site.city} | ${site.name}`;
const description = `Développeur web freelance à ${site.city} (${site.department}). Sites internet, boutiques en ligne, applications et outils sur mesure pour particuliers, artisans et PME.`;

const UMAMI_SRC = process.env.UMAMI_SCRIPT_URL, UMAMI_ID = process.env.UMAMI_WEBSITE_ID;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s | ${site.name}` },
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "fr_FR", url: "/", siteName: site.name, title, description },
  twitter: { card: "summary_large_image", title, description },
  robots: { "max-image-preview": "large" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FCFBFD" },
    { media: "(prefers-color-scheme: dark)", color: "#1C1727" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={archivo.variable}>
      <body>
        {children}
        {UMAMI_SRC && UMAMI_ID && <Script src={UMAMI_SRC} data-website-id={UMAMI_ID} data-domains={new URL(site.url).hostname} />}
      </body>
    </html>
  );
}
