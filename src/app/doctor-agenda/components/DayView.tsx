'use client';
import React from 'react';
import { Cita, statusStyles } from '@/lib/mockData';

interface DayViewProps {
  date: string;
  citas: Cita[];
  onSlot: (time: string) => void;
  onSelect: (c: Cita) => void;
}

const hours = Array.from({ length: 11 }, (_, i) => 8 + i); // 08..18
const ROW = 72; // px per hour

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export default function DayView({ date, citas, onSlot, onSelect }: DayViewProps) {
  const day = citas.filter((c) => c.date === date).sort((a, b) => toMin(a.start) - toMin(b.start));

  return (
    <div className="relative max-h-[640px] overflow-y-auto scrollbar-thin">
      <div className="relative" style={{ height: hours.length * ROW }}>
        {hours.map((h, i) => (
          <div key={`hr-${h}`} className="absolute inset-x-0 flex border-t border-border" style={{ top: i * ROW, height: ROW }}>
            <div className="tabular w-16 shrink-0 px-2 pt-1 text-right text-xs font-medium text-muted-foreground">{String(h).padStart(2, '0')}:00</div>
            <div className="grid flex-1 grid-rows-2">
              {['00', '30'].map((mm) => (
                <button
                  key={`slot-${h}-${mm}`}
                  onClick={() => onSlot(`${String(h).padStart(2, '0')}:${mm}`)}
                  aria-label={`Agendar a las ${h}:${mm}`}
                  className="group relative border-l border-dashed border-border text-left transition-colors hover:bg-primary/5"
                >
                  <span className="pointer-events-none absolute left-2 top-1 hidden text-[11px] font-semibold text-primary group-hover:block">
                    + Agendar {String(h).padStart(2, '0')}:{mm}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {day.map((c) => {
          const top = ((toMin(c.start) - 8 * 60) / 60) * ROW;
          const height = Math.max(34, (c.duration / 60) * ROW - 4);
          const overlapIdx = day.filter((o) => o.id !== c.id && toMin(o.start) < toMin(c.start) + c.duration && toMin(o.start) + o.duration > toMin(c.start) && o.id < c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className={`absolute rounded-lg border px-2.5 py-1.5 text-left shadow-sm transition-all duration-150 hover:z-10 hover:shadow-md active:scale-[0.99] ${statusStyles[c.status]} bg-card`}
              style={{ top: top + 2, height, left: `calc(4rem + ${overlapIdx * 32}%)`, width: 'calc(48% - 0.5rem)' }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-bold">{c.patient}</span>
                <span className="tabular shrink-0 text-[11px] font-semibold">{c.start}</span>
              </div>
              {height > 48 && <p className="truncate text-[11px] opacity-80">{c.procedure}</p>}
              {height > 64 && <p className="truncate text-[11px] opacity-70">{c.doctor} · {c.chair}</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}