import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { marked } from "marked";
import { Footer } from "@/components/Footer";
import { LegalEffects } from "@/components/LegalEffects";
import { Ribbon } from "@/components/Ribbon";
import { LEGAL_SLUGS } from "@/content/legal";
import { site } from "@/lib/site";

const SHARE_IMAGE = "/opengraph-image.png";

export const dynamicParams = false;
export const generateStaticParams = () => LEGAL_SLUGS.map(slug => ({ slug }));

function load(slug: string) {
  const md = readFileSync(path.join(process.cwd(), "src/content/legal", `${slug}.md`), "utf8");
  const [first, ...rest] = md.split("\n");
  return { title: first.replace(/^#\s*/, ""), html: marked.parse(rest.join("\n"), { async: false, breaks: true }) };
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { title } = load(slug);
  const description = `${title} du site ${site.name}, développeur web freelance à ${site.city}.`;
  return {
    title,
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: { type: "article", locale: "fr_FR", url: `/${slug}`, siteName: site.name, title, description, images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE] },
  };
}

export default async function LegalPage({ params }: PageProps<"/[slug]">) {
  const { title, html } = load((await params).slug);
  return (
    <div>
      <Ribbon />

      <header className="top">
        <div className="wrap">
          <Link className="brand" href="/">{site.name}</Link>
        </div>
      </header>

      <div className="legal-end">
        <main id="top" className="legal wrap">
          <h1 className="d">{title}</h1>
          <div className="legal-body">
            <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
            <div className="slot svc-slot" data-slot data-rx=".95" data-rz=".25" />
          </div>
        </main>

        <Footer />
      </div>

      <LegalEffects />
    </div>
  );
}
