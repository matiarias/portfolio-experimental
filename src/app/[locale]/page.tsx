import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ChapterPanels from "@/components/chapter-panels";
import Screening from "@/components/screening";
import { dictionaries, isLocale, name, role } from "@/content/portfolio";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { description } = dictionaries[locale];
  const title = `${name} · ${role}`;
  const host = process.env.SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

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
      images: [{ url: "/media/social.png", alt: title, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/media/social.png"] },
  };
}

export default async function PortfolioPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = dictionaries[locale];
  return (
    <Screening key={locale} locale={locale} copy={copy}>
      <ChapterPanels copy={copy} />
    </Screening>
  );
}
