'use client';
import React, { useMemo, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import EmptyState from '@/components/ui/EmptyState';

type MovType = 'Ingreso' | 'Gasto';
type MovStatus = 'Confirmado' | 'Pendiente' | 'Anulado';

interface Movement {
  id: string;
  date: string;
  type: MovType;
  concept: string;
  party: string;
  method: string;
  amount: number;
  status: MovStatus;
}

const DEMO_SEED: Movement[] = [
  { id: 'mov-001', date: '31/10/2026', type: 'Ingreso', concept: 'Profilaxis', party: 'Andrea Villacis', method: 'Efectivo', amount: 45, status: 'Confirmado' },
  { id: 'mov-002', date: '31/10/2026', type: 'Ingreso', concept: 'Resina', party: 'Paciente demo', method: 'Tarjeta', amount: 80, status: 'Confirmado' },
  { id: 'mov-003', date: '30/10/2026', type: 'Gasto', concept: 'Insumos', party: 'Proveedor', method: 'Transferencia', amount: 120, status: 'Confirmado' },
];

const statusTone: Record<Movement['status'], 'success' | 'info' | 'warning' | 'danger'> = {
  Confirmado: 'success',
  Pendiente: 'warning',
  Anulado: 'danger',
};

const filters = ['Todos', 'Ingreso', 'Gasto'] as const;

export default function FinanceModule() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Movement[]>(() => (user?.clinicIsDemo ? DEMO_SEED : []));
  const [filter, setFilter] = useState<(typeof filters)[number]>('Todos');
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ type: 'Ingreso' as MovType, concept: '', party: '', method: 'Efectivo', amount: '' });

  const visible = useMemo(
    () => (filter === 'Todos' ? rows : rows.filter((r) => r.type === filter)),
    [rows, filter],
  );
  const income = useMemo(() => rows.filter((r) => r.type === 'Ingreso' && r.status !== 'Anulado').reduce((a, r) => a + r.amount, 0), [rows]);
  const expense = useMemo(() => rows.filter((r) => r.type === 'Gasto' && r.status !== 'Anulado').reduce((a, r) => a + r.amount, 0), [rows]);

  const save = () => {
    if (!form.concept.trim() || !form.amount) {
      setToast('Completa concepto e importe');
      return;
    }
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setToast('Importe inválido');
      return;
    }
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    setRows((prev) => [
      {
        id: `mov-${Date.now()}`,
        date: `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`,
        type: form.type,
        concept: form.concept.trim(),
        party: form.party.trim() || '—',
        method: form.method,
        amount,
        status: 'Confirmado',
      },
      ...prev,
    ]);
    setOpen(false);
    setForm({ type: 'Ingreso', concept: '', party: '', method: 'Efectivo', amount: '' });
    setToast('Movimiento registrado');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                filter === f ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
        >
          <Icon name="PlusIcon" size={14} /> Nuevo movimiento
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">Ingresos</p>
          <p className="text-lg font-bold tabular-nums text-success">${income.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">Gastos</p>
          <p className="text-lg font-bold tabular-nums text-destructive">${expense.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="text-lg font-bold tabular-nums">${(income - expense).toFixed(2)}</p>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Icon name="BanknotesIcon" size={24} />}
          title="Sin movimientos"
          description="Los ingresos y gastos de tu clínica aparecerán aquí. No se muestran datos de ejemplo."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                {['Fecha', 'Tipo', 'Concepto', 'Tercero', 'Método', 'Monto', 'Estado'].map((h) => (
                  <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((r) => (
                <tr key={r.id} className="hover:bg-muted/40">
                  <td className="px-3 py-2.5">{r.date}</td>
                  <td className="px-3 py-2.5">{r.type}</td>
                  <td className="px-3 py-2.5 font-medium">{r.concept}</td>
                  <td className="px-3 py-2.5">{r.party}</td>
                  <td className="px-3 py-2.5">{r.method}</td>
                  <td className="px-3 py-2.5 tabular-nums font-semibold">${r.amount.toFixed(2)}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo movimiento"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2 text-sm font-semibold">Cancelar</button>
            <button type="button" onClick={save} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Guardar</button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">Tipo
            <select className="mt-1 w-full rounded-lg border px-3 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as MovType })}>
              <option>Ingreso</option>
              <option>Gasto</option>
            </select>
          </label>
          <label className="text-sm font-semibold">Método
            <select className="mt-1 w-full rounded-lg border px-3 py-2" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              <option>Efectivo</option>
              <option>Tarjeta</option>
              <option>Transferencia</option>
            </select>
          </label>
          <label className="text-sm font-semibold sm:col-span-2">Concepto
            <input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} />
          </label>
          <label className="text-sm font-semibold">Tercero
            <input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} />
          </label>
          <label className="text-sm font-semibold">Monto
            <input type="number" min="0" step="0.01" className="mt-1 w-full rounded-lg border px-3 py-2" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </label>
        </div>
      </Modal>
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
