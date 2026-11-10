-- Timezone y moneda por clínica (multi-tenant regional)
ALTER TABLE IF EXISTS public.clinics
  ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/Guayaquil',
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';
