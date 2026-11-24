export default function Entrance() {
  return (
    <>
      <defs>
        <linearGradient id="gate-steel" x2="0" y2="1">
          <stop stopColor="#535052" /><stop offset=".28" stopColor="#292b35" /><stop offset="1" stopColor="#111622" />
        </linearGradient>
        <linearGradient id="gate-wall" x2="0" y2="1">
          <stop stopColor="#4a3842" /><stop offset="1" stopColor="#191c2a" />
        </linearGradient>
        <radialGradient id="gate-light">
          <stop stopColor="#ffbe65" stopOpacity=".48" /><stop offset="1" stopColor="#ffbe65" stopOpacity="0" />
        </radialGradient>
        <pattern id="gate-slats" width="12" height="13" patternUnits="userSpaceOnUse">
          <path d="M0 0h12" stroke="#10141e" strokeWidth="4" /><path d="M0 3h12" stroke="#fbdac4" opacity=".18" />
        </pattern>
        <pattern id="gate-tile" width="31" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 0h31v20" fill="none" stroke="#120f1c" strokeWidth="2" />
        </pattern>
      </defs>
      <path d="M20 53h755v347H20Z" fill="url(#gate-wall)" />
      <path d="M20 53h755v347H20Z" fill="url(#gate-tile)" opacity=".58" />
      <path d="M36 85h702v28H36Z" fill="#12131d" />
      <path d="M43 92h684" stroke="#b77648" strokeWidth="2" />
      <path d="M55 115h567v285H55Z" fill="#090e17" />
      <path d="M72 129h534v243H72Z" fill="url(#gate-steel)" />
      <path d="M72 129h534v243H72Z" fill="url(#gate-slats)" />
      <path d="M338 129v246" stroke="#191723" strokeWidth="5" />
      <path d="M311 287v27m52-27v27" stroke="#af9a88" strokeWidth="5" />
      <path d="M72 373h534v27H72Z" fill="#202431" />
      <path d="M641 217h82v183h-82Z" fill="#161825" stroke="#705258" strokeWidth="4" />
      <path d="M654 234h56v62h-56Z" fill="#282e3d" />
      <path d="m660 289 43-47m-32 48 32-35" stroke="#d5b5a1" opacity=".18" strokeWidth="3" />
      <path d="M654 320h14" stroke="#b79572" strokeWidth="4" />
      <ellipse cx="366" cy="176" rx="302" ry="149" fill="url(#gate-light)" />
      <path d="M255 111h203" stroke="#f59c5c" strokeWidth="9" opacity=".55" />
      <path d="M256 111h200" stroke="#ffe4ac" strokeWidth="3" />
      <path d="M759 70v303q0 15-16 15h-18" fill="none" stroke="#100f19" strokeWidth="9" />
      <path d="M20 399h755" stroke="#71707a" strokeWidth="3" />
    </>
  );
}
