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

function statusTone(status: string): 'success' | 'warning' | 'destructive' | 'default' {
  const s = status.toLowerCase();
  if (s.includes('activ')) return 'success';
  if (s.includes('prueba') || s.includes('pend')) return 'warning';
  if (s.includes('susp') || s.includes('inactiv') || s.includes('vencid')) return 'destructive';
  return 'default';
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
    const active = !String(c.status).toLowerCase().includes('activ');
    // if currently activa -> suspend; if suspendida -> activa
    const currentlyActive = /activ/i.test(c.status) && !/inactiv/i.test(c.status);
    const nextActive = !currentlyActive;
    if (
      !confirm(
        nextActive
          ? `Activar la clinica "${c.name}"?`
          : `Desactivar (suspender) la clinica "${c.name}"? Los usuarios de esa clinica no deberian operar hasta reactivar.`,
      )
    ) {
      return;
    }
    setBusyId(c.id);
    try {
      await setClinicActive(c.table, c.id, nextActive);
      setToast(nextActive ? 'Clinica activada' : 'Clinica desactivada');
      await load();
    } catch (e: unknown) {
      setToast(e instanceof Error ? e.message : 'No se pudo cambiar el estado');
    } finally {
      setBusyId(null);
    }
  };

  const resetPassword = async (c: ClinicRecord) => {
    if (!c.adminEmail) {
      setToast('Sin email de admin en esta clinica; editala y guarda el correo');
      return;
    }
    if (!confirm(`Enviar enlace de restablecimiento de contrasena a ${c.adminEmail}?`)) return;
    setBusyId(c.id);
    try {
      await resetClinicAdminPassword(c.adminEmail);
      setToast(`Email de restablecimiento enviado a ${c.adminEmail}`);
    } catch (e: unknown) {
      setToast(e instanceof Error ? e.message : 'No se pudo enviar el restablecimiento');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section id="clinicas" className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold">Clinicas (tenants)</h2>
          <p className="text-sm text-muted-foreground">
            Editar, activar/desactivar y restablecer contrasena del admin
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar clinica..."
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
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Icon name="PlusIcon" size={16} />
            Nueva clinica
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Cargando clinicas...</div>
      ) : error && filtered.length === 0 ? (
        <div className="p-6">
          <EmptyState title="No se pudieron cargar clinicas" description={error} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-6">
          <EmptyState title="Sin clinicas" description="Crea la primera clinica real." />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Clinica</th>
                <th className="px-3 py-3">Ciudad</th>
                <th className="px-3 py-3">Plan</th>
                <th className="px-3 py-3">Admin</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-3 py-3">Alta</th>
                <th className="px-3 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const currentlyActive = /activ/i.test(c.status) && !/inactiv/i.test(c.status);
                return (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-semibold">
                      {c.name}
                      {isDemoClinic(c.name) ? (
                        <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                          demo
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">{c.city}</td>
                    <td className="px-3 py-3">{c.plan}</td>
                    <td className="px-3 py-3">
                      <div>{c.admin}</div>
                      {c.adminEmail ? (
                        <div className="text-[11px] text-muted-foreground">{c.adminEmail}</div>
                      ) : null}
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
                          title="Restablecer contrasena"
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
          setToast('Clinica creada');
          load();
        }}
      />
      <EditClinicModal
        open={!!editClinic}
        clinic={editClinic}
        onClose={() => setEditClinic(null)}
        onSaved={() => {
          setToast('Clinica actualizada');
          load();
        }}
      />
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </section>
  );
}
