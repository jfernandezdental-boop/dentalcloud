'use client';
import React, { useMemo, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';
import EmptyState from '@/components/ui/EmptyState';
import { statusTone, money, formatDate, InvoiceStatus } from './billingData';
import { useBillingData } from './useBillingData';

const filters: ('Todas' | InvoiceStatus)[] = ['Todas', 'Pagada', 'Parcial', 'Pendiente', 'Vencida'];

export default function InvoicesTable() {
  const { invoices } = useBillingData();
  const [filter, setFilter] = useState<'Todas' | InvoiceStatus>('Todas');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((i) => {
      const matchStatus = filter === 'Todas' || i.status === filter;
      const matchQuery =
        !q ||
        i.patient.toLowerCase().includes(q) ||
        i.number.toLowerCase().includes(q) ||
        i.treatment.toLowerCase().includes(q) ||
        i.proforma.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [filter, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={`inv-filter-${f}`}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                filter === f ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <Icon name="MagnifyingGlassIcon" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar paciente, factura o proforma"
            aria-label="Buscar facturas"
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<Icon name="DocumentTextIcon" size={24} />} title="Sin facturas" description="No hay facturas que coincidan con el filtro aplicado." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border scrollbar-thin">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {['Factura', 'Paciente', 'Tratamiento', 'Proforma', 'Emisión', 'Total', 'Saldo', 'Estado'].map((h) => (
                  <th key={`invh-${h}`} className="px-4 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {rows.map((i) => {
                const balance = i.total - i.paid;
                return (
                  <tr key={i.id} className="hover:bg-muted/40">
                    <td className="tabular px-4 py-3 text-xs font-semibold">{i.number}</td>
                    <td className="px-4 py-3 font-medium">{i.patient}</td>
                    <td className="px-4 py-3 text-muted-foreground">{i.treatment}</td>
                    <td className="tabular px-4 py-3 text-xs text-muted-foreground">{i.proforma}</td>
                    <td className="tabular px-4 py-3">{formatDate(i.issuedAt)}</td>
                    <td className="tabular px-4 py-3 font-bold">{money(i.total)}</td>
                    <td className={`tabular px-4 py-3 font-bold ${balance > 0 ? 'text-destructive' : 'text-success'}`}>{money(balance)}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone[i.status]} dot>{i.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
