'use client';
import React from 'react';
import { Surface, ToothState } from '@/lib/odontogram';

interface ToothProps {
  number: number;
  state: ToothState | undefined;
  size: number;
  selected: boolean;
  onApply: (tooth: number, surface?: Surface) => void;
  onHover: (n: number | null) => void;
}

const colorOf = (v: 'caries' | 'obturado' | undefined) =>
  v === 'caries' ? 'var(--tooth-red)' : v === 'obturado' ? 'var(--tooth-blue)' : 'var(--card)';

const surfaces: { id: Surface; d: string }[] = [
  { id: 'V', d: 'M1 1H39L28 12H12Z' },
  { id: 'D', d: 'M39 1V39L28 28V12Z' },
  { id: 'L', d: 'M39 39H1L12 28H28Z' },
  { id: 'M', d: 'M1 39V1L12 12V28Z' },
  { id: 'O', d: 'M12 12H28V28H12Z' },
];

function ToothComponent({ number, state, size, selected, onApply, onHover }: ToothProps) {
  const s = state?.surfaces ?? {};
  const marks = state?.marks ?? [];
  const has = (id: string) => marks.includes(id as never);
  const red = 'var(--tooth-red)';
  const blue = 'var(--tooth-blue)';
  const dark = 'var(--tooth-line)';
  const crossColor = has('extraccion-indicada') ? red : has('perdida-caries') ? blue : null;

  return (
    <div
      className="flex shrink-0 flex-col items-center gap-0.5"
      style={{ width: size + 4 }}
      onMouseEnter={() => onHover(number)}
      onMouseLeave={() => onHover(null)}
    >
      <span
        className={`tabular h-4 w-full rounded text-center text-[10px] font-semibold leading-4 ${
          selected ? 'bg-primary text-primary-foreground' : state?.note ? 'bg-warning/20 text-foreground' : 'text-muted-foreground'
        }`}
      >
        {number}
      </span>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        role="group"
        aria-label={`Pieza ${number}`}
        className="block overflow-visible"
        style={{ width: size, height: size }}
      >
        {selected && <rect x="-2" y="-2" width="44" height="44" rx="4" fill="none" stroke="var(--primary)" strokeWidth="2" pointerEvents="none" />}

        {surfaces.map((sf) => (
          <path
            key={`${number}-${sf.id}`}
            d={sf.d}
            fill={colorOf(s[sf.id])}
            stroke={dark}
            strokeWidth="1.6"
            strokeLinejoin="round"
            className="tooth-surface"
            onClick={() => onApply(number, sf.id)}
          >
            <title>{`Pieza ${number} · superficie ${sf.id}`}</title>
          </path>
        ))}

        <g pointerEvents="none" stroke={dark} strokeWidth="1.2" fill="none">
          <path d="M1 1L12 12M39 1L28 12M39 39L28 28M1 39L12 28" />
        </g>

        <g pointerEvents="none">
          {has('sellante-necesario') && <rect x="16" y="5" width="8" height="30" rx="4" fill="none" stroke={red} strokeWidth="2.4" />}
          {has('sellante-realizado') && <rect x="16" y="5" width="8" height="30" rx="4" fill="none" stroke={blue} strokeWidth="2.4" />}
          {has('perdida-otra') && <rect x="14" y="4" width="12" height="32" rx="5" fill="none" stroke={dark} strokeWidth="2.6" />}
          {crossColor && <path d="M3 3L37 37M37 3L3 37" stroke={crossColor} strokeWidth="3" strokeLinecap="round" />}
          {has('endodoncia-por-realizar') && <path d="M20 4L36 35H4Z" fill="none" stroke={red} strokeWidth="2.4" strokeLinejoin="round" />}
          {has('endodoncia-realizada') && <path d="M20 4L36 35H4Z" fill="none" stroke={dark} strokeWidth="2.4" strokeLinejoin="round" />}
          {has('corona-indicada') && <circle cx="20" cy="20" r="6" fill={red} />}
          {has('corona-realizada') && <circle cx="20" cy="20" r="6" fill={dark} />}
          {has('protesis-fija-indicada') && <path d="M0 20H40" stroke={red} strokeWidth="2.4" strokeDasharray="5 3" />}
          {has('protesis-fija-realizada') && <path d="M0 20H40" stroke={dark} strokeWidth="2.4" strokeDasharray="5 3" />}
          {has('protesis-removible-indicada') && <path d="M0 20H40" stroke={red} strokeWidth="2.2" strokeDasharray="2 3" />}
          {has('protesis-removible-realizada') && <path d="M0 20H40" stroke={dark} strokeWidth="2.2" strokeDasharray="2 3" />}
          {has('protesis-total-indicada') && <path d="M0 16H40M0 24H40" stroke={red} strokeWidth="2.4" />}
          {has('protesis-total-realizada') && <path d="M0 16H40M0 24H40" stroke={dark} strokeWidth="2.4" />}
          {has('ausente') && <text x="20" y="28" textAnchor="middle" fontSize="26" fontWeight="800" fill={dark}>A</text>}
        </g>
      </svg>
    </div>
  );
}

const Tooth = React.memo(ToothComponent);
export default Tooth;