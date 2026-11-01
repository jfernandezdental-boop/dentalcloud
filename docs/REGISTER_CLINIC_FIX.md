# Fix registro de clinica (login + panel global)

## Cambios en el front

- `registerClinic` prueba **varias firmas** de RPC `register_clinic`.
- Mensajes de error claros (email duplicado, RLS, funcion inexistente).
- Desde **panel global** (`createdBySuperAdmin: true`): tras crear, hace `signOut` para no dejar la sesion del admin de clinica (el super_admin debe volver a entrar).
- Desde **login / registrar clinica**: mantiene el flujo de alta publica.

## Checklist Supabase (Claude / SQL)

1. Existe la funcion `public.register_clinic(...)`.
2. `GRANT EXECUTE ON FUNCTION register_clinic TO anon, authenticated;`
3. Auth > Providers: si en pruebas falla, desactivar **Confirm email** temporalmente.
4. RLS: politicas que permitan al nuevo admin o a SECURITY DEFINER insertar el tenant.

### Consulta firma actual

```sql
select pg_get_function_identity_arguments(p.oid) as args
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'register_clinic';
```

Si los nombres de argumentos no coinciden con ninguno de los intentos del front, alinear el front o la funcion (sin borrar tablas).

## Vercel

```
NEXT_PUBLIC_SUPABASE_URL=https://cnyrlypddaehuieezebt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Redeploy tras este commit.
