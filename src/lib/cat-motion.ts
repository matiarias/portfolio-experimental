export const CAT_MOTION = {
  walkSpeed: 0.045,
  runSpeed: 1.45,
  sitDelay: 1_150,
  sleepDelay: 10_000,
  petDuration: 1_300,
} as const;

export type Gait = {
  velocity: number;
  stride: number;
  phase: number;
  direction: 1 | -1;
};

export const stillGait: Gait = { velocity: 0, stride: 0, phase: 0, direction: 1 };

export function easePose(from: number, to: number, rate: number, seconds: number) {
  const next = to + (from - to) * Math.exp(-rate * seconds);
  return Math.abs(next - to) < 0.002 ? to : next;
}

/** Travel is in viewport widths per frame; positive travel means walking right. */
export function advanceGait(gait: Gait, travel: number, seconds: number): Gait {
  const rawSpeed = travel / Math.max(seconds, 0.001);
  const velocity = easePose(gait.velocity, rawSpeed, 16, seconds);
  const speed = Math.abs(velocity);
  const targetStride = speed < CAT_MOTION.walkSpeed ? 0 : Math.min(1, 0.44 + speed * 0.39);
  const stride = easePose(gait.stride, targetStride, 14, seconds);
  const direction = speed >= CAT_MOTION.walkSpeed ? (velocity < 0 ? -1 : 1) : gait.direction;
  const phase = travel === 0
    ? gait.phase
    : (gait.phase + Math.min(4.5 * seconds, Math.abs(travel) * 9)) % 1;
  return { velocity, stride, phase, direction };
}
