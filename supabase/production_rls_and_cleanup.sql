-- ============================================================
-- DentalCloud · Producción: RLS + limpieza de datos
-- Ejecutar en Supabase → SQL Editor (como postgres / service)
-- ============================================================

-- 1) Helper: clinic_id del usuario autenticado
CREATE OR REPLACE FUNCTION public.get_my_clinic_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_super_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1), false);
$$;

-- 2) Tablas de negocio que deben estar aisladas por clínica
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'patients',
    'doctors',
    'appointments',
    'budgets',
    'budget_lines',
    'invoices',
    'receipts',
    'procedures',
    'inventory_items',
    'lab_orders',
    'profiles'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;

-- 3) Policies genéricas por clinic_id (drop + recreate)
-- patients
DROP POLICY IF EXISTS patients_tenant ON public.patients;
CREATE POLICY patients_tenant ON public.patients
  FOR ALL TO authenticated
  USING (clinic_id = public.get_my_clinic_id() OR public.is_super_admin())
  WITH CHECK (clinic_id = public.get_my_clinic_id() OR public.is_super_admin());

-- doctors
DROP POLICY IF EXISTS doctors_tenant ON public.doctors;
CREATE POLICY doctors_tenant ON public.doctors
  FOR ALL TO authenticated
  USING (clinic_id = public.get_my_clinic_id() OR public.is_super_admin())
  WITH CHECK (clinic_id = public.get_my_clinic_id() OR public.is_super_admin());

-- appointments
DROP POLICY IF EXISTS appointments_tenant ON public.appointments;
CREATE POLICY appointments_tenant ON public.appointments
  FOR ALL TO authenticated
  USING (clinic_id = public.get_my_clinic_id() OR public.is_super_admin())
  WITH CHECK (clinic_id = public.get_my_clinic_id() OR public.is_super_admin());

-- budgets
DROP POLICY IF EXISTS budgets_tenant ON public.budgets;
CREATE POLICY budgets_tenant ON public.budgets
  FOR ALL TO authenticated
  USING (clinic_id = public.get_my_clinic_id() OR public.is_super_admin())
  WITH CHECK (clinic_id = public.get_my_clinic_id() OR public.is_super_admin());

-- budget_lines
DROP POLICY IF EXISTS budget_lines_tenant ON public.budget_lines;
CREATE POLICY budget_lines_tenant ON public.budget_lines
  FOR ALL TO authenticated
  USING (clinic_id = public.get_my_clinic_id() OR public.is_super_admin())
  WITH CHECK (clinic_id = public.get_my_clinic_id() OR public.is_super_admin());

-- invoices
DROP POLICY IF EXISTS invoices_tenant ON public.invoices;
CREATE POLICY invoices_tenant ON public.invoices
  FOR ALL TO authenticated
  USING (clinic_id = public.get_my_clinic_id() OR public.is_super_admin())
  WITH CHECK (clinic_id = public.get_my_clinic_id() OR public.is_super_admin());

-- receipts
DROP POLICY IF EXISTS receipts_tenant ON public.receipts;
CREATE POLICY receipts_tenant ON public.receipts
  FOR ALL TO authenticated
  USING (clinic_id = public.get_my_clinic_id() OR public.is_super_admin())
  WITH CHECK (clinic_id = public.get_my_clinic_id() OR public.is_super_admin());

-- procedures
DROP POLICY IF EXISTS procedures_tenant ON public.procedures;
CREATE POLICY procedures_tenant ON public.procedures
  FOR ALL TO authenticated
  USING (clinic_id = public.get_my_clinic_id() OR public.is_super_admin())
  WITH CHECK (clinic_id = public.get_my_clinic_id() OR public.is_super_admin());

-- inventory_items
DROP POLICY IF EXISTS inventory_items_tenant ON public.inventory_items;
CREATE POLICY inventory_items_tenant ON public.inventory_items
  FOR ALL TO authenticated
  USING (clinic_id = public.get_my_clinic_id() OR public.is_super_admin())
  WITH CHECK (clinic_id = public.get_my_clinic_id() OR public.is_super_admin());

-- lab_orders
DROP POLICY IF EXISTS lab_orders_tenant ON public.lab_orders;
CREATE POLICY lab_orders_tenant ON public.lab_orders
  FOR ALL TO authenticated
  USING (clinic_id = public.get_my_clinic_id() OR public.is_super_admin())
  WITH CHECK (clinic_id = public.get_my_clinic_id() OR public.is_super_admin());

-- profiles: el usuario ve el suyo; super_admin ve todos
DROP POLICY IF EXISTS profiles_self_or_super ON public.profiles;
CREATE POLICY profiles_self_or_super ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS profiles_update_self ON public.profiles;
CREATE POLICY profiles_update_self ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_super_admin())
  WITH CHECK (id = auth.uid() OR public.is_super_admin());

-- 4) Limpieza: borrar datos de clínicas REALES (no MSP-DEMO-*)
-- ADVERTENCIA: esto borra pacientes/citas/etc de clínicas de producción.
-- Ejecutar solo si confirmas que deben nacer vacías.

-- Descomenta el bloque siguiente cuando quieras limpiar:
/*
WITH real_clinics AS (
  SELECT id FROM public.clinics
  WHERE msp_code IS NULL OR upper(msp_code) NOT LIKE 'MSP-DEMO%'
)
DELETE FROM public.budget_lines WHERE clinic_id IN (SELECT id FROM real_clinics);
DELETE FROM public.budgets       WHERE clinic_id IN (SELECT id FROM real_clinics);
DELETE FROM public.appointments  WHERE clinic_id IN (SELECT id FROM real_clinics);
DELETE FROM public.patients      WHERE clinic_id IN (SELECT id FROM real_clinics);
DELETE FROM public.invoices      WHERE clinic_id IN (SELECT id FROM real_clinics);
DELETE FROM public.receipts      WHERE clinic_id IN (SELECT id FROM real_clinics);
DELETE FROM public.lab_orders    WHERE clinic_id IN (SELECT id FROM real_clinics);
-- Opcional: no borrar procedures ni doctors si ya los configuraron.
*/

-- 5) Verificación rápida
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
