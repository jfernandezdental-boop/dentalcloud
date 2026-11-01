'use client';
import React, { useState } from 'react';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';

type BudgetStatus = 'Borrador' | 'Enviada' | 'Aprobada' | 'Parcialmente pagada' | 'Pagada';

interface Line {
  id: string;
  piece: string;
  procedure: string;
  qty: number;
  unit: number;
}

interface Budget {
  id: string;
  code: string;
  date: string;
  status: BudgetStatus;
  paid: number;
  lines: Line[];
}

const initial: Budget[] = [
  {
    id: 'bud-001',
    code: 'PRF-2026-0390',
    date: '03/10/2026',
    status: 'Parcialmente pagada',
    paid: 100,
    lines: [
      { id: 'bl-001', piece: '46', procedure: 'Resina compuesta cuádruple (OMDV)', qty: 1, unit: 85 },
      { id: 'bl-002', piece: '36', procedure: 'Corona cerámica sobre metal', qty: 1, unit: 280 },
      { id: 'bl-003', piece: 'Todas', procedure: 'Profilaxis y flúor', qty: 1, unit: 45 },
    ],
  },
  {
    id: 'bud-002',
    code: 'PRF-2026-0412',
    date: '31/10/2026',
    status: 'Borrador',
    paid: 0,
    lines: [
      { id: 'bl-004', piece: 'Sup.', procedure: 'Guarda oclusal rígida', qty: 1, unit: 150 },
      { id: 'bl-005', piece: 'Todas', procedure: 'Blanqueamiento en consultorio', qty: 1, unit: 180 },
    ],
  },
];

const tone: Record<BudgetStatus, 'neutral' | 'info' | 'success' | 'warning'> = {
  Borrador: 'neutral',
  Enviada: 'info',
  Aprobada: 'success',
  'Parcialmente pagada': 'warning',
  Pagada: 'success',
};

const total = (b: Budget) => b.lines.reduce((a, l) => a + l.qty * l.unit, 0);

export default function BudgetsTab() {
  const [budgets, setBudgets] = useState<Budget[]>(initial);
  const [toast, setToast] = useState('');

  const advance = (id: string) => {
    setBudgets((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        if (b.status === 'Borrador') return { ...b, status: 'Enviada' };
        if (b.status === 'Enviada') return { ...b, status: 'Aprobada' };
        return b;
      })
    );
    setToast('Proforma actualizada');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Presupuestos y proformas</h2>
          <p className="text-sm text-muted-foreground">Genera la proforma desde el odontograma y envíala al paciente por WhatsApp o correo.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95">
          <Icon name="PlusIcon" size={16} />
          Nueva proforma
        </button>
      </div>

      {budgets.map((b) => {
        const t = total(b);
        return (
          <article key={b.id} className="overflow-hidden rounded-xl border border-border">
            <header className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/50 px-4 py-3">
              <span className="tabular text-sm font-bold">{b.code}</span>
              <span className="tabular text-sm text-muted-foreground">{b.date}</span>
              <Badge tone={tone[b.status]} dot>{b.status}</Badge>
              <div className="ml-auto flex gap-2">
                {(b.status === 'Borrador' || b.status === 'Enviada') && (
                  <button onClick={() => advance(b.id)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95">
                    {b.status === 'Borrador' ? 'Enviar al paciente' : 'Marcar aprobada'}
                  </button>
                )}
                <button className="rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-semibold transition-all hover:bg-muted active:scale-95">PDF</button>
              </div>
            </header>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    {['Pieza', 'Procedimiento', 'Cant.', 'P. unitario', 'Subtotal'].map((h) => (
                      <th key={`bh-${b.id}-${h}`} className="px-4 py-2 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {b.lines.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/40">
                      <td className="tabular px-4 py-2.5 font-semibold">{l.piece}</td>
                      <td className="px-4 py-2.5">{l.procedure}</td>
                      <td className="tabular px-4 py-2.5">{l.qty}</td>
                      <td className="tabular px-4 py-2.5">${l.unit.toFixed(2)}</td>
                      <td className="tabular px-4 py-2.5 font-semibold">${(l.qty * l.unit).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="flex flex-wrap items-center justify-end gap-6 border-t border-border bg-muted/30 px-4 py-3 text-sm">
              <span>Total <strong className="tabular ml-1 text-base">${t.toFixed(2)}</strong></span>
              <span>Abonado <strong className="tabular ml-1 text-success">${b.paid.toFixed(2)}</strong></span>
              <span>Saldo <strong className={`tabular ml-1 text-base ${t - b.paid > 0 ? 'text-destructive' : 'text-success'}`}>${(t - b.paid).toFixed(2)}</strong></span>
            </footer>
          </article>
        );
      })}
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}