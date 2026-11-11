'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/components/AuthProvider';
import { listPatients } from '@/lib/supabase/data';
import { getSupabase, hasSupabaseEnv } from '@/lib/supabase/client';
import RealAestheticsTab from '@/app/patient-record/components/tabs/RealAestheticsTab';

type PatientOpt = {
  id: string;
  fullName: string;
  document: string;
  label: string;
};

function mapRow(row: Record<string, unknown>): PatientOpt {
  const first = String(row.first_name || row.nombres || '').trim();
  const last = String(row.last_name || row.apellidos || '').trim();
  const fullName =
    String(row.full_name || row.name || '').trim() ||
    [first, last].filter(Boolean).join(' ') ||
    'Paciente';
  const document = String(row.cedula || row.document || row.national_id || row.rut || '');
  return {
    id: String(row.id),
    fullName,
    document,
    label: document ? `${fullName} · ${document}` : fullName,
  };
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || '?';
}

export default function AestheticsWorkspace() {
  const { user, loading: authLoading } = useAuth();
  const [patients, setPatients] = useState<PatientOpt[]>([]);
  const [patientId, setPatientId] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (!hasSupabaseEnv()) {
        setPatients([]);
        setError('Supabase no está configurado.');
        return;
      }

      // 1) Misma vía que Ficha del paciente
      try {
        const rows = (await listPatients(300)) as Record<string, unknown>[];
        if (rows?.length) {
          setPatients(rows.map(mapRow));
          return;
        }
      } catch {
        /* fallback abajo */
      }

      // 2) Fallback: select directo (RLS filtra por clínica)
      let q = getSupabase()
        .from('patients')
        .select('id, first_name, last_name, full_name, name, nombres, apellidos, cedula, document')
        .order('created_at', { ascending: false })
        .limit(300);
      if (user?.clinicId) {
        q = q.eq('clinic_id', user.clinicId);
      }
      const { data, error: e } = await q;
      if (e) throw e;
      setPatients(((data as Record<string, unknown>[]) || []).map(mapRow));
    } catch (e) {
      setPatients([]);
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los pacientes');
    } finally {
      setLoading(false);
    }
  }, [user?.clinicId]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.document.toLowerCase().includes(q) ||
        p.label.toLowerCase().includes(q),
    );
  }, [patients, query]);

  const selected = patients.find((p) => p.id === patientId) || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Estética facial</h1>
        <p className="text-sm text-muted-foreground">
          Sesiones de toxina, rellenos y otros procedimientos · mapa de zonas y seguridad
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Lista de pacientes — mismo patrón que Ficha */}
        <aside className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-3 py-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Pacientes de la clínica</p>
              <button
                type="button"
                onClick={() => void load()}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                title="Recargar"
              >
                <Icon name="ArrowPathIcon" size={16} />
              </button>
            </div>
            <div className="relative">
              <Icon
                name="MagnifyingGlassIcon"
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                className="h-9 w-full rounded-lg border border-input bg-background pl-8 pr-2 text-sm"
                placeholder="Buscar nombre o cédula…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {loading ? 'Cargando…' : `${filtered.length} encontrado(s)`}
            </p>
          </div>

          <ul className="max-h-[480px] overflow-y-auto p-2">
            {error ? (
              <li className="px-2 py-4 text-sm text-destructive">{error}</li>
            ) : null}

            {!loading && !error && filtered.length === 0 ? (
              <li className="px-2 py-6 text-center text-sm text-muted-foreground">
                {patients.length === 0 ? (
                  <>
                    Sin pacientes.{' '}
                    <a href="/patient-record" className="font-semibold text-primary underline">
                      Ir a Ficha
                    </a>
                  </>
                ) : (
                  'Ningún resultado para esa búsqueda.'
                )}
              </li>
            ) : null}

            {filtered.map((p) => {
              const active = p.id === patientId;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setPatientId(p.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
                      active ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {initials(p.fullName)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{p.fullName}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {p.document || 'Sin documento'}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Contenido */}
        <div className="min-w-0">
          {selected ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card px-4 py-3">
                <p className="text-xs text-muted-foreground">Paciente seleccionado</p>
                <p className="text-lg font-semibold">{selected.fullName}</p>
                {selected.document ? (
                  <p className="text-sm text-muted-foreground">C.I. {selected.document}</p>
                ) : null}
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <RealAestheticsTab patientId={selected.id} />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
              <Icon name="SparklesIcon" size={32} className="mx-auto mb-3 text-muted-foreground" />
              <p className="font-semibold">Elige un paciente de la lista</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Las sesiones quedan vinculadas a la ficha del paciente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
