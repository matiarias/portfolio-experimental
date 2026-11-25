export default function Ramen() {
  return (
    <>
      <defs>
        <linearGradient id="ramen-timber" x2="0" y2="1">
          <stop stopColor="#583037" /><stop offset=".57" stopColor="#311c29" /><stop offset="1" stopColor="#171723" />
        </linearGradient>
        <linearGradient id="ramen-interior" x2="0" y2="1">
          <stop stopColor="#9d4d37" /><stop offset=".48" stopColor="#e9a660" /><stop offset="1" stopColor="#4f2725" />
        </linearGradient>
        <linearGradient id="ramen-curtain" x2="0" y2="1">
          <stop stopColor="#49293d" /><stop offset="1" stopColor="#a1394e" />
        </linearGradient>
        <radialGradient id="ramen-glow">
          <stop stopColor="#fa644e" stopOpacity=".56" /><stop offset="1" stopColor="#fa644e" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M37 88h724v312H37Z" fill="url(#ramen-timber)" />
      <path d="M109 122h577v241H109Z" fill="#241421" stroke="#100e17" strokeWidth="12" />
      <path d="M126 140h543v165H126Z" fill="url(#ramen-interior)" />
      <path d="M126 230h543m-543 36h543" stroke="#63342d" strokeWidth="8" />
      <path d="M157 218h20v10h-20zm33 2h22v8h-22zm31-4h20v12h-20zm84 34h28v11h-28zm90-2h25v13h-25zm74-29h24v9h-24zm50-3h20v12h-20z" fill="#fee0ac" opacity=".75" />
      <path d="M122 293h550v17H122Z" fill="#8d5041" />
      <path d="M118 306h558v65H118Z" fill="#30202a" />
      <path d="M128 318h539m-539 13h539m-539 13h539m-539 13h539" stroke="#ad6e54" opacity=".33" />
      <path d="M15 103 76 60h642l66 43-8 21H23Z" fill="#361e33" />
      <path d="M29 106h739" stroke="#8c4b56" strokeWidth="3" />
      <path d="M83 80h630M62 93h675" stroke="#df9671" opacity=".23" strokeWidth="2" />
      <path d="M133 145h533" stroke="#d09878" strokeWidth="7" />
      {[138, 245, 352, 459, 566].map((x, i) => (
        <g key={x} transform={`translate(${x} 149)`}>
          <path d="M1 0h96l-3 65Q58 73 0 66Z" fill="url(#ramen-curtain)" />
          <path d="M4 4v60m88-60v59" stroke="#d07570" opacity=".45" />
          {i === 2 && <path d="M36 32q12 12 24 0m-24 8q12 12 24 0m-24 8q12 12 24 0" fill="none" stroke="#f3c18a" strokeWidth="2" />}
        </g>
      ))}
      {[86, 709].map((x) => (
        <g key={x} transform={`translate(${x} 154)`}>
          <ellipse cy="28" rx="64" ry="69" fill="url(#ramen-glow)" />
          <path d="M0-34v17" stroke="#281724" strokeWidth="5" />
          <rect x="-20" y="-15" width="40" height="59" rx="15" fill="#ec6857" stroke="#ff9969" strokeWidth="2" />
          <path d="M-17 0h34m-37 13h40m-37 13h34M-11-17h22m-22 63h22" stroke="#862e38" strokeWidth="3" />
        </g>
      ))}
      {[203, 332, 466, 597].map((x) => (
        <g key={x} transform={`translate(${x} 347)`}>
          <path d="m-13 0-8 51m34-51 8 51m-37-17h32" stroke="#a97964" strokeWidth="5" />
          <ellipse rx="28" ry="8" fill="#9b4e46" /><ellipse cy="-3" rx="27" ry="5" fill="#ce825e" />
        </g>
      ))}
      <path d="M442 265q-14-12 1-23t-2-23m23 46q20-18 5-31m24 29q-10-9 0-22" fill="none" stroke="#ffe0b9" strokeWidth="2" strokeLinecap="round" opacity=".59" />
      <g fill="none" stroke="#171522" strokeWidth="4">
        <circle cx="674" cy="375" r="22" /><circle cx="750" cy="375" r="22" />
        <path d="m674 375 28-4 28-31h-42l-14 35m28-4-20-41m40 3 28 42m-20-35 1-19h13m-70 9h17" />
      </g>
      <path d="m674 374 28-4 28-31h-42l-14 35" fill="none" stroke="#b79484" strokeWidth="1.4" />
      <path d="M27 399h744" stroke="#78646d" strokeWidth="3" />
    </>
  );
}
