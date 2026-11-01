'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';

type Perm = 'agenda' | 'clinica' | 'odonto' | 'finanzas' | 'rrhh' | 'inventario' | 'config';

const permissions: { id: Perm; label: string }[] = [
  { id: 'agenda', label: 'Agenda' },
  { id: 'clinica', label: 'Historia clínica' },
  { id: 'odonto', label: 'Odontograma' },
  { id: 'finanzas', label: 'Finanzas' },
  { id: 'rrhh', label: 'RR. HH.' },
  { id: 'inventario', label: 'Inventario' },
  { id: 'config', label: 'Configuración' },
];

interface Role {
  id: string;
  name: string;
  description: string;
  users: number;
  perms: Record<Perm, boolean>;
  locked?: boolean;
}

const initialRoles: Role[] = [
  { id: 'role-admin', name: 'Administrador de clínica', description: 'Crea personal y asigna roles dentro de su clínica', users: 231, locked: true, perms: { agenda: true, clinica: true, odonto: true, finanzas: true, rrhh: true, inventario: true, config: true } },
  { id: 'role-doc', name: 'Odontólogo', description: 'Atiende pacientes, odontograma y recetas', users: 587, perms: { agenda: true, clinica: true, odonto: true, finanzas: false, rrhh: false, inventario: true, config: false } },
  { id: 'role-recep', name: 'Recepción', description: 'Agenda, cobros y datos del paciente', users: 342, perms: { agenda: true, clinica: false, odonto: false, finanzas: true, rrhh: false, inventario: false, config: false } },
  { id: 'role-aux', name: 'Auxiliar odontológico', description: 'Apoyo clínico e inventario', users: 298, perms: { agenda: true, clinica: false, odonto: false, finanzas: false, rrhh: false, inventario: true, config: false } },
  { id: 'role-cont', name: 'Contador', description: 'Finanzas, rol de pagos y reportes', users: 55, perms: { agenda: false, clinica: false, odonto: false, finanzas: true, rrhh: true, inventario: false, config: false } },
];

export default function RolesMatrix() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const toggle = (roleId: string, perm: Perm) => {
    setRoles((prev) => prev.map((r) => (r.id === roleId && !r.locked ? { ...r, perms: { ...r.perms, [perm]: !r.perms[perm] } } : r)));
    setDirty(true);
  };

  const save = () => {
    setSaving(true);
    // Backend integration: PUT /api/platform/roles (propagates to every tenant)
    setTimeout(() => {
      setSaving(false);
      setDirty(false);
      setToast('Matriz de roles guardada para todas las clínicas');
    }, 800);
  };

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">Roles y permisos base</h2>
          <p className="text-xs text-muted-foreground">Plantillas aplicadas a cada clínica. El administrador de clínica crea a su personal y le asigna uno de estos roles.</p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">Cambios sin guardar</span>}
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (<><Icon name="ArrowPathIcon" size={16} className="animate-spin" />Guardando…</>) : 'Guardar roles'}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-2.5 font-semibold">Rol</th>
              <th className="px-3 py-2.5 text-right font-semibold">Usuarios</th>
              {permissions.map((p) => (
                <th key={`rp-${p.id}`} className="px-3 py-2.5 text-center font-semibold">{p.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {roles.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-muted/40">
                <td className="px-5 py-3">
                  <p className="flex items-center gap-2 font-semibold">
                    {r.name}
                    {r.locked && <Icon name="LockClosedIcon" size={13} className="text-muted-foreground" />}
                  </p>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </td>
                <td className="tabular px-3 py-3 text-right font-semibold">{r.users}</td>
                {permissions.map((p) => (
                  <td key={`${r.id}-${p.id}`} className="px-3 py-3 text-center">
                    <button
                      onClick={() => toggle(r.id, p.id)}
                      disabled={r.locked}
                      role="checkbox"
                      aria-checked={r.perms[p.id]}
                      aria-label={`${r.name}: ${p.label}`}
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md border transition-all duration-150 active:scale-90 disabled:cursor-not-allowed ${
                        r.perms[p.id] ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-card hover:border-primary/60'
                      } ${r.locked ? 'opacity-70' : ''}`}
                    >
                      {r.perms[p.id] && <Icon name="CheckIcon" size={14} />}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </section>
  );
}