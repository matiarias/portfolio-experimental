import { gsap } from "gsap";
import { advanceGait, CAT_MOTION, easePose, stillGait } from "@/lib/cat-motion";

type Rest = "idle" | "sit" | "sleep" | "lookUp" | "pet";

export function animateCat(root: HTMLDivElement, wake: () => void) {
  const rig = gsap.utils.selector(root);
  const viewport = root.parentElement;
  const button = root.querySelector<HTMLButtonElement>(".cat-pet");
  const feedback = root.querySelector<HTMLElement>("[data-cat-feedback]");
  const part = (name: string) => rig(`[data-cat-part="${name}"]`);
  const bodyY = gsap.quickSetter(part("body"), "y", "px");
  const headRotation = gsap.quickSetter(part("head"), "rotation", "deg");
  const tailRotation = gsap.quickSetter(part("tail"), "rotation", "deg");
  const tailTipRotation = gsap.quickSetter(part("tail-tip"), "rotation", "deg");
  const facingX = gsap.quickSetter(part("facing"), "scaleX");
  const foreleg = ["front-far", "front-near"].map((name) => gsap.quickSetter(part(name), "rotation", "deg"));
  const hindleg = ["back-near", "back-far"].map((name) => gsap.quickSetter(part(name), "rotation", "deg"));
  const hindOpacity = gsap.quickSetter(part("hind-legs"), "opacity");
  const haunchOpacity = gsap.quickSetter(part("haunch"), "opacity");
  const openEyes = gsap.quickSetter(part("open-eyes"), "opacity");
  const closedEyes = gsap.quickSetter(part("closed-eyes"), "opacity");
  const pupilsX = gsap.quickSetter(part("pupils"), "x", "px");
  const pupilsY = gsap.quickSetter(part("pupils"), "y", "px");

  // These pivots are in viewBox coordinates, independent of the responsive SVG size.
  const pivots = {
    facing: "64 64", head: "87 57", tail: "34 64", "tail-tip": "15 48",
    "front-far": "80 66", "front-near": "87 67", "back-near": "43 67", "back-far": "55 67",
  };
  for (const [name, svgOrigin] of Object.entries(pivots)) {
    gsap.set(part(name), { svgOrigin });
  }

  let gait = stillGait;
  let rest: Rest = "idle";
  let moving = false;
  let bounds: DOMRect | undefined;
  let timer: number | undefined;
  let state = "idle";
  let facing = 1;
  let seat = 0;
  let tuck = 0;
  let tilt = 0;
  let shut = 0;
  let gazeX = 0;
  let gazeY = 0;
  let aimX = 0;
  let aimY = 0;

  function scheduleRest() {
    window.clearTimeout(timer);
    if (document.hidden || moving || rest === "pet" || rest === "sleep" || rest === "lookUp") return;
    timer = window.setTimeout(() => {
      rest = rest === "sit" ? "sleep" : "sit";
      wake();
      scheduleRest();
    }, rest === "sit" ? CAT_MOTION.sleepDelay - CAT_MOTION.sitDelay : CAT_MOTION.sitDelay);
  }

  function pet() {
    if (document.hidden || moving || rest === "pet") return;
    window.clearTimeout(timer);
    rest = "pet";
    if (feedback) feedback.textContent = feedback.dataset.message ?? "";
    wake();
    timer = window.setTimeout(() => {
      rest = "sit";
      if (feedback) feedback.textContent = "";
      scheduleRest();
      wake();
    }, CAT_MOTION.petDuration);
  }

  function leave() {
    aimX = 0;
    aimY = 0;
    if (rest === "lookUp") {
      rest = "idle";
      scheduleRest();
    }
    if (gazeX || gazeY || tilt) wake();
  }

  function point(event: PointerEvent) {
    if (event.pointerType !== "mouse" || document.hidden) return;
    const rect = bounds ??= root.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (event.clientY - rect.top - rect.height * 0.56) / rect.height;
    if (Math.abs(x) > 2.25 || Math.abs(y) > 2.1) {
      leave();
      return;
    }
    aimX = gsap.utils.clamp(-1.15, 1.15, x * 1.9);
    aimY = gsap.utils.clamp(-1.25, 1.25, y * 1.45);
    const lookingUp = Math.abs(x) < 1.35 && y < -0.32;
    if (!moving && rest !== "pet") {
      if (lookingUp) rest = "lookUp";
      else if (rest === "sleep") rest = "sit";
      else if (rest === "lookUp") rest = "idle";
      scheduleRest();
    }
    wake();
  }

  const remeasure = () => { bounds = undefined; };

  function visibility() {
    window.clearTimeout(timer);
    aimX = 0;
    aimY = 0;
    if (rest === "pet" || rest === "lookUp") rest = "idle";
    if (feedback) feedback.textContent = "";
    if (!document.hidden) {
      remeasure();
      scheduleRest();
      wake();
    }
  }

  viewport?.addEventListener("pointermove", point, { passive: true });
  viewport?.addEventListener("pointerleave", leave);
  document.addEventListener("visibilitychange", visibility);
  scheduleRest();

  return {
    pet,
    remeasure,
    advance(dt: number, travel: number) {
      if (document.hidden) return false;
      gait = advanceGait(gait, travel, dt);
      const speed = Math.abs(gait.velocity);
      const nowMoving = speed >= CAT_MOTION.walkSpeed;
      if (moving !== nowMoving) {
        moving = nowMoving;
        if (moving) button?.setAttribute("aria-disabled", "true");
        else button?.removeAttribute("aria-disabled");
        rest = "idle";
        if (feedback) feedback.textContent = "";
        scheduleRest();
      }

      const next = moving ? (speed >= CAT_MOTION.runSpeed ? "run" : "walk") : rest;
      if (next !== state) {
        state = next;
        root.dataset.catState = state;
      }

      const sitTarget = rest === "sit" || rest === "sleep" || rest === "pet" ? 1 : 0;
      const tuckTarget = rest === "sleep" ? 1 : 0;
      const shutTarget = rest === "sleep" || rest === "pet" ? 1 : 0;
      const tiltTarget = rest === "lookUp" ? -22 : rest === "pet" ? -12 : rest === "sleep" ? 21 : 0;
      const glance = !moving && !shutTarget;
      const xTarget = glance ? aimX * gait.direction : 0;
      const yTarget = glance ? aimY : 0;
      seat = easePose(seat, sitTarget, 10, dt);
      tuck = easePose(tuck, tuckTarget, 8, dt);
      shut = easePose(shut, shutTarget, 14, dt);
      tilt = easePose(tilt, tiltTarget, 12, dt);
      facing = easePose(facing, gait.direction, 24, dt);
      gazeX = easePose(gazeX, xTarget, 22, dt);
      gazeY = easePose(gazeY, yTarget, 22, dt);

      const cycle = gait.phase * Math.PI * 2;
      const swing = Math.sin(cycle) * gait.stride;
      facingX(facing);
      foreleg[0](swing * 25 + seat * 7 + tuck * 36);
      foreleg[1](-swing * 30 - seat * 5 - tuck * 23);
      hindleg[0](swing * 29 - seat * 32);
      hindleg[1](-swing * 24 + seat * 29);
      hindOpacity(1 - seat);
      haunchOpacity(seat);
      bodyY(seat * 3 + tuck * 10 - Math.abs(swing) * 3.5);
      headRotation(tilt + swing * 5);
      tailRotation(seat * -19 + tuck * -12 + swing * 16);
      tailTipRotation(seat * -19 + tuck * -10 + Math.sin(cycle - 0.7) * gait.stride * 21);
      openEyes(1 - shut);
      closedEyes(shut);
      pupilsX(gazeX);
      pupilsY(gazeY);

      return gait.stride !== 0 || gait.velocity !== 0 || seat !== sitTarget ||
        tuck !== tuckTarget || shut !== shutTarget || tilt !== tiltTarget ||
        facing !== gait.direction || gazeX !== xTarget || gazeY !== yTarget;
    },
    destroy() {
      window.clearTimeout(timer);
      viewport?.removeEventListener("pointermove", point);
      viewport?.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
    },
  };
}
