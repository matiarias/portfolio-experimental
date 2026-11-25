"use client";

import type { RefObject } from "react";
import { FiBookOpen } from "react-icons/fi";
import { chapters, type Dictionary, type Locale } from "@/content/portfolio";
import { stops, type StopId } from "@/content/scene";
import { progressForStop } from "@/lib/alley-engine";
import { isRegularClick } from "@/lib/is-regular-click";
import LocaleLinks from "./locale-links";

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
        <h1 className="hud-brand">
          <a
            href="#content"
            onClick={(event) => {
              if (!isRegularClick(event)) return;
              event.preventDefault();
              onNavigate("entrance");
            }}
          >
            Matias Arias
          </a>
        </h1>

        <nav className="hud-nav" aria-label={copy.navigation}>
          {chapters.map((chapter) => {
            const stop = stops.find((entry) => entry.id === chapter);
            if (!stop) return null;
            return (
              <a
                key={chapter}
                href={stop.hash}
                aria-current={activeStop === chapter ? "location" : undefined}
                onClick={(event) => {
                  if (!isRegularClick(event)) return;
                  event.preventDefault();
                  onNavigate(chapter);
                }}
              >
                {stop.label[locale]}
              </a>
            );
          })}
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
