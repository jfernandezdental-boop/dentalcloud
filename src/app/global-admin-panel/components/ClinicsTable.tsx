'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import Toast from '@/components/ui/Toast';
import EmptyState from '@/components/ui/EmptyState';
import CreateClinicModal from './CreateClinicModal';
import EditClinicModal from './EditClinicModal';
import {
  listClinics,
  setClinicActive,
  resetClinicAdminPassword,
  type ClinicRecord,
} from '@/lib/supabase/clinicsAdmin';
import { hasSupabaseEnv } from '@/lib/supabase/client';

function isDemoClinic(name: string) {
  return /sonrisa\s*boreal/i.test(name);
}

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  const s = status.toLowerCase();
  if (s.includes('susp') || s.includes('inactiv') || s.includes('vencid')) return 'danger';
  if (s.includes('prueba') || s.includes('pend')) return 'warning';
  if (s.includes('activ')) return 'success';
  return 'neutral';
}

export default function ClinicsTable() {
  const [rows, setRows] = useState<ClinicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editClinic, setEditClinic] = useState<ClinicRecord | null>(null);
  const [toast, setToast] = useState('');
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    if (!hasSupabaseEnv()) {
      setError('Configura NEXT_PUBLIC_SUPABASE_URL y ANON_KEY');
      setRows([]);
      setLoading(false);
      return;
    }
    const { rows: data, error: err } = await listClinics();
    if (err && data.length === 0) setError(err);
    data.sort((a, b) => {
      const da = isDemoClinic(a.name) ? 1 : 0;
      const db = isDemoClinic(b.name) ? 1 : 0;
      if (da !== db) return da - db;
      return a.name.localeCompare(b.name);
    });
    setRows(data);
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

  const toggleActive = async (c: ClinicRecord) => {
    const currentlyActive = /activ/i.test(c.status) && !/inactiv/i.test(c.status);
    const nextActive = !currentlyActive;
    setBusyId(c.id);
    const { error: err } = await setClinicActive(c.id, nextActive);
    setBusyId(null);
    if (err) {
      setToast(err);
      return;
    }
    setToast(nextActive ? 'Clínica activada' : 'Clínica desactivada');
    load();
  };

  const resetPassword = async (c: ClinicRecord) => {
    const pwd = window.prompt(`Nueva contraseña temporal para el admin de «${c.name}» (mín. 8 caracteres):`);
    if (!pwd) return;
    if (pwd.length < 8) {
      setToast('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setBusyId(c.id);
    const { error: err } = await resetClinicAdminPassword(c.id, pwd);
    setBusyId(null);
    if (err) {
      setToast(err);
      return;
    }
    setToast('Contraseña del administrador actualizada');
  };

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h3 className="text-base font-semibold">Clínicas de la red</h3>
          <p className="text-xs text-muted-foreground">
            {loading ? 'Cargando…' : `${rows.length} clínicas · datos reales`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar clínica o ciudad"
            className="w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
          >
            <Icon name="PlusIcon" size={14} /> Nueva clínica
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse bg-muted/40" />
      ) : error && filtered.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={<Icon name="BuildingOffice2Icon" size={24} />}
            title="No se pudieron cargar las clínicas"
            description={error}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={<Icon name="BuildingOffice2Icon" size={24} />}
            title="Sin clínicas"
            description="Crea la primera clínica de la red."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                {['Clínica', 'Ciudad', 'Plan', 'Estado', 'Alta', 'Acciones'].map((h) => (
                  <th key={h} className="px-3 py-2.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => {
                const currentlyActive = /activ/i.test(c.status) && !/inactiv/i.test(c.status);
                return (
                  <tr key={c.id} className="hover:bg-muted/40">
                    <td className="px-3 py-3">
                      <p className="font-semibold">{c.name}</p>
                      {isDemoClinic(c.name) ? (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Demo plataforma</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{c.city || '—'}</td>
                    <td className="px-3 py-3">
                      {c.plan ? <Badge tone="info">{c.plan}</Badge> : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{c.created}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap justify-end gap-1">
                        <button
                          type="button"
                          disabled={busyId === c.id}
                          onClick={() => setEditClinic(c)}
                          className="rounded-md border border-input px-2 py-1 text-xs font-semibold hover:bg-muted"
                          title="Editar"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          disabled={busyId === c.id}
                          onClick={() => toggleActive(c)}
                          className="rounded-md border border-input px-2 py-1 text-xs font-semibold hover:bg-muted"
                          title={currentlyActive ? 'Desactivar' : 'Activar'}
                        >
                          {currentlyActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          type="button"
                          disabled={busyId === c.id}
                          onClick={() => resetPassword(c)}
                          className="rounded-md border border-input px-2 py-1 text-xs font-semibold hover:bg-muted"
                          title="Restablecer contraseña"
                        >
                          Reset clave
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CreateClinicModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setToast('Clínica creada');
          load();
        }}
      />
      <EditClinicModal
        open={!!editClinic}
        clinic={editClinic}
        onClose={() => setEditClinic(null)}
        onSaved={() => {
          setToast('Clínica actualizada');
          load();
        }}
      />
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </section>
  );
}
