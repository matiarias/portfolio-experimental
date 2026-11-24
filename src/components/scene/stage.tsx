"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { stops, type StopId } from "@/content/scene";
import { anchorXFor, progressToX, stopAt, type Layout } from "@/lib/alley-engine";
import { animateCat } from "./cat/animate-cat";
import Cat from "./cat/cat";

const BACKDROP_DEPTH = 0.15;
const FOREGROUND_DEPTH = 1.35;
const SMOOTHING = 0.18;
const FRAME_MS = 1_000 / 60;
const SKYLINE = [14, 22, 17, 30, 19, 34, 15, 27, 21, 31, 18, 25];

type Props = {
  scrollHint: string;
  petLabel: string;
  petFeedback: string;
  activeStop: StopId;
  barRef: RefObject<HTMLDivElement | null>;
  onStopChange: (stop: StopId) => void;
  children: ReactNode;
};

/**
 * Escenario fijo del callejón.
 *
 * El pin se resuelve con `position: sticky`; ScrollTrigger solo lee el progreso
 * y un único ticker escribe `transform` sobre las tres bandas.
 */
export default function Stage({ scrollHint, petLabel, petFeedback, activeStop, barRef, onStopChange, children }: Props) {
  const stageRef = useRef<HTMLElement>(null);
  const streetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const foregroundRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<(() => void) | null>(null);
  const layoutRef = useRef<Layout | null>(null);
  const stopRef = useRef<StopId>("entrance");
  const onStopChangeRef = useRef(onStopChange);

  useEffect(() => {
    onStopChangeRef.current = onStopChange;
  }, [onStopChange]);

  useGSAP(
    () => {
      const stage = stageRef.current;
      const street = streetRef.current;
      const backdrop = backdropRef.current;
      const foreground = foregroundRef.current;
      if (!stage || !street || !backdrop || !foreground) return;

      gsap.registerPlugin(ScrollTrigger);

      const setBackdrop = gsap.quickSetter(backdrop, "x", "px");
      const setStreet = gsap.quickSetter(street, "x", "px");
      const setForeground = gsap.quickSetter(foreground, "x", "px");
      const bar = barRef.current;
      const setBar = bar ? gsap.quickSetter(bar, "scaleX") : null;

      const measure = (): Layout => {
        const stopCenter = {} as Record<StopId, number>;
        const streetLeft = street.getBoundingClientRect().left;
        street.querySelectorAll<HTMLElement>("[data-stop]").forEach((element) => {
          const id = element.dataset.stop as StopId;
          const rect = element.getBoundingClientRect();
          stopCenter[id] = rect.left - streetLeft + rect.width / 2;
        });
        const viewportW = stage.clientWidth;
        return {
          viewportW,
          streetW: street.scrollWidth,
          anchorX: anchorXFor(viewportW),
          stopCenter,
        };
      };

      let streetX = 0;
      const apply = (value: number) => {
        const layout = layoutRef.current;
        if (!layout) return 0;
        const x = progressToX(value, layout);
        const travel = (streetX - x) / Math.max(layout.viewportW, 1);
        streetX = x;
        setBackdrop(x * BACKDROP_DEPTH);
        setStreet(x);
        setForeground(x * FOREGROUND_DEPTH);
        setBar?.(value);
        return travel;
      };

      // La parada se anuncia al asentarse, no en cada frame: un paseo
      // programático no debe pasar por paradas intermedias ni pisar el hash.
      const report = (value: number) => {
        const next = stopAt(value);
        if (next !== stopRef.current) {
          stopRef.current = next;
          onStopChangeRef.current(next);
        }
      };

      layoutRef.current = measure();

      const state = { target: 0, current: 0 };
      let ticking = false;
      let previousFrame = 0;

      const cat = catRef.current ? animateCat(catRef.current, ensureTicker) : null;
      petRef.current = cat?.pet ?? null;

      function tick() {
        // Time from the browser clock, not GSAP's lag-smoothed timeline clock.
        const now = performance.now();
        const elapsed = gsap.utils.clamp(1, 1_000, now - previousFrame);
        previousFrame = now;
        const delta = state.target - state.current;
        const drifting = Math.abs(delta) >= 0.0002;
        let travel = 0;
        if (delta !== 0) {
          // Mantiene la duración del frenado incluso si el navegador entrega pocos frames.
          const smoothing = 1 - (1 - SMOOTHING) ** (elapsed / FRAME_MS);
          state.current = drifting ? state.current + delta * smoothing : state.target;
          travel = apply(state.current);
        }
        if (!drifting) report(state.current);
        const catMoving = cat?.advance(elapsed / 1_000, travel);
        if (!drifting && !catMoving) {
          gsap.ticker.remove(tick);
          ticking = false;
        }
      }

      function ensureTicker() {
        if (ticking) return;
        ticking = true;
        previousFrame = performance.now() - FRAME_MS;
        gsap.ticker.add(tick);
      }

      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const next = self.progress;
          // Un salto grande (deep link, tecla End) se aplica de una: no pasa
          // por paradas intermedias ni deja el hash del HUD en un valor transitorio.
          if (Math.abs(next - state.current) > 0.2) {
            state.target = next;
            state.current = next;
            apply(next);
            report(next);
            return;
          }
          state.target = next;
          ensureTicker();
        },
        onRefresh: () => {
          layoutRef.current = measure();
          state.current = state.target;
          apply(state.current);
          cat?.remeasure();
        },
      });

      state.target = trigger.progress;
      state.current = trigger.progress;
      apply(state.current);
      // Con hash manda el deep link; sin hash respetamos el scroll restaurado.
      if (!window.location.hash) report(state.current);

      return () => {
        petRef.current = null;
        cat?.destroy();
        gsap.ticker.remove(tick);
        trigger.kill();
      };
    },
    { scope: stageRef, dependencies: [] },
  );

  return (
    <section
      ref={stageRef}
      id="alley-stage"
      className="alley-stage"
      style={{ height: `${(stops.length + 1) * 100}svh` }}
    >
      <div className="alley-stage-viewport">
        <div ref={backdropRef} className="band band-backdrop" aria-hidden="true">
          <div className="sky" />
          <div className="moon" />
          <div className="skyline">
            {SKYLINE.map((height, index) => (
              <span key={index} style={{ height: `${height}svh` }} />
            ))}
          </div>
          <svg className="overhead-wires" viewBox="0 0 1600 200" preserveAspectRatio="none" focusable="false">
            <path d="M0 21Q360 194 754 36T1600 60M0 49Q408 218 792 63T1600 92M0 110Q495 35 1012 164T1600 112" />
            <path d="M146 0V97M747 0v77m615-77v135" />
          </svg>
        </div>

        <div ref={streetRef} className="band band-street" aria-hidden="true">
          {children}
        </div>

        <div className="ground" aria-hidden="true">
          <div className="street-reflection" />
        </div>

        <Cat rootRef={catRef} petLabel={petLabel} petFeedback={petFeedback} onPet={() => petRef.current?.()} />

        <div ref={foregroundRef} className="band band-foreground" aria-hidden="true">
          {Array.from({ length: 12 }, (_, index) => (
            <span key={index} className="fg-bollard" style={{ left: `${index * 56 + 9}vw` }} />
          ))}
        </div>
        <div className="alley-weather" aria-hidden="true">
          <div className="alley-rain" />
        </div>

        {activeStop === "entrance" && (
          <p className="scroll-hint">
            <span>{scrollHint}</span>
            <span className="scroll-paws">
              <span />
              <span />
              <span />
            </span>
          </p>
        )}
      </div>
    </section>
  );
}
