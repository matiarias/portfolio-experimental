"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onChange = () => listener();
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
}

function getSnapshot() {
  return window.location.hash;
}

/** Snapshot de servidor: sin hash, para que el primer render coincida con el HTML. */
function getServerSnapshot() {
  return "";
}

/**
 * `pushState` y `replaceState` no disparan `hashchange`. Después de cambiar la
 * URL hay que avisar a los suscriptores para que la parada activa se actualice.
 */
export function notifyHashChange() {
  for (const listener of listeners) listener();
}

export function useHash(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
