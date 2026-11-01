import { getSupabase } from './client';

export type ClinicRecord = {
  id: string;
  name: string;
  city: string;
  status: string;
  plan: string;
  admin: string;
  adminEmail: string;
  created: string;
  raw: Record<string, unknown>;
  table: string;
};

const TABLE_CANDIDATES = ['clinics', 'consultorios', 'tenants'] as const;

function mapRow(r: Record<string, unknown>, table: string): ClinicRecord {
  return {
    id: String(r.id),
    name: String(r.name || r.nombre || r.clinic_name || '—'),
    city: String(r.city || r.ciudad || '—'),
    status: String(r.status || r.estado || 'activa').toLowerCase(),
    plan: String(r.plan || r.plan_name || 'pro'),
    admin: String(r.admin_name || r.admin_email || r.owner_email || '—'),
    adminEmail: String(r.admin_email || r.owner_email || r.email || ''),
    created: String(r.created_at || r.created || '').slice(0, 10),
    raw: r,
    table,
  };
}

export async function listClinics(): Promise<{ rows: ClinicRecord[]; error?: string }> {
  const supabase = getSupabase();
  let lastErr = '';
  for (const table of TABLE_CANDIDATES) {
    const { data, error } = await supabase.from(table).select('*').limit(300);
    if (!error && data) {
      return { rows: data.map((r) => mapRow(r as Record<string, unknown>, table)) };
    }
    lastErr = error?.message || `Sin acceso a ${table}`;
  }
  return { rows: [], error: lastErr };
}

export type ClinicUpdate = {
  name?: string;
  city?: string;
  plan?: string;
  status?: string;
  admin_name?: string;
  admin_email?: string;
};

/** Actualiza campos comunes; prueba nombres de columna alternos si falla */
export async function updateClinic(
  table: string,
  id: string,
  patch: ClinicUpdate,
): Promise<void> {
  const supabase = getSupabase();
  const attempts: Record<string, unknown>[] = [
    {
      name: patch.name,
      city: patch.city,
      plan: patch.plan,
      status: patch.status,
      admin_name: patch.admin_name,
      admin_email: patch.admin_email,
    },
    {
      nombre: patch.name,
      ciudad: patch.city,
      plan: patch.plan,
      estado: patch.status,
      admin_name: patch.admin_name,
      admin_email: patch.admin_email,
    },
  ];

  let lastError: Error | null = null;
  for (const body of attempts) {
    const clean = Object.fromEntries(
      Object.entries(body).filter(([, v]) => v !== undefined && v !== ''),
    );
    if (Object.keys(clean).length === 0) continue;
    const { error } = await supabase.from(table).update(clean).eq('id', id);
    if (!error) return;
    lastError = new Error(error.message);
  }
  throw lastError || new Error('No se pudo actualizar la clinica');
}

export async function setClinicActive(
  table: string,
  id: string,
  active: boolean,
): Promise<void> {
  const status = active ? 'activa' : 'suspendida';
  await updateClinic(table, id, { status });
}

/**
 * Restablecer contrasena del admin de la clinica.
 * Usa el flujo oficial de Supabase (email de recuperacion).
 * No requiere service_role en el cliente.
 */
export async function resetClinicAdminPassword(adminEmail: string): Promise<void> {
  if (!adminEmail || !adminEmail.includes('@')) {
    throw new Error('Esta clinica no tiene email de administrador registrado');
  }
  const supabase = getSupabase();
  const redirectTo =
    (typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || '') + '/sign-up-login-screen';

  const { error } = await supabase.auth.resetPasswordForEmail(adminEmail.trim().toLowerCase(), {
    redirectTo,
  });
  if (error) throw new Error(error.message);
}
