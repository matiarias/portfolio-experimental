import { kanjiPaths } from "@/content/kanji-paths";
import type { StopId } from "@/content/scene";

export default function NeonSign({ stop }: { stop: StopId }) {
  const { d, width } = kanjiPaths[stop];
  const glyphId = `neon-glyph-${stop}`;
  const haloId = `neon-halo-${stop}`;

  return (
    <span className="neon-sign" lang="ja" aria-hidden="true">
      <svg viewBox={`0 0 ${width} 1000`} width={width} height={1000} focusable="false">
        <defs>
          <path id={glyphId} d={d} />
          <filter id={haloId} x="-20%" y="-30%" width="140%" height="160%">
            <feGaussianBlur stdDeviation="120" />
          </filter>
        </defs>
        <use className="neon-glow" href={`#${glyphId}`} filter={`url(#${haloId})`} />
        <use className="neon-tube" href={`#${glyphId}`} />
      </svg>
    </span>
  );
}
