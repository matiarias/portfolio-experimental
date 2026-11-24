/**
 * Gato de la escena. En esta fase es un SVG estático que fija proporciones,
 * posición y paleta. La Fase 3 lo convierte en un rig animado con GSAP.
 */
export default function Cat() {
  return (
    <div className="alley-cat" aria-hidden="true">
      <svg viewBox="0 0 128 96" role="presentation" focusable="false">
        <defs>
          <linearGradient id="cat-fur" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e6ecf6" />
            <stop offset="1" stopColor="#b7c1d4" />
          </linearGradient>
        </defs>

        <ellipse className="cat-shadow" cx="64" cy="89" rx="40" ry="5" />

        <path className="cat-tail" d="M34 64C20 64 11 52 14 34" />
        <path className="cat-tail-stripe" d="M19 53l7 2M15 43l7 1M15 33l7 0" />

        <rect className="cat-leg" x="40" y="70" width="7" height="17" rx="3" />
        <rect className="cat-leg" x="52" y="71" width="7" height="16" rx="3" />

        <ellipse className="cat-body" cx="62" cy="62" rx="30" ry="17" />
        <path className="cat-stripe" d="M48 48c4 3 8 4 13 4M44 56c5 3 10 4 16 4M46 65c5 2 10 3 15 3" />

        <rect className="cat-leg" x="76" y="70" width="7" height="17" rx="3" />
        <rect className="cat-leg" x="86" y="69" width="7" height="18" rx="3" />

        <rect className="cat-paw" x="39" y="84" width="9" height="5" rx="2.5" />
        <rect className="cat-paw" x="51" y="84" width="9" height="5" rx="2.5" />
        <rect className="cat-paw" x="75" y="84" width="9" height="5" rx="2.5" />
        <rect className="cat-paw" x="85" y="84" width="9" height="5" rx="2.5" />

        <g className="cat-head">
          <path className="cat-ear" d="M83 34l3-13 10 8z" />
          <path className="cat-ear" d="M103 32l9-9 2 14z" />
          <circle className="cat-head-fill" cx="96" cy="44" r="15" />
          <ellipse className="cat-muzzle" cx="104" cy="49" rx="8" ry="6" />
          <path className="cat-nose" d="M105 45l3 2-3 2-3-2z" />
          <ellipse className="cat-eye" cx="91" cy="41" rx="3.2" ry="4" />
          <ellipse className="cat-eye" cx="100" cy="41" rx="3.2" ry="4" />
          <ellipse className="cat-pupil" cx="91" cy="41" rx="1.1" ry="3" />
          <ellipse className="cat-pupil" cx="100" cy="41" rx="1.1" ry="3" />
          <path className="cat-whisker" d="M108 47l12-3M108 50l12 1M108 53l11 5" />
        </g>
      </svg>
    </div>
  );
}
