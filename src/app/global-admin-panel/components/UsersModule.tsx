'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { getSupabase } from '@/lib/supabase/client';

type Row = {
  id: string;
  full_name: string | null;
  email: string | null;
  role_key: string | null;
  is_super_admin: boolean;
  active: boolean;
  clinic: { name: string } | { name: string }[] | null;
};

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador de clinica',
  odontologo: 'Odontologo',
  recepcion: 'Recepcion',
  auxiliar: 'Auxiliar odontologico',
  contador: 'Contador',
};

const clinicName = (c: Row['clinic']) => (Array.isArray(c) ? c[0]?.name : c?.name) || '—';

/** Usuarios reales de la plataforma (solo lectura). El alta de personal se hace en "Personal de clinica". */
export default function UsersModule() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await getSupabase()
      .from('profiles')
      .select('id, full_name, email, role_key, is_super_admin, active, clinic:clinics(name)')
      .order('created_at', { ascending: true });
    if (err) {
      setError('No se pudieron cargar los usuarios.');
      setRows([]);
    } else {
      setError('');
      setRows((data as unknown as Row[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((r) =>
      [r.full_name, r.email, clinicName(r.clinic), r.role_key ? ROLE_LABEL[r.role_key] : '']
        .join(' ')
        .toLowerCase()
        .includes(t),
    );
  }, [rows, q]);

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h3 className="text-base font-semibold">Usuarios de la plataforma</h3>
          <p className="text-xs text-muted-foreground">{rows.length} usuarios registrados</p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, correo o clinica"
          aria-label="Buscar usuarios"
          className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm sm:w-72"
        />
      </div>
      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Cargando usuarios...</div>
      ) : error ? (
        <div className="p-6">
          <EmptyState icon={<Icon name="ExclamationTriangleIcon" size={22} />} title="Error" description={error} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-6">
          <EmptyState icon={<Icon name="UserGroupIcon" size={22} />} title="Sin resultados" description="No hay usuarios que coincidan." />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Clinica</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{r.full_name || '—'}</td>
                  <td className="px-4 py-3">{r.email || '—'}</td>
                  <td className="px-4 py-3">
                    {r.is_super_admin ? (
                      <Badge tone="accent">Administrador global</Badge>
                    ) : (
                      <Badge tone="info">{(r.role_key && ROLE_LABEL[r.role_key]) || 'Sin rol'}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">{clinicName(r.clinic)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={r.active ? 'success' : 'neutral'}>{r.active ? 'Activo' : 'Inactivo'}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
