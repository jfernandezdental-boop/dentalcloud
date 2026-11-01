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

/**
 * Resuelve el usuario actual y su rol.
 * Orden: profiles (si existe) → app_metadata → user_metadata → 'staff'
 * No crea tablas.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = getSupabase();
  const { data: authData, error } = await supabase.auth.getUser();
  if (error || !authData.user) return null;

  const user = authData.user;
  const meta = {
    ...(user.user_metadata || {}),
    ...(user.app_metadata || {}),
  } as Record<string, unknown>;

  let role = normalizeRole(
    String(meta.role || meta.rol || meta.user_role || ''),
  );
  let fullName = String(meta.full_name || meta.name || meta.nombre || user.email || '');
  let clinicId =
    (meta.clinic_id as string) ||
    (meta.consultorio_id as string) ||
    (meta.tenant_id as string) ||
    null;
  let clinicName = (meta.clinic_name as string) || (meta.clinica as string) || null;

  // Intentar tabla profiles si existe (RLS decidirá si se puede leer)
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      const p = profile as Record<string, unknown>;
      if (p.role || p.rol) role = normalizeRole(String(p.role || p.rol));
      if (p.full_name || p.nombre || p.name)
        fullName = String(p.full_name || p.nombre || p.name);
      if (p.clinic_id || p.consultorio_id || p.tenant_id)
        clinicId = String(p.clinic_id || p.consultorio_id || p.tenant_id);
      if (p.clinic_name) clinicName = String(p.clinic_name);
    }
  } catch {
    // Tabla ausente o sin permiso: seguir con JWT
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
