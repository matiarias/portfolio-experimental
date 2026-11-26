"use client";

import type { RefObject } from "react";
import { FiBookOpen } from "react-icons/fi";
import type { Dictionary, Locale } from "@/content/portfolio";
import { soundtrack } from "@/content/soundtrack";
import { stops, type StopId } from "@/content/scene";
import { progressForStop } from "@/lib/alley-engine";
import { isRegularClick } from "@/lib/is-regular-click";
import LocaleLinks from "./locale-links";
import SoundtrackControl from "./soundtrack-control";

type Props = {
  locale: Locale;
  copy: Dictionary;
  activeStop: StopId;
  suffix: string;
  reading: boolean;
  reduced: boolean;
  barRef: RefObject<HTMLDivElement | null>;
  onNavigate: (stop: StopId) => void;
  onToggleReading: () => void;
};

export default function Hud({
  locale,
  copy,
  activeStop,
  suffix,
  reading,
  reduced,
  barRef,
  onNavigate,
  onToggleReading,
}: Props) {
  return (
    <>
      <header className="alley-hud">
        <nav className="hud-nav" aria-label={copy.navigation}>
          {stops.map((stop) => (
            <a
              key={stop.id}
              href={stop.id === "entrance" ? "#content" : stop.hash}
              aria-current={activeStop === stop.id ? "location" : undefined}
              onClick={(event) => {
                if (!isRegularClick(event)) return;
                event.preventDefault();
                onNavigate(stop.id);
              }}
            >
              {stop.label[locale]}
            </a>
          ))}
        </nav>

        <div className="hud-tools">
          <LocaleLinks locale={locale} suffix={suffix} label={copy.language} />

          <button
            type="button"
            className="hud-reading"
            aria-pressed={reading}
            aria-label={copy.reading}
            disabled={reduced}
            onClick={onToggleReading}
          >
            <FiBookOpen aria-hidden="true" />
            <span>{copy.reading}</span>
          </button>
          {!reading && soundtrack && (
            <SoundtrackControl track={soundtrack} labels={copy.soundtrack} />
          )}
        </div>
      </header>

      {!reading && (
        <div className="alley-progress" aria-hidden="true">
          <span className="alley-progress-fill" ref={barRef} />
          {stops.map((stop) => (
            <span
              key={stop.id}
              className="alley-progress-dot"
              style={{ left: `${progressForStop(stop.id) * 100}%` }}
            />
          ))}
        </div>
      )}
    </>
  );
}
