import { getSupabase } from './client';
import { getSessionUser } from './session';
import { homeForRole } from './roles';

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterClinicInput = {
  clinicName: string;
  ruc: string;
  mspCode?: string;
  city?: string;
  adminName: string;
  adminEmail: string;
  phone?: string;
  plan?: string;
  password: string;
};

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return 'Correo o contraseña incorrectos. El usuario debe existir en Supabase Auth (no las cuentas demo).';
  }
  if (m.includes('email not confirmed')) {
    return 'Debes confirmar el correo antes de ingresar (revisa la bandeja o desactiva confirmación en Supabase Auth).';
  }
  if (m.includes('faltan next_public') || m.includes('dummy')) {
    return 'Faltan variables NEXT_PUBLIC_SUPABASE_URL / ANON_KEY en el entorno (Vercel o .env.local).';
  }
  return message;
}

/** Login con Supabase Auth */
export async function signInWithPassword({ email, password }: LoginInput) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw new Error(friendlyAuthError(error.message));
  return data;
}

/** Tras login: usuario + ruta home según rol */
export async function signInAndResolveHome(input: LoginInput) {
  await signInWithPassword(input);
  const user = await getSessionUser();
  const href = user ? homeForRole(user.role) : '/';
  return { user, href };
}

export async function signOut() {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function registerClinic(input: RegisterClinicInput) {
  const supabase = getSupabase();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: input.adminEmail.trim().toLowerCase(),
    password: input.password,
    options: {
      data: {
        full_name: input.adminName,
        role: 'admin',
      },
    },
  });
  if (signUpError) throw new Error(friendlyAuthError(signUpError.message));

  const { data, error } = await supabase.rpc('register_clinic', {
    p_clinic_name: input.clinicName.trim(),
    p_ruc: input.ruc.trim(),
    p_msp_code: input.mspCode?.trim() || null,
    p_city: input.city?.trim() || null,
    p_admin_name: input.adminName.trim(),
    p_admin_email: input.adminEmail.trim().toLowerCase(),
    p_phone: input.phone?.trim() || null,
    p_plan: input.plan || 'pro',
    p_user_id: signUpData.user?.id ?? null,
  });

  if (error) {
    throw new Error(
      error.message +
        ' — Si falla register_clinic, revisa los nombres de argumentos de la función en Supabase (no se modifican tablas desde el front).',
    );
  }
  return { user: signUpData.user, clinic: data };
}
