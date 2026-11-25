import { describe, expect, it } from "vitest";
import { stopIds } from "@/content/scene";
import {
  anchorXFor,
  clampX,
  facadeAtAnchor,
  maxTravel,
  progressForStop,
  progressToX,
  segmentAt,
  stopAt,
  xForStop,
  type Layout,
} from "./alley-engine";

const layout: Layout = {
  viewportW: 1000,
  streetW: 5000,
  anchorX: anchorXFor(1000),
  stopCenter: { entrance: 500, about: 1500, experience: 2500, contact: 3500 },
};

const anchored = (stop: (typeof stopIds)[number]) => layout.stopCenter[stop] + xForStop(stop, layout);

describe("alley engine", () => {
  it("exposes a facade from its near edge to its far edge, not just its center", () => {
    const facades = [
      { stop: "entrance", left: 40, right: 740 },
      { stop: "about", left: 800, right: 1500 },
    ] as const;
    expect(facadeAtAnchor(380, -359, facades)).toBe("entrance");
    expect(facadeAtAnchor(380, -360, facades)).toBeNull();
    expect(facadeAtAnchor(380, -420, facades)).toBe("about");
    expect(facadeAtAnchor(380, -760, facades)).toBe("about");
    expect(facadeAtAnchor(380, -1119, facades)).toBe("about");
    expect(facadeAtAnchor(380, -1120, facades)).toBeNull();
  });

  it("anchors the later storefronts on the cat", () => {
    for (const stop of stopIds) {
      if (stop === "entrance") continue;
      expect(anchored(stop)).toBeCloseTo(layout.anchorX, 6);
    }
  });

  it("keeps the entrance at the CSS origin even if its center differs from the anchor", () => {
    expect(progressToX(0, layout)).toBe(0);
    expect(progressToX(0.1, layout)).toBe(0);
  });

  it("keeps the street still during dwells", () => {
    expect(progressToX(0, layout)).toBeCloseTo(xForStop("entrance", layout), 6);
    expect(progressToX(0.1, layout)).toBeCloseTo(xForStop("entrance", layout), 6);
    expect(progressToX(0.26, layout)).toBeCloseTo(xForStop("about", layout), 6);
    expect(progressToX(0.4, layout)).toBeCloseTo(xForStop("about", layout), 6);
    expect(progressToX(0.65, layout)).toBeCloseTo(xForStop("experience", layout), 6);
    expect(progressToX(1, layout)).toBeCloseTo(xForStop("contact", layout), 6);
  });

  it("eases the walk between two stops", () => {
    const start = xForStop("entrance", layout);
    const end = xForStop("about", layout);
    expect(progressToX(0.18, layout)).toBeCloseTo((start + end) / 2, 6);
  });

  it("never moves forward when scrolling forward", () => {
    let previous = progressToX(0, layout);
    for (let progress = 0.001; progress <= 1; progress += 0.001) {
      const current = progressToX(progress, layout);
      expect(current).toBeLessThanOrEqual(previous + 1e-9);
      previous = current;
    }
  });

  it("stays inside the scrollable range", () => {
    for (let progress = -0.5; progress <= 1.5; progress += 0.05) {
      const x = progressToX(progress, layout);
      expect(x).toBeGreaterThanOrEqual(-maxTravel(layout));
      expect(x).toBeLessThanOrEqual(0);
    }
  });

  it("does not scroll when the street fits the viewport", () => {
    const tight: Layout = { ...layout, streetW: 800 };
    expect(maxTravel(tight)).toBe(0);
    expect(clampX(-500, tight)).toBe(0);
    expect(progressToX(0.5, tight)).toBe(0);
  });

  it("resolves the active stop, pointing at the destination while walking", () => {
    expect(stopAt(0)).toBe("entrance");
    expect(stopAt(0.05)).toBe("entrance");
    expect(stopAt(0.15)).toBe("about");
    expect(stopAt(0.33)).toBe("about");
    expect(stopAt(0.5)).toBe("experience");
    expect(stopAt(0.8)).toBe("contact");
    expect(stopAt(1)).toBe("contact");
  });

  it("reports whether a segment is a walk", () => {
    expect(segmentAt(0.18)).toMatchObject({ from: "entrance", to: "about", walking: true });
    expect(segmentAt(0.18).t).toBeCloseTo(0.5, 6);
    expect(segmentAt(0.33)).toMatchObject({ from: "about", to: "about", walking: false });
    expect(segmentAt(-1)).toMatchObject({ from: "entrance", to: "entrance" });
    expect(segmentAt(2)).toMatchObject({ from: "contact", to: "contact" });
  });

  it("maps each stop to the middle of its dwell", () => {
    expect(progressForStop("entrance")).toBeCloseTo(0.05, 6);
    expect(progressForStop("about")).toBeCloseTo(0.33, 6);
    expect(progressForStop("experience")).toBeCloseTo(0.65, 6);
    expect(progressForStop("contact")).toBeCloseTo(0.95, 6);
  });
});
