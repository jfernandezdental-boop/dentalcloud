/**
 * Personal de la clinica (admin de clinica crea doctores, recepcion, etc.).
 * Usa Edge Function `clinicas` accion invitar_personal si existe.
 * No usa service_role en el cliente.
 */
import { getSupabase } from './client';
import { normalizeEmail, isValidEmail } from '@/lib/validators';
import { friendlyAuthError } from './authErrors';
import type { AppRole } from './roles';
import { ROLE_LABEL } from './roles';

export type ClinicStaffRole = Exclude<AppRole, 'super_admin' | 'patient'>;

export const CLINIC_STAFF_ROLES: { value: ClinicStaffRole; label: string }[] = [
  { value: 'admin', label: ROLE_LABEL.admin },
  { value: 'doctor', label: ROLE_LABEL.doctor },
  { value: 'receptionist', label: ROLE_LABEL.receptionist },
  { value: 'staff', label: ROLE_LABEL.staff },
];

export type StaffMember = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: ClinicStaffRole;
  roleLabel: string;
  active: boolean;
  createdAt: string;
  source: 'server' | 'local';
};

export type InviteStaffInput = {
  fullName: string;
  email: string;
  phone?: string;
  role: ClinicStaffRole;
  password: string;
  clinicId: string;
};

function storageKey(clinicId: string) {
  return `dentalcloud_clinic_staff_${clinicId}`;
}

/** Ya no se guardan usuarios "locales": solo existe lo que esta en la base. */
export function listLocalStaff(clinicId: string): StaffMember[] {
  if (typeof window !== 'undefined' && clinicId) {
    try {
      localStorage.removeItem(storageKey(clinicId));
    } catch {
      /* sin acceso a storage */
    }
  }
  return [];
}

/** Equipo de la clinica: perfiles reales (RLS limita a tu clinica). */
export async function listClinicStaffFromDb(clinicId: string): Promise<StaffMember[]> {
  if (!clinicId) return [];
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, full_name, email, phone, role_key, active, created_at')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map(mapProfile);
}

const DB_ROLE_TO_APP: Record<string, ClinicStaffRole> = {
  admin: 'admin',
  odontologo: 'doctor',
  doctor: 'doctor',
  recepcion: 'receptionist',
  receptionist: 'receptionist',
  auxiliar: 'staff',
  contador: 'staff',
  staff: 'staff',
};

const APP_ROLE_TO_DB: Record<ClinicStaffRole, string> = {
  admin: 'admin',
  doctor: 'odontologo',
  receptionist: 'recepcion',
  staff: 'auxiliar',
};

function mapProfile(row: Record<string, unknown>): StaffMember {
  const role = DB_ROLE_TO_APP[String(row.role_key || '')] || 'staff';
  return {
    id: String(row.id),
    fullName: String(row.full_name || ''),
    email: String(row.email || ''),
    phone: row.phone ? String(row.phone) : undefined,
    role,
    roleLabel: ROLE_LABEL[role as AppRole] || role,
    active: row.active !== false,
    createdAt: String(row.created_at || '').slice(0, 10),
    source: 'server',
  };
}

/** Si el rol es odontologo, asegura fila en tabla doctors para la agenda. */
async function ensureDoctorRow(params: {
  clinicId: string;
  profileId: string;
  fullName: string;
  active?: boolean;
}) {
  const sb = getSupabase();
  const { data: existing } = await sb
    .from('doctors')
    .select('id')
    .eq('clinic_id', params.clinicId)
    .eq('profile_id', params.profileId)
    .maybeSingle();
  if (existing?.id) {
    await sb
      .from('doctors')
      .update({
        full_name: params.fullName,
        active: params.active !== false,
      })
      .eq('id', existing.id);
    return;
  }
  await sb.from('doctors').insert({
    clinic_id: params.clinicId,
    profile_id: params.profileId,
    full_name: params.fullName,
    specialty: 'Odontología general',
    active: params.active !== false,
  });
}

/**
 * Alta de personal: Edge Function clinicas / invitar_personal.
 */
