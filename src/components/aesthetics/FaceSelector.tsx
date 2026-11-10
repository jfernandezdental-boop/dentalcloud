'use client';
import React from 'react';
import { ZONES, type Shape, type ZoneCode } from '@/lib/aesthetics';

type Props = {
  view: 'front' | 'lateral';
  selected: ReadonlySet<ZoneCode>;
  onToggle: (code: ZoneCode) => void;
};

export default function FaceSelector({ view, selected, onToggle }: Props) {
  const zones = ZONES.filter((z) => z.view === view || z.view === 'both');
  return (
    <div className="relative mx-auto w-full max-w-xs">
      <svg viewBox="0 0 100 100" className="w-full rounded-2xl border border-border bg-muted/30">
        {/* silueta simple */}
        <ellipse cx="50" cy="50" rx="32" ry="42" fill="#f5e6d3" stroke="#d4b896" strokeWidth="0.5" />
        {zones.map((z) => {
          const active = selected.has(z.code);
          const common = {
            key: z.code,
            onClick: () => onToggle(z.code),
            className: 'cursor-pointer transition-opacity',
            style: { opacity: active ? 0.85 : 0.35 },
            fill: active ? '#0d9488' : '#94a3b8',
            stroke: active ? '#0f766e' : '#64748b',
            strokeWidth: 0.6,
          } as const;
          if (z.shape === 'rect') {
            return (
              <rect
                {...common}
                x={z.cx - z.rx}
                y={z.cy - z.ry}
                width={z.rx * 2}
                height={z.ry * 2}
                rx={2}
              />
            );
          }
          return <ellipse {...common} cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry} />;
        })}
      </svg>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {zones.map((z) => (
          <li key={z.code}>
            <button
              type="button"
              onClick={() => onToggle(z.code)}
              className={`rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors ${
                selected.has(z.code)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {z.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
