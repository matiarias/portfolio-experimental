export default function PhoneBooth() {
  return (
    <>
      <defs>
        <linearGradient id="phone-wall" x2="0" y2="1">
          <stop stopColor="#393a52" /><stop offset="1" stopColor="#1e2235" />
        </linearGradient>
        <linearGradient id="phone-glass" x2="0" y2="1">
          <stop stopColor="#a7c9a8" /><stop offset=".35" stopColor="#4d8b80" /><stop offset="1" stopColor="#214450" />
        </linearGradient>
        <linearGradient id="phone-vending" x2="0" y2="1">
          <stop stopColor="#b78d92" /><stop offset=".5" stopColor="#76394d" /><stop offset="1" stopColor="#49283f" />
        </linearGradient>
        <pattern id="phone-blocks" width="82" height="34" patternUnits="userSpaceOnUse">
          <path d="M0 0h82m0 17H0m21-17v17m41 0v17" fill="none" stroke="#0e1727" strokeWidth="2" opacity=".5" />
        </pattern>
      </defs>
      <path d="M18 106h756v294H18Z" fill="url(#phone-wall)" />
      <path d="M18 106h756v294H18Z" fill="url(#phone-blocks)" />
      <path d="M19 106h756m-754 25h752" stroke="#66586d" strokeWidth="3" opacity=".8" />
      <path d="M89 124v211q0 17 18 17h57m523-226v195q0 14 15 14h31" fill="none" stroke="#151a2a" strokeWidth="8" />
      <path d="M183 71h249v329H183Z" fill="#285c5b" stroke="#101e29" strokeWidth="6" />
      <path d="M169 63h277v45H169Z" fill="#367b70" stroke="#345e59" strokeWidth="4" />
      <path d="M185 78h246v16H185Z" fill="#d9eec7" />
      <path d="M297 81q3 9 13 9l4-3-6-3-3 2-4-5 1-2-3-2Z" fill="#23544d" />
      <path d="M202 114h210v231H202Z" fill="url(#phone-glass)" />
      <path d="M212 347h189v51H212Z" fill="#203c46" />
      <path d="M347 113v231m-145-75h210" stroke="#2a5b59" strokeWidth="7" />
      <path d="m211 227 117-106h16v12L211 251Zm145 1 49-46v16l-49 46Z" fill="#d4f3cb" opacity=".18" />
      <path d="M254 194h55v52h-55Z" fill="#28554c" stroke="#a1ba97" strokeWidth="2" />
      <path d="M279 202h22v15h-22Zm0 22h17v12h-17Z" fill="#afd7a3" />
      <path d="M267 201v37q-12 19 7 28q22-12 27-20" fill="none" stroke="#1b302e" strokeWidth="4" />
      <path d="M386 281v31" stroke="#daefce" strokeWidth="4" />
      <rect x="461" y="171" width="167" height="229" rx="7" fill="url(#phone-vending)" stroke="#1b162a" strokeWidth="5" />
      <path d="M478 185h132v97H478Z" fill="#b5c3cc" />
      <path d="M484 191h121v84H484Z" fill="#353c59" />
      {[198, 226, 254].map((y) => (
        <g key={y} transform={`translate(491 ${y})`}>
          <path d="M0 2h11v17H0Zm26 1h11v16H26Zm25-2h11v18H51Zm26 3h11v15H77Zm26-3h10v18h-10Z" fill="#d6d4b7" />
          <path d="M0 7h11v8H0Zm26-2h11v8H26Zm25 2h11v8H51Zm26 2h11v7H77Zm26-1h10v8h-10Z" fill="#be677e" />
          <path d="M-7 20h121" stroke="#eef2d9" opacity=".6" />
        </g>
      ))}
      <path d="M492 322h76v27h-76Z" fill="#292538" stroke="#b37280" strokeWidth="3" />
      <path d="M582 298h25v36h-25Z" fill="#252a3e" /><path d="M587 304h15v5h-15Z" fill="#d6dcaf" />
      <path d="M661 358h64l-11 41h-44Z" fill="#574150" />
      <path d="M692 357Q661 330 676 290q27 32 16 67 7-58 40-69 12 29-40 69-9-26-40-24 8 25 40 24" fill="#456860" stroke="#789078" />
      <path d="M20 399h755" stroke="#767686" strokeWidth="3" />
    </>
  );
}
