import type { CSSProperties } from "react";
import { name, role, type Locale } from "@/content/portfolio";
import { stops } from "@/content/scene";
import Entrance from "./facades/entrance";
import PhoneBooth from "./facades/phone-booth";
import Ramen from "./facades/ramen";
import Tower from "./facades/tower";
import NeonSign from "./neon-sign";

const facades = {
  entrance: Entrance,
  about: Ramen,
  experience: Tower,
  contact: PhoneBooth,
};

export default function Storefronts({ locale }: { locale: Locale }) {
  return stops.map((stop) => {
    const Facade = facades[stop.id];
    const entrance = stop.id === "entrance";

    return (
      <div
        key={stop.id}
        className="storefront"
        data-stop={stop.id}
        style={{ "--neon": `var(--neon-${stop.neon})` } as CSSProperties}
      >
        <div className="storefront-sign">
          <div className="storefront-sign-plate">
            <NeonSign stop={stop.id} />
            <span className="storefront-label" translate={entrance ? "no" : undefined}>
              {entrance ? name : stop.label[locale]}
            </span>
            {entrance && <span className="storefront-role">{role}</span>}
            {stop.id === "experience" && <span className="storefront-role">2023 — 2026</span>}
          </div>
        </div>
        <svg className="storefront-art" viewBox="0 0 800 400" preserveAspectRatio="none" focusable="false" aria-hidden="true">
          <Facade />
        </svg>
      </div>
    );
  });
}
