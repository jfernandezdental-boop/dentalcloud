'use client';
import React from 'react';
import { Cita } from '@/lib/mockData';

interface MiniCalendarProps {
  cursor: string;
  citas: Cita[];
  onSelect: (iso: string) => void;
  onBook: (iso: string) => void;
}

const header = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function MiniCalendar({ cursor, citas, onSelect, onBook }: MiniCalendarProps) {
  const base = new Date(`${cursor}T12:00:00`);
  const first = new Date(base.getFullYear(), base.getMonth(), 1, 12);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { iso: toIso(d), num: d.getDate(), inMonth: d.getMonth() === base.getMonth() };
  });
  const selectedCount = citas.filter((c) => c.date === cursor).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">{monthNames[base.getMonth()]} {base.getFullYear()}</h3>
      <div className="grid grid-cols-7 gap-1 text-center">
        {header.map((h) => (
          <span key={`mini-h-${h}`} className="py-1 text-[11px] font-semibold text-muted-foreground">{h}</span>
        ))}
        {cells.map((c) => {
          const has = citas.some((x) => x.date === c.iso);
          const active = c.iso === cursor;
          return (
            <button
              key={`mini-${c.iso}`}
              onClick={() => onSelect(c.iso)}
              className={`relative flex h-8 items-center justify-center rounded-lg text-xs font-semibold transition-all duration-150 active:scale-90 ${
                active ? 'bg-primary text-primary-foreground' : c.inMonth ? 'hover:bg-muted' : 'text-muted-foreground/50 hover:bg-muted'
              }`}
            >
              {c.num}
              {has && !active && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-xs">
        <span><strong className="tabular">{selectedCount}</strong> citas ese día</span>
        <button onClick={() => onBook(cursor)} className="font-semibold text-primary hover:underline">Agendar aquí</button>
      </div>
    </div>
  );
}