"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { stops, type StopId } from "@/content/scene";
import { anchorXFor, facadeAtAnchor, progressToX, stopAt, type FacadeBounds, type Layout } from "@/lib/alley-engine";
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
  facadeStop: StopId | null;
  barRef: RefObject<HTMLDivElement | null>;
  onStopChange: (stop: StopId) => void;
  onFacadeChange: (stop: StopId | null) => void;
  children: ReactNode;
};

/**
 * Escenario fijo del callejón.
 *
 * El pin se resuelve con `position: sticky`; ScrollTrigger solo lee el progreso
 * y un único ticker escribe `transform` sobre las tres bandas.
 */
export default function Stage({ scrollHint, petLabel, petFeedback, activeStop, facadeStop, barRef, onStopChange, onFacadeChange, children }: Props) {
  const stageRef = useRef<HTMLElement>(null);
  const streetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const foregroundRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<(() => void) | null>(null);
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

      const measure = (): { layout: Layout; facades: FacadeBounds[]; parallax: boolean } => {
        const stopCenter = {} as Record<StopId, number>;
        const streetLeft = street.getBoundingClientRect().left;
        const facades = Array.from(street.querySelectorAll<HTMLElement>("[data-stop]"), (element) => {
          const stop = element.dataset.stop as StopId;
          const rect = element.getBoundingClientRect();
          const left = rect.left - streetLeft;
          stopCenter[stop] = left + rect.width / 2;
          return { stop, left, right: left + rect.width };
        });
        const viewportW = stage.clientWidth;
        const facadeRatio = Number.parseFloat(getComputedStyle(stage).getPropertyValue("--facade-center"));
        return {
          layout: {
            viewportW, streetW: street.scrollWidth, anchorX: anchorXFor(viewportW), stopCenter,
            facadeX: Number.isFinite(facadeRatio) ? viewportW * facadeRatio : undefined,
          },
          facades,
          parallax: getComputedStyle(foreground).display !== "none",
        };
      };

      let geometry = measure();
      let streetX = 0;
      let facade: StopId | null | undefined;
      const apply = (value: number) => {
        const { layout, facades, parallax } = geometry;
        const x = progressToX(value, layout);
        const travel = (streetX - x) / Math.max(layout.viewportW, 1);
        streetX = x;
        if (parallax) {
          setBackdrop(x * BACKDROP_DEPTH);
          setForeground(x * FOREGROUND_DEPTH);
        }
        setStreet(x);
        setBar?.(value);
        const nextFacade = facadeAtAnchor(layout.anchorX, x, facades);
        if (nextFacade !== facade) {
          facade = nextFacade;
          onFacadeChange(facade);
        }
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

      const state = { target: 0, current: 0 };
      let visible = !document.hidden;
      let ticking = false;
      let previousFrame = 0;

      const cat = catRef.current ? animateCat(catRef.current, ensureTicker) : null;
      petRef.current = cat?.pet ?? null;

      function tick() {
        if (!visible) return;
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
        if (!drifting && !catMoving) stopTicker();
      }

      function stopTicker() {
        if (!ticking) return;
        gsap.ticker.remove(tick);
        ticking = false;
      }

      function ensureTicker() {
        if (ticking || !visible) return;
        ticking = true;
        previousFrame = performance.now() - FRAME_MS;
        gsap.ticker.add(tick);
      }

      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (!visible) return;
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
        onRefresh: (self) => {
          if (!visible) return;
          const nextGeometry = measure();
          if (geometry.parallax && !nextGeometry.parallax) setBackdrop(0);
          geometry = nextGeometry;
          state.current = state.target = self.progress;
          apply(state.current);
          cat?.remeasure();
        },
      });

      state.target = trigger.progress;
      state.current = trigger.progress;
      if (visible) apply(state.current);
      // Con hash manda el deep link; sin hash respetamos el scroll restaurado.
      if (visible && !window.location.hash) report(state.current);

      function syncVisibility() {
        visible = !document.hidden;
        stage?.toggleAttribute("data-scene-hidden", !visible);
        cat?.setVisible(visible);
        if (!visible) {
          stopTicker();
          return;
        }
        // Reconcile with the actual scroll position without replaying the hidden travel.
        trigger.refresh();
        report(state.current);
      }

      document.addEventListener("visibilitychange", syncVisibility);
      stage.toggleAttribute("data-scene-hidden", !visible);

      return () => {
        document.removeEventListener("visibilitychange", syncVisibility);
        petRef.current = null;
        cat?.destroy();
        stopTicker();
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
      data-lit-facade={facadeStop ?? undefined}
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

        <div ref={streetRef} className="band band-street">
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
