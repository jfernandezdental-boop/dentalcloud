import { registerClinic } from './auth';
import { getSupabase } from './client';

/**
 * Clinica demo de referencia (Sonrisa Boreal).
 * Los usuarios deben existir en Supabase Auth con estos correos/claves
 * y app_metadata.role + consultorio_id cuando register_clinic los enlace.
 */
function randomPassword(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const core = Array.from(bytes, (b) => 'abcdefghjkmnpqrstuvwxyz23456789'[b % 31]).join('');
  return `Dc-${core}-9A`;
}

export const DEMO_CLINIC = {
  clinicName: 'Sonrisa Boreal',
  ruc: '1799999999001',
  mspCode: 'MSP-DEMO-001',
  city: 'Quito',
  plan: 'pro',
  adminName: 'Mariana Rosero',
  adminEmail: 'admin.demo@sonrisaboreal.ec',
  phone: '0990000001',
  password: randomPassword(),
};

/** Cuentas de acceso de la clinica demo (crear en Auth o tras el alta) */
export const DEMO_ACCESS = [
  {
    role: 'admin',
    label: 'Administrador de clinica',
    email: 'admin.demo@sonrisaboreal.ec',
    password: DEMO_CLINIC.password,
  },
  {
    role: 'doctor',
    label: 'Odontologo',
    email: 'doctor.demo@sonrisaboreal.ec',
    password: randomPassword(),
  },
  {
    role: 'receptionist',
    label: 'Recepcion',
    email: 'recepcion.demo@sonrisaboreal.ec',
    password: randomPassword(),
  },
] as const;

export type SeedResult = {
  ok: boolean;
  message: string;
  clinic?: unknown;
  usersCreated: string[];
  usersFailed: { email: string; error: string }[];
};

/**
 * 1) register_clinic con admin demo
 * 2) signUp de doctor y recepcion (si Auth lo permite desde el cliente)
 *    Nota: signUp de varios usuarios desde un admin ya logueado puede estar
 *    limitado por Supabase; si falla, crear manualmente en Auth dashboard.
 */
export async function seedDemoClinic(): Promise<SeedResult> {
  const usersCreated: string[] = [];
  const usersFailed: { email: string; error: string }[] = [];

  let clinic: unknown;
  try {
    const res = await registerClinic({
      clinicName: DEMO_CLINIC.clinicName,
      ruc: DEMO_CLINIC.ruc,
      mspCode: DEMO_CLINIC.mspCode,
      city: DEMO_CLINIC.city,
      adminName: DEMO_CLINIC.adminName,
      adminEmail: DEMO_CLINIC.adminEmail,
      phone: DEMO_CLINIC.phone,
      plan: DEMO_CLINIC.plan,
      password: DEMO_CLINIC.password,
      createdBySuperAdmin: true,
    });
    clinic = res.clinic;
    usersCreated.push(DEMO_CLINIC.adminEmail);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error register_clinic';
    // Si el admin ya existe, seguimos con el resto
    if (!/already|registered|exists|existe/i.test(msg)) {
      return {
        ok: false,
        message: msg,
        usersCreated,
        usersFailed: [{ email: DEMO_CLINIC.adminEmail, error: msg }],
      };
    }
    usersFailed.push({ email: DEMO_CLINIC.adminEmail, error: msg + ' (puede existir ya)' });
  }

  const supabase = getSupabase();
  for (const u of DEMO_ACCESS) {
    if (u.email === DEMO_CLINIC.adminEmail) continue;
    try {
      const { error } = await supabase.auth.signUp({
        email: u.email,
        password: u.password,
        options: {
          data: {
            full_name: u.label,
            role: u.role,
            clinic_name: DEMO_CLINIC.clinicName,
          },
        },
      });
      if (error) {
        usersFailed.push({ email: u.email, error: error.message });
      } else {
        usersCreated.push(u.email);
      }
    } catch (e: unknown) {
      usersFailed.push({
        email: u.email,
        error: e instanceof Error ? e.message : 'Error signUp',
      });
    }
  }

  return {
    ok: usersCreated.length > 0,
    message:
      usersCreated.length > 0
        ? 'Clinica demo provisionada. Asigna app_metadata.role y consultorio_id en Auth si hace falta.'
        : 'No se pudo crear usuarios. Revisar Auth o crear manualmente con las claves del listado.',
    clinic,
    usersCreated,
    usersFailed,
  };
}
