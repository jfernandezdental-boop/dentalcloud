-- ============================================================
-- DentalCloud · Producción: RLS (ESTADO: YA APLICADO — NO EJECUTAR NADA DE ESTE ARCHIVO)
-- ============================================================
-- El aislamiento por clínica ya existe en la base de producción:
--   · Helpers en el esquema `private`: current_clinic_id(), current_role_key(), is_super_admin().
--   · Política `tenant_all` (clinic_id = clínica del usuario, o super admin) en todas las tablas con clinic_id.
--   · Políticas RESTRICTIVE por rol en historias clínicas, recetas, odontograma, radiografías,
--     estética e inventario.
--   · Trigger `trg_guard_profile` en `profiles`: impide cambiar clínica, rol o is_super_admin.
--
-- La versión anterior de este archivo se retiró por dos motivos:
--   1) Duplicaba las políticas existentes con funciones sin `(select ...)`, más lentas por fila.
--   2) Su bloque de limpieza borraba pacientes, citas, presupuestos y facturas de TODAS las clínicas
--      que no fueran MSP-DEMO, incluida "Estudio dental Vittoria", que es una clínica REAL.
-- No hay datos demo en la base: el demo vive solo en el frontend (clinicIsDemo) y no escribe en Supabase.
-- Nunca borrar datos de clínicas reales con un script genérico: hacerlo por clínica, con respaldo previo.

-- Verificación de políticas vigentes
SELECT tablename, policyname, cmd, permissive
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
