import React from 'react';
import MetricCard from '@/components/ui/MetricCard';
import type { PlatformOverview } from '@/lib/supabase/usePlatformOverview';

export default function AdminMetrics({ overview, loading }: { overview: PlatformOverview; loading?: boolean }) {
  const v = (n: number) => (loading ? '—' : String(n));
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Clínicas en la red"
        value={v(overview.clinics_total)}
        icon="BuildingOffice2Icon"
        tone="hero"
        helper={loading ? 'Cargando…' : `${overview.clinics_active} activas · ${overview.clinics_trial} en prueba`}
      />
      <MetricCard
        label="Pacientes totales"
        value={v(overview.patients_total)}
        icon="UserGroupIcon"
        tone="success"
        helper="Suma de todas las clínicas"
      />
      <MetricCard
        label="Citas del mes"
        value={v(overview.appointments_month)}
        icon="CalendarDaysIcon"
        tone="info"
        helper="Mes en curso"
      />
      <MetricCard
        label="Usuarios de plataforma"
        value={v(overview.users_total)}
        icon="UsersIcon"
        tone="warning"
        helper={loading ? '' : `${overview.clinics_suspended} clínicas suspendidas`}
      />
    </section>
  );
}
