'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import Toast from '@/components/ui/Toast';
import EmptyState from '@/components/ui/EmptyState';
import CreateClinicModal from './CreateClinicModal';
import { getSupabase, hasSupabaseEnv } from '@/lib/supabase/client';

type ClinicRow = {
  id: string;
  name: string;
  city: string;
  status: string;
  plan: string;
  admin: string;
  created: string;
};

function mapRow(r: Record<string, unknown>): ClinicRow {
  return {
    id: String(r.id),
    name: String(r.name || r.nombre || r.clinic_name || '—'),
    city: String(r.city || r.ciudad || '—'),
    status: String(r.status || r.estado || 'activa'),
    plan: String(r.plan || r.plan_name || '—'),
    admin: String(r.admin_name || r.admin_email || r.owner_email || '—'),
    created: String(r.created_at || r.created || '').slice(0, 10),
  };
}

/** No priorizar clínica demo Sonrisa Boreal */
function isDemoClinic(name: string) {
  return /sonrisa\s*boreal/i.test(name);
}

export default function ClinicsTable() {
  const [rows, setRows] = useState<ClinicRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState('');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    if (!hasSupabaseEnv()) {
      setError('Configura NEXT_PUBLIC_SUPABASE_URL y ANON_KEY');
      setRows([]);
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    // Tablas posibles ya existentes (no se crean aquí)
    const attempts = ['clinics', 'consultorios', 'tenants'];
    let loaded: ClinicRow[] = [];
    let lastErr = '';
    for (const table of attempts) {
      const { data, error: err } = await supabase.from(table).select('*').limit(200);
      if (!err && data) {
        loaded = data.map((r) => mapRow(r as Record<string, unknown>));
        lastErr = '';
        break;
      }
      lastErr = err?.message || `Sin acceso a ${table}`;
    }
    if (lastErr && loaded.length === 0) {
      setError(
        lastErr +
          ' — Indica el nombre real de la tabla de clínicas si no es clinics/consultorios/tenants (sin alterar esquema).',
      );
    }
    // Demo al final, nunca arriba
    loaded.sort((a, b) => {
      const da = isDemoClinic(a.name) ? 1 : 0;
      const db = isDemoClinic(b.name) ? 1 : 0;
      if (da !== db) return da - db;
      return a.name.localeCompare(b.name);
    });
    setRows(loaded);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = rows.filter(
    (r) =>
      !q ||
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.city.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <section id="clinicas" className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold">Clínicas (tenants)</h2>
          <p className="text-sm text-muted-foreground">
            Listado desde Supabase · la clínica demo no se prioriza
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar clínica…"
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => load()}
            className="rounded-lg border border-input px-3 py-2 text-sm font-semibold hover:bg-muted"
          >
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => setModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Icon name="PlusIcon" size={16} />
            Nueva clínica
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Cargando clínicas…</div>
      ) : error && filtered.length === 0 ? (
        <div className="p-6">
          <EmptyState title="No se pudieron cargar clínicas" description={error} />
          <button
            type="button"
            onClick={() => setModal(true)}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Crear primera clínica
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-6">
          <EmptyState title="Sin clínicas" description="Crea la primera clínica real (no demo)." />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Clínica</th>
                <th className="px-3 py-3">Ciudad</th>
                <th className="px-3 py-3">Plan</th>
                <th className="px-3 py-3">Admin</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-3 py-3">Alta</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-semibold">
                    {c.name}
                    {isDemoClinic(c.name) ? (
                      <Badge tone="warning" className="ml-2">
                        demo
                      </Badge>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">{c.city}</td>
                  <td className="px-3 py-3">{c.plan}</td>
                  <td className="px-3 py-3">{c.admin}</td>
                  <td className="px-3 py-3">{c.status}</td>
                  <td className="px-3 py-3 text-muted-foreground">{c.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateClinicModal
        open={modal}
        onClose={() => setModal(false)}
        onCreated={() => {
          setToast('Clínica creada en Auth + register_clinic');
          load();
        }}
      />
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </section>
  );
}
