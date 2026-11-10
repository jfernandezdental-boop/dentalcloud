alter table public.procedures add column if not exists specialty text;

-- specialty se rellena desde el seed de catálogo; esta migración solo asegura la columna
notify pgrst, 'reload schema';
