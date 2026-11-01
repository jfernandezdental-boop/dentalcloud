'use client';
import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import { Cita, CitaStatus } from '@/lib/mockData';

interface AppointmentDetailProps {
  cita: Cita | null;
  onClose: () => void;
  onStatus: (id: string, status: CitaStatus) => void;
}

const statusOptions: CitaStatus[] = ['Pendiente', 'Confirmada', 'En sala', 'En atención', 'Atendida', 'No asistió', 'Cancelada'];

export default function AppointmentDetail({ cita, onClose, onStatus }: AppointmentDetailProps) {
  if (!cita) return null;
  const [y, m, d] = cita.date.split('-');
  const endMin = Number(cita.start.split(':')[0]) * 60 + Number(cita.start.split(':')[1]) + cita.duration;
  const end = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/40 animate-fade-in" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-md animate-slide-in-right flex-col border-l border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cita {cita.id.toUpperCase()}</p>
            <h2 className="mt-1 text-lg font-semibold">{cita.patient}</h2>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted">
            <Icon name="XMarkIcon" size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 scrollbar-thin">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {[
              { id: 'dd-1', k: 'Fecha', v: `${d}/${m}/${y}` },
              { id: 'dd-2', k: 'Horario', v: `${cita.start} – ${end}` },
              { id: 'dd-3', k: 'Odontólogo', v: cita.doctor },
              { id: 'dd-4', k: 'Ubicación', v: cita.chair },
              { id: 'dd-5', k: 'Procedimiento', v: cita.procedure },
              { id: 'dd-6', k: 'Duración', v: `${cita.duration} min` },
            ].map((row) => (
              <div key={row.id}>
                <dt className="text-xs font-medium text-muted-foreground">{row.k}</dt>
                <dd className="tabular mt-0.5 font-semibold">{row.v}</dd>
              </div>
            ))}
          </dl>

          <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2.5 text-sm">
            <Icon name="SparklesIcon" size={16} className="text-primary" />
            {cita.reminder ? 'Bot IA enviará recordatorios automáticos' : 'Sin recordatorio automático — envío manual'}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Estado actual <Badge tone="info" className="ml-2">{cita.status}</Badge></p>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((s) => (
                <button
                  key={`so-${s}`}
                  onClick={() => onStatus(cita.id, s)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all active:scale-95 ${
                    cita.status === s ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:bg-muted'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border bg-muted/40 p-4">
          <Link href="/patient-record" className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-card px-3 py-2.5 text-sm font-semibold transition-all hover:bg-muted active:scale-95">
            <Icon name="UserCircleIcon" size={16} />
            Ver ficha
          </Link>
          <Link href="/interactive-odontogram" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95">
            <Icon name="PuzzlePieceIcon" size={16} />
            Odontograma
          </Link>
        </div>
      </aside>
    </div>
  );
}