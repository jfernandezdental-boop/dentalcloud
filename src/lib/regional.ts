/**
 * Utilidades regionales para Configuración de la clínica.
 *
 * - Las fechas se guardan en UTC (timestamptz en Supabase).
 * - Se muestran en la zona horaria IANA elegida (clinics.timezone).
 * - Al elegir zona horaria se propone la moneda del país (clinics.currency_code).
 * - Cambiar la moneda solo afecta formato de visualización; no convierte montos.
 */

export type RegionOption = {
  timezone: string;
  label: string;
  currency: string;
  country: string;
};

export const REGION_OPTIONS: RegionOption[] = [
  { timezone: 'America/Guayaquil', label: 'Ecuador (Guayaquil)', currency: 'USD', country: 'EC' },
  { timezone: 'America/Bogota', label: 'Colombia (Bogotá)', currency: 'COP', country: 'CO' },
  { timezone: 'America/Lima', label: 'Perú (Lima)', currency: 'PEN', country: 'PE' },
  { timezone: 'America/Mexico_City', label: 'México (CDMX)', currency: 'MXN', country: 'MX' },
  { timezone: 'America/Santiago', label: 'Chile (Santiago)', currency: 'CLP', country: 'CL' },
  { timezone: 'America/Argentina/Buenos_Aires', label: 'Argentina (Buenos Aires)', currency: 'ARS', country: 'AR' },
  { timezone: 'America/Caracas', label: 'Venezuela (Caracas)', currency: 'VES', country: 'VE' },
  { timezone: 'America/Panama', label: 'Panamá', currency: 'USD', country: 'PA' },
  { timezone: 'America/Costa_Rica', label: 'Costa Rica', currency: 'CRC', country: 'CR' },
  { timezone: 'America/New_York', label: 'EE.UU. (Nueva York)', currency: 'USD', country: 'US' },
  { timezone: 'Europe/Madrid', label: 'España (Madrid)', currency: 'EUR', country: 'ES' },
];

export const CURRENCY_OPTIONS = [
  { code: 'USD', label: 'USD — Dólar' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'COP', label: 'COP — Peso colombiano' },
  { code: 'MXN', label: 'MXN — Peso mexicano' },
  { code: 'PEN', label: 'PEN — Sol peruano' },
  { code: 'CLP', label: 'CLP — Peso chileno' },
  { code: 'ARS', label: 'ARS — Peso argentino' },
  { code: 'CRC', label: 'CRC — Colón costarricense' },
  { code: 'VES', label: 'VES — Bolívar' },
];

export function currencyForTimezone(tz: string): string {
  return REGION_OPTIONS.find((r) => r.timezone === tz)?.currency ?? 'USD';
}

export function formatMoney(amount: number, currencyCode = 'USD', locale = 'es-EC'): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

export function formatDateInTz(iso: string | Date, timeZone = 'America/Guayaquil', opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat('es-EC', { timeZone, dateStyle: 'medium', ...opts }).format(d);
}

export function formatDateTimeInTz(iso: string | Date, timeZone = 'America/Guayaquil'): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat('es-EC', { timeZone, dateStyle: 'medium', timeStyle: 'short' }).format(d);
}

/** Offset en minutos de la zona respecto a UTC en un instante dado. */
export function timezoneOffsetMinutes(timeZone: string, at = new Date()): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
  const p = Object.fromEntries(dtf.formatToParts(at).map((x) => [x.type, x.value]));
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((asUTC - at.getTime()) / 60_000);
}
