'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';

export interface Revision {
  id: string;
  label: string;
  date: string;
  doctor: string;
  findings: number;
  note: string;
}

interface RevisionHistoryProps {
  revisions: Revision[];
  viewingId: string | null;
  onView: (id: string) => void;
}

export default function RevisionHistory({ revisions, viewingId, onView }: RevisionHistoryProps) {
  return (
    <section className="no-print rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold">Historial de revisiones</h2>
        <p className="text-xs text-muted-foreground">Cada guardado crea una versión inmutable para auditoría MSP</p>
      </div>
      <ul className="max-h-80 divide-y divide-border overflow-y-auto scrollbar-thin">
        {revisions.map((r, idx) => {
          const viewing = viewingId === r.id;
          return (
            <li key={r.id} className={`flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/40 ${viewing ? 'bg-primary/5' : ''}`}>
              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <Icon name="DocumentDuplicateIcon" size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    {r.label}
                    {idx === 0 && <span className="ml-2 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">Vigente</span>}
                  </p>
                  <span className="tabular text-xs text-muted-foreground">{r.date}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{r.doctor} · {r.findings} hallazgos</p>
                <p className="truncate text-xs">{r.note}</p>
              </div>
              <button
                onClick={() => onView(r.id)}
                className={`rounded-md border px-2 py-1 text-xs font-semibold transition-all active:scale-95 ${viewing ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:bg-muted'}`}
              >
                {viewing ? 'Viendo' : 'Ver'}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}