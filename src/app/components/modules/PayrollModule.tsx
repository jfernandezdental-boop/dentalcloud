'use client';
import React, { useMemo, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';

type Row = {
  id: string;
  name: string;
  role: string;
  base: number;
  extras: number;
  iessEmp: number;
  status: 'Pagado' | 'Pendiente';
};

const seed: Row[] = [
  { id: 'stf-001', name: 'Dra. Camila Andrade', role: 'Odontologo general', base: 1800, extras: 220, iessEmp: 9.45, status: 'Pagado' },
  { id: 'stf-002', name: 'Dr. Santiago Moscoso', role: 'Endodoncista', base: 2200, extras: 340, iessEmp: 9.45, status: 'Pagado' },
];

export default function PayrollModule() {
  const [staff, setStaff] = useState<Row[]>(seed);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ name: '', role: 'Odontologo', base: 800, extras: 0, status: 'Pendiente' as 'Pagado' | 'Pendiente' });

  const totalNet = useMemo(
    () => staff.reduce((acc, s) => acc + s.base + s.extras - (s.base + s.extras) * (s.iessEmp / 100), 0),
    [staff],
  );

  const save = () => {
    if (!form.name.trim()) {
      setToast('Nombre obligatorio');
      return;
    }
    setStaff((prev) => [
      {
        id: `stf-${Date.now()}`,
        name: form.name.trim(),
        role: form.role.trim(),
        base: Number(form.base) || 0,
        extras: Number(form.extras) || 0,
        iessEmp: 9.45,
        status: form.status,
      },
      ...prev,
    ]);
    setOpen(false);
    setForm({ name: '', role: 'Odontologo', base: 800, extras: 0, status: 'Pendiente' });
    setToast('Colaborador agregado al rol de pagos');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">Rol de pagos — neto</p>
            <p className="tabular mt-1 text-2xl font-bold text-primary">${totalNet.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{staff.length} colaboradores</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">Pendientes de pago</p>
            <p className="tabular mt-1 text-2xl font-bold text-warning">{staff.filter((s) => s.status === 'Pendiente').length}</p>
          </div>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
          <Icon name="PlusIcon" size={14} />
          Nuevo colaborador
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              {['Colaborador', 'Cargo', 'Sueldo base', 'Extras', 'IESS 9,45 %', 'Neto', 'Estado'].map((h) => (
                <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staff.map((s) => {
              const gross = s.base + s.extras;
              const iess = gross * (s.iessEmp / 100);
              return (
                <tr key={s.id} className="hover:bg-muted/40">
                  <td className="px-3 py-3 font-semibold">{s.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{s.role}</td>
                  <td className="px-3 py-3">${s.base.toFixed(2)}</td>
                  <td className="px-3 py-3">${s.extras.toFixed(2)}</td>
                  <td className="px-3 py-3 text-destructive">-${iess.toFixed(2)}</td>
                  <td className="px-3 py-3 font-bold">${(gross - iess).toFixed(2)}</td>
                  <td className="px-3 py-3">
                    <Badge tone={s.status === 'Pagado' ? 'success' : 'warning'} dot>
                      {s.status}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo colaborador (RR. HH.)"
        subtitle="Datos para el rol de pagos de la clinica"
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
          <input className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" placeholder="Nombre completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Cargo" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <select className="rounded-lg border px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'Pagado' | 'Pendiente' })}>
            <option value="Pendiente">Pendiente</option>
            <option value="Pagado">Pagado</option>
          </select>
          <input type="number" className="rounded-lg border px-3 py-2 text-sm" placeholder="Sueldo base" value={form.base} onChange={(e) => setForm({ ...form, base: Number(e.target.value) })} />
          <input type="number" className="rounded-lg border px-3 py-2 text-sm" placeholder="Extras / comisiones" value={form.extras} onChange={(e) => setForm({ ...form, extras: Number(e.target.value) })} />
        </div>
      </Modal>
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
