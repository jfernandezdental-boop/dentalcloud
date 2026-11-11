'use client';
import React, { useState } from 'react';
import { ZONES, type ZoneCode } from '@/lib/aesthetics';

type Props = {
  selected: ReadonlySet<ZoneCode>;
  onToggle: (code: ZoneCode) => void;
};

type ViewId = 'left' | 'front' | 'right';
type Box = { left: number; top: number; w: number; h: number };

const VIEWS: { id: ViewId; label: string; src: string; width: number; height: number }[] = [
  { id: 'left', label: 'Perfil izquierdo', src: '/aesthetics/face-left.png', width: 488, height: 464 },
  { id: 'front', label: 'Frente', src: '/aesthetics/face-front.png', width: 447, height: 455 },
  { id: 'right', label: 'Perfil derecho', src: '/aesthetics/face-right.png', width: 470, height: 466 },
];

const HITS: Record<ViewId, Partial<Record<ZoneCode, Box[]>>> = {
  front: {
    frente: [{ left: 28, top: 9, w: 44, h: 13 }],
    glabela: [{ left: 44, top: 23, w: 12, h: 14 }],
    patas_gallo: [
      { left: 17, top: 32, w: 11, h: 16 },
      { left: 72, top: 32, w: 11, h: 16 },
    ],
    lineas_nasales: [
      { left: 39, top: 40, w: 10, h: 12 },
      { left: 51, top: 40, w: 10, h: 12 },
    ],
    labio_superior: [{ left: 41, top: 60.5, w: 18, h: 8 }],
    menton: [{ left: 39, top: 75, w: 22, h: 11 }],
    maseteros: [
      { left: 22, top: 58, w: 13, h: 17 },
      { left: 65, top: 58, w: 13, h: 17 },
    ],
    platisma: [{ left: 36, top: 87, w: 28, h: 11 }],
  },
  left: {
    frente: [{ left: 55, top: 11, w: 22, h: 16 }],
    glabela: [{ left: 72, top: 31, w: 12, h: 12 }],
    patas_gallo: [{ left: 56, top: 32, w: 12, h: 15 }],
    lineas_nasales: [{ left: 78, top: 42, w: 9, h: 12 }],
    labio_superior: [{ left: 77, top: 64.5, w: 11, h: 7 }],
    menton: [{ left: 69, top: 79, w: 14, h: 11 }],
    maseteros: [{ left: 42, top: 54, w: 18, h: 22 }],
    platisma: [{ left: 50, top: 87, w: 20, h: 11 }],
  },
  right: {
    frente: [{ left: 24, top: 11, w: 22, h: 16 }],
    glabela: [{ left: 16, top: 32, w: 11, h: 11 }],
    patas_gallo: [{ left: 33, top: 32, w: 11, h: 15 }],
    lineas_nasales: [{ left: 14, top: 42, w: 9, h: 12 }],
    labio_superior: [{ left: 13, top: 64.5, w: 11, h: 7 }],
    menton: [{ left: 18, top: 79, w: 14, h: 11 }],
    maseteros: [{ left: 38, top: 54, w: 18, h: 22 }],
    platisma: [{ left: 30, top: 87, w: 20, h: 11 }],
  },
};

export default function FaceSelector({ selected, onToggle }: Props) {
  const [view, setView] = useState<ViewId>('front');
  const [imgOk, setImgOk] = useState(true);
  const current = VIEWS.find((v) => v.id === view)!;
  const hits = HITS[view];

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap gap-1 rounded-lg bg-muted p-1">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => {
              setView(v.id);
              setImgOk(true);
            }}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
              view === v.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div
        className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-2xl border border-border bg-white"
        style={{ aspectRatio: `${current.width} / ${current.height}` }}
      >
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.src}
            alt={current.label}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
            draggable={false}
            onError={() => setImgOk(false)}
          />
        ) : (
          <p className="absolute inset-0 grid place-items-center p-4 text-center text-sm text-muted-foreground">
            Falta {current.src}. Sube las PNG a public/aesthetics/.
          </p>
        )}

        {(Object.entries(hits) as [ZoneCode, Box[]][]).flatMap(([code, boxes]) => {
          const active = selected.has(code);
          const label = ZONES.find((z) => z.code === code)?.label ?? code;
          return boxes.map((b, i) => (
            <button
              key={`${code}-${i}`}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={active}
              onClick={() => onToggle(code)}
              className={`absolute rounded-full border-2 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 ${
                active
                  ? 'border-teal-600 bg-teal-500/45 shadow-md'
                  : 'border-transparent bg-slate-400/10 hover:border-teal-400/60 hover:bg-teal-400/20'
              }`}
              style={{ left: `${b.left}%`, top: `${b.top}%`, width: `${b.w}%`, height: `${b.h}%` }}
            />
          ));
        })}
      </div>
      <p className="mt-1 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {current.label}
      </p>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {ZONES.map((z) => (
          <li key={z.code}>
            <button
              type="button"
              onClick={() => onToggle(z.code)}
              aria-pressed={selected.has(z.code)}
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
