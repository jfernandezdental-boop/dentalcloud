alter table public.clinics
  add column if not exists timezone text,
  add column if not exists currency_code text;

comment on column public.clinics.timezone is 'Zona horaria IANA (ej. America/Guayaquil). Las fechas se guardan en UTC (timestamptz) y se muestran con esta zona.';
comment on column public.clinics.currency_code is 'Código ISO 4217 (ej. USD, COP, MXN). Solo cambia el formato de visualización; no convierte montos.';

notify pgrst, 'reload schema';
