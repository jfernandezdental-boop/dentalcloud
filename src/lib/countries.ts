// src/lib/countries.ts
// País de la clínica -> moneda + documentos de identidad (con validación por país).
// Funciones puras: sirven en cliente, en server actions y en tests.

export type CountryCode =
  | 'EC' | 'CL' | 'AR' | 'PE' | 'CO' | 'MX' | 'ES' | 'UY' | 'BR'
  | 'BO' | 'PY' | 'VE' | 'PA' | 'CR' | 'GT' | 'DO' | 'US';

/** true = válido; string = mensaje de error */
type Check = (raw: string) => true | string;

export type DocType = {
  code: string;
  label: string;
  hint: string;
  /** true: se verifica el dígito verificador/algoritmo oficial. false: solo el formato. */
  algorithmic: boolean;
  check: Check;
  /** Formato canónico para guardar (por defecto: solo dígitos, o mayúsculas sin separadores si lleva letras). */
  format?: (cleaned: string) => string;
  /**
   * Longitud del placeholder numérico (ceros) para altas rápidas.
   * Si no aplica (pasaporte, etc.), se omite y el placeholder queda vacío o genérico.
   */
  placeholderLen?: number;
};

export type Country = {
  code: CountryCode;
  name: string;
  currency: string; // ISO 4217
  locale: string;   // para Intl
  docs: DocType[];
};

const digits = (s: string) => s.replace(/\D/g, '');
const clean = (s: string) => s.replace(/[\s.\-/]/g, '').toUpperCase();
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const weighted = (d: string, w: number[]) => sum([...d].map((c, i) => Number(c) * w[i]));

// ───────────── Ecuador ─────────────
const ecCedula: Check = (v) => {
  const d = digits(v);
  if (!/^\d{10}$/.test(d)) return 'La cédula debe tener 10 dígitos';
  const prov = Number(d.slice(0, 2));
  if (!((prov >= 1 && prov <= 24) || prov === 30)) return 'Código de provincia inválido';
  if (Number(d[2]) > 5) return 'Tercer dígito inválido para una persona natural';
  const s = sum([...d.slice(0, 9)].map((c, i) => { const x = Number(c) * (i % 2 === 0 ? 2 : 1); return x > 9 ? x - 9 : x; }));
  return (10 - (s % 10)) % 10 === Number(d[9]) ? true : 'Dígito verificador incorrecto';
};
const mod11 = (d: string, w: number[]) => { const r = weighted(d, w) % 11; return r === 0 ? 0 : 11 - r; };
const ecRuc: Check = (v) => {
  const d = digits(v);
  if (!/^\d{13}$/.test(d)) return 'El RUC debe tener 13 dígitos';
  const t = Number(d[2]);
  if (t < 6) {
    const c = ecCedula(d.slice(0, 10));
    if (c !== true) return c;
    return Number(d.slice(10)) >= 1 ? true : 'Establecimiento inválido';
  }
  if (t === 9) { // sociedad privada
    const dv = mod11(d.slice(0, 9), [4, 3, 2, 7, 6, 5, 4, 3, 2]);
    if (dv === 10 || dv !== Number(d[9])) return 'Dígito verificador incorrecto';
    return Number(d.slice(10)) >= 1 ? true : 'Establecimiento inválido';
  }
  if (t === 6) { // entidad pública
    const dv = mod11(d.slice(0, 8), [3, 2, 7, 6, 5, 4, 3, 2]);
    if (dv === 10 || dv !== Number(d[8])) return 'Dígito verificador incorrecto';
    return Number(d.slice(9)) >= 1 ? true : 'Establecimiento inválido';
  }
  return 'Tercer dígito inválido';
};

// ───────────── Chile ─────────────
const clRut: Check = (v) => {
  const c = clean(v);
  if (!/^\d{7,8}[0-9K]$/.test(c)) return 'Formato de RUT inválido (ej. 12.345.678-5)';
  const body = c.slice(0, -1), dv = c.slice(-1);
  const s = sum([...body].reverse().map((x, i) => Number(x) * ((i % 6) + 2)));
  const r = 11 - (s % 11);
  const exp = r === 11 ? '0' : r === 10 ? 'K' : String(r);
  return exp === dv ? true : 'Dígito verificador incorrecto';
};

