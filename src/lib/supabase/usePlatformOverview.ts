'use client';
import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from './client';

export type PlatformOverview = {
  clinics_total: number;
  clinics_active: number;
  clinics_trial: number;
  clinics_suspended: number;
  patients_total: number;
  appointments_month: number;
  users_total: number;
  top_clinics: { id: string; name: string; patients: number }[];
  weekly_flow: { week: string; patients: number; new_clinics: number }[];
};

const empty: PlatformOverview = {
  clinics_total: 0,
  clinics_active: 0,
  clinics_trial: 0,
  clinics_suspended: 0,
  patients_total: 0,
  appointments_month: 0,
  users_total: 0,
  top_clinics: [],
  weekly_flow: [],
};

/**
 * Datos reales del panel global vía RPC platform_overview().
 * Sin cifras inventadas.
 */
export function usePlatformOverview() {
  const [data, setData] = useState<PlatformOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: row, error: e } = await getSupabase().rpc('platform_overview');
      if (e) throw e;
      const r = (row || {}) as Partial<PlatformOverview>;
      setData({
        clinics_total: Number(r.clinics_total) || 0,
        clinics_active: Number(r.clinics_active) || 0,
        clinics_trial: Number(r.clinics_trial) || 0,
        clinics_suspended: Number(r.clinics_suspended) || 0,
        patients_total: Number(r.patients_total) || 0,
        appointments_month: Number(r.appointments_month) || 0,
        users_total: Number(r.users_total) || 0,
        top_clinics: Array.isArray(r.top_clinics) ? r.top_clinics : [],
        weekly_flow: Array.isArray(r.weekly_flow) ? r.weekly_flow : [],
      });
    } catch (err: unknown) {
      setData(empty);
      setError(err instanceof Error ? err.message : 'No se pudo cargar el resumen');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data: data ?? empty, loading, error, reload: load };
}
