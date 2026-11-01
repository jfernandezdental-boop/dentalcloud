'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function DashboardHeader() {
  const [range, setRange] = useState('Hoy');
  const ranges = ['Hoy', '7 días', 'Mes'];

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Sábado 31 de octubre de 2026 · Sonrisa Boreal, Quito</p>
        <h1 className="mt-1 text-2xl font-semibold">Buenos días, Mariana</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-success" />
          Datos actualizados a las 10:36 — 2 pacientes en sala, 1 cita sin confirmar
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {ranges?.map((r) => (
            <button
              key={`rng-${r}`}
              onClick={() => setRange(r)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-all duration-150 active:scale-95 ${
                range === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <Link
          href="/doctor-agenda"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all duration-150 hover:opacity-90 active:scale-95"
        >
          <Icon name="CalendarDaysIcon" size={16} />
          Agendar cita
        </Link>
      </div>
    </div>
  );
}