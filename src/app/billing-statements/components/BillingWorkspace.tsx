'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import MetricCard from '@/components/ui/MetricCard';
import InvoicesTable from './InvoicesTable';
import ReceiptsList from './ReceiptsList';
import FinancialStatement from './FinancialStatement';
import { money } from './billingData';
import { useBillingData } from './useBillingData';

type TabId = 'invoices' | 'receipts' | 'statements';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'invoices', label: 'Facturas', icon: 'DocumentTextIcon' },
  { id: 'receipts', label: 'Recibos de pago', icon: 'ReceiptPercentIcon' },
  { id: 'statements', label: 'Estados financieros', icon: 'ChartBarIcon' },
];

export default function BillingWorkspace() {
  const [tab, setTab] = useState<TabId>('invoices');
  const { invoices, receipts } = useBillingData();

  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const totalCollected = receipts.reduce((s, r) => s + r.amount, 0);
  const pending = invoices.reduce((s, i) => s + (i.total - i.paid), 0);
  const overdueCount = invoices.filter((i) => i.status === 'Vencida').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Facturación y estados de cuenta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Facturas, recibos y balances vinculados a tratamientos y proformas · Octubre 2026
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95">
          <Icon name="ArrowDownTrayIcon" size={16} />
          Exportar para contabilidad
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Facturado" value={money(totalInvoiced)} icon="DocumentTextIcon" tone="hero" helper={`${invoices.length} facturas emitidas`} />
        <MetricCard label="Cobrado" value={money(totalCollected)} icon="BanknotesIcon" tone="success" helper={`${receipts.length} recibos`} />
        <MetricCard label="Saldo por cobrar" value={money(pending)} icon="ClockIcon" tone="warning" helper="Facturas abiertas" />
        <MetricCard label="Facturas vencidas" value={String(overdueCount)} icon="ExclamationTriangleIcon" tone="alert" helper="Requieren gestión de cobro" />
      </div>

      <div>
        <div role="tablist" className="mb-4 flex gap-1 overflow-x-auto border-b border-border scrollbar-thin">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'invoices' && <InvoicesTable />}
        {tab === 'receipts' && <ReceiptsList />}
        {tab === 'statements' && <FinancialStatement />}
      </div>
    </div>
  );
}
