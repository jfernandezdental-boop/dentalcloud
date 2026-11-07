'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/components/AuthProvider';
import { getSupabase } from '@/lib/supabase/client';

interface Waiting {
  id: string;
  patient: string;
  procedure: string;
  doctor: string;
  waited: number;
  slot: string;
  status: 'En sala' | 'En atencion' | 'Confirmada' | 'Pendiente';
}

const tone: Record<Waiting['status'], 'success' | 'accent' | 'info' | 'warning'> = {
  'En atencion': 'success',
  'En sala': 'accent',
  Confirmada: 'info',
  Pendiente: 'warning',
};

function mapStatus(raw: string): Waiting['status'] {
  const s = (raw || '').toLowerCase();
  if (s.includes('atenci')) return 'En atencion';
  if (s.includes('sala') || s.includes('espera')) return 'En sala';
  if (s.includes('confirm')) return 'Confirmada';
  return 'Pendiente';
}

function todayISO() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function WaitingRoomPanel() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Waiting[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState('');

  const load = useCallback(async () => {
    if (!user?.clinicId || user.clinicIsDemo) {
      // Demo: vacío también (no inventamos pacientes); la agenda demo tiene su propia UI
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const day = todayISO();
    const sb = getSupabase();
    // Preferimos start_time/date locales; fallback a starts_at
    let { data, error } = await sb
      .from('appointments')
      .select('id, status, start_time, starts_at, procedure, type, notes, patients(first_name, last_name, full_name), doctors(full_name, name)')
      .eq('clinic_id', user.clinicId)
      .eq('date', day)
      .order('start_time', { ascending: true })
      .limit(40);

    if (error) {
      const r2 = await sb
        .from('appointments')
        .select('id, status, starts_at, procedure, type, notes, patient_name, doctor_name')
        .eq('clinic_id', user.clinicId)
        .gte('starts_at', `${day}T00:00:00`)
        .lte('starts_at', `${day}T23:59:59`)
        .order('starts_at', { ascending: true })
        .limit(40);
      data = r2.data as typeof data;
      error = r2.error;
    }

    if (error || !data) {
      setRows([]);
      setLoading(false);
      return;
    }

    const mapped: Waiting[] = (data as Record<string, unknown>[]).map((a) => {
      const pat = a.patients as Record<string, unknown> | null;
      const doc = a.doctors as Record<string, unknown> | null;
      const patient =
        (pat
          ? String(pat.full_name || [pat.first_name, pat.last_name].filter(Boolean).join(' '))
          : '') ||
        String(a.patient_name || 'Paciente');
      const doctor =
        (doc ? String(doc.full_name || doc.name || '') : '') || String(a.doctor_name || '—');
      const slotRaw = String(a.start_time || a.starts_at || '');
      const slot = slotRaw.includes('T') ? slotRaw.slice(11, 16) : slotRaw.slice(0, 5);
      return {
        id: String(a.id),
        patient,
        procedure: String(a.procedure || a.type || a.notes || 'Cita'),
        doctor,
        waited: 0,
        slot: slot || '—',
        status: mapStatus(String(a.status || '')),
      };
    });
    setRows(mapped);
    setLoading(false);
  }, [user?.clinicId, user?.clinicIsDemo]);

  useEffect(() => {
    void load();
  }, [load]);

  const advance = (id: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.status === 'Pendiente') return { ...r, status: 'Confirmada' };
        if (r.status === 'Confirmada') return { ...r, status: 'En sala' };
        if (r.status === 'En sala') return { ...r, status: 'En atencion' };
        return r;
      }),
    );
  };

  const finish = (id: string) => {
    setRemoving(id);
    setTimeout(() => {
      setRows((prev) => prev.filter((r) => r.id !== id));
      setRemoving('');
    }, 300);
  };

  return (
    <aside className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-base font-semibold">Sala de espera y cola</h3>
          <p className="text-xs text-muted-foreground">
            {loading ? 'Cargando…' : `${rows.length} pacientes por atender`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-input p-2 text-muted-foreground hover:bg-muted"
          aria-label="Actualizar"
        >
          <Icon name="ArrowPathIcon" size={16} />
        </button>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse bg-muted/40" />
      ) : rows.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={<Icon name="UserGroupIcon" size={24} />}
            title="Sin pacientes en cola"
            description="Las citas de hoy aparecerán aquí cuando estén agendadas."
          />
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((r) => (
            <li
              key={r.id}
              className={`px-5 py-3 transition-opacity ${removing === r.id ? 'opacity-0' : 'opacity-100'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{r.patient}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.procedure}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {r.slot} · {r.doctor}
                  </p>
                </div>
                <Badge tone={tone[r.status]}>{r.status}</Badge>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => advance(r.id)}
                  className="rounded-md border px-2 py-1 text-[11px] font-semibold hover:bg-muted"
                >
                  Avanzar
                </button>
                <button
                  type="button"
                  onClick={() => finish(r.id)}
                  className="rounded-md border px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted"
                >
                  Finalizar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
