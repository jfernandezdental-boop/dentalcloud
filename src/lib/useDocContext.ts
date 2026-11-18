'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import type { DocClinic, DocPatient } from '@/lib/clinicDocs';

/**
 * Datos reales de la clínica y del paciente para los documentos imprimibles.
 * Se cargan al abrir la pestaña para que "Imprimir" sea instantáneo.
 */
export function useDocContext(patientId: string): { clinic: DocClinic; patient: DocPatient } | null {
  const { user } = useAuth();
  const clinicId = user?.clinicId || null;
  const clinicName = user?.clinicName || 'Clínica dental';
  const [ctx, setCtx] = useState<{ clinic: DocClinic; patient: DocPatient } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const sb = getSupabase();
      const [c, p] = await Promise.all([
        clinicId
          ? sb
              .from('clinics')
              .select('name, ruc, msp_code, city, address, phone, mobile, email')
              .eq('id', clinicId)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        sb
          .from('patients')
          .select('first_name, last_name, cedula, birth_date, sex, allergies, hc_number, hc')
          .eq('id', patientId)
          .maybeSingle(),
      ]);
      if (!alive) return;
      const cd = c.data as {
        name: string;
        ruc: string | null;
        msp_code: string | null;
        city: string | null;
        address?: string | null;
        phone?: string | null;
        mobile?: string | null;
        email?: string | null;
      } | null;
      const pd = p.data as {
        first_name: string;
        last_name: string;
        cedula: string | null;
        birth_date: string | null;
        sex: string | null;
        allergies: string | null;
        hc_number?: string | null;
        hc?: string | null;
      } | null;

      const hc =
        (pd?.hc_number && String(pd.hc_number)) ||
        (pd?.hc && String(pd.hc)) ||
        (patientId ? patientId.replace(/\D/g, '').slice(-4).padStart(4, '0') : null);

      setCtx({
        clinic: {
          name: cd?.name || clinicName,
          ruc: cd?.ruc,
          mspCode: cd?.msp_code,
          city: cd?.city,
          address: cd?.address ?? null,
          phone: cd?.phone ?? null,
          mobile: cd?.mobile ?? null,
          email: cd?.email ?? null,
        },
        patient: {
          name: pd ? `${pd.first_name} ${pd.last_name}`.trim() : 'Paciente',
          cedula: pd?.cedula,
          hc: hc || null,
          birthDate: pd?.birth_date,
          sex: pd?.sex,
          allergies: pd?.allergies,
        },
      });
    })();
    return () => {
      alive = false;
    };
  }, [patientId, clinicId, clinicName]);

  return ctx;
}
