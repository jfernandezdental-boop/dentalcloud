import React from 'react';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

const highlights = [
  { id: 'hl-msp', icon: 'DocumentCheckIcon', title: 'Formularios MSP Ecuador', text: 'Historia clínica 033 y odontograma listos para auditoría.' },
  { id: 'hl-ia', icon: 'SparklesIcon', title: 'Bot IA de recordatorios', text: 'Reduce la inasistencia hasta un 38 % con avisos a pacientes y doctores.' },
  { id: 'hl-fin', icon: 'BanknotesIcon', title: 'Contabilidad y rol de pagos', text: 'Ingresos, gastos, por cobrar y beneficios de ley en un solo lugar.' },
];

export default function AuthBrandPanel() {
  return (
    <section className="relative hidden flex-col justify-between overflow-hidden bg-brand-panel p-10 text-sidebar-foreground lg:flex xl:p-14">
      <div className="flex items-center gap-3">
        <AppLogo size={44} />
        <span className="text-2xl font-bold tracking-tight">DentalCloud</span>
      </div>

      <div className="max-w-xl">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Plataforma multi-clínica
        </p>
        <h1 className="text-hero-xl font-bold">La clínica que no pierde un solo paciente en la agenda.</h1>
        <p className="mt-4 text-base text-sidebar-foreground/80">
          Agenda, odontograma, historia clínica MSP, laboratorio y finanzas conectados. Cada clínica con su propio espacio y su propio equipo.
        </p>

        <ul className="mt-8 space-y-4">
          {highlights?.map((h) => (
            <li key={h?.id} className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Icon name={h?.icon} size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold">{h?.title}</p>
                <p className="mt-0.5 text-sm text-sidebar-foreground/70">{h?.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div />
    </section>
  );
}