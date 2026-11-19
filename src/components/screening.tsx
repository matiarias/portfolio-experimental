"use client";

import Link from "next/link";
import { useEffect, useReducer, useRef, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from "react";
import { chapters, locales, name, panelFromHash, role, type Dictionary, type Locale, type Panel } from "@/content/portfolio";
import { playbackReducer } from "./playback";
import SceneBackdrop from "./scene-backdrop";

const quietQuery = "(prefers-reduced-motion: reduce)";
const soundtrack = "/media/loop-crepusculo.wav";

function subscribeToMotion(listener: () => void) {
  const media = window.matchMedia(quietQuery);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

function subscribeToHash(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

function isRegularClick(event: MouseEvent<HTMLAnchorElement>) {
  return !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export default function Screening({ locale, copy, children }: {
  locale: Locale;
  copy: Dictionary;
  children: ReactNode;
}) {
  const hash = useSyncExternalStore(subscribeToHash, () => window.location.hash, () => null);
  const reduced = useSyncExternalStore(subscribeToMotion, () => window.matchMedia(quietQuery).matches, () => false);
  const [state, dispatch] = useReducer(playbackReducer, null);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const focusNext = useRef(false);
  const playAttempt = useRef(0);
  const panel = state?.panel ?? panelFromHash(hash ?? "");
  const status = state?.status ?? "reading";

  function pauseAudio() {
    playAttempt.current += 1;
    const player = audio.current;
    if (player && !player.paused) player.pause();
  }

  function playAudio(restart: boolean) {
    const player = audio.current;
    if (!player) return;
    const attempt = ++playAttempt.current;
    if (restart) player.currentTime = 0;
    player.volume = 0.32;
    setAudioUnavailable(false);
    void player.play().catch(() => {
      if (attempt === playAttempt.current) setAudioUnavailable(true);
    });
  }

  function start() {
    focusNext.current = true;
    if (reduced) {
      navigate("about");
      return;
    }
    playAudio(true);
    dispatch({ type: "play", now: performance.now() });
  }

  function togglePlayback() {
    if (status === "finished") {
      start();
    } else if (status === "playing") {
      pauseAudio();
      dispatch({ type: "pause", now: performance.now() });
    } else if (status === "paused") {
      playAudio(false);
      dispatch({ type: "resume", now: performance.now() });
    }
  }

  function navigate(next: Panel) {
    pauseAudio();
    focusNext.current = true;
    const fragment = next === "cover" ? "" : `#${next}`;
    if (fragment !== window.location.hash) {
      window.history.pushState(null, "", fragment || window.location.pathname);
    }
    dispatch({ type: "browse", panel: next });
  }

  function followChapter(event: MouseEvent<HTMLAnchorElement>, next: Panel) {
    if (!isRegularClick(event)) return;
    event.preventDefault();
    navigate(next);
  }

  useEffect(() => {
    function followHistory() {
      const player = audio.current;
      if (player && !player.paused) player.pause();
      focusNext.current = true;
      dispatch({ type: "browse", panel: panelFromHash(window.location.hash) });
    }
    // Traversal can return to a history entry with the same fragment.
    window.addEventListener("popstate", followHistory);
    window.addEventListener("hashchange", followHistory);
    return () => {
      window.removeEventListener("popstate", followHistory);
      window.removeEventListener("hashchange", followHistory);
    };
  }, []);

  useEffect(() => {
    const player = audio.current;
    return () => {
      if (player && !player.paused) player.pause();
    };
  }, []);

  useEffect(() => {
    if (state?.status !== "playing") return;
    const player = audio.current;
    if (reduced) {
      if (player && !player.paused) player.pause();
      dispatch({ type: "browse", panel: state.panel });
      return;
    }
    const timer = window.setTimeout(() => {
      if (state.panel === "contact") {
        if (player && !player.paused) player.pause();
      } else {
        focusNext.current = screen.current?.contains(document.activeElement) ?? false;
      }
      dispatch({ type: "advance", now: Math.max(state.deadline, performance.now()) });
    }, Math.max(0, Math.ceil(state.deadline - performance.now())));
    return () => window.clearTimeout(timer);
  }, [state, reduced]);

  useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    const viewport = screen.current;
    if (!viewport) return;
    viewport.scrollTop = 0;
    viewport.querySelector<HTMLElement>(`#${panel} :is(h1, h2)`)?.focus({ preventScroll: true });
  }, [panel, state]);

  const playbackLabel = status === "playing" ? copy.pause : status === "paused" ? copy.resume : copy.replay;
  const projectionLit = !reduced && panel !== "contact" && (status === "playing" || status === "paused");

  return (
    <main className="mx-auto max-w-[1600px]">
      <audio ref={audio} src={soundtrack} preload="none" loop onError={() => setAudioUnavailable(true)} />
      <figure className="preview" aria-label={copy.cinema}
        data-active={hash === null ? undefined : panel} data-projection={projectionLit ? "lit" : undefined}>
        <div className="scene">
          <nav className="locale absolute z-10 flex items-center" aria-label={copy.language}>
            {locales.map((language) => (
              <Link key={language} href={`/${language}${panel === "cover" ? "" : `#${panel}`}`}
                prefetch={false} scroll={false} lang={language} hrefLang={language}
                aria-label={language === "en" ? "English" : "Español"}
                aria-current={language === locale ? "page" : undefined}
                onClick={(event) => {
                  if (language !== locale && isRegularClick(event)) {
                    pauseAudio();
                    dispatch({ type: "browse", panel });
                  }
                }}>{language.toUpperCase()}</Link>
            ))}
          </nav>
          <SceneBackdrop />
          <div className="projection-spill" aria-hidden="true" />
          <div className="projection-frame">
            <div className="screen" ref={screen}>
              <section id="cover" data-panel className="shot title-shot" aria-labelledby="cover-heading">
                <h1 id="cover-heading" tabIndex={-1}>{name}</h1>
                <p className="cover-role">{role}</p>
                <div className="actions flex flex-wrap justify-center">
                  {hash !== null && <button className="primary" type="button" onClick={start}>
                    <span aria-hidden="true">▶ </span>{copy.play}
                  </button>}
                  <a href="#experience" onClick={(event) => followChapter(event, "experience")}>{copy.viewExperience}</a>
                </div>
              </section>
              {children}
            </div>
          </div>
        </div>
        <figcaption className="controls flex flex-wrap justify-center">
          <nav className="chapter-links flex flex-wrap justify-center gap-2" aria-label={copy.navigation}>
            <a href="#cover" aria-current={hash !== null && panel === "cover" ? "location" : undefined}
              onClick={(event) => followChapter(event, "cover")}>{copy.cover}</a>
            {chapters.map((chapter) => (
              <a key={chapter} href={`#${chapter}`} aria-current={hash !== null && panel === chapter ? "location" : undefined}
                onClick={(event) => followChapter(event, chapter)}>{copy.labels[chapter]}</a>
            ))}
          </nav>
          {!reduced && status !== "reading" && (
            <div className="transport flex flex-wrap justify-center gap-2" role="group" aria-label={copy.playback}>
              <button type="button" onClick={togglePlayback}>{playbackLabel}</button>
            </div>
          )}
          <p className="sr-only" role="status">{audioUnavailable && status === "playing" ? copy.silentNote : ""}</p>
        </figcaption>
      </figure>
    </main>
  );
}