// ───────────── Argentina ─────────────
const arCuit: Check = (v) => {
  const d = digits(v);
  if (!/^\d{11}$/.test(d)) return 'El CUIT/CUIL debe tener 11 dígitos';
  if (!['20', '23', '24', '27', '30', '33', '34'].includes(d.slice(0, 2))) return 'Prefijo inválido';
  const r = weighted(d.slice(0, 10), [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]) % 11;
  const dv = r === 0 ? 0 : 11 - r;
  return dv !== 10 && dv === Number(d[10]) ? true : 'Dígito verificador incorrecto';
};

// ───────────── Perú ─────────────
const peRuc: Check = (v) => {
  const d = digits(v);
  if (!/^\d{11}$/.test(d)) return 'El RUC debe tener 11 dígitos';
  if (!['10', '15', '16', '17', '20'].includes(d.slice(0, 2))) return 'Prefijo inválido';
  const r = 11 - (weighted(d.slice(0, 10), [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]) % 11);
  const dv = r === 10 ? 0 : r === 11 ? 1 : r;
  return dv === Number(d[10]) ? true : 'Dígito verificador incorrecto';
};

// ───────────── Colombia ─────────────
const coNit: Check = (v) => {
  const c = clean(v).replace(/\D/g, '');
  if (!/^\d{7,16}$/.test(c)) return 'NIT inválido (ej. 899.999.063-3)';
  const body = c.slice(0, -1), dv = Number(c.slice(-1));
  const w = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  const s = sum([...body].reverse().map((x, i) => Number(x) * w[i]));
  const r = s % 11;
  return (r > 1 ? 11 - r : r) === dv ? true : 'Dígito de verificación incorrecto';
};

// ───────────── México ─────────────
const CURP_CHARS = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
const mxCurp: Check = (v) => {
  const c = v.replace(/\s/g, '').toUpperCase();
  if (!/^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HMX][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/.test(c)) return 'Formato de CURP inválido';
  const s = sum([...c.slice(0, 17)].map((ch, i) => CURP_CHARS.indexOf(ch) * (18 - i)));
  return (10 - (s % 10)) % 10 === Number(c[17]) ? true : 'Dígito verificador incorrecto';
};
const mxRfc: Check = (v) =>
  /^[A-ZÑ&]{3,4}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[A-Z0-9]{3}$/.test(v.replace(/\s/g, '').toUpperCase())
    ? true : 'Formato de RFC inválido';

// ───────────── España ─────────────
const LETRAS = 'TRWAGMYFPDXBNJZSQVHLCKE';
const esDni: Check = (v) => {
  const c = clean(v);
  if (!/^\d{8}[A-Z]$/.test(c)) return 'Formato de DNI inválido (8 números y una letra)';
  return LETRAS[Number(c.slice(0, 8)) % 23] === c[8] ? true : 'La letra no corresponde al número';
};
const esNie: Check = (v) => {
  const c = clean(v);
  if (!/^[XYZ]\d{7}[A-Z]$/.test(c)) return 'Formato de NIE inválido';
  const n = Number('XYZ'.indexOf(c[0]) + c.slice(1, 8));
  return LETRAS[n % 23] === c[8] ? true : 'La letra no corresponde al número';
};

// ───────────── Uruguay ─────────────
const uyCi: Check = (v) => {
  const d = digits(v);
  if (!/^\d{7,8}$/.test(d)) return 'La cédula debe tener 7 u 8 dígitos (con dígito verificador)';
  const body = d.slice(0, -1).padStart(7, '0');
  const s = weighted(body, [2, 9, 8, 7, 6, 3, 4]);
  return (10 - (s % 10)) % 10 === Number(d.slice(-1)) ? true : 'Dígito verificador incorrecto';
};

