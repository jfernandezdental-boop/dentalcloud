import { getSupabase } from './client';
import { normalizeRole, type AppRole, ROLE_LABEL } from './roles';

export type SessionUser = {
  id: string;
  email: string;
  role: AppRole;
  roleLabel: string;
  fullName: string;
  clinicId: string | null;
  clinicName: string | null;
};

const PLATFORM_ADMIN_EMAILS = new Set(['jfernandez.dental@gmail.com']);

/** Mapeo temporal email admin -> nombre clinica (hasta que profiles tenga el dato) */
const EMAIL_CLINIC_HINT: Record<string, string> = {
  'clinicaldentalela@gmail.com': 'Estudio dental Vittoria',
  'admin.demo@sonrisaboreal.ec': 'Sonrisa Boreal',
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = getSupabase();
  const { data: authData, error } = await supabase.auth.getUser();
  if (error || !authData.user) return null;

  const user = authData.user;
  const email = (user.email || '').toLowerCase();
  const meta = {
    ...(user.user_metadata || {}),
    ...(user.app_metadata || {}),
  } as Record<string, unknown>;

  let role = normalizeRole(String(meta.role || meta.rol || meta.user_role || ''));
  if (PLATFORM_ADMIN_EMAILS.has(email)) role = 'super_admin';
  if (!meta.role && !meta.rol && email && !PLATFORM_ADMIN_EMAILS.has(email)) {
    role = 'admin';
  }

  let fullName = String(meta.full_name || meta.name || meta.nombre || user.email || '');
  let clinicId =
    (meta.clinic_id as string) ||
    (meta.consultorio_id as string) ||
    (meta.tenant_id as string) ||
    null;
  let clinicName =
    (meta.clinic_name as string) ||
    (meta.clinica as string) ||
    EMAIL_CLINIC_HINT[email] ||
    null;

  if (role === 'super_admin') {
    clinicId = null;
    clinicName = null;
  }

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      const p = profile as Record<string, unknown>;
      if (p.role || p.rol) role = normalizeRole(String(p.role || p.rol));
      if (PLATFORM_ADMIN_EMAILS.has(email)) role = 'super_admin';
      if (p.full_name || p.nombre || p.name)
        fullName = String(p.full_name || p.nombre || p.name);
      if (role !== 'super_admin' && (p.clinic_id || p.consultorio_id || p.tenant_id))
        clinicId = String(p.clinic_id || p.consultorio_id || p.tenant_id);
      if (role !== 'super_admin' && (p.clinic_name || p.clinica))
        clinicName = String(p.clinic_name || p.clinica);
    }
  } catch {
    // profiles opcional
  }

  if (!clinicName && role !== 'super_admin') {
    clinicName = EMAIL_CLINIC_HINT[email] || 'Mi clinica';
  }

  return {
    id: user.id,
    email: user.email || '',
    role,
    roleLabel: ROLE_LABEL[role],
    fullName,
    clinicId,
    clinicName,
  };
}
