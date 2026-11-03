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

/** Ya no se guardan usuarios "locales": solo existe lo que esta en la base. Se limpia lo que dejo la version anterior. */
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
  recepcion: 'receptionist',
  auxiliar: 'staff',
  contador: 'staff',
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

/**
 * Alta de personal: Edge Function clinicas / invitar_personal.
 * Si el backend aun no expone la accion, se guarda en local y se informa.
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

  const member: StaffMember = {
    id: String(data.user_id),
    fullName: input.fullName.trim(),
    email,
    phone: input.phone,
    role: input.role,
    roleLabel: ROLE_LABEL[input.role],
    active: true,
    createdAt: new Date().toISOString().slice(0, 10),
    source: 'server',
  };
  return { member, message: `Usuario creado. Ya puede ingresar con ${email}.` };
}
