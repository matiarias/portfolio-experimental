"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { name, type Dictionary, type Locale } from "@/content/portfolio";
import type { StopId } from "@/content/scene";
import { progressForStop } from "@/lib/alley-engine";
import { panelFromLocation, stopFromHash, type PanelHash } from "@/lib/alley-location";
import { isRegularClick } from "@/lib/is-regular-click";
import { notifyHashChange, useHash } from "@/lib/use-hash";
import { useReadingMode } from "@/lib/use-reading-mode";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import Hud from "./hud";
import { AboutDetails, ContactLinks, ExperienceDetails } from "./chapter-panels";
import LocaleLinks from "./locale-links";
import PanelSurface, { type PanelOrigin } from "./panels/panel-surface";
import ReadingMode from "./reading-mode";
import { focusStopLink, SceneActions } from "./scene/scene-actions";
import Stage from "./scene/stage";

export default function Alley({ locale, copy, children }: {
  locale: Locale;
  copy: Dictionary;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const [preference, setPreference] = useReadingMode();
  const reading = reduced || preference === "reading";

  // La URL es la única fuente de la parada activa. Evita carreras entre el
  // scroll, el HUD y el cambio de idioma, y mantiene el deep link hidratado.
  const hash = useHash();
  const activeStop = stopFromHash(hash) ?? "entrance";
  const panelHash = panelFromLocation(hash);
  const suffix = panelHash ?? (activeStop === "entrance" ? "" : `#${activeStop}`);
  const panelTone = panelHash?.startsWith("#experience/") ? "experience" : panelHash === "#contact/details" ? "contact" : "about";
  const [facadeStop, setFacadeStop] = useState<StopId | null>("entrance");
  const panelOrigin = useRef<PanelOrigin | null>(null);
  const previousPanel = useRef<PanelHash | null>(null);
  const panelEntry = `${locale}:${useId()}`;

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
        const detail = panelFromLocation(window.location.hash);
        const id = detail && stopFromHash(detail) === stop ? detail.slice(1) : stop;
        document.getElementById(id)?.scrollIntoView({ behavior: "auto", block: "start" });
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
      if (panelFromLocation(window.location.hash)) return;
      writeHash(stop, "replace");
    },
    [writeHash],
  );

  const handleFacadeChange = useCallback((next: StopId | null) => {
    const previous = document.activeElement?.closest(".scene-hotspots")?.closest<HTMLElement>("[data-stop]");
    const stop = previous ? stopFromHash(`#${previous.dataset.stop}`) : null;
    if (stop && stop !== next) focusStopLink(stop);
    setFacadeStop(next);
  }, []);

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

  useEffect(() => {
    const closed = previousPanel.current;
    previousPanel.current = panelHash;
    if (!closed || panelHash || reading) return;
    // Fragment history traversal can clear the focus restored by the native dialog.
    const frame = window.requestAnimationFrame(() => {
      if (document.activeElement !== document.body) return;
      const origin = panelOrigin.current;
      if (origin?.hash === closed && origin.trigger.isConnected && !origin.trigger.matches(":disabled") && origin.trigger.getClientRects().length) {
        origin.trigger.focus({ preventScroll: true });
      } else {
        focusStopLink(activeStop);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeStop, panelHash, reading]);

  const openPanel = useCallback((next: PanelHash, trigger: HTMLElement, jumpToStop = false) => {
    const stop = stopFromHash(next);
    if (!stop || reading || window.location.hash === next) return;
    if (document.activeElement !== trigger) trigger.focus({ preventScroll: true });
    panelOrigin.current = { hash: next, trigger };
    const previousStop = stopFromHash(window.location.hash);
    // An early click belongs to the visible facade even if the HUD hash hasn't caught up.
    if (!jumpToStop && stop !== previousStop) window.history.replaceState(null, "", `#${stop}`);
    window.history.pushState({ alleyPanel: panelEntry }, "", next);
    if (jumpToStop) scrollToStop(stop);
    notifyHashChange();
  }, [panelEntry, reading, scrollToStop]);

  function dismissPanel(dismissed: PanelHash) {
    // `close` also fires after Back or a manual hash change; don't undo them.
    if (window.location.hash !== dismissed) return;
    const stop = stopFromHash(dismissed);
    if (!stop) return;
    if (window.history.state?.alleyPanel === panelEntry) {
      window.history.back();
    } else {
      window.history.replaceState(null, "", `#${stop}`);
      notifyHashChange();
    }
  }

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
          if (!reading) {
            openPanel("#about/details", event.currentTarget, true);
          } else {
            navigate("about");
            document.getElementById("about/details")?.focus({ preventScroll: true });
          }
        }}
      >
        {copy.skipToContent}
      </a>

      <Hud
        locale={locale}
        copy={copy}
        activeStop={activeStop}
        suffix={suffix}
        reading={reading}
        reduced={reduced}
        barRef={barRef}
        onNavigate={navigate}
        onToggleReading={toggleReading}
      />

      <main id="content" data-active-stop={activeStop} data-mode={reading ? "reading" : "scene"}>
        <h1 className="sr-only">{name}</h1>
        {reading ? (
          <ReadingMode copy={copy} />
        ) : (
          <>
            <SceneActions.Provider value={{ availableStop: facadeStop, open: openPanel }}>
              <Stage
                scrollHint={copy.scrollHint}
                petLabel={copy.petCat}
                petFeedback={copy.catFeedback}
                activeStop={activeStop}
                facadeStop={facadeStop}
                barRef={barRef}
                onStopChange={handleStopChange}
                onFacadeChange={handleFacadeChange}
              >
                {children}
              </Stage>
            </SceneActions.Provider>
            <div className="reading-fallback">
              <ReadingMode copy={copy} />
            </div>
            <PanelSurface
              hash={panelHash}
              title={panelTone === "about" ? copy.headline : copy.labels[panelTone]}
              tone={panelTone}
              close={copy.scene.close}
              languageLinks={<LocaleLinks locale={locale} suffix={suffix} label={copy.language} />}
              originRef={panelOrigin}
              onDismiss={dismissPanel}
            >
              {panelHash && (panelTone === "experience" ? (
                <ExperienceDetails copy={copy} inDialog />
              ) : panelTone === "contact" ? (
                <><p className="chapter-project-copy">{copy.contactIntro}</p><ContactLinks variant="booth" /></>
              ) : <AboutDetails copy={copy} />)}
            </PanelSurface>
          </>
        )}
      </main>
    </>
  );
}
