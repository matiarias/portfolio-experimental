import { projectById, stops, type StopId } from "@/content/scene";

export type PanelHash = "#about/details" | "#contact/details" | `#experience/${string}`;

export function stopFromHash(hash: string): StopId | null {
  if (hash.startsWith("#experience/")) return "experience";
  if (hash === "#about/details") return "about";
  if (hash === "#contact/details") return "contact";
  return stops.find((stop) => stop.hash === hash)?.id ?? null;
}

export function projectHash(id: string): `#experience/${string}` {
  return `#experience/${id}`;
}

export function panelFromLocation(hash: string): PanelHash | null {
  if (hash === "#about/details" || hash === "#contact/details") return hash;
  const prefix = "#experience/";
  if (!hash.startsWith(prefix)) return null;
  const project = projectById("en", hash.slice(prefix.length));
  return project ? projectHash(project.id) : null;
}
