'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/components/AuthProvider';
import { getSupabase } from '@/lib/supabase/client';
import RealAestheticsTab from '@/app/patient-record/components/tabs/RealAestheticsTab';

type PatientOpt = { id: string; label: string };

function patientLabel(p: Record<string, unknown>): string {
  const full =
    (p.full_name as string) ||
    [p.first_name, p.last_name].filter(Boolean).join(' ') ||
    (p.name as string) ||
    'Paciente';
  const doc = (p.cedula as string) || (p.document as string) || '';
  return doc ? `${full} · ${doc}` : full;
}

export default function AestheticsWorkspace() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientOpt[]>([]);
  const [patientId, setPatientId] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user?.clinicId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await getSupabase()
        .from('patients')
        .select('id, first_name, last_name, full_name, cedula, document')
        .order('created_at', { ascending: false })
        .limit(300);
      if (!alive) return;
      if (error) {
        setPatients([]);
      } else {
        setPatients(
          ((data as Record<string, unknown>[]) || []).map((p) => ({
            id: String(p.id),
            label: patientLabel(p),
          })),
        );
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [user?.clinicId]);

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
            <Icon name="MagnifyingGlassIcon" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm"
              placeholder="Buscar por nombre o cédula…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="h-10 min-w-[240px] rounded-lg border border-input bg-background px-3 text-sm"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            disabled={loading}
          >
            <option value="">{loading ? 'Cargando…' : 'Selecciona un paciente'}</option>
            {filtered.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
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
