import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Alley from "@/components/alley";
import Storefronts from "@/components/scene/storefronts";
import { dictionaries, isLocale, name, role } from "@/content/portfolio";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { description, shareImageAlt } = dictionaries[locale];
  const title = `${name} · ${role}`;
  const host = process.env.SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const image = { url: "/media/alley-social.png", alt: shareImageAlt, width: 1200, height: 630 };

  return {
    metadataBase: new URL(host),
    title,
    description,
    alternates: { canonical: `/${locale}`, languages: { en: "/en", es: "/es", "x-default": "/en" } },
    robots: process.env.VERCEL_ENV === "preview" ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: `/${locale}`,
      locale: locale === "es" ? "es_AR" : "en_US",
      type: "website",
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function PortfolioPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = dictionaries[locale];
  return (
    <Alley key={locale} locale={locale} copy={copy}>
      <Storefronts locale={locale} />
    </Alley>
  );
}
