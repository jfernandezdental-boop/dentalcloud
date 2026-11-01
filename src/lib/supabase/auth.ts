import { getSupabase } from './client';
import { getSessionUser } from './session';
import { homeForRole } from './roles';
import { normalizeEmail, isValidEmail } from '@/lib/validators';

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

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('email address') && m.includes('invalid')) {
    return (
      'Supabase rechazo el correo como invalido. ' +
      'Revisa: 1) Auth > Providers > Email (Enable sign ups ON). ' +
      '2) No haya lista de dominios restringidos. ' +
      '3) Escribe el correo sin espacios (ej. nombre@gmail.com). ' +
      'Detalle: ' +
      message
    );
  }
  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return 'Correo o contrasena incorrectos.';
  }
  if (m.includes('email not confirmed')) {
    return 'Confirma el correo o desactiva Confirm email en Supabase Auth > Providers.';
  }
  if (m.includes('signups not allowed') || m.includes('signup is disabled')) {
    return 'Los registros estan deshabilitados en Supabase Auth. Activa Enable sign ups.';
  }
  if (m.includes('already registered') || m.includes('already been registered') || m.includes('user already')) {
    return 'Ese correo ya esta registrado en Auth. Usa otro o restablece la clave.';
  }
  if (m.includes('faltan next_public') || m.includes('dummy')) {
    return 'Faltan NEXT_PUBLIC_SUPABASE_URL / ANON_KEY en Vercel.';
  }
  if (m.includes('permission') || m.includes('policy') || m.includes('rls')) {
    return 'Permiso denegado (RLS).';
  }
  if (m.includes('function') && (m.includes('not found') || m.includes('does not exist'))) {
    return 'El servicio de alta de clinicas no esta disponible. Intenta de nuevo en unos minutos.';
  }
  return message;
}

export async function signInWithPassword({ email, password }: LoginInput) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
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

async function invokeClinicas(body: Record<string, unknown>) {
  const supabase = getSupabase();
  const { data, error } = await supabase.functions.invoke('clinicas', { body });
  if (error) {
    let msg = error.message || 'No se pudo completar la solicitud.';
    try {
      const ctx = (error as { context?: Response }).context;
      const j = ctx ? await ctx.json() : null;
      if (j?.error) msg = j.error;
    } catch {
      /* respuesta sin JSON: se deja el mensaje generico */
    }
    throw new Error(friendlyAuthError(msg));
  }
  if (data?.error) throw new Error(friendlyAuthError(data.error));
  return data as { ok: boolean; clinic_id: string; user_id: string; plan: string; status: string };
}

/**
 * Registro de clinica (Edge Function `clinicas`: admin + clinica + perfil en un solo paso,
 * con rollback si algo falla; no usa signUp, asi que no toca la sesion del admin global):
 * - createdBySuperAdmin: true  -> accion "crear": el servidor exige administrador global.
 * - createdBySuperAdmin: false -> accion "registro_publico": sin sesion, con limite de intentos.
 */
export async function registerClinic(input: RegisterClinicInput) {
  const email = normalizeEmail(input.adminEmail);
  const asGlobal = !!input.createdBySuperAdmin;
  const minPass = asGlobal ? 6 : 8;

  if (!isValidEmail(email)) {
    throw new Error('Correo del administrador no valido. Ejemplo: nombre@gmail.com');
  }
  if (!input.password || input.password.length < minPass) {
    throw new Error(`La contrasena debe tener al menos ${minPass} caracteres`);
  }
  if (!input.clinicName.trim() || !input.ruc.trim()) {
    throw new Error('Nombre de clinica y RUC son obligatorios');
  }

  const data = await invokeClinicas({
    action: asGlobal ? 'crear' : 'registro_publico',
    clinica: {
      name: input.clinicName.trim(),
      ruc: input.ruc.trim().replace(/\D/g, ''),
      msp_code: input.mspCode?.trim() || null,
      city: input.city?.trim() || null,
      plan: input.plan || 'inicial',
    },
    admin: {
      full_name: input.adminName.trim(),
      email,
      phone: input.phone?.trim() || null,
      password: input.password,
    },
  });

  return {
    user: { id: data.user_id },
    clinic: data,
    message: asGlobal
      ? `Clinica creada. El administrador ya puede ingresar con ${email} y la contrasena que definiste.`
      : 'Tu clinica y tu cuenta de administrador ya estan activas. Inicia sesion con el correo y la contrasena que acabas de definir.',
  };
}
