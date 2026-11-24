const rows = [
  { y: 90, windows: [70, 197, 324, 451, 578] },
  { y: 246, windows: [70, 197, 324] },
] as const;

export default function Tower() {
  return (
    <>
      <defs>
        <linearGradient id="tower-concrete" x2="0" y2="1">
          <stop stopColor="#415261" /><stop offset="1" stopColor="#1b2535" />
        </linearGradient>
        <linearGradient id="tower-glass" x2=".2" y2="1">
          <stop stopColor="#7ca8a7" /><stop offset=".42" stopColor="#355c70" /><stop offset="1" stopColor="#172d43" />
        </linearGradient>
        <linearGradient id="tower-warm" x2=".2" y2="1">
          <stop stopColor="#c8a47b" /><stop offset="1" stopColor="#485567" />
        </linearGradient>
        <pattern id="tower-panel" width="38" height="32" patternUnits="userSpaceOnUse">
          <path d="M0 0h38v32" fill="none" stroke="#91aeb7" opacity=".15" />
        </pattern>
      </defs>
      <path d="M44 28h699v372H44Z" fill="url(#tower-concrete)" />
      <path d="M44 28h699v372H44Z" fill="url(#tower-panel)" />
      <path d="M33 19h722v27H33Zm12 195h700v20H45Z" fill="#1b2634" />
      <path d="M45 45h700m-700 168h700m-700 21h700" stroke="#6b9ca8" strokeWidth="2" opacity=".64" />
      {rows.map(({ y, windows }) => windows.map((x, i) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`} data-window="">
          <rect x="-4" y="-5" width="108" height="111" fill="#131d2c" />
          <rect width="100" height="101" fill={i === 1 || i === 4 ? "url(#tower-warm)" : "url(#tower-glass)"} />
          <path d="M0 18h100M51 0v101M0 86h100" stroke="#213543" strokeWidth="4" />
          <path d="M5 8h90M8 24h84" stroke="#e0e9d1" opacity=".65" strokeWidth="2" />
          <path d="m10 73 20-26 17-9v9L10 83Zm49-4 25-28 11-6v9L59 80Z" fill="#c6ebde" opacity=".16" />
          <path d="M-8 101h116v6H-8Z" fill="#768798" />
        </g>
      )))}
      <path d="M474 249h220v133H474Z" fill="#283647" stroke="#597180" strokeWidth="2" />
      <path d="M495 269h177m-177 94h177" stroke="#728a91" strokeWidth="1" opacity=".45" />
      <path d="M484 259v114m201-114v114" stroke="#101b2a" strokeWidth="2" opacity=".45" />
      <path d="M711 235v142h35" fill="none" stroke="#121c2b" strokeWidth="8" />
      <path d="M54 365h83v31H54Z" fill="#677481" stroke="#252b39" strokeWidth="2" />
      <circle cx="76" cy="380" r="11" fill="#344050" stroke="#99a4a5" strokeWidth="2" />
      <path d="M76 371v18m-9-9h18m30-8h16m-16 5h16m-16 5h16m-16 5h16" stroke="#1c2736" strokeWidth="2" />
    </>
  );
}
