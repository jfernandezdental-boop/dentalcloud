'use client';
import React, { useEffect, useState } from 'react';
import MetricCard from '@/components/ui/MetricCard';
import { useAuth } from '@/components/AuthProvider';
import { getSupabase } from '@/lib/supabase/client';

function todayISO() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function MetricsBentoGrid() {
  const { user } = useAuth();
  const [attended, setAttended] = useState(0);
  const [scheduled, setScheduled] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user?.clinicId) {
        setLoading(false);
        return;
      }
      const day = todayISO();
      const sb = getSupabase();
      let { data, error } = await sb
        .from('appointments')
        .select('id, status')
        .eq('clinic_id', user.clinicId)
        .eq('date', day);
      if (error) {
        const r2 = await sb
          .from('appointments')
          .select('id, status')
          .eq('clinic_id', user.clinicId)
          .gte('starts_at', `${day}T00:00:00`)
          .lte('starts_at', `${day}T23:59:59`);
        data = r2.data;
      }
      if (!alive) return;
      const rows = (data as { status?: string }[]) || [];
      setScheduled(rows.length);
      setAttended(
        rows.filter((r) => /complet|atendid|final|done|realiz/i.test(String(r.status || ''))).length,
      );
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [user?.clinicId]);

  const pct = scheduled > 0 ? Math.round((attended / scheduled) * 100) : 0;

  return (
    <section aria-label="Indicadores del dia" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        className="md:col-span-2"
        tone="hero"
        icon="UserGroupIcon"
        label="Pacientes atendidos hoy"
        value={loading ? '—' : String(attended)}
        unit={loading ? '' : `de ${scheduled} agendados`}
        helper={scheduled === 0 ? 'Sin citas registradas hoy' : `Avance ${pct} %`}
      >
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-sidebar-foreground/80">
            <span>Avance de la jornada</span>
            <span className="tabular font-semibold">{pct} %</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/15">
            <div className="h-full bg-white/90 transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
        </div>
      </MetricCard>
      <MetricCard
        icon="CalendarDaysIcon"
        label="Citas agendadas hoy"
        value={loading ? '—' : String(scheduled)}
        unit="citas"
        helper="Datos de tu clínica"
      />
      <MetricCard
        icon="ClipboardDocumentCheckIcon"
        label="Completadas"
        value={loading ? '—' : String(attended)}
        unit="hoy"
        helper="Según estado en agenda"
      />
    </section>
  );
}
