export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ'.\- ]*$/;
export const MOBILE_PATTERN = /^09\d{8}$/;
export const LANDLINE_OR_MOBILE_PATTERN = /^0\d{8,9}$/;

export function onlyDigits(value: string): string {
  return (value || '').replace(/\D/g, '');
}

export function isValidCedula(value: string): boolean {
  const v = (value || '').trim();
  if (!/^\d{10}$/.test(v)) return false;
  const province = parseInt(v.slice(0, 2), 10);
  if (province < 1 || (province > 24 && province !== 30)) return false;
  const third = parseInt(v[2], 10);
  if (third > 5) return false;
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    let d = parseInt(v[i], 10);
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(v[9], 10);
}

export function isValidRuc(value: string): boolean {
  const v = (value || '').trim();
  if (!/^\d{13}$/.test(v)) return false;
  const province = parseInt(v.slice(0, 2), 10);
  if (province < 1 || (province > 24 && province !== 30)) return false;
  return v.endsWith('001') || /\d{3}$/.test(v);
}

export type IdCountry = 'EC' | 'CL';

export function cleanRut(value: string): string {
  return (value || '').replace(/[.\-\s]/g, '').toUpperCase();
}

export function isValidRut(value: string): boolean {
  const v = cleanRut(value);
  if (!/^\d{7,8}[0-9K]$/.test(v)) return false;
  const body = v.slice(0, -1);
  const dv = v.slice(-1);
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += parseInt(body[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const rest = 11 - (sum % 11);
  const expected = rest === 11 ? '0' : rest === 10 ? 'K' : String(rest);
  return dv === expected;
}

export function formatRut(value: string): string {
  const v = cleanRut(value);
  if (v.length < 2) return v;
  const body = v.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${body}-${v.slice(-1)}`;
}

export function isValidNationalId(country: IdCountry, value: string): boolean {
  return country === 'CL' ? isValidRut(value) : isValidCedula(value);
}

export function todayISO(): string {
  let d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export const rules = {
  name: (label: string) => ({
    required: `${label} es obligatorio`,
    minLength: { value: 2, message: `${label} debe tener al menos 2 caracteres` },
    maxLength: { value: 80, message: `${label} no puede superar 80 caracteres` },
    validate: (v: string) => NAME_PATTERN.test((v || '').trim()) || `${label} solo admite letras y espacios`,
  }),
  email: (required = true) => ({
    required: required ? 'El correo es obligatorio' : false,
    validate: (v: string) => !v || EMAIL_PATTERN.test(v.trim()) || 'Ingresa un correo válido, ej. nombre@dominio.ec',
  }),
  mobile: (required = true) => ({
    required: required ? 'El celular es obligatorio' : false,
    validate: (v: string) => !v || MOBILE_PATTERN.test(v.trim()) || 'Formato de celular: 09XXXXXXXX (10 dígitos)',
  }),
  phone: (required = true) => ({
    required: required ? 'El teléfono es obligatorio' : false,
    validate: (v: string) => {
      const digits = onlyDigits(v || '');
      if (!v) return true;
      return /^0\d{8,9}$/.test(digits) || 'Teléfono no válido (9 o 10 dígitos, inicia con 0)';
    },
  }),
  cedula: () => ({
    required: 'La cédula es obligatoria',
    validate: (v: string) => isValidCedula(v) || 'Cédula no válida: revisa los 10 dígitos',
  }),
  nationalId: (getCountry: () => IdCountry) => ({
    required: 'El documento de identidad es obligatorio',
    validate: (v: string) => {
      const country = getCountry();
      if (isValidNationalId(country, v)) return true;
      return country === 'CL' ?'RUT chileno no válido: revisa el número y el dígito verificador (ej. 12.345.678-5)' :'Cédula ecuatoriana no válida: revisa los 10 dígitos';
    },
  }),
  ruc: () => ({
    required: 'El RUC es obligatorio',
    validate: (v: string) => isValidRuc(v) || 'El RUC debe tener 13 dígitos numéricos válidos',
  }),
  password: () => ({
    required: 'La contraseña es obligatoria',
    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
    validate: (v: string) =>
      (/[A-Za-z]/.test(v || '') && /\d/.test(v || '')) || 'Debe combinar letras y números',
  }),
  pastDate: (label: string) => ({
    required: `${label} es obligatoria`,
    validate: (v: string) => {
      if (!v) return true;
      if (v > todayISO()) return `${label} no puede ser futura`;
      if (v < '1900-01-01') return `${label} no es válida`;
      return true;
    },
  }),
};
