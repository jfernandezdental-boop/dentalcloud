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
  /** true = panel global: no dejar sesion del admin de clinica */
  createdBySuperAdmin?: boolean;
};

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return 'Correo o contrasena incorrectos.';
  }
  if (m.includes('email not confirmed')) {
    return 'Confirma el correo o desactiva Confirm email en Supabase Auth > Providers.';
  }
  if (m.includes('already registered') || m.includes('already been registered') || m.includes('user already')) {
    return 'Ese correo ya esta registrado en Auth. Usa otro o restablece la clave.';
  }
  if (m.includes('password')) {
    return message;
  }
  if (m.includes('faltan next_public') || m.includes('dummy')) {
    return 'Faltan NEXT_PUBLIC_SUPABASE_URL / ANON_KEY en Vercel.';
  }
  if (m.includes('permission') || m.includes('policy') || m.includes('rls')) {
    return 'Permiso denegado (RLS). El rol o la politica no permiten crear la clinica.';
  }
  if (m.includes('function') && m.includes('not found')) {
    return 'No existe la funcion register_clinic en Supabase. Debe crearla Claude/SQL (sin tocar tablas ajenas).';
  }
  return message;
}

export async function signInWithPassword({ email, password }: LoginInput) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw new Error(friendlyAuthError(error.message));
  return data;
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

/** Prueba varios nombres de argumentos de register_clinic */
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
      msp_code: params.mspCode,
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
    {
      p_name: params.clinicName,
      p_ruc: params.ruc,
      p_admin_email: params.adminEmail,
      p_admin_name: params.adminName,
      p_user_id: params.userId,
      p_plan: params.plan,
    },
  ];

  const errors: string[] = [];
  for (const payload of attempts) {
    const { data, error } = await supabase.rpc('register_clinic', payload);
    if (!error) return data;
    errors.push(error.message);
    // Si la funcion no existe, no seguir
    if (/could not find|does not exist|not find the function/i.test(error.message)) {
      throw new Error(friendlyAuthError(error.message));
    }
  }

  throw new Error(
    friendlyAuthError(
      errors[errors.length - 1] ||
        'register_clinic rechazo todos los formatos de parametros. Revisa la firma en Supabase.',
    ),
  );
}

/**
 * Registro de clinica:
 * 1) signUp del admin de clinica
 * 2) RPC register_clinic (varias firmas)
 * 3) Si createdBySuperAdmin: cierra sesion del admin nuevo para no perder el panel global
 */
export async function registerClinic(input: RegisterClinicInput) {
  const supabase = getSupabase();
  const email = input.adminEmail.trim().toLowerCase();
  const password = input.password;

  if (!email || !password || password.length < 6) {
    throw new Error('Email y contrasena (min. 6) son obligatorios');
  }
  if (!input.clinicName.trim() || !input.ruc.trim()) {
    throw new Error('Nombre de clinica y RUC son obligatorios');
  }

  // Sesion previa (admin global)
  const { data: prevSessionData } = await supabase.auth.getSession();
  const hadSession = !!prevSessionData.session;

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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

  if (signUpError) throw new Error(friendlyAuthError(signUpError.message));

  const userId = signUpData.user?.id ?? null;

  // Si Auth exige confirmacion, a veces no hay session; igual intentamos RPC con user id
  let clinicData: unknown;
  try {
    clinicData = await callRegisterClinicRpc({
      userId,
      clinicName: input.clinicName.trim(),
      ruc: input.ruc.trim(),
      mspCode: input.mspCode?.trim() || null,
      city: input.city?.trim() || null,
      adminName: input.adminName.trim(),
      adminEmail: email,
      phone: input.phone?.trim() || null,
      plan: input.plan || 'pro',
    });
  } catch (rpcErr) {
    // Si el RPC falla, el usuario Auth puede haber quedado creado
    const extra =
      rpcErr instanceof Error ? rpcErr.message : 'Error en register_clinic';
    throw new Error(
      `${extra} (El usuario Auth pudo crearse: ${email}. Revisalo en Authentication > Users).`,
    );
  }

  // Panel global: no quedarse logueado como admin de la clinica nueva
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
        : 'Clinica creada. Confirma el email del admin si Supabase lo exige, luego inicia sesion.',
  };
}
