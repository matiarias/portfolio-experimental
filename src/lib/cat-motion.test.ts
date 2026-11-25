import { describe, expect, it } from "vitest";
import { advanceGait, CAT_MOTION, easePose, stillGait, type Gait } from "./cat-motion";

const frame = 1 / 60;

function travel(gait: Gait, velocity: number, frames: number) {
  for (let index = 0; index < frames; index++) {
    gait = advanceGait(gait, velocity * frame, frame);
  }
  return gait;
}

describe("cat gait", () => {
  it("keeps the pose still during a dwell", () => {
    expect(travel(stillGait, 0, 60)).toEqual(stillGait);
  });

  it("builds a stride as the street moves and increases it at running speed", () => {
    const walk = travel(stillGait, 0.3, 25);
    const run = travel(walk, 2, 25);
    expect(walk.velocity).toBeGreaterThan(CAT_MOTION.walkSpeed);
    expect(walk.velocity).toBeLessThan(CAT_MOTION.runSpeed);
    expect(run.velocity).toBeGreaterThan(CAT_MOTION.runSpeed);
    expect(run.stride).toBeGreaterThan(walk.stride);
    expect(run.stride).toBeLessThanOrEqual(1);
  });

  it("brakes without adding footsteps and remembers the reverse direction", () => {
    const walking = travel(stillGait, -0.6, 25);
    const paused = travel(walking, 0, 90);
    expect(walking.direction).toBe(-1);
    expect(paused.phase).toBe(walking.phase);
    expect(paused).toMatchObject({ velocity: 0, stride: 0, direction: -1 });
  });

  it("eases at the same rate across frame rates and converges exactly", () => {
    const split = easePose(easePose(0, 1, 10, frame), 1, 10, frame);
    expect(split).toBeCloseTo(easePose(0, 1, 10, frame * 2));
    expect(easePose(0.999, 1, 10, frame)).toBe(1);
  });
});
