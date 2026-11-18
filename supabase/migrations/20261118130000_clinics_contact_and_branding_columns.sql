-- Columnas que "Configuración de la clínica" ya enviaba pero no existían en producción
-- (el guardado fallaba siempre). Aditiva y opcional. YA APLICADA en producción.
alter table public.clinics
  add column if not exists phone text,
  add column if not exists mobile text,
  add column if not exists email text,
  add column if not exists address text,
  add column if not exists doctor_name text,
  add column if not exists doctor_license text,
  add column if not exists doctor_degree text,
  add column if not exists specialty text,
  add column if not exists specialty_license text,
  add column if not exists logo_url text;

-- Odontólogos dados de alta antes de la sincronización con la agenda quedaron sin fila en doctors.
insert into public.doctors (clinic_id, profile_id, full_name, specialty, active)
select p.clinic_id, p.id, p.full_name, 'Odontología general', coalesce(p.active, true)
from public.profiles p
where p.role_key = 'odontologo' and p.clinic_id is not null
  and not exists (select 1 from public.doctors d where d.profile_id = p.id and d.clinic_id = p.clinic_id);

-- Recetas: el diagnóstico y el nombre del odontólogo nunca se guardaban (columnas inexistentes).
alter table public.prescriptions
  add column if not exists doctor_name text,
  add column if not exists diagnosis text;
