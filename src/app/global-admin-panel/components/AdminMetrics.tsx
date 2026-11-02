import React from 'react';
import MetricCard from '@/components/ui/MetricCard';

export default function AdminMetrics() {
  return (
    <section aria-label="Indicadores de plataforma" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        className="md:col-span-2"
        tone="hero"
        icon="BuildingOffice2Icon"
        label="Clinicas activas"
        value="214"
        unit="de 231 registradas"
        delta="+9 este mes"
        deltaDirection="up"
        helper="17 en prueba o suspendidas"
      >
        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          {[
            { id: 'am-1', k: 'Plan Inicial', v: '96' },
            { id: 'am-2', k: 'Clinica Pro', v: '98' },
            { id: 'am-3', k: 'Red de clinicas', v: '20' },
          ].map((p) => (
            <div key={p.id} className="rounded-lg bg-white/10 px-3 py-2">
              <p className="tabular text-lg font-bold text-sidebar-foreground">{p.v}</p>
              <p className="text-sidebar-foreground/70">{p.k}</p>
            </div>
          ))}
        </div>
      </MetricCard>
      <MetricCard icon="UserGroupIcon" label="Doctores activos" value="587" delta="+21" deltaDirection="up" helper="promedio 2,7 por clinica" />
      <MetricCard icon="IdentificationIcon" label="Personal administrativo" value="895" delta="+14" deltaDirection="up" helper="recepcion, auxiliares, contabilidad" />
      <MetricCard className="md:col-span-1 xl:col-span-2" icon="ChartBarIcon" label="Pacientes atendidos (30 dias)" value="38 412" delta="+6,8 %" deltaDirection="up" tone="success" helper="vs. mes anterior" />
      <MetricCard className="md:col-span-1 xl:col-span-2" icon="ExclamationTriangleIcon" label="Suscripciones en riesgo" value="11" unit="clinicas" delta="+4" deltaDirection="up" deltaGood={false} tone="alert" helper="pago vencido > 10 dias" />
    </section>
  );
}
