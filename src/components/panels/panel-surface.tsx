"use client";

import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import type { PanelHash } from "@/lib/alley-location";

export type PanelOrigin = { hash: PanelHash; trigger: HTMLElement };

export default function PanelSurface({
  hash, title, tone, close, languageLinks, originRef, onDismiss, children,
}: {
  hash: PanelHash | null;
  title: string;
  tone: "about" | "experience" | "contact";
  close: string;
  languageLinks: ReactNode;
  originRef: RefObject<PanelOrigin | null>;
  onDismiss: (hash: PanelHash) => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const surfaceRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const programmaticCloses = useRef(0);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    const body = bodyRef.current;
    if (!dialog || !body) return;

    const remaining = (target: EventTarget | null, delta: number) => {
      if (!(target instanceof Node) || !body.contains(target)) return 0;
      return delta < 0 ? body.scrollTop : body.scrollHeight - body.clientHeight - body.scrollTop;
    };

    const wheel = (event: WheelEvent) => {
      if (!event.cancelable || event.ctrlKey || !event.deltaY) return;
      const available = remaining(event.target, event.deltaY);
      if (available <= 1) {
        event.preventDefault();
      } else if (event.deltaMode === WheelEvent.DOM_DELTA_PIXEL && Math.abs(event.deltaY) > available) {
        // WebKit can chain the excess delta to the page at the scroll boundary.
        body.scrollTop += Math.sign(event.deltaY) * available;
        event.preventDefault();
      }
    };

    let touchY: number | undefined;
    function touchStart(event: TouchEvent) {
      touchY = event.touches.length === 1 ? event.touches[0].clientY : undefined;
    }
    function touchMove(event: TouchEvent) {
      if (event.touches.length !== 1 || touchY === undefined) return;
      const nextY = event.touches[0].clientY;
      const delta = touchY - nextY;
      touchY = nextY;
      if (event.cancelable && delta && remaining(event.target, delta) <= 1) event.preventDefault();
    }

    dialog.addEventListener("wheel", wheel, { passive: false });
    dialog.addEventListener("touchstart", touchStart, { passive: true });
    dialog.addEventListener("touchmove", touchMove, { passive: false });
    return () => {
      dialog.removeEventListener("wheel", wheel);
      dialog.removeEventListener("touchstart", touchStart);
      dialog.removeEventListener("touchmove", touchMove);
    };
  }, []);

  useGSAP(() => {
    const dialog = dialogRef.current;
    const surface = surfaceRef.current;
    if (!dialog || !surface) return;
    if (!hash) {
      if (dialog.open) {
        programmaticCloses.current += 1;
        dialog.close();
      }
      return;
    }
    const wasOpen = dialog.open;
    if (!wasOpen) dialog.showModal();
    const body = bodyRef.current;
    const target = Array.from(body?.querySelectorAll<HTMLElement>("[data-panel-anchor]") ?? [])
      .find((item) => item.dataset.panelAnchor === hash.slice(1));
    body?.scrollTo(0, 0);
    if (body && target) {
      // Only scroll the dialog body; the alley stays at its current position.
      body.scrollTop = target.getBoundingClientRect().top - body.getBoundingClientRect().top - 12;
    }
    (target ?? closeRef.current)?.focus({ preventScroll: true });
    if (wasOpen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const origin = originRef.current;
    let from: gsap.TweenVars = { scale: 0.965 };
    if (origin?.hash === hash && origin.trigger.isConnected) {
      const trigger = origin.trigger.getBoundingClientRect();
      const panel = surface.getBoundingClientRect();
      if (trigger.width && trigger.height && panel.width && panel.height) {
        // The surface's transform origin is its top-left corner.
        from = {
          x: trigger.left - panel.left,
          y: trigger.top - panel.top,
          scaleX: trigger.width / panel.width,
          scaleY: trigger.height / panel.height,
        };
      }
    }
    const tween = gsap.from(surface, { ...from, opacity: 0, duration: 0.34, ease: "power2.out", clearProps: "transform,opacity" });
    // GSAP's lag smoothing stretches short tweens when frames stall, which can turn this
    // entrance into a multi-second crawl on a busy main thread. Cap it on wall-clock time.
    const settle = window.setTimeout(() => {
      if (tween.isActive()) tween.progress(1);
    }, 400);
    tween.eventCallback("onComplete", () => window.clearTimeout(settle));
    return () => window.clearTimeout(settle);
  }, { dependencies: [hash], revertOnUpdate: true });

  return (
    <dialog
      className="chapter-dialog"
      data-tone={tone}
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={(event) => {
        // A queued close from Back may arrive after Forward has opened the dialog again.
        if (programmaticCloses.current > 0) {
          programmaticCloses.current -= 1;
          return;
        }
        if (hash && !event.currentTarget.open) onDismiss(hash);
      }}
    >
      <article className="chapter-surface" ref={surfaceRef}>
        <header className="chapter-toolbar">
          {languageLinks}
          <form method="dialog"><button type="submit" className="chapter-close" ref={closeRef}>{close}</button></form>
        </header>
        <div className="chapter-body" ref={bodyRef} role="region" aria-labelledby={titleId} tabIndex={0}>
          <h1 className="chapter-title" id={titleId}>{title}</h1>
          {children}
        </div>
      </article>
    </dialog>
  );
}
