'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import ProfileTab from './tabs/ProfileTab';
import ClinicalHistoryTab from './tabs/ClinicalHistoryTab';
import TreatmentHistoryTab from './tabs/TreatmentHistoryTab';
import BudgetsTab from './tabs/BudgetsTab';
import PrescriptionsTab from './tabs/PrescriptionsTab';
import XraysTab from './tabs/XraysTab';
import PaymentsTab from './tabs/PaymentsTab';
import RealBudgetsTab from './tabs/RealBudgetsTab';
import RealPaymentsTab from './tabs/RealPaymentsTab';
import RealClinicalHistoryTab from './tabs/RealClinicalHistoryTab';
import RealPrescriptionsTab from './tabs/RealPrescriptionsTab';
import RealHistoryTab from './tabs/RealHistoryTab';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/components/AuthProvider';
import type { PatientListItem } from './PatientListPanel';

const tabs = [
  { id: 'pt-profile', key: 'profile', label: 'Datos del paciente', icon: 'IdentificationIcon' },
  { id: 'pt-hc', key: 'hc', label: 'Historia clinica MSP', icon: 'ClipboardDocumentListIcon' },
  { id: 'pt-hist', key: 'hist', label: 'Historial', icon: 'ClockIcon' },
  { id: 'pt-bud', key: 'bud', label: 'Presupuestos', icon: 'DocumentTextIcon' },
  { id: 'pt-rx', key: 'rx', label: 'Recetario', icon: 'BeakerIcon' },
  { id: 'pt-img', key: 'img', label: 'Radiografias', icon: 'PhotoIcon' },
  { id: 'pt-pay', key: 'pay', label: 'Pagos', icon: 'BanknotesIcon' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export default function PatientTabs({
  patient,
  onProfileSaved,
}: {
  patient: PatientListItem;
  onProfileSaved?: (values: Record<string, string>) => Promise<void> | void;
}) {
  const [active, setActive] = useState<TabKey>('profile');
  const { user } = useAuth();
  const demo = !!user?.clinicIsDemo;
  const pending = (title: string) => (
    <EmptyState
      icon={<Icon name="ClockIcon" size={24} />}
      title={`${title}: sin registros`}
      description="Este paciente todavía no tiene información en esta sección."
    />
  );

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex gap-1 overflow-x-auto border-b border-border px-3 pt-3 scrollbar-thin" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === t.key}
            onClick={() => setActive(t.key)}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-all duration-150 ${
              active === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={t.icon} size={16} />
            {t.label}
          </button>
        ))}
      </div>
      <div className="animate-fade-in p-5" key={`ptab-${patient.id}-${active}`}>
        {active === 'profile' && <ProfileTab patient={patient} onSaved={onProfileSaved} />}
        {active === 'hc' && (demo ? <ClinicalHistoryTab /> : <RealClinicalHistoryTab patientId={patient.id} />)}
        {active === 'hist' && (demo ? <TreatmentHistoryTab /> : <RealHistoryTab patientId={patient.id} />)}
        {active === 'bud' && (demo ? <BudgetsTab /> : <RealBudgetsTab patientId={patient.id} />)}
        {active === 'rx' && (demo ? <PrescriptionsTab /> : <RealPrescriptionsTab patientId={patient.id} />)}
        {active === 'img' && (demo ? <XraysTab /> : pending('Radiografías'))}
        {active === 'pay' && (demo ? <PaymentsTab /> : <RealPaymentsTab patientId={patient.id} />)}
      </div>
    </section>
  );
}
