import Link from "next/link";
import { locales, type Locale } from "@/content/portfolio";

export default function LocaleLinks({ locale, suffix, label }: { locale: Locale; suffix: string; label: string }) {
  return (
    <div className="hud-locale" role="group" aria-label={label}>
      {locales.map((language) => (
        <Link
          key={language}
          href={`/${language}${suffix}`}
          prefetch={false}
          scroll={false}
          lang={language}
          hrefLang={language}
          aria-label={language === "en" ? "English" : "Español"}
          aria-current={language === locale ? "page" : undefined}
        >
          {language.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
