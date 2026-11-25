import { aboutStack, name, type Dictionary } from "@/content/portfolio";
import ChapterPanels from "./chapter-panels";

/**
 * Vista apilada y sin animación. Es el modo lectura, el fallback de
 * `prefers-reduced-motion` y la vista que se muestra sin JavaScript.
 */
export default function ReadingMode({ copy }: { copy: Dictionary }) {
  return (
    <div className="reading-shell">
      <header className="reading-hero">
        <h1 className="reading-name" tabIndex={-1}>{name}</h1>
        <p className="reading-role">{copy.headline}</p>
        <p className="reading-stack">{aboutStack}</p>
        <p className="about-sector">{copy.aboutSector}</p>
      </header>
      <ChapterPanels copy={copy} />
    </div>
  );
}
