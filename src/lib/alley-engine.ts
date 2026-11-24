import { keyframes, type StopId } from "@/content/scene";

/**
 * Motor del callejón: traduce progreso de scroll (0..1) a desplazamiento
 * horizontal de la calle. Todo acá es puro y testeable; el acceso al DOM vive
 * en `src/components/scene/stage.tsx`.
 */

export type Layout = {
  /** Ancho del viewport en px. */
  viewportW: number;
  /** Ancho total de la tira de fachadas en px. */
  streetW: number;
  /** Punto de pantalla donde se ancla la fachada activa. */
  anchorX: number;
  /** Centro de cada fachada, en coordenadas de la tira. */
  stopCenter: Record<StopId, number>;
};

/** El gato se ancla al 38% del ancho de pantalla. */
export const ANCHOR_RATIO = 0.38;

function clamp(value: number, min: number, max: number): number {
  const result = Math.min(max, Math.max(min, value));
  // `Math.max(-0, -n)` devuelve -0; lo normalizamos para no filtrarlo al DOM.
  return Object.is(result, -0) ? 0 : result;
}

export function anchorXFor(viewportW: number): number {
  return viewportW * ANCHOR_RATIO;
}

export function maxTravel(layout: Layout): number {
  return Math.max(0, layout.streetW - layout.viewportW);
}

/**
 * La entrada usa la posición de reposo de CSS antes y después de hidratar.
 * Las demás fachadas se alinean con `anchorX`.
 * Una fachada con centro `c` aparece en pantalla en `c + x`.
 */
export function xForStop(stop: StopId, layout: Layout): number {
  if (stop === "entrance") return 0;
  return layout.anchorX - layout.stopCenter[stop];
}

export function clampX(x: number, layout: Layout): number {
  return clamp(x, -maxTravel(layout), 0);
}

/** Equivalente a `power2.inOut` de GSAP: cúbica de entrada y salida. */
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export type Segment = {
  from: StopId;
  to: StopId;
  /** Progreso 0..1 dentro del segmento. */
  t: number;
  /** `true` cuando el segmento une dos paradas distintas. */
  walking: boolean;
};

function segmentIndex(progress: number): number {
  const last = keyframes.length - 1;
  let index = 0;
  while (index < last && progress > keyframes[index + 1].p) index += 1;
  return index;
}

export function segmentAt(progress: number): Segment {
  const p = clamp(progress, 0, 1);
  const last = keyframes.length - 1;
  const index = segmentIndex(p);
  const next = Math.min(index + 1, last);
  const from = keyframes[index].stop;
  const to = keyframes[next].stop;
  const start = keyframes[index].p;
  const end = keyframes[next].p;
  const span = end - start;
  const t = span > 0 ? clamp((p - start) / span, 0, 1) : 1;
  return { from, to, t, walking: from !== to };
}

/**
 * Parada activa. Durante un tramo de caminata devuelve el destino, para que el
 * cartel se encienda a medida que el gato se acerca.
 */
export function stopAt(progress: number): StopId {
  const last = keyframes.length - 1;
  return keyframes[Math.min(segmentIndex(clamp(progress, 0, 1)) + 1, last)].stop;
}

/** Desplazamiento de la calle para un progreso dado. */
export function progressToX(progress: number, layout: Layout): number {
  const { from, to, t, walking } = segmentAt(progress);
  const start = xForStop(from, layout);
  if (!walking) return clampX(start, layout);
  const end = xForStop(to, layout);
  return clampX(start + (end - start) * easeInOut(t), layout);
}

/** Punto medio del dwell de una parada. Útil para deep links. */
export function progressForStop(stop: StopId): number {
  const indices = keyframes.reduce<number[]>(
    (acc, keyframe, index) => (keyframe.stop === stop ? [...acc, index] : acc),
    [],
  );
  if (indices.length === 0) return 0;
  const first = indices[0];
  const last = indices[indices.length - 1];
  return (keyframes[first].p + keyframes[last].p) / 2;
}
