import React from 'react';
import MetricCard from '@/components/ui/MetricCard';

export default function MetricsBentoGrid() {
  return (
    <section aria-label="Indicadores del dia" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        className="md:col-span-2"
        tone="hero"
        icon="UserGroupIcon"
        label="Pacientes atendidos hoy"
        value="14"
        unit="de 23 agendados"
        delta="+3 vs. ayer"
        deltaDirection="up"
        helper="Meta diaria: 20"
      >
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-sidebar-foreground/80">
            <span>Avance de la jornada</span>
            <span className="tabular font-semibold">61 %</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-[61%] rounded-full bg-accent transition-all duration-700" />
          </div>
        </div>
      </MetricCard>
      <MetricCard icon="ClockIcon" label="Espera promedio" value="11" unit="min" delta="-4 min" deltaDirection="down" deltaGood helper="vs. ayer" />
      <MetricCard icon="CurrencyDollarIcon" label="Ingresos de hoy" value="$1 865" delta="+12,4 %" deltaDirection="up" deltaGood helper="Cobrado $1 420" tone="success" />
      <MetricCard icon="UserMinusIcon" label="Inasistencia (no-show)" value="8,7" unit="%" delta="+3,1 pts" deltaDirection="up" deltaGood={false} helper="2 de 23 citas" tone="warning" />
      <MetricCard icon="ReceiptPercentIcon" label="Por cobrar (cartera)" value="$8 940" delta="+$620" deltaDirection="up" deltaGood={false} helper="17 pacientes" tone="alert" />
      <MetricCard icon="BeakerIcon" label="Trabajos de laboratorio" value="9" unit="en proceso" delta="3 atrasados" deltaDirection="up" deltaGood={false} helper="Entrega prevista hoy: 2" />
      <MetricCard icon="ArchiveBoxIcon" label="Insumos bajo minimo" value="5" unit="items" delta="2 criticos" deltaDirection="up" deltaGood={false} helper="Lidocaina, resina A2" />
    </section>
  );
}
