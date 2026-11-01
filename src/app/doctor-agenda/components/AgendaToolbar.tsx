'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { doctors } from '@/lib/mockData';
import type { ViewMode } from './AgendaWorkspace';

interface AgendaToolbarProps {
  view: ViewMode;
  onView: (v: ViewMode) => void;
  cursor: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  doctorId: string;
  onDoctor: (id: string) => void;
}

const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export function formatTitle(cursor: string, view: ViewMode) {
  const d = new Date(`${cursor}T12:00:00`);
  if (view === 'month') return `${monthNames[d.getMonth()]} de ${d.getFullYear()}`;
  if (view === 'week') {
    const dow = (d.getDay() + 6) % 7;
    const start = new Date(d);
    start.setDate(d.getDate() - dow);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.getDate()} ${monthNames[start.getMonth()].slice(0, 3)} – ${end.getDate()} ${monthNames[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`;
  }
  return `${dayNames[d.getDay()]} ${d.getDate()} de ${monthNames[d.getMonth()]} de ${d.getFullYear()}`;
}

const views: { id: string; key: ViewMode; label: string }[] = [
  { id: 'vw-day', key: 'day', label: 'Día' },
  { id: 'vw-week', key: 'week', label: 'Semana' },
  { id: 'vw-month', key: 'month', label: 'Mes' },
];

export default function AgendaToolbar({ view, onView, cursor, onPrev, onNext, onToday, doctorId, onDoctor }: AgendaToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
      <div className="flex items-center gap-1">
        <button onClick={onPrev} aria-label="Anterior" className="rounded-lg border border-input p-2 transition-all hover:bg-muted active:scale-95">
          <Icon name="ChevronLeftIcon" size={16} />
        </button>
        <button onClick={onToday} className="rounded-lg border border-input px-3 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95">
          Hoy
        </button>
        <button onClick={onNext} aria-label="Siguiente" className="rounded-lg border border-input p-2 transition-all hover:bg-muted active:scale-95">
          <Icon name="ChevronRightIcon" size={16} />
        </button>
      </div>
      <h2 className="text-base font-semibold capitalize">{formatTitle(cursor, view)}</h2>

      <div className="ml-auto flex flex-wrap items-center gap-3">
        <select
          value={doctorId}
          onChange={(e) => onDoctor(e.target.value)}
          aria-label="Filtrar por doctor"
          className="rounded-lg border border-input bg-card px-3 py-2 text-sm font-medium outline-none transition-colors focus:border-primary"
        >
          <option value="all">Todos los doctores</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <div className="inline-flex rounded-lg bg-muted p-1" role="tablist">
          {views.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={view === v.key}
              onClick={() => onView(v.key)}
              className={`rounded-md px-3.5 py-1.5 text-sm font-semibold transition-all duration-150 active:scale-95 ${
                view === v.key ? 'bg-card shadow' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}