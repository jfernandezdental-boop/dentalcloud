'use client';
import React, { useState } from 'react';
import { ZONES, SIDE_LABEL, type Side, type ZoneCode } from '@/lib/aesthetics';

type Props = {
  selected: ReadonlySet<ZoneCode>;
  onToggle: (code: ZoneCode) => void;
  /** Opcional: sincronizar lado al elegir zona bilateral */
  onSideHint?: (code: ZoneCode, side: Side) => void;
};

type ViewId = 'left' | 'front' | 'right';

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'left', label: 'Perfil izquierdo' },
  { id: 'front', label: 'Frente' },
  { id: 'right', label: 'Perfil derecho' },
];

/** Hit-areas por vista (coordenadas en viewBox 0–100). */
const HITS: Record<ViewId, Partial<Record<ZoneCode, { cx: number; cy: number; rx: number; ry: number }>>> = {
  front: {
    frente: { cx: 50, cy: 22, rx: 22, ry: 9 },
    glabela: { cx: 50, cy: 32, rx: 6, ry: 5 },
    patas_gallo: { cx: 28, cy: 38, rx: 5, ry: 8 },
    lineas_nasales: { cx: 44, cy: 48, rx: 5, ry: 6 },
    labio_superior: { cx: 50, cy: 62, rx: 10, ry: 4 },
    menton: { cx: 50, cy: 78, rx: 10, ry: 6 },
    maseteros: { cx: 26, cy: 58, rx: 7, ry: 12 },
    platisma: { cx: 50, cy: 92, rx: 14, ry: 5 },
  },
  left: {
    frente: { cx: 58, cy: 22, rx: 14, ry: 10 },
    glabela: { cx: 68, cy: 34, rx: 5, ry: 5 },
    patas_gallo: { cx: 62, cy: 40, rx: 5, ry: 7 },
    labio_superior: { cx: 72, cy: 58, rx: 6, ry: 3 },
    menton: { cx: 68, cy: 72, rx: 6, ry: 5 },
    maseteros: { cx: 48, cy: 55, rx: 10, ry: 12 },
    platisma: { cx: 52, cy: 88, rx: 12, ry: 6 },
  },
  right: {
    frente: { cx: 42, cy: 22, rx: 14, ry: 10 },
    glabela: { cx: 32, cy: 34, rx: 5, ry: 5 },
    patas_gallo: { cx: 38, cy: 40, rx: 5, ry: 7 },
    labio_superior: { cx: 28, cy: 58, rx: 6, ry: 3 },
    menton: { cx: 32, cy: 72, rx: 6, ry: 5 },
    maseteros: { cx: 52, cy: 55, rx: 10, ry: 12 },
    platisma: { cx: 48, cy: 88, rx: 12, ry: 6 },
  },
};

function FaceSilhouette({ view }: { view: ViewId }) {
  // Siluetas line-art inspiradas en diagrama clínico (ojos cerrados, contorno limpio)
  if (view === 'front') {
    return (
      <g fill="none" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 28 C34 12, 66 12, 68 28 C72 40, 74 55, 70 70 C66 86, 58 94, 50 96 C42 94, 34 86, 30 70 C26 55, 28 40, 32 28 Z" />
        <path d="M38 34 C42 30, 58 30, 62 34" />
        <path d="M36 38 Q42 36 48 38" /><path d="M52 38 Q58 36 64 38" />
        <path d="M40 40 Q44 44 48 40" /><path d="M52 40 Q56 44 60 40" />
        <path d="M50 42 L48 54 Q50 58 52 54 Z" />
        <path d="M44 66 Q50 70 56 66" /><path d="M46 68 Q50 72 54 68" />
        <path d="M42 22 C45 18, 55 18, 58 22" />
      </g>
    );
  }
  const flip = view === 'right';
  return (
    <g
      fill="none"
      stroke="#1a1a1a"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      transform={flip ? 'translate(100,0) scale(-1,1)' : undefined}
    >
      {/* perfil mirando a la derecha del viewBox local */}
      <path d="M28 30 C30 14, 48 10, 58 22 C68 30, 78 38, 80 48 C82 58, 78 68, 70 74 C62 80, 55 88, 52 96 L40 92 C38 80, 30 70, 28 55 C26 42, 26 36, 28 30 Z" />
      <path d="M58 40 Q64 42 66 46" />
      <path d="M72 52 Q78 54 76 58" />
      <path d="M68 62 Q74 64 72 68" />
      <path d="M48 28 C52 24, 60 26, 62 32" />
      <path d="M34 48 C28 50, 26 56, 30 58" />
    </g>
  );
}

export default function FaceSelector({ selected, onToggle }: Props) {
  const [view, setView] = useState<ViewId>('front');
  const hits = HITS[view];

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap gap-1 rounded-lg bg-muted p-1">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setView(v.id)}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
              view === v.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="relative mx-auto aspect-[4/5] w-full max-w-[280px] rounded-2xl border border-border bg-white">
        <svg viewBox="0 0 100 100" className="h-full w-full p-2" role="img" aria-label={`Mapa facial · ${VIEWS.find((v) => v.id === view)?.label}`}>
          <FaceSilhouette view={view} />
          {(Object.entries(hits) as [ZoneCode, { cx: number; cy: number; rx: number; ry: number }][]).map(([code, h]) => {
            const active = selected.has(code);
            return (
              <ellipse
                key={code}
                cx={h.cx}
                cy={h.cy}
                rx={h.rx}
                ry={h.ry}
                onClick={() => onToggle(code)}
                className="cursor-pointer transition-opacity"
                style={{ opacity: active ? 0.55 : 0.2 }}
                fill={active ? '#0d9488' : '#94a3b8'}
                stroke={active ? '#0f766e' : '#64748b'}
                strokeWidth={0.8}
              >
                <title>{ZONES.find((z) => z.code === code)?.label ?? code}</title>
              </ellipse>
            );
          })}
        </svg>
        <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {VIEWS.find((v) => v.id === view)?.label}
        </p>
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {ZONES.map((z) => (
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
