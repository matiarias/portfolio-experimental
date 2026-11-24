import type { RefObject } from "react";

const legs = {
  "back-near": [43, 67],
  "back-far": [55, 67],
  "front-near": [87, 67],
  "front-far": [80, 66],
} as const;

function Leg({ name }: { name: keyof typeof legs }) {
  const [x, y] = legs[name];
  return (
    <g data-cat-part={name}>
      <path className="cat-leg" d={`M${x - 4} ${y}q4-4 8 0l-1 16q-2 4-6 2Z`} />
      <ellipse className="cat-paw" cx={x + 1} cy="86" rx="4.5" ry="3.1" />
    </g>
  );
}

type Props = {
  rootRef: RefObject<HTMLDivElement | null>;
  petLabel: string;
  petFeedback: string;
  onPet: () => void;
};

export default function Cat({ rootRef, petLabel, petFeedback, onPet }: Props) {
  return (
    <div className="alley-cat" data-cat-state="idle" ref={rootRef}>
      <svg viewBox="0 0 128 96" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="cat-fur" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--cat-fur-light)" />
            <stop offset="1" stopColor="var(--cat-fur-dark)" />
          </linearGradient>
        </defs>
        <ellipse className="cat-shadow" cx="64" cy="89" rx="40" ry="5" />
        <g data-cat-part="facing">
          <g data-cat-part="hind-legs">
            <Leg name="back-far" />
            <Leg name="back-near" />
          </g>
          <Leg name="front-far" />
          <g data-cat-part="body">
            <g data-cat-part="tail">
              <path className="cat-tail" d="M35 64Q20 65 15 48" />
              <path className="cat-tail-stripe" d="m19 56 5-3m3 9 4-5" />
              <g data-cat-part="tail-tip">
                <path className="cat-tail" d="M15 48Q12 38 16 30" />
                <path className="cat-tail-stripe" d="m12 42 5-1m-4-8 5 2" />
              </g>
            </g>
            <g data-cat-part="haunch" opacity="0">
              <path className="cat-body" d="M28 67q9-20 23-16 15 5 10 26-6 7-22 7-17 0-11-17Z" />
              <path className="cat-stripe" d="M32 62q8-2 15 2m-17 4q8-2 11 1" />
              <ellipse className="cat-paw" cx="53" cy="83" rx="8" ry="3" />
            </g>
            <ellipse className="cat-body" cx="62" cy="62" rx="30" ry="17" />
            <path className="cat-stripe" d="M48 48c4 3 8 4 13 4M44 56c5 3 8 4 13 4M46 65c5 2 10 3 15 3" />
            <g data-cat-part="head">
              <path className="cat-ear" d="M83 34l3-13 10 8z" />
              <path className="cat-ear" d="M103 32l9-9 2 14z" />
              <path fill="#c59ea7" d="m86 31 2-7 5 5m14 2 4-4 1 6" />
              <circle className="cat-head-fill" cx="96" cy="44" r="15" />
              <ellipse className="cat-muzzle" cx="104" cy="49" rx="8" ry="6" />
              <path className="cat-nose" d="M105 45l3 2-3 2-3-2z" />
              <g data-cat-part="open-eyes">
                <ellipse className="cat-eye" cx="92.2" cy="41" rx="3.5" ry="4.2" />
                <ellipse className="cat-eye" cx="101" cy="40.7" rx="3.05" ry="4" />
                <g data-cat-part="pupils">
                  <ellipse className="cat-pupil" cx="92.9" cy="41" rx="1.05" ry="2.5" />
                  <ellipse className="cat-pupil" cx="101.65" cy="40.7" rx="1" ry="2.4" />
                </g>
              </g>
              <path data-cat-part="closed-eyes" opacity="0" d="M89.2 41q3 4 6 0m3.2-.3q2.6 3.6 5.2 0" fill="none" stroke="#364252" strokeWidth="1.5" strokeLinecap="round" />
              <path className="cat-whisker" d="M108 47l12-3M108 50l12 1M108 53l11 5" />
            </g>
          </g>
          <Leg name="front-near" />
        </g>
      </svg>
      <button className="cat-pet" type="button" aria-label={petLabel} onClick={onPet} />
      <span className="sr-only" role="status" data-cat-feedback data-message={petFeedback} />
    </div>
  );
}
