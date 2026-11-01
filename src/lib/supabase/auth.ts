import { getSupabase } from './client';

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

/** Login con Supabase Auth */
export async function signInWithPassword({ email, password }: LoginInput) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return data;
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

/**
 * Registro de clínica:
 * 1) signUp del admin
 * 2) RPC register_clinic (ya existe en Supabase; no crea tablas)
 *
 * Si los nombres de argumentos de register_clinic difieren, se ajustan aquí.
 */
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
  if (signUpError) throw signUpError;

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

  if (error) throw error;
  return { user: signUpData.user, clinic: data };
}
