"use client";

import { useEffect, useRef, useState } from "react";
import { FiPause, FiPlay } from "react-icons/fi";
import type { Dictionary } from "@/content/portfolio";
import type { Soundtrack } from "@/content/soundtrack";

export default function SoundtrackControl({ track, labels, suspended }: {
  track: Soundtrack;
  labels: Dictionary["soundtrack"];
  suspended: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [requested, setRequested] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const pause = () => {
      if (!audio.paused) audio.pause();
    };
    const onVisibility = () => {
      if (document.hidden) pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", pause);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", pause);
      pause();
    };
  }, []);

  useEffect(() => {
    if (suspended && audioRef.current && !audioRef.current.paused) audioRef.current.pause();
  }, [suspended]);

  function onPause() {
    setRequested(false);
    setPlaying(false);
  }

  function onError() {
    onPause();
    setFailed(true);
  }

  function toggle() {
    const audio = audioRef.current;
    if (!audio || suspended || document.hidden) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    setFailed(false);
    setRequested(true);
    // Set the URL and call play inside the gesture, including on iOS.
    if (!audio.hasAttribute("src") || audio.error) audio.src = track.src;
    void audio.play().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (audioRef.current === audio && audio.paused) onError();
    });
  }

  const Icon = requested ? FiPause : FiPlay;
  return (
    <div className="hud-soundtrack">
      <audio
        ref={audioRef}
        preload="none"
        loop
        onPlaying={() => setPlaying(true)}
        onPause={onPause}
        onError={onError}
      />
      <button
        type="button"
        className="hud-soundtrack-toggle"
        aria-label={requested ? labels.pause : labels.play}
        title={requested ? labels.pause : labels.play}
        data-playing={playing}
        onClick={toggle}
      >
        <Icon aria-hidden="true" />
      </button>
      <div role="status" className="hud-soundtrack-status">
        {failed && <span className="hud-soundtrack-error">{labels.error}</span>}
      </div>
      {playing && track.title && <span className="hud-soundtrack-title">{track.title}</span>}
    </div>
  );
}
