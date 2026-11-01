'use client';
import React from 'react';
import { Cita } from '@/lib/mockData';
import Icon from '@/components/ui/AppIcon';

interface MonthViewProps {
  date: string;
  citas: Cita[];
  onDay: (iso: string) => void;
  onBook: (iso: string) => void;
}

const header = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const dotColor: Record<string, string> = {
  Atendida: 'bg-muted-foreground',
  'En atención': 'bg-success',
  'En sala': 'bg-accent',
  Confirmada: 'bg-primary',
  Pendiente: 'bg-warning',
  'No asistió': 'bg-destructive',
  Cancelada: 'bg-input',
};

export default function MonthView({ date, citas, onDay, onBook }: MonthViewProps) {
  const base = new Date(`${date}T12:00:00`);
  const first = new Date(base.getFullYear(), base.getMonth(), 1, 12);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { iso: toIso(d), num: d.getDate(), inMonth: d.getMonth() === base.getMonth() };
  });

  return (
    <div className="p-3">
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border">
        {header.map((h) => (
          <div key={`mh-${h}`} className="bg-muted px-2 py-2 text-center text-xs font-semibold text-muted-foreground">{h}</div>
        ))}
        {cells.map((c) => {
          const dayCitas = citas.filter((x) => x.date === c.iso);
          const isCursor = c.iso === date;
          const isToday = c.iso === '2026-10-31';
          return (
            <div
              key={`mc-${c.iso}`}
              className={`group relative min-h-[96px] cursor-pointer bg-card p-1.5 text-left transition-colors hover:bg-primary/5 ${c.inMonth ? '' : 'opacity-45'} ${isCursor ? 'ring-2 ring-inset ring-primary' : ''}`}
              onClick={() => onDay(c.iso)}
            >
              <div className="flex items-center justify-between">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isToday ? 'bg-accent text-accent-foreground' : ''}`}>{c.num}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBook(c.iso);
                  }}
                  aria-label={`Agendar cita el ${c.iso}`}
                  className="rounded-md p-1 text-primary opacity-0 transition-opacity hover:bg-primary hover:text-primary-foreground group-hover:opacity-100"
                >
                  <Icon name="PlusIcon" size={14} />
                </button>
              </div>
              <div className="mt-1 space-y-0.5">
                {dayCitas.slice(0, 2).map((x) => (
                  <p key={x.id} className="flex items-center gap-1 truncate text-[11px]">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor[x.status]}`} />
                    <span className="tabular font-semibold">{x.start}</span>
                    <span className="truncate text-muted-foreground">{x.patient.split(' ')[0]}</span>
                  </p>
                ))}
                {dayCitas.length > 2 && <p className="text-[11px] font-semibold text-primary">+{dayCitas.length - 2} más</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}