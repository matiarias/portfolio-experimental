import Image from "next/image";
import { useRef, type PointerEvent } from "react";
import styles from "./scene-backdrop.module.css";

const lights = [
  ["tower", styles.tower, styles.towerLight],
  ["lantern", styles.lantern, styles.lanternLight],
  ["bridge", styles.bridge, styles.bridgeLight],
  ["river", styles.river, styles.riverLight],
] as const;

const reedStems = ["outer", "left", "midleft", "center", "midright", "right", "inner"];

export default function SceneBackdrop() {
  const touch = useRef<{ id: number; start: number; zone: HTMLElement | null } | null>(null);

  function startTouch(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch" || !event.isPrimary ||
      !window.matchMedia("(max-width: 800px) and (prefers-reduced-motion: no-preference)").matches) return;

    const zone = event.target instanceof Element
      ? event.target.closest<HTMLElement>("[data-scene-zone]") : null;
    touch.current = { id: event.pointerId, start: event.clientX, zone };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = "";
    if (zone) zone.dataset.touched = "";
  }

  function moveTouch(event: PointerEvent<HTMLDivElement>) {
    if (touch.current?.id !== event.pointerId) return;
    const shift = Math.max(-8, Math.min(8, (event.clientX - touch.current.start) * .14));
    event.currentTarget.style.setProperty("--touch-shift", `${shift}px`);
  }

  function endTouch(event: PointerEvent<HTMLDivElement>) {
    if (touch.current?.id !== event.pointerId) return;
    if (touch.current.zone) delete touch.current.zone.dataset.touched;
    touch.current = null;
    delete event.currentTarget.dataset.dragging;
    event.currentTarget.style.removeProperty("--touch-shift");
  }

  return (
    <div className={`backdrop ${styles.backdrop}`} aria-hidden="true">
      <div className={styles.plate} onPointerDown={startTouch} onPointerMove={moveTouch}
        onPointerUp={endTouch} onPointerCancel={endTouch} onLostPointerCapture={endTouch}>
        <Image className="room" src="/media/ciudad-nocturna-asimetrica.webp" alt="" fill unoptimized preload />
        {lights.map(([name, zone, light]) => (
          <div key={name} className={`${styles.zone} ${zone}`} data-scene-zone={name}>
            <span className={`${styles.light} ${light}`} data-scene-light={name} />
          </div>
        ))}
        <div className={`${styles.zone} ${styles.reeds}`} data-scene-zone="reeds">
          <span className={styles.reedCluster} data-scene-reeds>
            {reedStems.map((stem) => <span key={stem} className={styles.reed} />)}
            <span className={styles.dew} data-scene-dew>
              <span /><span /><span />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
