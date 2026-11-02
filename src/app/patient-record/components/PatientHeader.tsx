'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import Toast from '@/components/ui/Toast';
import NewPatientModal, { NewPatient } from './NewPatientModal';

export default function PatientHeader() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');

  const handleCreate = (p: NewPatient) => {
    setOpen(false);
    setToast(`Paciente ${p.firstName} ${p.lastName} registrado correctamente`);
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start gap-5">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
          AV
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">Andrea Villacis Toapanta</h1>
            <Badge tone="success" dot>
              Paciente activa
            </Badge>
            <Badge tone="warning">Alergia: penicilina</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            HC N. 0412 · C.I. 1712345678 · 34 anos · Femenino · IESS afiliada
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            {[
              { id: 'ph-1', k: 'Ultima visita', v: '31/10/2026' },
              { id: 'ph-2', k: 'Proxima cita', v: '18/11/2026 · 09:00' },
              { id: 'ph-3', k: 'Saldo pendiente', v: '$185,00', danger: true },
              { id: 'ph-4', k: 'Odontologo', v: 'Dra. Camila Andrade' },
            ].map((r) => (
              <div key={r.id}>
                <dt className="text-xs text-muted-foreground">{r.k}</dt>
                <dd className={`tabular font-semibold ${r.danger ? 'text-destructive' : ''}`}>{r.v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95"
          >
            <Icon name="UserPlusIcon" size={16} />
            Nuevo paciente
          </button>
          <Link
            href="/interactive-odontogram"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            <Icon name="PuzzlePieceIcon" size={16} />
            Abrir odontograma
          </Link>
          <Link
            href="/doctor-agenda"
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-4 py-2.5 text-sm font-semibold transition-all hover:bg-muted active:scale-95"
          >
            <Icon name="CalendarDaysIcon" size={16} />
            Agendar
          </Link>
        </div>
      </div>
      <NewPatientModal open={open} onClose={() => setOpen(false)} onCreate={handleCreate} />
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </section>
  );
}
