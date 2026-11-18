import { chapters, type Chapter, type Panel } from "@/content/portfolio";

export const chapterDurations = { about: 11_000, experience: 15_000, contact: 6_000 } satisfies Record<Chapter, number>;

export type Playback =
  | { status: "reading"; panel: Panel }
  | { status: "playing"; panel: Chapter; deadline: number }
  | { status: "paused"; panel: Chapter; remaining: number }
  | { status: "finished"; panel: "contact" };

export type PlaybackAction =
  | { type: "browse"; panel: Panel }
  | { type: "play" | "pause" | "resume" | "advance"; now: number };

export function playbackReducer(state: Playback | null, action: PlaybackAction): Playback | null {
  switch (action.type) {
    case "browse":
      return { status: "reading", panel: action.panel };
    case "play":
      return { status: "playing", panel: "about", deadline: action.now + chapterDurations.about };
    case "pause":
      if (state?.status !== "playing") return state;
      return { status: "paused", panel: state.panel, remaining: Math.max(0, state.deadline - action.now) };
    case "resume":
      if (state?.status !== "paused") return state;
      return { status: "playing", panel: state.panel, deadline: action.now + state.remaining };
    case "advance": {
      if (state?.status !== "playing" || action.now < state.deadline) return state;
      const panel = chapters[chapters.indexOf(state.panel) + 1];
      return panel
        ? { status: "playing", panel, deadline: action.now + chapterDurations[panel] }
        : { status: "finished", panel: "contact" };
    }
  }
}