// ───────────── Brasil ─────────────
const brCpf: Check = (v) => {
  const d = digits(v);
  if (!/^\d{11}$/.test(d) || /^(\d)\1{10}$/.test(d)) return 'CPF inválido';
  const dv = (n: number) => { const r = sum([...d.slice(0, n)].map((c, i) => Number(c) * (n + 1 - i))) % 11; return r < 2 ? 0 : 11 - r; };
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10]) ? true : 'Dígito verificador incorrecto';
};
const brCnpj: Check = (v) => {
  const d = digits(v);
  if (!/^\d{14}$/.test(d) || /^(\d)\1{13}$/.test(d)) return 'CNPJ inválido';
  const dv = (n: number, w: number[]) => { const r = weighted(d.slice(0, n), w) % 11; return r < 2 ? 0 : 11 - r; };
  const a = dv(12, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const b = dv(13, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return a === Number(d[12]) && b === Number(d[13]) ? true : 'Dígito verificador incorrecto';
};

// ───────────── Solo formato (sin algoritmo público de verificación) ─────────────
const fmt = (re: RegExp, msg: string): Check => (v) => (re.test(clean(v)) ? true : msg);
const pasaporte: DocType = {
  code: 'PASAPORTE', label: 'Pasaporte', hint: 'Letras y números, 5 a 20 caracteres', algorithmic: false,
  check: fmt(/^[A-Z0-9]{5,20}$/, 'Pasaporte inválido (5 a 20 letras o números)'),
  placeholderLen: 9,
};
const d = (
  code: string,
  label: string,
  hint: string,
  algorithmic: boolean,
  check: Check,
  placeholderLen?: number,
): DocType => ({ code, label, hint, algorithmic, check, placeholderLen });

export const COUNTRIES: Record<CountryCode, Country> = {
  EC: { code: 'EC', name: 'Ecuador', currency: 'USD', locale: 'es-EC', docs: [d('CEDULA', 'Cédula', '10 dígitos', true, ecCedula, 10), d('RUC', 'RUC', '13 dígitos', true, ecRuc, 13), pasaporte] },
  CL: { code: 'CL', name: 'Chile', currency: 'CLP', locale: 'es-CL', docs: [{ ...d('RUT', 'RUT', '12.345.678-5', true, clRut, 8), format: (x) => `${x.slice(0, -1)}-${x.slice(-1)}` }, pasaporte] },
  AR: { code: 'AR', name: 'Argentina', currency: 'ARS', locale: 'es-AR', docs: [d('DNI', 'DNI', '7 u 8 dígitos', false, fmt(/^\d{7,8}$/, 'El DNI debe tener 7 u 8 dígitos'), 8), d('CUIT', 'CUIT / CUIL', '20-12345678-6', true, arCuit, 11), pasaporte] },
  PE: { code: 'PE', name: 'Perú', currency: 'PEN', locale: 'es-PE', docs: [d('DNI', 'DNI', '8 dígitos', false, fmt(/^\d{8}$/, 'El DNI debe tener 8 dígitos'), 8), d('RUC', 'RUC', '11 dígitos', true, peRuc, 11), d('CE', 'Carné de extranjería', '9 a 12 caracteres', false, fmt(/^[A-Z0-9]{9,12}$/, 'Carné inválido'), 9), pasaporte] },
  CO: { code: 'CO', name: 'Colombia', currency: 'COP', locale: 'es-CO', docs: [d('CC', 'Cédula de ciudadanía', '6 a 10 dígitos', false, fmt(/^\d{6,10}$/, 'La cédula debe tener entre 6 y 10 dígitos'), 10), d('NIT', 'NIT', '899.999.063-3', true, coNit, 10), d('CE', 'Cédula de extranjería', '6 a 7 dígitos', false, fmt(/^\d{6,7}$/, 'Cédula de extranjería inválida'), 7), pasaporte] },
  MX: { code: 'MX', name: 'México', currency: 'MXN', locale: 'es-MX', docs: [d('CURP', 'CURP', '18 caracteres', true, mxCurp, 18), d('RFC', 'RFC', '12 o 13 caracteres', false, mxRfc, 13), pasaporte] },
  ES: { code: 'ES', name: 'España', currency: 'EUR', locale: 'es-ES', docs: [d('DNI', 'DNI', '12345678Z', true, esDni, 8), d('NIE', 'NIE', 'X1234567L', true, esNie, 8), pasaporte] },
  UY: { code: 'UY', name: 'Uruguay', currency: 'UYU', locale: 'es-UY', docs: [d('CI', 'Cédula de identidad', '1.234.567-2', true, uyCi, 8), pasaporte] },
  BR: { code: 'BR', name: 'Brasil', currency: 'BRL', locale: 'pt-BR', docs: [d('CPF', 'CPF', '111.444.777-35', true, brCpf, 11), d('CNPJ', 'CNPJ', '14 dígitos', true, brCnpj, 14), pasaporte] },
  BO: { code: 'BO', name: 'Bolivia', currency: 'BOB', locale: 'es-BO', docs: [d('CI', 'Cédula de identidad', '5 a 9 dígitos', false, fmt(/^\d{5,9}[A-Z]?$/, 'Cédula inválida'), 7), pasaporte] },
  PY: { code: 'PY', name: 'Paraguay', currency: 'PYG', locale: 'es-PY', docs: [d('CI', 'Cédula de identidad', '5 a 8 dígitos', false, fmt(/^\d{5,8}$/, 'Cédula inválida'), 7), pasaporte] },
  VE: { code: 'VE', name: 'Venezuela', currency: 'VES', locale: 'es-VE', docs: [d('CI', 'Cédula (V/E)', 'V-12345678', false, fmt(/^[VE]?\d{6,9}$/, 'Cédula inválida (ej. V-12345678)'), 8), pasaporte] },
  PA: { code: 'PA', name: 'Panamá', currency: 'PAB', locale: 'es-PA', docs: [d('CIP', 'Cédula', '8-123-456', false, (v) => (/^(\d{1,2}|PE|E|N)-\d{1,4}-\d{1,6}$/.test(v.replace(/\s/g, '').toUpperCase()) ? true : 'Cédula inválida (ej. 8-123-456)'), 8), pasaporte] },
  CR: { code: 'CR', name: 'Costa Rica', currency: 'CRC', locale: 'es-CR', docs: [d('CED', 'Cédula', '9 dígitos', false, fmt(/^\d{9}$/, 'La cédula debe tener 9 dígitos'), 9), pasaporte] },
  GT: { code: 'GT', name: 'Guatemala', currency: 'GTQ', locale: 'es-GT', docs: [d('DPI', 'DPI', '13 dígitos', false, fmt(/^\d{13}$/, 'El DPI debe tener 13 dígitos'), 13), pasaporte] },
  DO: { code: 'DO', name: 'República Dominicana', currency: 'DOP', locale: 'es-DO', docs: [d('CED', 'Cédula', '11 dígitos', false, fmt(/^\d{11}$/, 'La cédula debe tener 11 dígitos'), 11), pasaporte] },
  US: { code: 'US', name: 'Estados Unidos', currency: 'USD', locale: 'en-US', docs: [pasaporte] },
};

export const COUNTRY_LIST = Object.values(COUNTRIES);

export function getCountry(code?: string | null): Country {
  return COUNTRIES[(code ?? '').toUpperCase() as CountryCode] ?? COUNTRIES.EC; // fallback: Ecuador
}

export type DocResult = { ok: true; value: string } | { ok: false; error: string };

/**
 * ¿Es un documento placeholder (solo ceros)?
 * Sin tipo de documento: cualquier secuencia de 5+ ceros.
 * Con país/tipo: debe coincidir el largo esperado (ej. EC cédula = 10 ceros).
 */
export function isPlaceholderDocument(
  raw: string | null | undefined,
  country?: string | null,
  type?: string | null,
): boolean {
  const d = digits(String(raw || ''));
  if (!d.length || !/^0+$/.test(d)) return false;

  if (country != null || type != null) {
    const c = getCountry(country);
    const doc = (type && c.docs.find((x) => x.code === type)) || c.docs[0];
    const len = doc.placeholderLen ?? 10;
    // Aceptar exactamente el largo del tipo (o 7–8 para RUT/CI variables)
    if (c.code === 'CL' && doc.code === 'RUT') return d.length === 7 || d.length === 8 || d.length === 9;
    if (c.code === 'CO' && doc.code === 'CC') return d.length >= 6 && d.length <= 10;
    if (c.code === 'AR' && doc.code === 'DNI') return d.length === 7 || d.length === 8;
    return d.length === len;
  }

  return d.length >= 5;
}

/**
 * Genera el número por defecto (ceros) según país y tipo de documento.
 * Ej. Ecuador cédula → "0000000000" (10); RUC → 13 ceros; Chile RUT → "00000000-0".
 */
export function placeholderDocument(country?: string | null, type?: string | null): string {
  const c = getCountry(country);
  const doc = (type && c.docs.find((x) => x.code === type)) || c.docs[0];
  const len = doc.placeholderLen ?? 10;

  // Chile RUT: cuerpo + dígito verificador 0
  if (c.code === 'CL' && doc.code === 'RUT') {
    return `${'0'.repeat(Math.max(7, Math.min(8, len)))}-0`;
  }
  // España DNI: 8 ceros + letra (T corresponde a 0)
  if (c.code === 'ES' && doc.code === 'DNI') {
    return `${'0'.repeat(8)}T`;
  }
  // España NIE: X + 7 ceros + letra
  if (c.code === 'ES' && doc.code === 'NIE') {
    return 'X0000000T';
  }
  // Panamá CIP formato con guiones
  if (c.code === 'PA' && doc.code === 'CIP') {
    return '0-000-000';
  }
  // Venezuela con prefijo opcional
  if (c.code === 'VE' && doc.code === 'CI') {
    return '0'.repeat(8);
  }
  // México CURP/RFC alfanuméricos: ceros numéricos del largo tipico (se aceptan como placeholder)
  if (c.code === 'MX' && (doc.code === 'CURP' || doc.code === 'RFC')) {
    return '0'.repeat(len);
  }

  return '0'.repeat(len);
}

/**
 * Valida un documento según país y tipo.
 * - Ceros del largo correcto → OK (placeholder para alta rápida).
 * - Documento real válido → OK (normalizado).
 * - Cualquier otro valor → error; el llamador NO debe guardar.
 */
export function validateDocument(country: string | null | undefined, type: string, raw: string): DocResult {
  const doc = getCountry(country).docs.find((x) => x.code === type);
  if (!doc) return { ok: false, error: 'Tipo de documento no válido para este país' };
  if (!raw?.trim()) return { ok: false, error: 'Ingresa el número de documento' };

  // Placeholder de ceros del largo correcto: válido para altas rápidas
  if (isPlaceholderDocument(raw, country, type)) {
    const norm = digits(raw);
    const len = doc.placeholderLen ?? norm.length;
    const value = norm.length === len ? norm : norm.padEnd(len, '0').slice(0, len);
    if (getCountry(country).code === 'CL' && doc.code === 'RUT') {
      return { ok: true, value: `${'0'.repeat(8)}-0` };
    }
    return { ok: true, value };
  }

  const r = doc.check(raw);
  if (r !== true) return { ok: false, error: r };
  // Se guarda sin puntos, guiones ni espacios (en mayúsculas si el documento lleva letras)
  const norm = /[A-Za-z]/.test(raw) ? clean(raw) : digits(raw);
  return { ok: true, value: doc.format ? doc.format(norm) : norm };
}

/** Moneda del país de la clínica. Cambiar el país cambia símbolo, decimales y separadores. */
export function formatMoney(amount: number | string | null | undefined, country?: string | null): string {
  const c = getCountry(country);
  const n = Number(amount ?? 0);
  return new Intl.NumberFormat(c.locale, { style: 'currency', currency: c.currency }).format(Number.isFinite(n) ? n : 0);
}

// ───────────── País activo de la sesión (lo fija getSessionUser al cargar la clínica) ─────────────
// El sistema corre en el navegador, así que un valor de módulo es seguro: un solo usuario por pestaña.
let activeCountry: CountryCode = 'EC';
export function setActiveCountry(code?: string | null): void {
  activeCountry = getCountry(code).code;
}
export function getActiveCountry(): CountryCode {
  return activeCountry;
}
/** Dinero con la moneda del país de la clínica activa. */
export const money = (amount: number | string | null | undefined): string => formatMoney(amount, activeCountry);
/** Documento principal del país (Cédula, RUT, DNI, CPF…). */
export const primaryDoc = (country?: string | null): DocType => getCountry(country ?? activeCountry).docs[0];
/** Nombre corto del documento principal para textos de interfaz: "RUT", "Cédula", "DNI"… */
export const docName = (country?: string | null): string => primaryDoc(country).label;
