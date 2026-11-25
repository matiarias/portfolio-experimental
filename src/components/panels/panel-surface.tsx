"use client";

import { useId, useRef, type ReactNode, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
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
  const programmaticCloses = useRef(0);
  const titleId = useId();

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
    if (dialog.open) return;
    dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const origin = originRef.current;
    let from: gsap.TweenVars = { scale: 0.965 };
    if (origin?.hash === hash && origin.trigger.isConnected && origin.trigger.getClientRects().length) {
      gsap.registerPlugin(Flip);
      const fit = Flip.fit(surface, origin.trigger, { scale: true, getVars: true }) as
        { x?: number; y?: number; scaleX?: number; scaleY?: number } | null;
      if (fit && Number.isFinite(fit.x) && Number.isFinite(fit.y) &&
          Number.isFinite(fit.scaleX) && Number.isFinite(fit.scaleY)) {
        from = { x: fit.x, y: fit.y, scaleX: fit.scaleX, scaleY: fit.scaleY };
      }
    }
    gsap.from(surface, { ...from, opacity: 0, duration: 0.34, ease: "power2.out", clearProps: "transform,opacity" });
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
        <h1 className="chapter-title" id={titleId}>{title}</h1>
        {children}
      </article>
    </dialog>
  );
}
