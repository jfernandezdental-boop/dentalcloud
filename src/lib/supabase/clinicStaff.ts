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

export function listLocalStaff(clinicId: string): StaffMember[] {
  if (typeof window === 'undefined' || !clinicId) return [];
  try {
    const raw = localStorage.getItem(storageKey(clinicId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StaffMember[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalStaff(clinicId: string, list: StaffMember[]) {
  if (typeof window === 'undefined' || !clinicId) return;
  localStorage.setItem(storageKey(clinicId), JSON.stringify(list));
}

/** Intenta listar perfiles de la clinica en Supabase (si la tabla profiles existe y RLS lo permite) */
export async function listClinicStaffFromDb(clinicId: string): Promise<StaffMember[]> {
  if (!clinicId) return [];
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role, active, created_at')
    .eq('consultorio_id', clinicId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    // intentar columna clinic_id
    const alt = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role, active, created_at')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });
    if (alt.error || !alt.data) return [];
    return alt.data.map(mapProfile);
  }
  return data.map(mapProfile);
}

function mapProfile(row: Record<string, unknown>): StaffMember {
  const role = String(row.role || 'staff') as ClinicStaffRole;
  return {
    id: String(row.id),
    fullName: String(row.full_name || ''),
    email: String(row.email || ''),
    phone: row.phone ? String(row.phone) : undefined,
    role: ['admin', 'doctor', 'receptionist', 'staff'].includes(role) ? role : 'staff',
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

  const supabase = getSupabase();
  try {
    const { data, error } = await supabase.functions.invoke('clinicas', {
      body: {
        action: 'invitar_personal',
        clinic_id: input.clinicId,
        consultorio_id: input.clinicId,
        user: {
          full_name: input.fullName.trim(),
          email,
          phone: input.phone?.trim() || null,
          password: input.password,
          role: input.role,
        },
      },
    });
    if (!error && data && !data.error) {
      const member: StaffMember = {
        id: String(data.user_id || data.id || `srv-${Date.now()}`),
        fullName: input.fullName.trim(),
        email,
        phone: input.phone,
        role: input.role,
        roleLabel: ROLE_LABEL[input.role],
        active: true,
        createdAt: new Date().toISOString().slice(0, 10),
        source: 'server',
      };
      const local = listLocalStaff(input.clinicId).filter((m) => m.email !== email);
      saveLocalStaff(input.clinicId, [member, ...local]);
      return {
        member,
        message: `Usuario creado. Ya puede ingresar con ${email}.`,
      };
    }
    if (error) {
      // sigue a fallback si accion no existe
      const msg = error.message || '';
      if (!/not found|404|invalid|unknown action|invitar/i.test(msg)) {
        throw new Error(friendlyAuthError(msg));
      }
    }
    if (data?.error) {
      const msg = String(data.error);
      if (!/not found|unknown action|invitar|no implement/i.test(msg)) {
        throw new Error(friendlyAuthError(msg));
      }
    }
  } catch (e: unknown) {
    if (e instanceof Error && !/failed to fetch|404|not found/i.test(e.message)) {
      // si es error de negocio real, relanzar
      if (!/unknown action|invitar/i.test(e.message)) throw e;
    }
  }

  // Fallback local (UI operativa hasta que Edge Function soporte invitar_personal)
  const member: StaffMember = {
    id: `local-${Date.now()}`,
    fullName: input.fullName.trim(),
    email,
    phone: input.phone,
    role: input.role,
    roleLabel: ROLE_LABEL[input.role],
    active: true,
    createdAt: new Date().toISOString().slice(0, 10),
    source: 'local',
  };
  saveLocalStaff(input.clinicId, [member, ...listLocalStaff(input.clinicId)]);
  return {
    member,
    message:
      `Personal registrado en la clinica (vista local). ` +
      `Para login real en Supabase Auth, la Edge Function clinicas debe soportar action "invitar_personal" ` +
      `(rol ${input.role}, correo ${email}).`,
  };
}
