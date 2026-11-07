'use client';
import React, { useMemo, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import EmptyState from '@/components/ui/EmptyState';

type Row = {
  id: string;
  name: string;
  role: string;
  base: number;
  extras: number;
  iessEmp: number;
  status: 'Activo' | 'Pendiente';
};

const DEMO_SEED: Row[] = [
  { id: 'stf-001', name: 'Dra. Camila Andrade', role: 'Odontologo general', base: 1800, extras: 220, iessEmp: 9.45, status: 'Activo' },
];

export default function PayrollModule() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<Row[]>(() => (user?.clinicIsDemo ? DEMO_SEED : []));
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ name: '', role: 'Odontologo', base: 800, extras: 0, status: 'Pendiente' as Row['status'] });

  const total = useMemo(
    () => staff.reduce((a, s) => a + s.base + s.extras - (s.base + s.extras) * (s.iessEmp / 100), 0),
    [staff],
  );

  const save = () => {
    if (!form.name.trim()) return setToast('Nombre obligatorio');
    setStaff((prev) => [
      {
        id: `stf-${Date.now()}`,
        name: form.name.trim(),
        role: form.role,
        base: Number(form.base) || 0,
        extras: Number(form.extras) || 0,
        iessEmp: 9.45,
        status: form.status,
      },
      ...prev,
    ]);
    setOpen(false);
    setForm({ name: '', role: 'Odontologo', base: 800, extras: 0, status: 'Pendiente' });
    setToast('Colaborador registrado');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Nómina del personal de la clínica</p>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
          <Icon name="PlusIcon" size={14} /> Agregar
        </button>
      </div>

      {staff.length === 0 ? (
        <EmptyState
          icon={<Icon name="UserGroupIcon" size={24} />}
          title="Sin personal registrado"
          description="Agrega al equipo de tu clínica. No se muestran datos de ejemplo."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                {['Nombre', 'Rol', 'Base', 'Extras', 'IESS %', 'Neto est.', 'Estado'].map((h) => (
                  <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staff.map((s) => {
                const neto = s.base + s.extras - (s.base + s.extras) * (s.iessEmp / 100);
                return (
                  <tr key={s.id} className="hover:bg-muted/40">
                    <td className="px-3 py-2.5 font-medium">{s.name}</td>
                    <td className="px-3 py-2.5">{s.role}</td>
                    <td className="px-3 py-2.5 tabular-nums">{s.base.toFixed(2)}</td>
                    <td className="px-3 py-2.5 tabular-nums">{s.extras.toFixed(2)}</td>
                    <td className="px-3 py-2.5">{s.iessEmp}</td>
                    <td className="px-3 py-2.5 tabular-nums font-semibold">{neto.toFixed(2)}</td>
                    <td className="px-3 py-2.5">
                      <Badge tone={s.status === 'Activo' ? 'success' : 'warning'}>{s.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-right text-sm">Total neto estimado: <strong>{total.toFixed(2)}</strong></p>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo colaborador" footer={
        <>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2 text-sm font-semibold">Cancelar</button>
          <button type="button" onClick={save} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Guardar</button>
        </>
      }>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold sm:col-span-2">Nombre
            <input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="text-sm font-semibold">Rol
            <input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </label>
          <label className="text-sm font-semibold">Base
            <input type="number" className="mt-1 w-full rounded-lg border px-3 py-2" value={form.base} onChange={(e) => setForm({ ...form, base: Number(e.target.value) })} />
          </label>
        </div>
      </Modal>
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
