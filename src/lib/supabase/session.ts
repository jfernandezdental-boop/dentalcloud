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
  /**
   * true SOLO para la clínica de demostración de la plataforma.
   * Cualquier clínica creada (p. ej. Estudio dental Vittoria) es producción → false.
   */
  clinicIsDemo: boolean;
};

/** Códigos MSP reservados exclusivamente a la clínica demo de referencia. */
const DEMO_MSP_CODES = new Set(['MSP-DEMO-001', 'MSP-DEMO']);

/**
 * Una clínica es demo solo si:
 * - is_demo === true en la tabla clinics, o
 * - msp_code es exactamente un código demo de plataforma (MSP-DEMO-001).
 *
 * NO se usa startsWith('MSP-DEMO') para no marcar por error clínicas reales.
 */
export function resolveClinicIsDemo(clinic: {
  is_demo?: boolean | null;
  msp_code?: string | null;
  name?: string | null;
} | null | undefined): boolean {
  if (!clinic) return false;
  if (clinic.is_demo === true) return true;
  const msp = String(clinic.msp_code || '')
    .toUpperCase()
    .trim();
  if (msp && DEMO_MSP_CODES.has(msp)) return true;
  return false;
}

/**
 * La identidad sale SIEMPRE de la base de datos (tabla profiles + clinics, protegidas por RLS).
 * Nunca se confía en user_metadata (el propio usuario puede editarlo al registrarse) ni en
 * correos fijos en el código. Si el perfil no existe, está inactivo o no se puede leer, no hay sesión.
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
    // is_demo puede no existir aún: si falla el select, reintentamos sin esa columna
    type ClinicRow = {
      name?: string | null;
      city?: string | null;
      plan?: string | null;
      msp_code?: string | null;
      is_demo?: boolean | null;
    };
    let clinic = null as ClinicRow | null;

    const full = await supabase
      .from('clinics')
      .select('name, city, plan, msp_code, is_demo')
      .eq('id', clinicId)
      .maybeSingle();

    if (full.error && /is_demo/i.test(full.error.message || '')) {
      const basic = await supabase
        .from('clinics')
        .select('name, city, plan, msp_code')
        .eq('id', clinicId)
        .maybeSingle();
      clinic = basic.data as ClinicRow | null;
    } else {
      clinic = full.data as ClinicRow | null;
    }

    if (clinic) {
      clinicName = clinic.name ?? null;
      clinicCity = clinic.city ?? null;
      clinicPlan = clinic.plan ?? null;
      clinicIsDemo = resolveClinicIsDemo(clinic);
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
