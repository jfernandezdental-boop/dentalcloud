'use client';
import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/components/AuthProvider';

function saludo(h: number) {
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function DashboardHeader() {
  const { user } = useAuth();
  const now = new Date();
  const fecha = now.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fechaCap = fecha.charAt(0).toUpperCase() + fecha.slice(1);
  const primerNombre = (user?.fullName || '').split(/\s+/)[0] || '';
  const lugar = [user?.clinicName, user?.clinicCity].filter(Boolean).join(', ');

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground" suppressHydrationWarning>
          {fechaCap}
          {lugar ? ` · ${lugar}` : ''}
        </p>
        <h1 className="mt-1 text-2xl font-semibold" suppressHydrationWarning>
          {saludo(now.getHours())}
          {primerNombre ? `, ${primerNombre}` : ''}
        </h1>
      </div>
      <Link
        href="/doctor-agenda"
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all duration-150 hover:opacity-90 active:scale-95"
      >
        <Icon name="CalendarDaysIcon" size={16} />
        Agendar cita
      </Link>
    </div>
  );
}
