import type { MetadataRoute } from "next";
import { isPreview, siteUrl } from "@/lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: isPreview ? undefined : new URL("/sitemap.xml", siteUrl).href,
  };
}
