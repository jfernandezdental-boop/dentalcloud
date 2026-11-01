'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';

interface Movement {
  id: string;
  date: string;
  type: 'Ingreso' | 'Gasto';
  concept: string;
  party: string;
  method: string;
  doc: string;
  amount: number;
  status: 'Cobrado' | 'Pagado' | 'Por cobrar' | 'Vencido';
}

const movements: Movement[] = [
  { id: 'mov-001', date: '31/10/2026', type: 'Ingreso', concept: 'Profilaxis y flúor', party: 'Andrea Villacís', method: 'Tarjeta crédito', doc: 'FAC 001-001-000004812', amount: 45, status: 'Cobrado' },
  { id: 'mov-002', date: '31/10/2026', type: 'Ingreso', concept: 'Endodoncia pieza 36 (abono 2/3)', party: 'Marco Tulio Cevallos', method: 'Transferencia', doc: 'FAC 001-001-000004813', amount: 180, status: 'Cobrado' },
  { id: 'mov-003', date: '31/10/2026', type: 'Ingreso', concept: 'Ortodoncia — control mensual', party: 'Valentina Carrión', method: 'Efectivo', doc: 'FAC 001-001-000004814', amount: 60, status: 'Cobrado' },
  { id: 'mov-004', date: '30/10/2026', type: 'Gasto', concept: 'Compra resina Filtek A2 ×4', party: 'DentalPro Ecuador S.A.', method: 'Transferencia', doc: 'FAC 003-002-000118220', amount: 212.8, status: 'Pagado' },
  { id: 'mov-005', date: '30/10/2026', type: 'Ingreso', concept: 'Corona sobre implante 46 (saldo)', party: 'Ricardo Benítez', method: 'Pendiente', doc: 'PRF-2026-0388', amount: 640, status: 'Por cobrar' },
  { id: 'mov-006', date: '28/10/2026', type: 'Gasto', concept: 'Arriendo local — octubre', party: 'Inmobiliaria Pichincha', method: 'Transferencia', doc: 'FAC 002-001-000009104', amount: 1450, status: 'Pagado' },
  { id: 'mov-007', date: '22/10/2026', type: 'Ingreso', concept: 'Blanqueamiento sesión 2', party: 'Mónica Altamirano', method: 'Pendiente', doc: 'PRF-2026-0371', amount: 120, status: 'Vencido' },
  { id: 'mov-008', date: '20/10/2026', type: 'Gasto', concept: 'Prótesis total — laboratorio', party: 'Laboratorio Dental Andino', method: 'Cheque', doc: 'FAC 001-003-000045119', amount: 320, status: 'Pagado' },
];

const statusTone: Record<Movement['status'], 'success' | 'info' | 'warning' | 'danger'> = {
  Cobrado: 'success',
  Pagado: 'info',
  'Por cobrar': 'warning',
  Vencido: 'danger',
};

const filters = ['Todos', 'Ingreso', 'Gasto'] as const;

export default function FinanceModule() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('Todos');
  const rows = movements.filter((m) => filter === 'Todos' || m.type === filter);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { id: 'fs-1', label: 'Ingresos octubre', value: '$24 860', tone: 'text-success', helper: '+12,3 % vs. sep.' },
          { id: 'fs-2', label: 'Gastos octubre', value: '$15 480', tone: 'text-accent', helper: '−10,6 % vs. sep.' },
          { id: 'fs-3', label: 'Utilidad neta', value: '$9 380', tone: 'text-primary', helper: 'Margen 37,7 %' },
          { id: 'fs-4', label: 'Por cobrar', value: '$8 940', tone: 'text-destructive', helper: '$2 310 vencido > 30 d' },
        ].map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className={`tabular mt-1 text-2xl font-bold ${s.tone}`}>{s.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.helper}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg bg-muted p-1">
          {filters.map((f) => (
            <button
              key={`ff-${f}`}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 ${filter === f ? 'bg-card shadow' : 'text-muted-foreground'}`}
            >
              {f === 'Todos' ? f : `${f}s`}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-semibold transition-all hover:bg-muted active:scale-95">
            <Icon name="ArrowDownTrayIcon" size={14} />
            Exportar Excel
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95">
            <Icon name="PlusIcon" size={14} />
            Registrar movimiento
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border scrollbar-thin">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {['Fecha', 'Tipo', 'Concepto', 'Paciente / Proveedor', 'Forma de pago', 'Comprobante', 'Monto', 'Estado'].map((h) => (
                <th key={`fh-${h}`} className="px-4 py-2.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((m) => (
              <tr key={m.id} className="transition-colors hover:bg-muted/40">
                <td className="tabular px-4 py-3">{m.date}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${m.type === 'Ingreso' ? 'text-success' : 'text-accent'}`}>
                    <Icon name={m.type === 'Ingreso' ? 'ArrowDownLeftIcon' : 'ArrowUpRightIcon'} size={13} />
                    {m.type}
                  </span>
                </td>
                <td className="max-w-[220px] truncate px-4 py-3 font-medium">{m.concept}</td>
                <td className="px-4 py-3">{m.party}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.method}</td>
                <td className="tabular px-4 py-3 text-xs text-muted-foreground">{m.doc}</td>
                <td className={`tabular px-4 py-3 text-right font-bold ${m.type === 'Gasto' ? 'text-accent' : ''}`}>
                  {m.type === 'Gasto' ? '−' : ''}${m.amount.toFixed(2)}
                </td>
                <td className="px-4 py-3"><Badge tone={statusTone[m.status]} dot>{m.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}