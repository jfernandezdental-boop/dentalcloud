export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
export const NAME_PATTERN = /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'.\- ]*$/;
export const MOBILE_PATTERN = /^09\d{8}$/;
export const LANDLINE_OR_MOBILE_PATTERN = /^0\d{8,9}$/;

export function onlyDigits(value: string): string {
  return (value || '').replace(/\D/g, '');
}

/** Quita espacios y caracteres invisibles del correo */
export function normalizeEmail(value: string): string {
  return (value || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .toLowerCase();
}

export function isValidEmail(value: string): boolean {
  const v = normalizeEmail(value);
  if (!v || v.length > 254) return false;
  return EMAIL_PATTERN.test(v);
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

/**
 * RUC Ecuador: 13 digitos (ideal) o 10 (cedula / RUC incompleto en alta).
 * En alta de clinica no bloqueamos si son 10 digitos numericos.
 */
export function isValidRuc(value: string): boolean {
  const v = onlyDigits(value || '');
  if (/^\d{13}$/.test(v)) {
    const province = parseInt(v.slice(0, 2), 10);
    if (province < 1 || (province > 24 && province !== 30)) return false;
    return true;
  }
  if (/^\d{10}$/.test(v)) {
    const province = parseInt(v.slice(0, 2), 10);
    return province >= 1 && (province <= 24 || province === 30);
  }
  return false;
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
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export const rules = {
  name: (label: string) => ({
    required: `${label} es obligatorio`,
    minLength: { value: 2, message: `${label} debe tener al menos 2 caracteres` },
    maxLength: { value: 80, message: `${label} no puede superar 80 caracteres` },
    validate: (v: string) =>
      NAME_PATTERN.test((v || '').trim()) || `${label} solo admite letras y espacios`,
  }),
  email: (required = true) => ({
    required: required ? 'El correo es obligatorio' : false,
    validate: (v: string) =>
      !v || isValidEmail(v) || 'Ingresa un correo valido, ej. nombre@gmail.com',
  }),
  mobile: (required = true) => ({
    required: required ? 'El celular es obligatorio' : false,
    validate: (v: string) =>
      !v || MOBILE_PATTERN.test(v.trim()) || 'Formato de celular: 09XXXXXXXX (10 digitos)',
  }),
  phone: (required = true) => ({
    required: required ? 'El telefono es obligatorio' : false,
    validate: (v: string) => {
      const digits = onlyDigits(v || '');
      if (!v) return true;
      return /^0\d{8,9}$/.test(digits) || 'Telefono no valido (9 o 10 digitos, inicia con 0)';
    },
  }),
  cedula: () => ({
    required: 'La cedula es obligatoria',
    validate: (v: string) => isValidCedula(v) || 'Cedula no valida: revisa los 10 digitos',
  }),
  nationalId: (getCountry: () => IdCountry) => ({
    required: 'El documento de identidad es obligatorio',
    validate: (v: string) => {
      const country = getCountry();
      if (isValidNationalId(country, v)) return true;
      return country === 'CL'
        ? 'RUT chileno no valido'
        : 'Cedula ecuatoriana no valida: revisa los 10 digitos';
    },
  }),
  ruc: () => ({
    required: 'El RUC es obligatorio',
    validate: (v: string) =>
      isValidRuc(v) ||
      'RUC: 13 digitos (recomendado) o 10 digitos numericos de provincia valida',
  }),
  password: () => ({
    required: 'La contrasena es obligatoria',
    minLength: { value: 8, message: 'Minimo 8 caracteres' },
    validate: (v: string) =>
      (/[A-Za-z]/.test(v || '') && /\d/.test(v || '')) || 'Debe combinar letras y numeros',
  }),
  pastDate: (label: string) => ({
    required: `${label} es obligatoria`,
    validate: (v: string) => {
      if (!v) return true;
      if (v > todayISO()) return `${label} no puede ser futura`;
      if (v < '1900-01-01') return `${label} no es valida`;
      return true;
    },
  }),
};
