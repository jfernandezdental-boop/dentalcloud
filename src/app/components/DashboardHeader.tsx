'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/components/AuthProvider';

export default function DashboardHeader() {
  const { user } = useAuth();
  const [range, setRange] = useState('Hoy');
  const ranges = ['Hoy', '7 dias', 'Mes'];
  const clinic = user?.clinicName || 'Mi clinica';
  const name = (user?.fullName || '').trim();

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{clinic}</p>
        <h1 className="mt-1 text-2xl font-semibold">Buenos dias{name ? `, ${name}` : ''}</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-success" />
          Panel operativo de la clinica
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {ranges.map((r) => (
            <button
              key={`rng-${r}`}
              type="button"
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
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all hover:opacity-90 active:scale-95"
        >
          <Icon name="CalendarDaysIcon" size={16} />
          Agendar cita
        </Link>
      </div>
    </div>
  );
}
