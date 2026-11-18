-- País de la clínica -> moneda; tipo de documento por paciente. (YA APLICADA en producción)
-- Aditiva: no borra ni modifica documentos existentes.

alter table public.patients add column if not exists id_type text;

-- La restricción vieja solo admitía EC y CL y bloqueaba a pacientes de otros países.
alter table public.patients drop constraint if exists patients_id_country_check;
alter table public.patients add constraint patients_id_country_check
  check (id_country in ('EC','CL','AR','PE','CO','MX','ES','UY','BR','BO','PY','VE','PA','CR','GT','DO','US'));

update public.patients set id_type = case when id_country = 'CL' then 'RUT' else 'CEDULA' end where id_type is null;

alter table public.clinics drop constraint if exists clinics_country_valido;
alter table public.clinics add constraint clinics_country_valido
  check (country is null or country in ('EC','CL','AR','PE','CO','MX','ES','UY','BR','BO','PY','VE','PA','CR','GT','DO','US')) not valid;

-- Estudio dental Vittoria: clínica chilena (RUT, pesos chilenos). La zona horaria no se toca.
update public.clinics set country = 'CL', currency_code = 'CLP'
 where id = 'babe62e0-9145-4cb7-a977-1b98bc7e2c1c';
