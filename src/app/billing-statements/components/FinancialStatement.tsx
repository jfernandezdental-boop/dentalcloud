import React from 'react';
import { money } from './billingData';
import { useBillingData } from './useBillingData';

export default function FinancialStatement() {
  const { proformas, invoices, receipts } = useBillingData();
  const totalInvoiced = invoices?.reduce((s, i) => s + i?.total, 0);
  const totalCollected = receipts?.reduce((s, r) => s + r?.amount, 0);
  const overdue = invoices?.filter((i) => i?.status === 'Vencida')?.reduce((s, i) => s + (i?.total - i?.paid), 0);
  const pending = invoices?.reduce((s, i) => s + (i?.total - i?.paid), 0);

  const summary = [
    { label: 'Total facturado', value: money(totalInvoiced), cls: '' },
    { label: 'Total cobrado', value: money(totalCollected), cls: 'text-success' },
    { label: 'Saldo por cobrar', value: money(pending), cls: 'text-warning' },
    { label: 'Cartera vencida', value: money(overdue), cls: 'text-destructive' },
  ];

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary?.map((s) => (
          <div key={`sum-${s?.label}`} className="rounded-xl border border-border bg-card p-4">
            <dt className="text-xs text-muted-foreground">{s?.label}</dt>
            <dd className={`tabular mt-1 text-xl font-bold ${s?.cls}`}>{s?.value}</dd>
          </div>
        ))}
      </dl>
      <div className="space-y-3">
        {proformas?.map((p) => {
          const invoicedPct = Math.min(100, Math.round((p?.invoiced / p?.approved) * 100));
          const collectedPct = Math.min(100, Math.round((p?.collected / p?.approved) * 100));
          return (
            <div key={p?.code} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="tabular text-xs font-semibold text-primary">{p?.code}</p>
                  <p className="text-sm font-semibold">{p?.treatment}</p>
                  <p className="text-xs text-muted-foreground">{p?.patient}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Aprobado</p>
                  <p className="tabular text-lg font-bold">{money(p?.approved)}</p>
                </div>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted" role="img" aria-label={`Facturado ${invoicedPct}%, cobrado ${collectedPct}%`}>
                <div className="relative h-full" style={{ width: `${invoicedPct}%` }}>
                  <div className="absolute inset-0 bg-primary/30" />
                  <div className="absolute inset-y-0 left-0 bg-success" style={{ width: `${invoicedPct === 0 ? 0 : (collectedPct / invoicedPct) * 100}%` }} />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                <span>Facturado <b className="tabular text-foreground">{money(p?.invoiced)}</b> ({invoicedPct}%)</span>
                <span>Cobrado <b className="tabular text-success">{money(p?.collected)}</b> ({collectedPct}%)</span>
                <span>Por facturar <b className="tabular text-foreground">{money(p?.approved - p?.invoiced)}</b></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
