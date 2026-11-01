'use client';
import React from 'react';
import { Cita, statusStyles } from '@/lib/mockData';

interface WeekViewProps {
  date: string;
  citas: Cita[];
  onSlot: (date: string, time: string) => void;
  onSelect: (c: Cita) => void;
}

const hours = Array.from({ length: 11 }, (_, i) => 8 + i);
const ROW = 64;
const dayShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export default function WeekView({ date, citas, onSlot, onSelect }: WeekViewProps) {
  const base = new Date(`${date}T12:00:00`);
  const dow = (base.getDay() + 6) % 7;
  const monday = new Date(base);
  monday.setDate(base.getDate() - dow);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { iso: toIso(d), num: d.getDate(), label: dayShort[i] };
  });

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <div className="min-w-[860px]">
        <div className="sticky top-0 z-10 grid grid-cols-[4rem_repeat(7,1fr)] border-b border-border bg-card">
          <div />
          {days.map((d) => {
            const isCursor = d.iso === date;
            const total = citas.filter((c) => c.date === d.iso).length;
            return (
              <div key={`wh-${d.iso}`} className="border-l border-border px-2 py-2 text-center">
                <p className="text-xs font-medium text-muted-foreground">{d.label}</p>
                <p className={`mx-auto mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${isCursor ? 'bg-primary text-primary-foreground' : ''}`}>{d.num}</p>
                <p className="tabular text-[11px] text-muted-foreground">{total} citas</p>
              </div>
            );
          })}
        </div>
        <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
          <div className="relative grid grid-cols-[4rem_repeat(7,1fr)]" style={{ height: hours.length * ROW }}>
            <div>
              {hours.map((h) => (
                <div key={`wt-${h}`} className="tabular pr-2 text-right text-xs font-medium text-muted-foreground" style={{ height: ROW }}>
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>
            {days.map((d) => {
              const dayCitas = citas.filter((c) => c.date === d.iso);
              return (
                <div key={`wc-${d.iso}`} className="relative border-l border-border">
                  {hours.map((h) => (
                    <button
                      key={`ws-${d.iso}-${h}`}
                      onClick={() => onSlot(d.iso, `${String(h).padStart(2, '0')}:00`)}
                      aria-label={`Agendar ${d.iso} ${h}:00`}
                      className="block w-full border-t border-border transition-colors hover:bg-primary/5"
                      style={{ height: ROW }}
                    />
                  ))}
                  {dayCitas.map((c, idx) => {
                    const top = ((toMin(c.start) - 8 * 60) / 60) * ROW;
                    const height = Math.max(26, (c.duration / 60) * ROW - 3);
                    const offset = (idx % 2) * 8;
                    return (
                      <button
                        key={c.id}
                        onClick={() => onSelect(c)}
                        className={`absolute left-1 right-1 overflow-hidden rounded-md border bg-card px-1.5 py-1 text-left text-[11px] leading-tight shadow-sm transition-all hover:z-10 hover:shadow-md active:scale-[0.98] ${statusStyles[c.status]}`}
                        style={{ top: top + 1, height, marginLeft: offset }}
                      >
                        <span className="block truncate font-bold">{c.start} {c.patient.split(' ')[0]}</span>
                        {height > 38 && <span className="block truncate opacity-80">{c.procedure}</span>}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}