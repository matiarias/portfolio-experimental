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
  description:
    "Matias Arias, Software Engineer from Argentina with a focus on frontend. Walk a neon Tokyo alley at night to explore his work in banking and investment products.",
  language: "Language",
  navigation: "Chapters",
  reading: "Reading mode",
  skipToContent: "Skip to content",
  scrollHint: "Scroll to walk",
  petCat: "Pet the cat",
  catFeedback: "The cat leans in.",
  scene: {
    aboutAction: "Read the bio",
    contactAction: "Get in touch",
    experienceAction: "View experience",
    close: "Close",
  },
  labels: { about: "About", experience: "Experience", contact: "Contact" },
  headline: "Software Engineer · Frontend Specialist",
  aboutSector: "Fintech & Banking",
  about: [
    "I’m a Software Engineer from Argentina. I spent over three years on the Investments team at Santander Tecnología Argentina, building banking and investment features for web and mobile, including Dólar MEP trading and Markets and Tenders.",
    "I have experience developing projects end to end, working closely with UX/UI and business teams. I helped define the user flows, built the frontend and BFF, and took features into production. After launch, I monitored how they performed, investigated incidents and coordinated fixes.",
    "I work with Claude Code, OpenAI Codex, GitHub Copilot and Devin. I use them to research technical options, turn requirements into specs, plan the implementation and coordinate subagents on specific tasks. On this portfolio, I run lint, type checks and end-to-end tests with Playwright across browsers. If a check fails, I investigate, fix the issue and verify the flow again.",
  ],
  contactIntro: "I’m open to remote Software Engineer roles.",
  experience: santander.en,
};

export type Dictionary = typeof en;

export const dictionaries = {
  en,
  es: {
    description:
      "Matias Arias, Software Engineer de Argentina con foco en frontend. Recorré un callejón nocturno de neón en Tokio para conocer mi trabajo en productos bancarios y de inversión.",
    language: "Idioma",
    navigation: "Capítulos",
    reading: "Modo lectura",
    skipToContent: "Saltar al contenido",
    scrollHint: "Scrolleá para caminar",
    petCat: "Acariciar al gato",
    catFeedback: "El gato se acurruca.",
    scene: {
      aboutAction: "Leer la bio",
      contactAction: "Contactarme",
      experienceAction: "Ver experiencia",
      close: "Cerrar",
    },
    labels: { about: "Sobre mí", experience: "Experiencia", contact: "Contacto" },
    headline: "Software Engineer · Especialista en Frontend",
    aboutSector: "Fintech & Banca",
    about: [
      "Soy Software Engineer de Argentina. Trabajé más de tres años en el equipo de Inversiones de Santander Tecnología Argentina, donde desarrollé funcionalidades de banca e inversión para web y móvil, como la compra y venta de Dólar MEP y los flujos de Mercados y Licitaciones.",
      "Tengo experiencia desarrollando proyectos de punta a punta, en colaboración con equipos de UX/UI y negocio. Participé en la definición de los flujos, desarrollé el frontend y el BFF y acompañé la puesta en producción. Después del lanzamiento, monitoreé su funcionamiento, investigué incidencias y coordiné su resolución.",
      "Trabajo con Claude Code, OpenAI Codex, GitHub Copilot y Devin. Los uso para investigar alternativas técnicas, convertir requisitos en especificaciones, planificar la implementación y coordinar tareas concretas entre subagentes. En este portfolio, verifico los cambios con lint, chequeo de tipos y pruebas end to end con Playwright en varios navegadores. Si algo falla, investigo la causa, corrijo el cambio y vuelvo a probar el flujo.",
    ],
    contactIntro: "Estoy abierto a oportunidades remotas como Software Engineer.",
    experience: santander.es,
  },
} satisfies Record<Locale, Dictionary>;

export const name = "Matias Arias";
export const role = "Software Engineer";
export const aboutStack = "React · TypeScript · Next.js · Node.js · NestJS";
export const contacts = [
  { label: "GitHub", detail: "@matiarias", href: "https://github.com/matiarias" },
  { label: "LinkedIn", detail: "/in/matiasarias27", href: "https://www.linkedin.com/in/matiasarias27" },
  { label: "Email", detail: "maticarlosarias@gmail.com", href: "mailto:maticarlosarias@gmail.com" },
] as const;
