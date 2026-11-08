'use client';
import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from './client';

export type PlatformOverview = {
  clinics_total: number;
  clinics_active: number;
  clinics_trial: number;
  clinics_suspended: number;
  clinics_overdue: number;
  plan_inicial: number;
  plan_pro: number;
  plan_red: number;
  doctors: number;
  staff: number;
  patients: number;
  attended_30: number;
  attended_prev_30: number;
  top_clinics: { name: string; pacientes: number }[];
  weekly: { sem: string; semana: string; atendidas: number; nuevas: number }[];
};

/** Resumen real de la plataforma (solo administrador global; lo valida la base de datos). */
export function usePlatformOverview(enabled: boolean) {
  const [data, setData] = useState<PlatformOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data: res, error: err } = await getSupabase().rpc('platform_overview');
    if (err) {
      setError('No se pudo cargar el resumen de la plataforma.');
      setData(null);
    } else {
      setData(res as PlatformOverview);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (enabled) void load();
  }, [enabled, load]);

  return { data, loading, error, reload: load };
}
