create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

create or replace function public.immutable_unaccent(text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$ select extensions.unaccent('extensions.unaccent'::regdictionary, $1) $$;

create index if not exists idx_patients_search_trgm
  on public.patients
  using gin (public.immutable_unaccent(lower(first_name || ' ' || last_name)) extensions.gin_trgm_ops);

-- Búsqueda de pacientes por nombre, apellido, cédula o teléfono (sin tildes, cualquier orden de palabras).
-- SECURITY INVOKER: respeta RLS, solo devuelve pacientes de la clínica del usuario.
create or replace function public.search_patients(q text, lim int default 10)
returns table (id uuid, first_name text, last_name text, full_name text, cedula text, phone text)
language sql
stable
security invoker
set search_path = ''
as $$
  select p.id, p.first_name, p.last_name, p.first_name || ' ' || p.last_name, p.cedula, p.phone
  from public.patients p
  where p.active is not false
    and not exists (
      select 1
      from unnest(regexp_split_to_array(trim(public.immutable_unaccent(lower(coalesce(q, '')))), '\s+')) as t(tok)
      where tok <> ''
        and public.immutable_unaccent(lower(p.first_name || ' ' || p.last_name || ' ' || coalesce(p.cedula, '') || ' ' || coalesce(p.phone, '')))
            not like '%' || replace(replace(tok, '%', ''), '_', '') || '%'
    )
  order by p.last_name, p.first_name
  limit least(coalesce(lim, 10), 50)
$$;

revoke all on function public.search_patients(text, int) from public, anon;
grant execute on function public.search_patients(text, int) to authenticated;

notify pgrst, 'reload schema';
