-- patients: columna consultorio_id (nullable, FK a clinics)
alter table public.patients
  add column if not exists consultorio_id uuid references public.clinics(id) on delete set null;

-- clinics: estado, admin_email, admin_name
alter table public.clinics
  add column if not exists estado text default 'En prueba',
  add column if not exists admin_email text,
  add column if not exists admin_name text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'clinics_estado_check' and conrelid = 'public.clinics'::regclass
  ) then
    alter table public.clinics
      add constraint clinics_estado_check
      check (estado is null or estado = any (array['Activa','En prueba','Suspendida','Pago vencido']));
  end if;
end $$;

-- Alinear estado con status en filas existentes (solo copia, sin inventar datos)
update public.clinics set estado = status where estado is distinct from status;

notify pgrst, 'reload schema';
