"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Dictionary, Locale } from "@/content/portfolio";
import { stops, type StopId } from "@/content/scene";
import { progressForStop } from "@/lib/alley-engine";
import { isRegularClick } from "@/lib/is-regular-click";
import { notifyHashChange, useHash } from "@/lib/use-hash";
import { useReadingMode } from "@/lib/use-reading-mode";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import Hud from "./hud";
import ReadingMode from "./reading-mode";
import Stage from "./scene/stage";

function stopFromHash(hash: string): StopId | null {
  if (hash.startsWith("#experience/")) return "experience";
  const stop = stops.find((entry) => entry.hash === hash);
  return stop?.id ?? null;
}

export default function Alley({ locale, copy }: { locale: Locale; copy: Dictionary }) {
  const reduced = useReducedMotion();
  const [preference, setPreference] = useReadingMode();
  const reading = reduced || preference === "reading";

  // La URL es la única fuente de la parada activa. Evita carreras entre el
  // scroll, el HUD y el cambio de idioma, y mantiene el deep link hidratado.
  const hash = useHash();
  const activeStop = stopFromHash(hash) ?? "entrance";

  const barRef = useRef<HTMLDivElement>(null);
  const activeStopRef = useRef(activeStop);
  const mounted = useRef(false);
  const previousReading = useRef(reading);

  useEffect(() => {
    activeStopRef.current = activeStop;
  }, [activeStop]);

  /**
   * Salto programático instantáneo. El suavizado visual lo hace el ticker del
   * escenario; un scroll animado del navegador pasaría por paradas intermedias
   * y ensuciaría el hash activo.
   */
  const scrollToStop = useCallback(
    (stop: StopId) => {
      if (reading) {
        if (stop === "entrance") {
          window.scrollTo({ top: 0, behavior: "auto" });
          return;
        }
        document.getElementById(stop)?.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }

      const stage = document.getElementById("alley-stage");
      if (!stage) return;
      const top = stage.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(1, stage.offsetHeight - window.innerHeight);
      const progress = stop === "entrance" ? 0 : progressForStop(stop);
      window.scrollTo({ top: top + progress * travel, behavior: "auto" });
    },
    [reading],
  );

  const writeHash = useCallback((stop: StopId, mode: "push" | "replace") => {
    const currentStop = stopFromHash(window.location.hash);
    // Un detalle como `#experience/<id>` resuelve a la misma parada: no lo pisamos.
    if (currentStop === stop && window.location.hash) return;

    const nextUrl =
      stop === "entrance" ? window.location.pathname : `${window.location.pathname}#${stop}`;
    const currentUrl = `${window.location.pathname}${window.location.hash}`;
    if (nextUrl === currentUrl) return;

    window.history[mode === "push" ? "pushState" : "replaceState"](null, "", nextUrl);
    notifyHashChange();
  }, []);

  const navigate = useCallback(
    (stop: StopId) => {
      writeHash(stop, "push");
      scrollToStop(stop);
    },
    [scrollToStop, writeHash],
  );

  const handleStopChange = useCallback(
    (stop: StopId) => {
      writeHash(stop, "replace");
    },
    [writeHash],
  );

  useEffect(() => {
    const hashStop = stopFromHash(window.location.hash);

    if (!mounted.current) {
      mounted.current = true;
      previousReading.current = reading;
      // Sin hash respetamos la restauración del navegador.
      if (hashStop) scrollToStop(hashStop);
    } else if (previousReading.current !== reading) {
      previousReading.current = reading;
      scrollToStop(hashStop ?? activeStopRef.current);
    }
  }, [reading, scrollToStop]);

  useEffect(() => {
    const followHistory = () => {
      const next = stopFromHash(window.location.hash) ?? "entrance";
      scrollToStop(next);
    };

    window.addEventListener("popstate", followHistory);
    window.addEventListener("hashchange", followHistory);
    return () => {
      window.removeEventListener("popstate", followHistory);
      window.removeEventListener("hashchange", followHistory);
    };
  }, [scrollToStop]);

  const toggleReading = useCallback(() => {
    if (reduced) return;
    setPreference(reading ? "scene" : "reading");
  }, [reading, reduced, setPreference]);

  return (
    <>
      <a
        className="skip-link"
        href="#about"
        onClick={(event) => {
          if (!isRegularClick(event)) return;
          event.preventDefault();
          navigate("about");
        }}
      >
        {copy.skipToContent}
      </a>

      <Hud
        locale={locale}
        copy={copy}
        activeStop={activeStop}
        reading={reading}
        reduced={reduced}
        barRef={barRef}
        onNavigate={navigate}
        onToggleReading={toggleReading}
      />

      <main id="content" data-active-stop={activeStop} data-mode={reading ? "reading" : "scene"}>
        {reading ? (
          <ReadingMode copy={copy} />
        ) : (
          <>
            <Stage
              locale={locale}
              scrollHint={copy.scrollHint}
              activeStop={activeStop}
              barRef={barRef}
              onStopChange={handleStopChange}
            />
            <div className="reading-fallback">
              <ReadingMode copy={copy} />
            </div>
          </>
        )}
      </main>
    </>
  );
}
