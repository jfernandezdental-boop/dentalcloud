'use client';
import React, { useState } from 'react';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';

type LabStatus = 'Falta procesar' | 'Procesado' | 'Ajuste correcto';

interface LabOrder {
  id: string;
  code: string;
  patient: string;
  piece: string;
  type: string;
  lab: string;
  sent: string;
  due: string;
  status: LabStatus;
  late: boolean;
}

const seed: LabOrder[] = [
  { id: 'lab-001', code: 'LAB-2026-0214', patient: 'Ricardo Benitez', piece: '46', type: 'Corona zirconio', lab: 'Lab Andino', sent: '18/10/2026', due: '30/10/2026', status: 'Procesado', late: true },
  { id: 'lab-002', code: 'LAB-2026-0219', patient: 'Patricio Naranjo', piece: '36', type: 'Corona metal-porcelana', lab: 'Lab Andino', sent: '21/10/2026', due: '03/11/2026', status: 'Falta procesar', late: false },
];

const tone: Record<LabStatus, 'warning' | 'info' | 'success'> = {
  'Falta procesar': 'warning',
  Procesado: 'info',
  'Ajuste correcto': 'success',
};
const flow: LabStatus[] = ['Falta procesar', 'Procesado', 'Ajuste correcto'];

function today() {
  return new Date().toLocaleDateString('es-EC');
}

export default function LabModule() {
  const [orders, setOrders] = useState<LabOrder[]>(seed);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ patient: '', piece: '', type: '', lab: '', due: '' });

  const next = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const idx = flow.indexOf(o.status);
        return idx < flow.length - 1 ? { ...o, status: flow[idx + 1], late: false } : o;
      }),
    );
  };

  const save = () => {
    if (!form.patient.trim() || !form.type.trim()) {
      setToast('Paciente y tipo de trabajo son obligatorios');
      return;
    }
    const n = orders.length + 220;
    setOrders((prev) => [
      {
        id: `lab-${Date.now()}`,
        code: `LAB-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`,
        patient: form.patient.trim(),
        piece: form.piece.trim() || '—',
        type: form.type.trim(),
        lab: form.lab.trim() || 'Laboratorio',
        sent: today(),
        due: form.due || today(),
        status: 'Falta procesar',
        late: false,
      },
      ...prev,
    ]);
    setOpen(false);
    setForm({ patient: '', piece: '', type: '', lab: '', due: '' });
    setToast('Orden de laboratorio creada');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {flow.map((s) => (
            <span key={s} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
              <Badge tone={tone[s]}>{orders.filter((o) => o.status === s).length}</Badge>
              {s}
            </span>
          ))}
        </div>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
          <Icon name="PlusIcon" size={14} />
          Nueva orden
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              {['Orden', 'Paciente', 'Pieza', 'Trabajo', 'Laboratorio', 'Enviado', 'Entrega', 'Estado', ''].map((h) => (
                <th key={h || 'a'} className="px-3 py-2.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-muted/40">
                <td className="px-3 py-3 text-xs font-semibold">{o.code}</td>
                <td className="px-3 py-3 font-medium">{o.patient}</td>
                <td className="px-3 py-3">{o.piece}</td>
                <td className="px-3 py-3">{o.type}</td>
                <td className="px-3 py-3 text-muted-foreground">{o.lab}</td>
                <td className="px-3 py-3">{o.sent}</td>
                <td className={`px-3 py-3 font-semibold ${o.late ? 'text-destructive' : ''}`}>{o.due}</td>
                <td className="px-3 py-3">
                  <Badge tone={tone[o.status]} dot>
                    {o.status}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-right">
                  {o.status !== 'Ajuste correcto' ? (
                    <button type="button" onClick={() => next(o.id)} className="rounded-md border px-2.5 py-1 text-xs font-semibold hover:bg-primary hover:text-primary-foreground">
                      Avanzar
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva orden de laboratorio"
        subtitle="Registra trabajo enviado al lab"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2 text-sm font-semibold">
              Cancelar
            </button>
            <button type="button" onClick={save} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Crear orden
            </button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" placeholder="Paciente" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} />
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Pieza" value={form.piece} onChange={(e) => setForm({ ...form, piece: e.target.value })} />
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Tipo de trabajo" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Laboratorio" value={form.lab} onChange={(e) => setForm({ ...form, lab: e.target.value })} />
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Fecha entrega DD/MM/AAAA" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
        </div>
      </Modal>
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
