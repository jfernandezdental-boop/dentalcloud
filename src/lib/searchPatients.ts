/** Búsqueda de pacientes vía RPC (trigram). */
import { createClient } from '@/lib/supabase/client';

export type PatientSearchRow = {
  id: string;
  nombres: string;
  apellidos: string;
  cedula: string | null;
  celular: string | null;
};

export async function searchPatients(q: string, limit = 20): Promise<PatientSearchRow[]> {
  const term = (q || '').trim();
  if (term.length < 2) return [];
  const supabase = createClient();
  const { data, error } = await supabase.rpc('search_patients', {
    search_term: term,
    result_limit: limit,
  });
  if (error) {
    console.error('search_patients', error);
    return [];
  }
  return (data || []) as PatientSearchRow[];
}
