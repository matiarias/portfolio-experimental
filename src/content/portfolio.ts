import { santander } from "./santander";

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value);
}

export const chapters = ["about", "experience", "contact"] as const;
export type Chapter = (typeof chapters)[number];
export type Panel = "cover" | Chapter;

export function panelFromHash(hash: string): Panel {
  return chapters.find((chapter) => hash === `#${chapter}`) ?? "cover";
}

const en = {
  description: "Matias Arias, frontend engineer from San Juan, Argentina. Explore his work in banking and investment products in an interactive drive-in cinema.",
  cinema: "Drive-in cinema",
  language: "Language",
  navigation: "Chapters",
  playback: "Playback",
  play: "Play",
  pause: "Pause",
  resume: "Resume",
  replay: "Watch again",
  cover: "Title screen",
  browse: "Browse chapters",
  silentNote: "The screening is continuing without music.",
  labels: { about: "About", experience: "Experience", contact: "Contact" },
  headline: "Software Engineer focused on frontend for banking and fintech",
  about: [
    "I’m a Frontend Engineer from San Juan, Argentina. I spent over three years at Santander Tecnología Argentina building production-critical banking and investment features with React and TypeScript.",
    "I work with Next.js and develop BFFs with Node.js and NestJS. I’ve also worked on high-volume transactional systems and resolved incidents in production.",
    "I use agentic workflows in my daily development with GitHub Copilot, Windsurf, Devin, Claude Code and Codex.",
  ],
  experience: santander.en,
};

export type Dictionary = typeof en;

export const dictionaries = {
  en,
  es: {
    description: "Matias Arias, Frontend Engineer de San Juan, Argentina. Conocé mi trabajo en productos bancarios y de inversión en un autocine interactivo.",
    cinema: "Autocine",
    language: "Idioma",
    navigation: "Capítulos",
    playback: "Reproducción",
    play: "Play",
    pause: "Pausa",
    resume: "Continuar",
    replay: "Volver a ver",
    cover: "Portada",
    browse: "Explorar capítulos",
    silentNote: "La proyección continúa sin música.",
    labels: { about: "Sobre mí", experience: "Experiencia", contact: "Contacto" },
    headline: "Software Engineer con foco en frontend para banca y fintech",
    about: [
      "Soy Frontend Engineer de San Juan, Argentina. Durante más de tres años en Santander Tecnología Argentina desarrollé funcionalidades bancarias y de inversión críticas para producción con React y TypeScript.",
      "Trabajo con Next.js y desarrollo BFF con Node.js y NestJS. También tengo experiencia con sistemas transaccionales de alto volumen y resolución de incidentes en producción.",
      "Integro flujos de desarrollo con agentes en mi trabajo diario con GitHub Copilot, Windsurf, Devin, Claude Code y Codex.",
    ],
    experience: santander.es,
  },
} satisfies Record<Locale, Dictionary>;

export const name = "Matias Arias";
export const role = "Frontend Engineer";
export const contacts = [
  { label: "GitHub", detail: "@matiarias", href: "https://github.com/matiarias" },
  { label: "LinkedIn", detail: "/in/matiasarias27", href: "https://www.linkedin.com/in/matiasarias27" },
  { label: "Email", detail: "maticarlosarias@gmail.com", href: "mailto:maticarlosarias@gmail.com" },
] as const;
