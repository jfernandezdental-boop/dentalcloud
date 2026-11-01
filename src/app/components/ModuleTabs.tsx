'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import FinanceModule from './modules/FinanceModule';
import PayrollModule from './modules/PayrollModule';
import LabModule from './modules/LabModule';
import InventoryModule from './modules/InventoryModule';
import NotificationsModule from './modules/NotificationsModule';

const tabs = [
  { id: 'tab-fin', key: 'fin', label: 'Finanzas', icon: 'BanknotesIcon' },
  { id: 'tab-rrhh', key: 'rrhh', label: 'RR. HH.', icon: 'IdentificationIcon' },
  { id: 'tab-lab', key: 'lab', label: 'Laboratorio', icon: 'BeakerIcon' },
  { id: 'tab-inv', key: 'inv', label: 'Inventario', icon: 'ArchiveBoxIcon' },
  { id: 'tab-ntf', key: 'ntf', label: 'Notificaciones IA', icon: 'SparklesIcon' },
] as const;

export default function ModuleTabs() {
  const [active, setActive] = useState<(typeof tabs)[number]['key']>('fin');

  return (
    <section className="min-w-0 rounded-2xl border border-border bg-card">
      <div className="flex gap-1 overflow-x-auto border-b border-border px-3 pt-3 scrollbar-thin" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.key}
            onClick={() => setActive(t.key)}
            className={`flex shrink-0 items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold transition-all duration-150 ${
              active === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={t.icon} size={16} />
            {t.label}
          </button>
        ))}
      </div>
      <div className="animate-fade-in p-5" key={`panel-${active}`}>
        {active === 'fin' && <FinanceModule />}
        {active === 'rrhh' && <PayrollModule />}
        {active === 'lab' && <LabModule />}
        {active === 'inv' && <InventoryModule />}
        {active === 'ntf' && <NotificationsModule />}
      </div>
    </section>
  );
}