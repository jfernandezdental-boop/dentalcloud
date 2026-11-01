import { getSupabase } from './client';
import { getSessionUser } from './session';
import { homeForRole } from './roles';
import { normalizeEmail, isValidEmail } from '@/lib/validators';
import { friendlyAuthError } from './authErrors';

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
  createdBySuperAdmin?: boolean;
};

export async function signInWithPassword({ email, password }: LoginInput) {
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });
    if (error) throw new Error(friendlyAuthError(error.message));
    return data;
  } catch (e: unknown) {
    if (e instanceof Error && e.message.toLowerCase().includes('failed to fetch')) {
      throw new Error(friendlyAuthError('Failed to fetch'));
    }
    throw e;
  }
}

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

async function callRegisterClinicRpc(params: {
  userId: string | null;
  clinicName: string;
  ruc: string;
  mspCode: string | null;
  city: string | null;
  adminName: string;
  adminEmail: string;
  phone: string | null;
  plan: string;
}) {
  const supabase = getSupabase();
  const attempts: Record<string, unknown>[] = [
    {
      p_clinic_name: params.clinicName,
      p_ruc: params.ruc,
      p_msp_code: params.mspCode,
      p_city: params.city,
      p_admin_name: params.adminName,
      p_admin_email: params.adminEmail,
      p_phone: params.phone,
      p_plan: params.plan,
      p_user_id: params.userId,
    },
    {
      clinic_name: params.clinicName,
      ruc: params.ruc,
      city: params.city,
      admin_name: params.adminName,
      admin_email: params.adminEmail,
      phone: params.phone,
      plan: params.plan,
      user_id: params.userId,
    },
    {
      p_nombre: params.clinicName,
      p_ruc: params.ruc,
      p_ciudad: params.city,
      p_admin_nombre: params.adminName,
      p_admin_email: params.adminEmail,
      p_telefono: params.phone,
      p_plan: params.plan,
      p_user_id: params.userId,
    },
  ];

  const errors: string[] = [];
  for (const payload of attempts) {
    const { data, error } = await supabase.rpc('register_clinic', payload);
    if (!error) return data;
    errors.push(error.message);
    if (/could not find|does not exist|not find the function/i.test(error.message)) {
      throw new Error(friendlyAuthError(error.message));
    }
  }
  throw new Error(friendlyAuthError(errors[errors.length - 1] || 'register_clinic fallo'));
}

export async function registerClinic(input: RegisterClinicInput) {
  const supabase = getSupabase();
  const email = normalizeEmail(input.adminEmail);
  const password = input.password;

  if (!isValidEmail(email)) {
    throw new Error('Correo del administrador no valido. Ejemplo: nombre@gmail.com');
  }
  if (!password || password.length < 8) {
    throw new Error('La contrasena debe tener al menos 8 caracteres');
  }
  if (!input.clinicName.trim() || !input.ruc.trim()) {
    throw new Error('Nombre de clinica y RUC son obligatorios');
  }

  const { data: prevSessionData } = await supabase.auth.getSession();
  const hadSession = !!prevSessionData.session;

  let signUpData;
  try {
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: input.adminName.trim(),
          role: 'admin',
          clinic_name: input.clinicName.trim(),
        },
        emailRedirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}/sign-up-login-screen`
            : undefined,
      },
    });
    if (res.error) throw new Error(friendlyAuthError(res.error.message));
    signUpData = res.data;
  } catch (e: unknown) {
    if (e instanceof Error) throw new Error(friendlyAuthError(e.message));
    throw e;
  }

  const userId = signUpData.user?.id ?? null;

  let clinicData: unknown;
  try {
    clinicData = await callRegisterClinicRpc({
      userId,
      clinicName: input.clinicName.trim(),
      ruc: input.ruc.trim().replace(/\D/g, ''),
      mspCode: input.mspCode?.trim() || null,
      city: input.city?.trim() || null,
      adminName: input.adminName.trim(),
      adminEmail: email,
      phone: input.phone?.trim() || null,
      plan: input.plan || 'pro',
    });
  } catch (rpcErr) {
    const extra = rpcErr instanceof Error ? rpcErr.message : 'Error en register_clinic';
    throw new Error(
      `${extra} (El usuario Auth pudo crearse: ${email}. Revisalo en Authentication > Users).`,
    );
  }

  if (input.createdBySuperAdmin || hadSession) {
    await supabase.auth.signOut();
  }

  return {
    user: signUpData.user,
    clinic: clinicData,
    needsEmailConfirmation: !signUpData.session,
    message: input.createdBySuperAdmin
      ? 'Clinica creada. Vuelve a iniciar sesion como admin global.'
      : signUpData.session
        ? 'Clinica creada. Ya puedes usar el sistema con este admin.'
        : 'Clinica creada. Confirma el email si Supabase lo exige, luego inicia sesion.',
  };
}
