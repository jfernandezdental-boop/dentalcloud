-- Catálogo base de procedimientos (precio 0 e inactivos: la clínica edita el valor y los activa)
-- NOTA: Esta migración YA fue aplicada en el proyecto Supabase dentalcloud.
-- Aquí queda como registro en el repo.

insert into public.procedures (clinic_id, name, price, active)
select c.id, p.name, 0, false
from public.clinics c
cross join unnest(array[
  'Consulta de valoración','Consulta de urgencia','Control / revisión','Historia clínica y diagnóstico',
  'Radiografía periapical','Radiografía de aleta de mordida (bitewing)','Radiografía oclusal','Radiografía panorámica',
  'Profilaxis','Profilaxis y aplicación de flúor','Destartraje supragingival',
  'Resina compuesta simple','Resina compuesta doble','Resina compuesta cuádruple (OMDV)',
  'Extracción simple','Extracción quirúrgica','Endodoncia unirradicular','Endodoncia multirradicular',
  'Corona cerámica sobre metal','Corona sobre implante','Blanqueamiento en consultorio','Guarda oclusal rígida'
]) as p(name)
on conflict do nothing;

notify pgrst, 'reload schema';
