import { describe, expect, it } from "vitest";
import { locales } from "./portfolio";
import { keyframes, projectById, projectsFor, stopById, stopIds, stops } from "./scene";

describe("scene manifest", () => {
  it("declares one storefront per stop", () => {
    expect(stops.map((stop) => stop.id)).toEqual([...stopIds]);
    expect(new Set(stopIds).size).toBe(stopIds.length);
  });

  it("keeps every storefront bilingual and labelled", () => {
    for (const stop of stops) {
      expect(stop.hash).toBe(`#${stop.id}`);
      expect(stop.kanji.length).toBeGreaterThan(0);
      for (const locale of locales) {
        expect(stop.label[locale].trim().length).toBeGreaterThan(0);
      }
    }
    expect(stopById("experience")).toMatchObject({ id: "experience", hash: "#experience" });
  });

  it("orders keyframes from 0 to 1 without going back", () => {
    expect(keyframes[0].p).toBe(0);
    expect(keyframes[keyframes.length - 1].p).toBe(1);
    for (let index = 1; index < keyframes.length; index += 1) {
      expect(keyframes[index].p).toBeGreaterThan(keyframes[index - 1].p);
      expect(stopIds).toContain(keyframes[index].stop);
    }
  });

  it("derives eight windows from the experience content", () => {
    for (const locale of locales) {
      const projects = projectsFor(locale);
      expect(projects).toHaveLength(8);
      expect(projects.map((project) => project.floor)).toEqual([0, 0, 0, 0, 0, 1, 1, 1]);
      expect(new Set(projects.map((project) => project.id)).size).toBe(8);
      expect(projects.every((project) => project.title && project.body && project.period)).toBe(true);
    }
  });

  it("keeps project ids stable across locales", () => {
    const english = projectsFor("en").map((project) => project.id);
    const spanish = projectsFor("es").map((project) => project.id);
    expect(spanish).toEqual(english);
    expect(english[0]).toBe("0-0");
    expect(projectById("es", "1-2")).toMatchObject({ id: "1-2", floor: 1 });
    expect(projectById("es", "9-9")).toBeUndefined();
  });
});
