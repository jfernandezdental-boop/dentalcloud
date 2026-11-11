'use client';
import React, { useState } from 'react';
import { FACE_DIAGRAM_DATA_URL } from '@/lib/faceDiagram';
import { ZONES, type ZoneCode } from '@/lib/aesthetics';

type Props = {
  selected: ReadonlySet<ZoneCode>;
  onToggle: (code: ZoneCode) => void;
};

type ViewId = 'left' | 'front' | 'right';

const VIEWS: { id: ViewId; label: string; /** posición del recorte en la imagen panorámica */ objectPos: string }[] = [
  { id: 'left', label: 'Perfil izquierdo', objectPos: '12% center' },
  { id: 'front', label: 'Frente', objectPos: '50% center' },
  { id: 'right', label: 'Perfil derecho', objectPos: '88% center' },
];

/** Hit-areas en % del contenedor (sobre el recorte de cada vista). */
const HITS: Record<ViewId, Partial<Record<ZoneCode, { top: string; left: string; w: string; h: string }>>> = {
  front: {
    frente: { top: '10%', left: '28%', w: '44%', h: '12%' },
    glabela: { top: '22%', left: '42%', w: '16%', h: '8%' },
    patas_gallo: { top: '28%', left: '18%', w: '14%', h: '12%' },
    lineas_nasales: { top: '38%', left: '36%', w: '28%', h: '10%' },
    labio_superior: { top: '52%', left: '38%', w: '24%', h: '8%' },
    menton: { top: '64%', left: '38%', w: '24%', h: '10%' },
    maseteros: { top: '42%', left: '12%', w: '16%', h: '18%' },
    platisma: { top: '78%', left: '30%', w: '40%', h: '12%' },
  },
  left: {
    frente: { top: '12%', left: '40%', w: '36%', h: '14%' },
    glabela: { top: '26%', left: '55%', w: '18%', h: '8%' },
    patas_gallo: { top: '30%', left: '48%', w: '16%', h: '12%' },
    labio_superior: { top: '50%', left: '58%', w: '20%', h: '8%' },
    menton: { top: '62%', left: '52%', w: '22%', h: '10%' },
    maseteros: { top: '40%', left: '30%', w: '22%', h: '18%' },
    platisma: { top: '78%', left: '32%', w: '40%', h: '12%' },
  },
  right: {
    frente: { top: '12%', left: '24%', w: '36%', h: '14%' },
    glabela: { top: '26%', left: '28%', w: '18%', h: '8%' },
    patas_gallo: { top: '30%', left: '36%', w: '16%', h: '12%' },
    labio_superior: { top: '50%', left: '22%', w: '20%', h: '8%' },
    menton: { top: '62%', left: '26%', w: '22%', h: '10%' },
    maseteros: { top: '40%', left: '48%', w: '22%', h: '18%' },
    platisma: { top: '78%', left: '28%', w: '40%', h: '12%' },
  },
};

export default function FaceSelector({ selected, onToggle }: Props) {
  const [view, setView] = useState<ViewId>('front');
  const current = VIEWS.find((v) => v.id === view)!;
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

      <div className="relative mx-auto aspect-[3/4] w-full max-w-[300px] overflow-hidden rounded-2xl border border-border bg-white">
        {/* Imagen panorámica recortada a la vista activa */}
        <img
          src={FACE_DIAGRAM_DATA_URL}
          alt={current.label}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
          style={{ objectPosition: current.objectPos }}
          draggable={false}
        />

        {/* Zonas clicables */}
        {(Object.entries(hits) as [ZoneCode, { top: string; left: string; w: string; h: string }][]).map(
          ([code, h]) => {
            const active = selected.has(code);
            const label = ZONES.find((z) => z.code === code)?.label ?? code;
            return (
              <button
                key={code}
                type="button"
                title={label}
                aria-label={label}
                aria-pressed={active}
                onClick={() => onToggle(code)}
                className={`absolute rounded-full border-2 transition-all ${
                  active
                    ? 'border-teal-600 bg-teal-500/45 shadow-md'
                    : 'border-transparent bg-slate-400/15 hover:border-teal-400/60 hover:bg-teal-400/25'
                }`}
                style={{ top: h.top, left: h.left, width: h.w, height: h.h }}
              />
            );
          },
        )}

        <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[10px] font-bold uppercase tracking-wider text-slate-600">
          {current.label}
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
