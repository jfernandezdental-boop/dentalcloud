'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

interface Waiting {
  id: string;
  patient: string;
  procedure: string;
  doctor: string;
  waited: number;
  slot: string;
  status: 'En sala' | 'En atención' | 'Confirmada' | 'Pendiente';
}

const initial: Waiting[] = [
  { id: 'wr-001', patient: 'Jorge Luis Almeida', procedure: 'Resina pieza 14 y 15', doctor: 'Dra. Andrade', waited: 0, slot: '09:30', status: 'En atención' },
  { id: 'wr-002', patient: 'Daniela Escobar Ruiz', procedure: 'Colocación de brackets', doctor: 'Dra. Villavicencio', waited: 18, slot: '10:00', status: 'En sala' },
  { id: 'wr-003', patient: 'Patricio Naranjo León', procedure: 'Retratamiento de conducto', doctor: 'Dr. Moscoso', waited: 6, slot: '10:30', status: 'En sala' },
  { id: 'wr-004', patient: 'Lucía Fernanda Mora', procedure: 'Valoración y proforma', doctor: 'Dra. Andrade', waited: 0, slot: '11:00', status: 'Confirmada' },
  { id: 'wr-005', patient: 'Esteban Quishpe Yánez', procedure: 'Extracción pieza 48', doctor: 'Dra. Andrade', waited: 0, slot: '11:30', status: 'Confirmada' },
  { id: 'wr-006', patient: 'Gabriela Salazar Pinto', procedure: 'Control post alineadores', doctor: 'Dra. Villavicencio', waited: 0, slot: '12:00', status: 'Pendiente' },
];

const tone: Record<Waiting['status'], 'success' | 'accent' | 'info' | 'warning'> = {
  'En atención': 'success',
  'En sala': 'accent',
  Confirmada: 'info',
  Pendiente: 'warning',
};

export default function WaitingRoomPanel() {
  const [rows, setRows] = useState<Waiting[]>(initial);
  const [removing, setRemoving] = useState<string>('');

  const advance = (id: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.status === 'Pendiente') return { ...r, status: 'Confirmada' };
        if (r.status === 'Confirmada') return { ...r, status: 'En sala' };
        if (r.status === 'En sala') return { ...r, status: 'En atención' };
        return r;
      })
    );
  };

  const finish = (id: string) => {
    setRemoving(id);
    setTimeout(() => {
      setRows((prev) => prev.filter((r) => r.id !== id));
      setRemoving('');
    }, 300);
  };

  return (
    <aside className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-base font-semibold">Sala de espera y cola</h3>
          <p className="text-xs text-muted-foreground">{rows.length} pacientes por atender</p>
        </div>
        <Badge tone="accent" dot>En vivo</Badge>
      </div>

      {rows.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<Icon name="UserGroupIcon" size={24} />}
            title="No hay pacientes en cola"
            description="Cuando se confirme una cita o un paciente llegue a recepción, aparecerá aquí."
            actionLabel="Agendar cita"
          />
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((r) => (
            <li
              key={r.id}
              className={`group flex items-start gap-3 px-5 py-3.5 transition-all duration-300 hover:bg-muted/50 ${
                removing === r.id ? 'max-h-0 opacity-0' : 'max-h-40 opacity-100'
              }`}
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {r.patient
                  .split(' ')
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join('')}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{r.patient}</p>
                  <span className="tabular text-xs font-semibold text-muted-foreground">{r.slot}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{r.procedure} · {r.doctor}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge tone={tone[r.status]}>{r.status}</Badge>
                  {r.waited > 15 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                      <Icon name="ClockIcon" size={12} />
                      {r.waited} min esperando
                    </span>
                  )}
                  <span className="ml-auto flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {r.status !== 'En atención' ? (
                      <button onClick={() => advance(r.id)} aria-label="Avanzar estado" className="rounded-md bg-primary/10 p-1.5 text-primary transition-all hover:bg-primary hover:text-primary-foreground active:scale-95">
                        <Icon name="ArrowRightIcon" size={14} />
                      </button>
                    ) : (
                      <button onClick={() => finish(r.id)} aria-label="Finalizar atención" className="rounded-md bg-success/15 p-1.5 text-success transition-all hover:bg-success hover:text-success-foreground active:scale-95">
                        <Icon name="CheckIcon" size={14} />
                      </button>
                    )}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}