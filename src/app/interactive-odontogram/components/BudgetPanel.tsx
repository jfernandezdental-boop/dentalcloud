'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import EmptyState from '@/components/ui/EmptyState';
import { ChartState, buildBudgetLines, formatUsd } from '@/lib/odontogram';

interface BudgetPanelProps {
  chart: ChartState;
  onGenerate: (total: number, lines: number) => void;
}

export default function BudgetPanel({ chart, onGenerate }: BudgetPanelProps) {
  const lines = useMemo(() => buildBudgetLines(chart), [chart]);
  const total = lines.reduce((a, l) => a + l.price, 0);

  return (
    <section className="no-print rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">Proforma desde el odontograma</h2>
          <p className="text-xs text-muted-foreground">Se calcula con los hallazgos pendientes (rojo)</p>
        </div>
        <span className="tabular rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">{formatUsd(total)}</span>
      </div>
      {lines.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<Icon name="ReceiptPercentIcon" size={24} />}
            title="Sin tratamientos pendientes"
            description="Marca caries o tratamientos indicados en rojo para generar una proforma."
          />
        </div>
      ) : (
        <>
          <ul className="max-h-64 divide-y divide-border overflow-y-auto scrollbar-thin">
            {lines.map((l) => (
              <li key={l.id} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                <span className="tabular flex h-8 w-10 items-center justify-center rounded-md bg-muted text-sm font-bold">{l.tooth}</span>
                <span className="flex-1">{l.description}</span>
                <span className="tabular font-semibold">{formatUsd(l.price)}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-3">
            <Link href="/patient-record" className="rounded-lg border border-input bg-card px-3.5 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95">
              Ver presupuestos del paciente
            </Link>
            <button
              onClick={() => onGenerate(total, lines.length)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
            >
              <Icon name="DocumentPlusIcon" size={16} />
              Generar proforma
            </button>
          </div>
        </>
      )}
    </section>
  );
}
