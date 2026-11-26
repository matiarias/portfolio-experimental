import type { MetadataRoute } from "next";
import { locales } from "@/content/portfolio";
import { isPreview, languageUrls, siteUrl } from "@/lib/site-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  if (isPreview) return [];

  return locales.map((locale) => ({
    url: new URL(`/${locale}`, siteUrl).href,
    alternates: { languages: languageUrls },
  }));
}
