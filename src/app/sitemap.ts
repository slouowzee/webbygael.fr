import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { LEGAL_SLUGS } from "@/content/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, priority: 1 },
    ...LEGAL_SLUGS.map(slug => ({ url: `${site.url}/${slug}`, priority: 0.2 })),
  ];
}
