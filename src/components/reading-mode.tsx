import { aboutStack, name, role, type Dictionary } from "@/content/portfolio";
import ChapterPanels from "./chapter-panels";

/**
 * Vista apilada y sin animación. Es el modo lectura, el fallback de
 * `prefers-reduced-motion` y la vista que se muestra sin JavaScript.
 */
export default function ReadingMode({ copy }: { copy: Dictionary }) {
  return (
    <div className="reading-shell">
      <header className="reading-hero">
        <p className="reading-eyebrow">{copy.alley}</p>
        <p className="reading-name">{name}</p>
        <p className="reading-role">{role}</p>
        <p className="reading-stack">{aboutStack}</p>
      </header>
      <ChapterPanels copy={copy} />
    </div>
  );
}
