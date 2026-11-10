/**
 * Búsqueda de pacientes para cualquier casillero con autocompletado.
 * Llama a la función SQL public.search_patients (ya aplicada en Supabase).
 * - Busca por nombre, apellido, cédula o teléfono, sin importar tildes ni orden de palabras.
 * - Respeta RLS: solo devuelve pacientes de la clínica del usuario.
 *
 * Uso (con debounce de ~250 ms desde el input):
 *   const results = await searchPatients(supabase, "gar ana");
 */
export type PatientHit = {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  cedula: string | null;
  phone: string | null;
};

type RpcClient = {
  rpc: (fn: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

export async function searchPatients(client: RpcClient, query: string, limit = 10): Promise<PatientHit[]> {
  const { data, error } = await client.rpc("search_patients", { q: query.trim(), lim: limit });
  if (error) throw new Error(`search_patients: ${error.message}`);
  return (data as PatientHit[]) ?? [];
}