export async function inviteClinicStaff(input: InviteStaffInput): Promise<{ member: StaffMember; message: string }> {
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) throw new Error('Correo no valido');
  if (!input.fullName.trim()) throw new Error('Nombre obligatorio');
  if (!input.password || input.password.length < 8) {
    throw new Error('La contrasena debe tener al menos 8 caracteres');
  }
  if (!input.clinicId) throw new Error('No hay clinica activa en la sesion');

  const { data, error } = await getSupabase().functions.invoke('clinicas', {
    body: {
      action: 'invitar_personal',
      clinic_id: input.clinicId,
      user: {
        full_name: input.fullName.trim(),
        email,
        phone: input.phone?.trim() || null,
        password: input.password,
        role: input.role,
      },
    },
  });
  if (error) {
    let msg = error.message || 'No se pudo crear el usuario';
    try {
      const j = await (error as { context?: Response }).context?.json();
      if (j?.error) msg = j.error;
    } catch {
      /* sin cuerpo JSON */
    }
    throw new Error(friendlyAuthError(msg));
  }
  if (data?.error) throw new Error(friendlyAuthError(String(data.error)));

  const userId = String(data.user_id);
  if (input.role === 'doctor') {
    try {
      await ensureDoctorRow({
        clinicId: input.clinicId,
        profileId: userId,
        fullName: input.fullName.trim(),
        active: true,
      });
    } catch {
      /* agenda puede crear el odontologo despues */
    }
  }

  const member: StaffMember = {
    id: userId,
    fullName: input.fullName.trim(),
    email,
    phone: input.phone,
    role: input.role,
    roleLabel: ROLE_LABEL[input.role],
    active: true,
    createdAt: new Date().toISOString().slice(0, 10),
    source: 'server',
  };
  return {
    member,
    message:
      input.role === 'doctor'
        ? `Odontólogo creado. Ya puede ingresar con ${email} y aparece en la agenda.`
        : `Usuario creado. Ya puede ingresar con ${email}.`,
  };
}

export async function updateClinicStaff(input: {
  id: string;
  clinicId: string;
  fullName: string;
  phone?: string;
  role: ClinicStaffRole;
}): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from('profiles')
    .update({
      full_name: input.fullName.trim(),
      phone: input.phone?.trim() || null,
      role_key: APP_ROLE_TO_DB[input.role] || input.role,
    })
    .eq('id', input.id)
    .eq('clinic_id', input.clinicId);
  if (error) throw new Error(friendlyAuthError(error.message));

  if (input.role === 'doctor') {
    await ensureDoctorRow({
      clinicId: input.clinicId,
      profileId: input.id,
      fullName: input.fullName.trim(),
      active: true,
    });
  } else {
    // Desactiva fila de doctor si ya no es odontologo
    await sb
      .from('doctors')
      .update({ active: false })
      .eq('clinic_id', input.clinicId)
      .eq('profile_id', input.id);
  }
}

export async function setClinicStaffActive(input: {
  id: string;
  clinicId: string;
  active: boolean;
  role?: ClinicStaffRole;
  fullName?: string;
}): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from('profiles')
    .update({ active: input.active })
    .eq('id', input.id)
    .eq('clinic_id', input.clinicId);
  if (error) throw new Error(friendlyAuthError(error.message));

  if (input.role === 'doctor' || input.fullName) {
    await sb
      .from('doctors')
      .update({ active: input.active, ...(input.fullName ? { full_name: input.fullName } : {}) })
      .eq('clinic_id', input.clinicId)
      .eq('profile_id', input.id);
  }
}

/** Soft-delete: desactiva el perfil (y el doctor si aplica). */
export async function deactivateClinicStaff(input: {
  id: string;
  clinicId: string;
}): Promise<void> {
  await setClinicStaffActive({ ...input, active: false });
}

/**
 * Reset de clave via Edge Function. Si no existe la accion, informa al admin.
 */
export async function resetClinicStaffPassword(input: {
  id: string;
  clinicId: string;
  email: string;
  password: string;
}): Promise<string> {
  if (!input.password || input.password.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres');
  }
  const { data, error } = await getSupabase().functions.invoke('clinicas', {
    body: {
      action: 'reset_password',
      clinic_id: input.clinicId,
      user_id: input.id,
      email: input.email,
      password: input.password,
    },
  });
  if (error) {
    let msg = error.message || 'No se pudo restablecer la contraseña';
    try {
      const j = await (error as { context?: Response }).context?.json();
      if (j?.error) msg = j.error;
    } catch {
      /* */
    }
    throw new Error(
      friendlyAuthError(msg) +
        ' Si el backend no soporta reset aún, usa «Recuperar contraseña» en el login.',
    );
  }
  if (data?.error) throw new Error(friendlyAuthError(String(data.error)));
  return 'Contraseña actualizada. El usuario ya puede ingresar con la nueva clave.';
}
