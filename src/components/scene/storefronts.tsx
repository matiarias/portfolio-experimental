import type { CSSProperties } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { dictionaries, name, role, type Locale } from "@/content/portfolio";
import { projectsFor, stops, type StopId } from "@/content/scene";
import { projectHash } from "@/lib/alley-location";
import Entrance from "./facades/entrance";
import PhoneBooth from "./facades/phone-booth";
import Ramen from "./facades/ramen";
import Tower from "./facades/tower";
import { towerRows } from "./facades/tower-layout";
import NeonSign from "./neon-sign";
import { SceneButton, SceneHotspots } from "./scene-actions";

const facades = {
  entrance: Entrance,
  about: Ramen,
  experience: Tower,
  contact: PhoneBooth,
};

const place = (x: number, y: number, width: number, height: number): CSSProperties => ({
  "--hit-x": `${x / 8}%`,
  "--hit-y": `${y / 4}%`,
  "--hit-w": `${width / 8}%`,
  "--hit-h": `${height / 4}%`,
} as CSSProperties);

function Hotspots({ stop, locale }: { stop: Exclude<StopId, "entrance">; locale: Locale }) {
  const copy = dictionaries[locale].scene;
  if (stop !== "experience") {
    const about = stop === "about";
    const label = about ? copy.aboutAction : copy.contactAction;
    return (
      <SceneHotspots stop={stop}>
        <SceneButton hash={about ? "#about/details" : "#contact/details"} label={label} className="facade-plaque">
          {label}<FiArrowUpRight aria-hidden="true" />
        </SceneButton>
      </SceneHotspots>
    );
  }

  const projects = projectsFor(locale);
  const firstProjects = projects.filter(({ id }) => id.endsWith("-0"));
  return (
    <SceneHotspots stop="experience">
      <p className="tower-instruction">{copy.experienceHint}</p>
      {projects.map((project, index) => {
        const row = towerRows[project.floor];
        const column = Number(project.id.split("-")[1]);
        return (
          <SceneButton
            key={project.id}
            hash={projectHash(project.id)}
            label={project.title}
            className="tower-window"
            style={place(row.windows[column], row.y, 100, 101)}
            floor={project.floor}
            project={project.id}
          >
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}<FiArrowUpRight /></span>
            <span className="window-caption" aria-hidden="true">{project.title}</span>
          </SceneButton>
        );
      })}
      <section className="tower-timeline" aria-label={copy.timeline} style={place(474, 236, 246, 164)}>
        <p>{copy.timeline}</p>
        <ol>
          {[...firstProjects].reverse().map((project) => (
            <li key={project.id}>
              <SceneButton
                hash={projectHash(project.id)}
                label={`${project.period}: ${project.title}`}
                className="timeline-stop"
                floor={project.floor}
              >
                {project.period}<FiArrowUpRight aria-hidden="true" />
              </SceneButton>
            </li>
          ))}
        </ol>
      </section>
    </SceneHotspots>
  );
}

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
        <div className="storefront-sign" aria-hidden="true">
          <div className="storefront-sign-plate">
            <NeonSign stop={stop.id} />
            <span className="storefront-label" translate={entrance ? "no" : undefined}>
              {entrance ? name : stop.label[locale]}
            </span>
            {entrance && <span className="storefront-role">{role}</span>}
            {stop.id === "experience" && <span className="storefront-role">2023 — 2026</span>}
          </div>
        </div>
        <div className="storefront-building">
          <svg className="storefront-art" viewBox="0 0 800 400" preserveAspectRatio="none" focusable="false" aria-hidden="true">
            <Facade />
          </svg>
          {stop.id !== "entrance" && <Hotspots stop={stop.id} locale={locale} />}
        </div>
      </div>
    );
  });
}
