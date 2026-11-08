import React from 'react';
import MetricCard from '@/components/ui/MetricCard';
import type { PlatformOverview } from '@/lib/supabase/usePlatformOverview';

const fmt = (n: number) => n.toLocaleString('es-EC');

function variation(now: number, prev: number): { delta?: string; dir: 'up' | 'down' | 'flat' } {
  if (prev <= 0) return { dir: 'flat' };
  const pct = ((now - prev) / prev) * 100;
  const sign = pct > 0 ? '+' : '';
  return { delta: `${sign}${pct.toFixed(1).replace('.', ',')} %`, dir: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat' };
}

export default function AdminMetrics({ data }: { data: PlatformOverview | null }) {
  const d = data;
  const v = variation(d?.attended_30 ?? 0, d?.attended_prev_30 ?? 0);
  const notActive = d ? d.clinics_total - d.clinics_active : 0;
  const atRisk = d ? d.clinics_overdue + d.clinics_suspended : 0;
  const avgDocs = d && d.clinics_total > 0 ? (d.doctors / d.clinics_total).toFixed(1).replace('.', ',') : '0';

  return (
    <section aria-label="Indicadores de plataforma" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        className="md:col-span-2"
        tone="hero"
        icon="BuildingOffice2Icon"
        label="Clinicas activas"
        value={fmt(d?.clinics_active ?? 0)}
        unit={`de ${fmt(d?.clinics_total ?? 0)} registradas`}
        helper={`${fmt(notActive)} en prueba, suspendidas o con pago vencido`}
      >
        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          {[
            { id: 'am-1', k: 'Plan Inicial', v: d?.plan_inicial ?? 0 },
            { id: 'am-2', k: 'Clinica Pro', v: d?.plan_pro ?? 0 },
            { id: 'am-3', k: 'Red de clinicas', v: d?.plan_red ?? 0 },
          ].map((p) => (
            <div key={p.id} className="rounded-lg bg-white/10 px-3 py-2">
              <p className="tabular text-lg font-bold text-sidebar-foreground">{fmt(p.v)}</p>
              <p className="text-sidebar-foreground/70">{p.k}</p>
            </div>
          ))}
        </div>
      </MetricCard>
      <MetricCard icon="UserGroupIcon" label="Doctores activos" value={fmt(d?.doctors ?? 0)} helper={`promedio ${avgDocs} por clinica`} />
      <MetricCard icon="IdentificationIcon" label="Personal administrativo" value={fmt(d?.staff ?? 0)} helper="administracion, recepcion, auxiliares y contabilidad" />
      <MetricCard
        className="md:col-span-1 xl:col-span-2"
        icon="ChartBarIcon"
        label="Pacientes atendidos (30 dias)"
        value={fmt(d?.attended_30 ?? 0)}
        delta={v.delta}
        deltaDirection={v.dir}
        tone="success"
        helper={`${fmt(d?.patients ?? 0)} pacientes registrados en total`}
      />
      <MetricCard
        className="md:col-span-1 xl:col-span-2"
        icon="ExclamationTriangleIcon"
        label="Suscripciones en riesgo"
        value={fmt(atRisk)}
        unit="clinicas"
        tone={atRisk > 0 ? 'alert' : 'default'}
        helper="pago vencido o suspendidas"
      />
    </section>
  );
}
