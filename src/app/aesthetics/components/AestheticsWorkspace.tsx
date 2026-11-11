'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/components/AuthProvider';
import { listPatients } from '@/lib/supabase/data';
import { hasSupabaseEnv } from '@/lib/supabase/client';
import RealAestheticsTab from '@/app/patient-record/components/tabs/RealAestheticsTab';

type PatientOpt = { id: string; label: string };

function mapPatientLabel(row: Record<string, unknown>): PatientOpt {
  const first =
    String(row.first_name || row.nombres || '') ||
    String(row.full_name || row.name || '')
      .split(' ')
      .slice(0, -1)
      .join(' ');
  const last =
    String(row.last_name || row.apellidos || '') ||
    String(row.full_name || row.name || '')
      .split(' ')
      .slice(-1)
      .join(' ');
  const fullName =
    String(row.full_name || row.name || '').trim() ||
    [first, last].filter(Boolean).join(' ') ||
    'Paciente';
  const doc = String(row.cedula || row.document || row.national_id || row.rut || '');
  return {
    id: String(row.id),
    label: doc ? `${fullName} · ${doc}` : fullName,
  };
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
        setError('Supabase no está configurado en este entorno.');
        return;
      }
      if (!user?.clinicId && user?.role !== 'super_admin') {
        setPatients([]);
        setError('No hay una clínica activa en tu sesión. Cierra sesión y vuelve a entrar.');
        return;
      }
      const rows = (await listPatients(300)) as Record<string, unknown>[];
      setPatients(rows.map(mapPatientLabel));
    } catch (e) {
      setPatients([]);
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los pacientes.');
    } finally {
      setLoading(false);
    }
  }, [user?.clinicId, user?.role]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => p.label.toLowerCase().includes(q));
  }, [patients, query]);

  const selected = patients.find((p) => p.id === patientId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estética facial</h1>
          <p className="text-sm text-muted-foreground">
            Sesiones de toxina, rellenos y otros procedimientos · mapa de zonas y seguridad
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <label className="mb-2 block text-sm font-semibold">Paciente</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Icon
              name="MagnifyingGlassIcon"
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm"
              placeholder="Buscar por nombre o cédula…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading || !!error}
            />
          </div>
          <select
            className="h-10 min-w-[260px] rounded-lg border border-input bg-background px-3 text-sm"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            disabled={loading || patients.length === 0}
          >
            <option value="">
              {loading
                ? 'Cargando pacientes…'
                : patients.length === 0
                  ? 'Sin pacientes'
                  : `Selecciona un paciente (${filtered.length})`}
            </option>
            {filtered.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="h-10 shrink-0 rounded-lg border border-input px-3 text-sm font-semibold hover:bg-muted"
            onClick={() => void load()}
            disabled={loading}
            title="Recargar lista"
          >
            <Icon name="ArrowPathIcon" size={16} />
          </button>
        </div>

        {error ? (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {!loading && !error && patients.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No hay pacientes en esta clínica. Créalos primero en{' '}
            <a href="/patient-record" className="font-semibold text-primary underline">
              Ficha del paciente
            </a>
            .
          </p>
        ) : null}

        {selected ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Trabajando con <span className="font-semibold text-foreground">{selected.label}</span>
          </p>
        ) : null}
      </div>

      {patientId ? (
        <div className="rounded-2xl border border-border bg-card p-5">
          <RealAestheticsTab patientId={patientId} />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <Icon name="SparklesIcon" size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="font-semibold">Elige un paciente para registrar o ver sesiones de estética</p>
          <p className="mt-1 text-sm text-muted-foreground">Las sesiones quedan vinculadas a la ficha del paciente.</p>
        </div>
      )}
    </div>
  );
}
