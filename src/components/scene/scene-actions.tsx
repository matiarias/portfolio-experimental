"use client";

import { createContext, useContext, useLayoutEffect, useRef, type ReactNode } from "react";
import type { StopId } from "@/content/scene";
import type { PanelHash } from "@/lib/alley-location";

export const SceneActions = createContext<{
  availableStop: StopId | null;
  open: (hash: PanelHash, trigger: HTMLButtonElement) => void;
} | null>(null);

export function focusStopLink(stop: StopId) {
  document.querySelector<HTMLElement>(`.hud-nav a[href="#${stop}"]`)?.focus({ preventScroll: true });
}

export function SceneHotspots({ stop, children }: { stop: StopId; children: ReactNode }) {
  const active = useContext(SceneActions)?.availableStop === stop;
  const groupRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const group = groupRef.current;
    const viewport = group?.closest(".alley-stage-viewport");
    if (!active || !group || !viewport) return;

    const buttons = [...group.querySelectorAll("button")];
    function setVisible(button: HTMLButtonElement, visible: boolean) {
      if (!visible && document.activeElement === button) focusStopLink(stop);
      button.disabled = !visible;
      if (visible) button.removeAttribute("aria-hidden");
      else button.setAttribute("aria-hidden", "true");
    }

    const visibleThreshold = 0.999;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const button = entry.target as HTMLButtonElement;
        const visible = entry.isIntersecting && entry.intersectionRatio >= visibleThreshold;
        setVisible(button, visible);
      }
    }, { root: viewport, threshold: [visibleThreshold] });

    buttons.forEach((button) => {
      setVisible(button, false);
      observer.observe(button);
    });
    return () => {
      observer.disconnect();
      buttons.forEach((button) => setVisible(button, false));
    };
  }, [active, stop]);

  return <div className="scene-hotspots" hidden={!active} ref={groupRef}>{children}</div>;
}

export function SceneButton({ hash, children, className, label }: {
  hash: PanelHash;
  children: ReactNode;
  className: string;
  label: string;
}) {
  const actions = useContext(SceneActions);
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      aria-haspopup="dialog"
      aria-hidden="true"
      onClick={(event) => actions?.open(hash, event.currentTarget)}
    >
      {children}
    </button>
  );
}
