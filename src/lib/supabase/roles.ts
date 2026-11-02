/**
 * Roles y accesos DentalCloud.
 * No altera tablas: lee rol de JWT app_metadata / user_metadata o tabla profiles si existe.
 */

export type AppRole =
  | 'super_admin'
  | 'admin'
  | 'doctor'
  | 'receptionist'
  | 'staff'
  | 'patient';

/** Rutas de la app y quien puede entrar */
export const ROUTE_ACCESS: Record<string, AppRole[]> = {
  '/': ['super_admin', 'admin', 'doctor', 'receptionist', 'staff'],
  '/doctor-agenda': ['super_admin', 'admin', 'doctor', 'receptionist'],
  '/patient-record': ['super_admin', 'admin', 'doctor', 'receptionist'],
  '/interactive-odontogram': ['super_admin', 'admin', 'doctor'],
  '/billing-statements': ['super_admin', 'admin', 'receptionist'],
  '/inventory-restock': ['super_admin', 'admin', 'staff'],
  '/clinic-staff': ['super_admin', 'admin'],
  '/global-admin-panel': ['super_admin'],
  '/sign-up-login-screen': [
    'super_admin',
    'admin',
    'doctor',
    'receptionist',
    'staff',
    'patient',
  ],
};

export const ROLE_HOME: Record<AppRole, string> = {
  super_admin: '/global-admin-panel',
  admin: '/',
  doctor: '/doctor-agenda',
  receptionist: '/',
  staff: '/inventory-restock',
  patient: '/',
};

export const ROLE_LABEL: Record<AppRole, string> = {
  super_admin: 'Admin global',
  admin: 'Administrador de clinica',
  doctor: 'Odontologo',
  receptionist: 'Recepcion',
  staff: 'Personal',
  patient: 'Paciente',
};

export function normalizeRole(raw: string | null | undefined): AppRole {
  const r = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  if (r === 'superadmin' || r === 'super-admin' || r === 'global_admin') return 'super_admin';
  if (r === 'clinic_admin' || r === 'administrador') return 'admin';
  if (r === 'odontologo' || r === 'odontólogo' || r === 'dentist') return 'doctor';
  if (r === 'recepcion' || r === 'recepcionista' || r === 'reception') return 'receptionist';
  if (r === 'personal' || r === 'empleado') return 'staff';
  if (r === 'paciente') return 'patient';
  if (
    r === 'super_admin' ||
    r === 'admin' ||
    r === 'doctor' ||
    r === 'receptionist' ||
    r === 'staff' ||
    r === 'patient'
  ) {
    return r as AppRole;
  }
  return 'staff';
}

export function canAccessPath(role: AppRole, pathname: string): boolean {
  if (pathname.startsWith('/sign-up-login-screen')) return true;
  const exact = ROUTE_ACCESS[pathname];
  if (exact) return exact.includes(role);
  for (const [route, roles] of Object.entries(ROUTE_ACCESS)) {
    if (route !== '/' && pathname.startsWith(route)) return roles.includes(role);
  }
  return role === 'super_admin' || role === 'admin';
}

export function homeForRole(role: AppRole): string {
  return ROLE_HOME[role] || '/';
}
