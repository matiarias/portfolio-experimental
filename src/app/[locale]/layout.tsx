import type { ReactNode } from "react";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/content/portfolio";
import "../globals.css";

const geist = localFont({
  src: "../fonts/geist-latin.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-geist",
});

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
    <html lang={locale === "es" ? "es-AR" : "en"} className={geist.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
