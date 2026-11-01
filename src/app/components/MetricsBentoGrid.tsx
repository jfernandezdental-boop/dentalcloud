import React from 'react';
import MetricCard from '@/components/ui/MetricCard';

/* Bento plan: 7 cards → grid-cols-4 → row 1: hero (span 2) + 2 regular; row 2: 4 regular. No orphans. */
export default function MetricsBentoGrid() {
  return (
    <section aria-label="Indicadores del día" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        className="md:col-span-2"
        tone="hero"
        icon="UserGroupIcon"
        label="Pacientes atendidos hoy"
        value="14"
        unit="de 23 agendados"
        delta="+3 vs. viernes"
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
          <div className="mt-3 flex gap-5 text-xs text-sidebar-foreground/80">
            <span><strong className="tabular text-sidebar-foreground">14</strong> atendidos</span>
            <span><strong className="tabular text-sidebar-foreground">2</strong> en sala</span>
            <span><strong className="tabular text-sidebar-foreground">7</strong> por atender</span>
          </div>
        </div>
      </MetricCard>

      <MetricCard icon="ClockIcon" label="Espera promedio" value="11" unit="min" delta="−4 min" deltaDirection="down" deltaGood helper="vs. ayer" />
      <MetricCard icon="CurrencyDollarIcon" label="Ingresos de hoy" value="$1 865" delta="+12,4 %" deltaDirection="up" deltaGood helper="Cobrado $1 420" tone="success" />

      <MetricCard icon="UserMinusIcon" label="Inasistencia (no-show)" value="8,7" unit="%" delta="+3,1 pts" deltaDirection="up" deltaGood={false} helper="2 de 23 citas" tone="warning" />
      <MetricCard icon="ReceiptPercentIcon" label="Por cobrar (cartera)" value="$8 940" delta="+$620" deltaDirection="up" deltaGood={false} helper="17 pacientes · 6 vencidos" tone="alert" />
      <MetricCard icon="BeakerIcon" label="Trabajos de laboratorio" value="9" unit="en proceso" delta="3 atrasados" deltaDirection="up" deltaGood={false} helper="Entrega prevista hoy: 2" />
      <MetricCard icon="ArchiveBoxIcon" label="Insumos bajo mínimo" value="5" unit="ítems" delta="2 críticos" deltaDirection="up" deltaGood={false} helper="Lidocaína 2 %, resina A2" />
    </section>
  );
}