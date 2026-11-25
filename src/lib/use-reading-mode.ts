"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Preferencia de lectura persistida.
 *
 * `null` significa "automático": con movimiento reducido se abre el modo
 * lectura; sin él, la escena. La preferencia explícita del usuario gana.
 */
export type ReadingPreference = "scene" | "reading" | null;

const STORAGE_KEY = "alley:reading";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): ReadingPreference {
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "reading" || value === "scene" ? value : null;
}

/** Snapshot de servidor: siempre automático, para no romper la hidratación. */
function getServerSnapshot(): ReadingPreference {
  return null;
}

export function setReadingPreference(value: ReadingPreference) {
  if (value === null) window.localStorage.removeItem(STORAGE_KEY);
  else window.localStorage.setItem(STORAGE_KEY, value);
  for (const listener of listeners) listener();
}

export function useReadingMode() {
  const preference = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setPreference = useCallback((value: ReadingPreference) => setReadingPreference(value), []);
  return [preference, setPreference] as const;
}
