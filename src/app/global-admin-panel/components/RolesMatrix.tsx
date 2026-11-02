'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';

type Perm = 'agenda' | 'clinica' | 'odonto' | 'finanzas' | 'rrhh' | 'inventario' | 'config';

const permissions: { id: Perm; label: string }[] = [
  { id: 'agenda', label: 'Agenda' },
  { id: 'clinica', label: 'Historia clinica' },
  { id: 'odonto', label: 'Odontograma' },
  { id: 'finanzas', label: 'Finanzas' },
  { id: 'rrhh', label: 'RR. HH.' },
  { id: 'inventario', label: 'Inventario' },
  { id: 'config', label: 'Configuracion' },
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
  {
    id: 'role-admin',
    name: 'Administrador de clinica',
    description: 'Crea personal y asigna roles',
    users: 231,
    locked: true,
    perms: { agenda: true, clinica: true, odonto: true, finanzas: true, rrhh: true, inventario: true, config: true },
  },
  {
    id: 'role-doc',
    name: 'Odontologo',
    description: 'Atiende pacientes, odontograma y recetas',
    users: 587,
    perms: { agenda: true, clinica: true, odonto: true, finanzas: false, rrhh: false, inventario: true, config: false },
  },
  {
    id: 'role-recep',
    name: 'Recepcion',
    description: 'Agenda, cobros y datos del paciente',
    users: 342,
    perms: { agenda: true, clinica: false, odonto: false, finanzas: true, rrhh: false, inventario: false, config: false },
  },
  {
    id: 'role-aux',
    name: 'Auxiliar odontologico',
    description: 'Apoyo clinico e inventario',
    users: 298,
    perms: { agenda: true, clinica: false, odonto: false, finanzas: false, rrhh: false, inventario: true, config: false },
  },
  {
    id: 'role-cont',
    name: 'Contador',
    description: 'Finanzas, rol de pagos y reportes',
    users: 55,
    perms: { agenda: false, clinica: false, odonto: false, finanzas: true, rrhh: true, inventario: false, config: false },
  },
];

export default function RolesMatrix() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const toggle = (roleId: string, perm: Perm) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId && !r.locked ? { ...r, perms: { ...r.perms, [perm]: !r.perms[perm] } } : r)),
    );
    setDirty(true);
  };

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setDirty(false);
      setToast('Matriz de roles guardada (plantilla UI)');
    }, 600);
  };

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">Roles y permisos base</h2>
          <p className="text-xs text-muted-foreground">Plantillas aplicadas a cada clinica</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar roles'}
        </button>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-2.5 font-semibold">Rol</th>
              <th className="px-3 py-2.5 text-right font-semibold">Usuarios</th>
              {permissions.map((p) => (
                <th key={p.id} className="px-3 py-2.5 text-center font-semibold">
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {roles.map((r) => (
              <tr key={r.id} className="hover:bg-muted/40">
                <td className="px-5 py-3">
                  <p className="flex items-center gap-2 font-semibold">
                    {r.name}
                    {r.locked ? <Icon name="LockClosedIcon" size={13} className="text-muted-foreground" /> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </td>
                <td className="tabular px-3 py-3 text-right font-semibold">{r.users}</td>
                {permissions.map((p) => (
                  <td key={`${r.id}-${p.id}`} className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggle(r.id, p.id)}
                      disabled={r.locked}
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md border ${
                        r.perms[p.id] ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-card'
                      } ${r.locked ? 'opacity-70' : ''}`}
                    >
                      {r.perms[p.id] ? <Icon name="CheckIcon" size={14} /> : null}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </section>
  );
}
