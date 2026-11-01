import React from 'react';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';

const events = [
  { id: 'th-001', date: '31/10/2026', type: 'Consulta', title: 'Profilaxis y aplicación de flúor', doctor: 'Dra. Camila Andrade', pieces: 'Todas', note: 'Índice de placa 1. Se instruye técnica de Bass modificada.', cost: 45, icon: 'SparklesIcon', tone: 'success' as const },
  { id: 'th-002', date: '17/10/2026', type: 'Tratamiento', title: 'Resina compuesta pieza 26 (OD)', doctor: 'Dra. Camila Andrade', pieces: '26', note: 'Anestesia infiltrativa, aislamiento relativo. Sin complicaciones.', cost: 55, icon: 'WrenchScrewdriverIcon', tone: 'info' as const },
  { id: 'th-003', date: '03/10/2026', type: 'Consulta', title: 'Valoración inicial y radiografías', doctor: 'Dra. Camila Andrade', pieces: '—', note: 'Se toman 4 periapicales y 1 panorámica. Se elabora proforma PRF-2026-0390.', cost: 30, icon: 'ClipboardDocumentListIcon', tone: 'neutral' as const },
  { id: 'th-004', date: '12/06/2026', type: 'Tratamiento', title: 'Extracción pieza 38 (cordal impactado)', doctor: 'Dr. Santiago Moscoso', pieces: '38', note: 'Cirugía con colgajo, sutura reabsorbible. Control sin eventualidades a los 7 días.', cost: 120, icon: 'ScissorsIcon', tone: 'danger' as const },
  { id: 'th-005', date: '20/02/2026', type: 'Consulta', title: 'Control anual y profilaxis', doctor: 'Dra. Camila Andrade', pieces: 'Todas', note: 'Paciente nueva en la clínica. Se abre historia clínica.', cost: 40, icon: 'UserPlusIcon', tone: 'neutral' as const },
];

export default function TreatmentHistoryTab() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Historial de tratamientos y consultas</h2>
          <p className="text-sm text-muted-foreground">5 atenciones en los últimos 9 meses · Total facturado <strong className="tabular text-foreground">$290,00</strong></p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95">
          <Icon name="PrinterIcon" size={16} />
          Imprimir historial
        </button>
      </div>
      <ol className="relative space-y-4 border-l-2 border-border pl-6">
        {events.map((e) => (
          <li key={e.id} className="relative rounded-xl border border-border bg-background p-4 transition-shadow hover:shadow-md">
            <span className="absolute -left-[34px] top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-card">
              <Icon name={e.icon} size={13} />
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="tabular text-sm font-bold">{e.date}</span>
              <Badge tone={e.tone}>{e.type}</Badge>
              <span className="ml-auto tabular text-sm font-semibold">${e.cost.toFixed(2)}</span>
            </div>
            <h3 className="mt-1.5 text-base font-semibold">{e.title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{e.doctor} · Piezas: {e.pieces}</p>
            <p className="mt-2 text-sm">{e.note}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}