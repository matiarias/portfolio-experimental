import type { MouseEvent } from "react";

/** Un click normal, sin modificadores. Los modificadores conservan el comportamiento del navegador. */
export function isRegularClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
