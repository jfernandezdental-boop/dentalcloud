'use client';
import React, { useMemo, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';

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

const seed: Movement[] = [
  { id: 'mov-001', date: '31/10/2026', type: 'Ingreso', concept: 'Profilaxis', party: 'Andrea Villacis', method: 'Efectivo', doc: 'FAC-001', amount: 45, status: 'Cobrado' },
  { id: 'mov-002', date: '30/10/2026', type: 'Gasto', concept: 'Compra resina', party: 'DentalPro', method: 'Transferencia', doc: 'FAC-PROV-1', amount: 212.8, status: 'Pagado' },
];

const statusTone: Record<Movement['status'], 'success' | 'info' | 'warning' | 'danger'> = {
  Cobrado: 'success',
  Pagado: 'info',
  'Por cobrar': 'warning',
  Vencido: 'danger',
};

const filters = ['Todos', 'Ingreso', 'Gasto'] as const;

function today() {
  return new Date().toLocaleDateString('es-EC');
}

export default function FinanceModule() {
  const [rows, setRows] = useState<Movement[]>(seed);
  const [filter, setFilter] = useState<(typeof filters)[number]>('Todos');
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({
    type: 'Ingreso' as 'Ingreso' | 'Gasto',
    concept: '',
    party: '',
    method: 'Efectivo',
    doc: '',
    amount: 0,
    status: 'Cobrado' as Movement['status'],
  });

  const list = rows.filter((m) => filter === 'Todos' || m.type === filter);
  const ingresos = useMemo(() => rows.filter((m) => m.type === 'Ingreso').reduce((a, m) => a + m.amount, 0), [rows]);
  const gastos = useMemo(() => rows.filter((m) => m.type === 'Gasto').reduce((a, m) => a + m.amount, 0), [rows]);
  const porCobrar = useMemo(
    () => rows.filter((m) => m.type === 'Ingreso' && (m.status === 'Por cobrar' || m.status === 'Vencido')).reduce((a, m) => a + m.amount, 0),
    [rows],
  );

  const save = () => {
    if (!form.concept.trim() || !form.party.trim() || !(form.amount > 0)) {
      setToast('Concepto, paciente/proveedor y monto son obligatorios');
      return;
    }
    const status: Movement['status'] =
      form.type === 'Gasto' ? 'Pagado' : form.status === 'Pagado' ? 'Cobrado' : form.status;
    setRows((prev) => [
      {
        id: `mov-${Date.now()}`,
        date: today(),
        type: form.type,
        concept: form.concept.trim(),
        party: form.party.trim(),
        method: form.method,
        doc: form.doc.trim() || (form.type === 'Ingreso' ? `FAC-${Date.now() % 10000}` : `GAS-${Date.now() % 10000}`),
        amount: Number(form.amount),
        status,
      },
      ...prev,
    ]);
    setOpen(false);
    setForm({ type: 'Ingreso', concept: '', party: '', method: 'Efectivo', doc: '', amount: 0, status: 'Cobrado' });
    setToast('Movimiento registrado en finanzas');
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs text-muted-foreground">Ingresos</p>
          <p className="tabular mt-1 text-2xl font-bold text-success">${ingresos.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs text-muted-foreground">Gastos</p>
          <p className="tabular mt-1 text-2xl font-bold text-accent">${gastos.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs text-muted-foreground">Utilidad</p>
          <p className="tabular mt-1 text-2xl font-bold text-primary">${(ingresos - gastos).toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs text-muted-foreground">Por cobrar</p>
          <p className="tabular mt-1 text-2xl font-bold text-destructive">${porCobrar.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg bg-muted p-1">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${filter === f ? 'bg-card shadow' : 'text-muted-foreground'}`}
            >
              {f === 'Todos' ? f : `${f}s`}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
          <Icon name="PlusIcon" size={14} />
          Registrar movimiento
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              {['Fecha', 'Tipo', 'Concepto', 'Paciente / Proveedor', 'Pago', 'Comprobante', 'Monto', 'Estado'].map((h) => (
                <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((m) => (
              <tr key={m.id} className="hover:bg-muted/40">
                <td className="px-4 py-3">{m.date}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold ${m.type === 'Ingreso' ? 'text-success' : 'text-accent'}`}>{m.type}</span>
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 font-medium">{m.concept}</td>
                <td className="px-4 py-3">{m.party}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.method}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{m.doc}</td>
                <td className={`px-4 py-3 text-right font-bold ${m.type === 'Gasto' ? 'text-accent' : ''}`}>
                  {m.type === 'Gasto' ? '-' : ''}${m.amount.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone[m.status]} dot>
                    {m.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Registrar movimiento financiero"
        subtitle="Ingreso o gasto de la clinica"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2 text-sm font-semibold">
              Cancelar
            </button>
            <button type="button" onClick={save} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Guardar
            </button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <select className="rounded-lg border px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'Ingreso' | 'Gasto' })}>
            <option value="Ingreso">Ingreso</option>
            <option value="Gasto">Gasto</option>
          </select>
          <select className="rounded-lg border px-3 py-2 text-sm" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
            {['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque', 'Pendiente'].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <input className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" placeholder="Concepto" value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} />
          <input className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" placeholder="Paciente o proveedor" value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} />
          <input type="number" step="0.01" className="rounded-lg border px-3 py-2 text-sm" placeholder="Monto" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="N. comprobante (opcional)" value={form.doc} onChange={(e) => setForm({ ...form, doc: e.target.value })} />
          {form.type === 'Ingreso' ? (
            <select className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Movement['status'] })}>
              <option value="Cobrado">Cobrado</option>
              <option value="Por cobrar">Por cobrar</option>
              <option value="Vencido">Vencido</option>
            </select>
          ) : null}
        </div>
      </Modal>
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
