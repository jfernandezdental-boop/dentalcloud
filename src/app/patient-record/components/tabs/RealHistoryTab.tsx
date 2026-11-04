'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/AppIcon';
import { getSupabase } from '@/lib/supabase/client';
import { btnPrimary } from './formKit';

type Appt = { id: string; date: string; start_time: string; procedure: string | null; status: string | null; doctors: { full_name: string } | null };

/** Historial del paciente: sus citas reales (lo que se agenda en la Agenda aparece aqui automaticamente). */
export default function RealHistoryTab({ patientId }: { patientId: string }) {
  const [rows, setRows] = useState<Appt[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setRows(null);
    getSupabase()
      .from('appointments')
      .select('id, date, start_time, procedure, status, doctors(full_name)')
      .eq('patient_id', patientId)
      .order('date', { ascending: false })
      .order('start_time', { ascending: false })
      .then(({ data, error: e }) => {
        if (!alive) return;
        if (e) setError('No se pudo cargar el historial.');
        else setRows((data as unknown as Appt[]) || []);
      });
    return () => {
      alive = false;
    };
  }, [patientId]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Historial de citas</h3>
          <p className="text-xs text-muted-foreground">Las citas agendadas para este paciente aparecen aquí automáticamente.</p>
        </div>
        <Link href={`/doctor-agenda?patient=${patientId}`} className={btnPrimary()}>
          <Icon name="CalendarDaysIcon" size={16} /> Agendar cita
        </Link>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!rows && !error && <div className="h-24 animate-pulse rounded-xl bg-muted/40" />}
      {rows && rows.length === 0 && (
        <EmptyState icon={<Icon name="ClockIcon" size={24} />} title="Sin citas" description="Este paciente todavía no tiene citas agendadas." />
      )}
      <ul className="divide-y divide-border rounded-xl border border-border">
        {rows?.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
            <span className="font-semibold">{a.date} · {String(a.start_time).slice(0, 5)}</span>
            <span>{a.procedure || 'Consulta'}</span>
            <span className="text-muted-foreground">{a.doctors?.full_name || ''}</span>
            {a.status && <Badge>{a.status}</Badge>}
          </li>
        ))}
      </ul>
    </div>
  );
}
