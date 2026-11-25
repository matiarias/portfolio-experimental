import type { Locale } from "./portfolio";
import { santander } from "./santander";

/**
 * Manifiesto de la escena del callejón.
 *
 * El scroll vertical produce un único valor (`progress`) que se traduce en un
 * desplazamiento horizontal de la calle. Este archivo define las paradas y el
 * ritmo del paseo; el cálculo vive en `src/lib/alley-engine.ts`.
 */

export const stopIds = ["entrance", "about", "experience", "contact"] as const;
export type StopId = (typeof stopIds)[number];

export type NeonColor = "amber" | "magenta" | "cyan" | "jade";

export type Stop = {
  id: StopId;
  /** Ancla de hash. Conserva el contrato `#about`, `#experience`, `#contact`. */
  hash: `#${StopId}`;
  /** Texto decorativo del cartel. Se dibuja como path y queda fuera del árbol de accesibilidad. */
  kanji: string;
  /** Etiqueta accesible, traducida. */
  label: Record<Locale, string>;
  /** Color de neón dominante de la fachada. */
  neon: NeonColor;
};

export const stops = [
  {
    id: "entrance",
    hash: "#entrance",
    kanji: "アリアス",
    label: { en: "Home", es: "Inicio" },
    neon: "amber",
  },
  {
    id: "about",
    hash: "#about",
    kanji: "ラーメン",
    label: { en: "About", es: "Sobre mí" },
    neon: "magenta",
  },
  {
    id: "experience",
    hash: "#experience",
    kanji: "投資",
    label: { en: "Experience", es: "Experiencia" },
    neon: "cyan",
  },
  {
    id: "contact",
    hash: "#contact",
    kanji: "連絡",
    label: { en: "Contact", es: "Contacto" },
    neon: "jade",
  },
] as const satisfies readonly Stop[];

export function stopById(id: StopId): Stop {
  return stops.find((stop) => stop.id === id) ?? stops[0];
}

/**
 * Ritmo del paseo. Cada par de keyframes consecutivos con la misma parada es un
 * dwell (la calle no se mueve); entre paradas distintas hay un tramo de caminata.
 *
 * `experience` tiene el dwell más largo porque hay ocho ventanas para explorar.
 */
export type Keyframe = { p: number; stop: StopId };

export const keyframes = [
  { p: 0.0, stop: "entrance" },
  { p: 0.1, stop: "entrance" },
  { p: 0.26, stop: "about" },
  { p: 0.4, stop: "about" },
  { p: 0.56, stop: "experience" },
  { p: 0.74, stop: "experience" },
  { p: 0.9, stop: "contact" },
  { p: 1.0, stop: "contact" },
] as const satisfies readonly Keyframe[];

/** Un proyecto equivale a una ventana iluminada del edificio. */
export type Project = {
  /** Identificador estable: `${piso}-${índice}`. */
  id: string;
  floor: number;
  period: string;
  title: string;
  body: string;
};

/**
 * Deriva las ocho ventanas del contenido de experiencia ya existente:
 * dos períodos (pisos) por cinco y tres logros respectivamente.
 */
export function projectsFor(locale: Locale): Project[] {
  return santander[locale].flatMap((role, floor) =>
    role.highlights.map((highlight, index) => ({
      id: `${floor}-${index}`,
      floor,
      period: role.period,
      title: highlight.title,
      body: highlight.body,
    })),
  );
}

/** Busca un proyecto por el id usado en `#experience/<id>`. */
export function projectById(locale: Locale, id: string): Project | undefined {
  return projectsFor(locale).find((project) => project.id === id);
}
