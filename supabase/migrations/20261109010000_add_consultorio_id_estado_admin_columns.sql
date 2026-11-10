-- DentalCloud · columnas faltantes reportadas en producción
-- patients.consultorio_id, clinics.estado, clinics.admin_email, clinics.admin_name

ALTER TABLE IF EXISTS public.patients
  ADD COLUMN IF NOT EXISTS consultorio_id uuid;

ALTER TABLE IF EXISTS public.clinics
  ADD COLUMN IF NOT EXISTS estado text DEFAULT 'En prueba',
  ADD COLUMN IF NOT EXISTS admin_email text,
  ADD COLUMN IF NOT EXISTS admin_name text;

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_patients_consultorio_id ON public.patients (consultorio_id);
CREATE INDEX IF NOT EXISTS idx_clinics_estado ON public.clinics (estado);
