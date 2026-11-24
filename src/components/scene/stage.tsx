"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { stops, type StopId } from "@/content/scene";
import { anchorXFor, progressToX, stopAt, type Layout } from "@/lib/alley-engine";
import Cat from "./cat/cat";

const BACKDROP_DEPTH = 0.15;
const FOREGROUND_DEPTH = 1.35;
const SMOOTHING = 0.18;
const SKYLINE = [14, 22, 17, 30, 19, 34, 15, 27, 21, 31, 18, 25];

type Props = {
  scrollHint: string;
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
export default function Stage({ scrollHint, activeStop, barRef, onStopChange, children }: Props) {
  const stageRef = useRef<HTMLElement>(null);
  const streetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const foregroundRef = useRef<HTMLDivElement>(null);
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

      const apply = (value: number) => {
        const layout = layoutRef.current;
        if (!layout) return;
        const x = progressToX(value, layout);
        setBackdrop(x * BACKDROP_DEPTH);
        setStreet(x);
        setForeground(x * FOREGROUND_DEPTH);
        setBar?.(value);
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

      const tick = () => {
        const delta = state.target - state.current;
        if (Math.abs(delta) < 0.0002) {
          state.current = state.target;
          apply(state.current);
          report(state.current);
          gsap.ticker.remove(tick);
          ticking = false;
          return;
        }
        state.current += delta * SMOOTHING;
        apply(state.current);
      };

      const ensureTicker = () => {
        if (ticking) return;
        ticking = true;
        gsap.ticker.add(tick);
      };

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
        },
      });

      state.target = trigger.progress;
      state.current = trigger.progress;
      apply(state.current);
      // Con hash manda el deep link; sin hash respetamos el scroll restaurado.
      if (!window.location.hash) report(state.current);

      return () => {
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
      aria-hidden="true"
    >
      <div className="alley-stage-viewport">
        <div ref={backdropRef} className="band band-backdrop">
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

        <div ref={streetRef} className="band band-street">
          {children}
        </div>

        <div className="ground">
          <div className="street-reflection" />
        </div>

        <Cat />

        <div ref={foregroundRef} className="band band-foreground">
          {Array.from({ length: 12 }, (_, index) => (
            <span key={index} className="fg-bollard" style={{ left: `${index * 56 + 9}vw` }} />
          ))}
        </div>
        <div className="alley-weather">
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
