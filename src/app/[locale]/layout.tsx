import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/content/portfolio";
import "@fontsource/lato/latin-400.css";
import "@fontsource/lato/latin-700.css";
import "@fontsource/lato/latin-900.css";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export default async function LocaleLayout({ children, params }: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  // Browser extensions may add attributes to the document root before hydration.
  return (
    <html lang={locale === "es" ? "es-AR" : "en"} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
