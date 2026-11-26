import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Alley from "@/components/alley";
import Storefronts from "@/components/scene/storefronts";
import { contacts, dictionaries, isLocale, name, role } from "@/content/portfolio";
import { isPreview, languageUrls, siteUrl } from "@/lib/site-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { description, headline, shareImageAlt } = dictionaries[locale];
  const title = `${name} · ${headline}`;
  const image = {
    url: "/media/alley-social.png",
    alt: shareImageAlt,
    width: 1200,
    height: 630,
    type: "image/png",
  };

  return {
    metadataBase: siteUrl,
    title,
    description,
    alternates: { canonical: `/${locale}`, languages: languageUrls },
    robots: isPreview ? { index: false, follow: false } : { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      title,
      description,
      url: `/${locale}`,
      siteName: name,
      locale: locale === "es" ? "es_AR" : "en_US",
      alternateLocale: [locale === "es" ? "en_US" : "es_AR"],
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
  const profile = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: new URL(`/${locale}`, siteUrl).href,
    inLanguage: locale === "es" ? "es-AR" : "en",
    mainEntity: {
      "@type": "Person",
      "@id": new URL("/en#matias-arias", siteUrl).href,
      name,
      jobTitle: role,
      sameAs: contacts.map(({ href }) => href).filter((href) => href.startsWith("https://")),
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify(profile).replace(/</g, "\\u003c"),
      }} />
      <Alley key={locale} locale={locale} copy={copy} year={new Date().getUTCFullYear()}>
        <Storefronts locale={locale} />
      </Alley>
    </>
  );
}
