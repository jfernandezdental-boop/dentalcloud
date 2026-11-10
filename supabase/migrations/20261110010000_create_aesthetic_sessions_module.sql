-- Módulo Estética facial: sesiones, zonas tratadas y fotos de seguimiento
create table if not exists public.aesthetic_sessions (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete restrict,
  doctor_id uuid references public.doctors(id) on delete set null,
  session_date date not null default current_date,
  procedure_type text not null default 'toxina_botulinica'
    check (procedure_type in ('toxina_botulinica','rellenos_ah','bioestimuladores','hilos_pdo','skinboosters_pdrn','peelings','laser_rf_hifu','armonizacion')),
  product text, lot text, expiry date, dilution text, technique text, notes text,
  safety jsonb not null default '{}'::jsonb,
  consent_signed boolean not null default false,
  followup_date date,
  created_by uuid,
  created_at timestamptz not null default now()
);
create table if not exists public.aesthetic_session_zones (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  session_id uuid not null references public.aesthetic_sessions(id) on delete cascade,
  zone_code text not null,
  side text not null default 'central' check (side in ('central','derecho','izquierdo','bilateral')),
  amount numeric(8,2),
  unit text not null default 'U' check (unit in ('U','ml')),
  notes text,
  created_at timestamptz not null default now()
);
create table if not exists public.aesthetic_photos (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  session_id uuid not null references public.aesthetic_sessions(id) on delete cascade,
  kind text not null check (kind in ('antes','15_dias','3_meses','otro')),
  storage_path text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_aesthetic_sessions_clinic_patient on public.aesthetic_sessions (clinic_id, patient_id, session_date desc);
create index if not exists idx_aesthetic_zones_session on public.aesthetic_session_zones (session_id);
create index if not exists idx_aesthetic_zones_clinic on public.aesthetic_session_zones (clinic_id);
create index if not exists idx_aesthetic_photos_session on public.aesthetic_photos (session_id);
create index if not exists idx_aesthetic_sessions_doctor on public.aesthetic_sessions (doctor_id);

alter table public.aesthetic_sessions enable row level security;
alter table public.aesthetic_session_zones enable row level security;
alter table public.aesthetic_photos enable row level security;

drop policy if exists tenant_all on public.aesthetic_sessions;
create policy tenant_all on public.aesthetic_sessions for all to authenticated
  using ((clinic_id = (select private.current_clinic_id())) or (select private.is_super_admin()))
  with check (
    ((clinic_id = (select private.current_clinic_id())) or (select private.is_super_admin()))
    and exists (select 1 from public.patients p where p.id = patient_id and p.clinic_id = aesthetic_sessions.clinic_id)
  );
drop policy if exists tenant_all on public.aesthetic_session_zones;
create policy tenant_all on public.aesthetic_session_zones for all to authenticated
  using ((clinic_id = (select private.current_clinic_id())) or (select private.is_super_admin()))
  with check (
    ((clinic_id = (select private.current_clinic_id())) or (select private.is_super_admin()))
    and exists (select 1 from public.aesthetic_sessions s where s.id = session_id and s.clinic_id = aesthetic_session_zones.clinic_id)
  );
drop policy if exists tenant_all on public.aesthetic_photos;
create policy tenant_all on public.aesthetic_photos for all to authenticated
  using ((clinic_id = (select private.current_clinic_id())) or (select private.is_super_admin()))
  with check (
    ((clinic_id = (select private.current_clinic_id())) or (select private.is_super_admin()))
    and exists (select 1 from public.aesthetic_sessions s where s.id = session_id and s.clinic_id = aesthetic_photos.clinic_id)
  );
revoke all on public.aesthetic_sessions, public.aesthetic_session_zones, public.aesthetic_photos from anon;

insert into public.procedures (clinic_id, name, price, active, specialty)
select c.id, p.name, 0, false, 'Medicina estética facial'
from public.clinics c
cross join unnest(array[
  'Toxina botulínica: tercio superior','Toxina botulínica: glabela','Toxina botulínica: patas de gallo','Toxina botulínica: maseteros','Toxina botulínica: bandas del platisma',
  'Relleno de ácido hialurónico: labios','Relleno de ácido hialurónico: surco nasogeniano','Relleno de ácido hialurónico: pómulos','Relleno de ácido hialurónico: mentón','Relleno de ácido hialurónico: línea mandibular','Relleno de ácido hialurónico: ojeras',
  'Bioestimulador de colágeno (por sesión)','Hilos tensores PDO (por hilo)','Skinbooster / PDRN (por sesión)','Peeling médico facial','Plasma rico en plaquetas facial','Armonización facial (plan completo)','Evaluación de medicina estética facial'
]) as p(name)
on conflict do nothing;

notify pgrst, 'reload schema';
