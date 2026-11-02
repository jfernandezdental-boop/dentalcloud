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
  clinicCity: string | null;
  clinicPlan: string | null;
  /** true solo para la clinica de demostracion (MSP-DEMO-*): unica que puede ver datos de ejemplo */
  clinicIsDemo: boolean;
};

/**
 * La identidad sale SIEMPRE de la base de datos (tabla profiles + clinics, protegidas por RLS).
 * Nunca se confia en user_metadata (el propio usuario puede editarlo al registrarse) ni en
 * correos fijos en el codigo. Si el perfil no existe, esta inactivo o no se puede leer, no hay sesion.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = getSupabase();
  const { data: authData, error } = await supabase.auth.getUser();
  if (error || !authData.user) return null;
  const user = authData.user;

  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('full_name, role_key, is_super_admin, clinic_id, active')
    .eq('id', user.id)
    .maybeSingle();
  if (pErr || !profile || !profile.active) return null;

  const isSuper = profile.is_super_admin === true;
  const role: AppRole = isSuper ? 'super_admin' : profile.role_key ? normalizeRole(profile.role_key) : 'patient';

  let clinicId: string | null = null;
  let clinicName: string | null = null;
  let clinicCity: string | null = null;
  let clinicPlan: string | null = null;
  let clinicIsDemo = false;

  if (!isSuper && profile.clinic_id) {
    clinicId = String(profile.clinic_id);
    const { data: clinic } = await supabase
      .from('clinics')
      .select('name, city, plan, msp_code')
      .eq('id', clinicId)
      .maybeSingle();
    if (clinic) {
      clinicName = clinic.name ?? null;
      clinicCity = clinic.city ?? null;
      clinicPlan = clinic.plan ?? null;
      clinicIsDemo = String(clinic.msp_code || '').toUpperCase().startsWith('MSP-DEMO');
    }
  }

  return {
    id: user.id,
    email: user.email || '',
    role,
    roleLabel: ROLE_LABEL[role],
    fullName: String(profile.full_name || user.email || ''),
    clinicId,
    clinicName,
    clinicCity,
    clinicPlan,
    clinicIsDemo,
  };
}
