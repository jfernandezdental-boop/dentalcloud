import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { receipts, money, formatDate } from './billingData';

export default function ReceiptsList() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {receipts?.map((r, idx) => (
        <article
          key={r?.id}
          className={`relative overflow-hidden rounded-xl border border-dashed border-border bg-card p-4 ${idx === 0 ? 'xl:col-span-2' : ''}`}
        >
          <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-border bg-background" />
          <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-border bg-background" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="tabular text-xs font-semibold text-muted-foreground">{r?.number}</p>
              <p className="mt-0.5 truncate text-sm font-semibold">{r?.patient}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{r?.concept}</p>
            </div>
            <p className="tabular text-xl font-bold text-success">{money(r?.amount)}</p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-dashed border-border pt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Icon name="CalendarDaysIcon" size={14} />{formatDate(r?.date)}</span>
            <span className="inline-flex items-center gap-1"><Icon name="BanknotesIcon" size={14} />{r?.method}</span>
            <span className="tabular inline-flex items-center gap-1"><Icon name="DocumentTextIcon" size={14} />{r?.invoiceNumber}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
