import { locales } from "@/content/portfolio";

const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

export const siteUrl = new URL(
  process.env.SITE_URL ?? (vercelHost ? `https://${vercelHost}` : "http://localhost:3000"),
);

export const isPreview = process.env.VERCEL_ENV === "preview";

export const languageUrls = {
  ...Object.fromEntries(locales.map((locale) => [locale, new URL(`/${locale}`, siteUrl).href])),
  "x-default": new URL("/en", siteUrl).href,
};
