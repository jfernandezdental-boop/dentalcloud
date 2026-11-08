'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import { getSupabase } from '@/lib/supabase/client';

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

export default function RolesMatrix() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    const sb = getSupabase();
    const [{ data: rs, error: e1 }, { data: ps }] = await Promise.all([
      sb.from('roles').select('key, name, description, perms, locked').order('locked', { ascending: false }).order('name'),
      sb.from('profiles').select('role_key').eq('active', true).not('clinic_id', 'is', null),
    ]);
    if (e1 || !rs) {
      setLoadError('No se pudieron cargar los roles.');
      return;
    }
    const counts: Record<string, number> = {};
    (ps || []).forEach((p: { role_key: string | null }) => {
      if (p.role_key) counts[p.role_key] = (counts[p.role_key] || 0) + 1;
    });
    setLoadError('');
    setRoles(
      rs.map((r: { key: string; name: string; description: string; perms: Partial<Record<Perm, boolean>>; locked: boolean }) => ({
        id: r.key,
        name: r.name,
        description: r.description,
        users: counts[r.key] || 0,
        locked: r.locked,
        perms: { agenda: false, clinica: false, odonto: false, finanzas: false, rrhh: false, inventario: false, config: false, ...r.perms },
      })),
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const toggle = (roleId: string, perm: Perm) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId && !r.locked ? { ...r, perms: { ...r.perms, [perm]: !r.perms[perm] } } : r)),
    );
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const sb = getSupabase();
    const results = await Promise.all(
      roles.filter((r) => !r.locked).map((r) => sb.from('roles').update({ perms: r.perms }).eq('key', r.id)),
    );
    setSaving(false);
    if (results.some((x) => x.error)) {
      setToast('No se pudieron guardar los roles.');
      return;
    }
    setDirty(false);
    setToast('Permisos de roles guardados.');
  };

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">Roles y permisos base</h2>
          <p className="text-xs text-muted-foreground">Referencia de permisos por rol, guardada en la base de datos</p>
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
            {loadError ? (
              <tr>
                <td colSpan={permissions.length + 2} className="px-5 py-6 text-center text-sm text-destructive">{loadError}</td>
              </tr>
            ) : null}
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
