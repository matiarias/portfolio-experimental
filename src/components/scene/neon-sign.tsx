import { kanjiPaths } from "@/content/kanji-paths";
import type { StopId } from "@/content/scene";

export default function NeonSign({ stop }: { stop: StopId }) {
  const { d, width } = kanjiPaths[stop];

  return (
    <span className="neon-sign" lang="ja" aria-hidden="true">
      <svg viewBox={`0 0 ${width} 1000`} width={width} height="1000" focusable="false">
        <path d={d} />
      </svg>
    </span>
  );
}
