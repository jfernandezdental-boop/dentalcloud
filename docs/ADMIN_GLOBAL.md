# Admin global vs clínica

## Separación

| Ámbito | Ruta | Menú |
|--------|------|------|
| **Admin global** (`super_admin`) | `/global-admin-panel` | Solo plataforma (tenants, roles SaaS) |
| **Clínica** (admin, doctor, etc.) | `/`, agenda, pacientes… | Operación clínica |

El admin global **no** usa el menú de Sonrisa Boreal / clínica demo.

## Correo plataforma

`jfernandez.dental@gmail.com` → rol `super_admin`

### Clave

**No se puede leer ni inventar desde el chat.** Debes definirla tú en Supabase:

1. https://supabase.com/dashboard/project/cnyrlypddaehuieezebt/auth/users
2. Si el usuario **no existe**: *Add user* → email `jfernandez.dental@gmail.com` + contraseña que elijas.
3. Si **ya existe**: menú del usuario → *Reset password* o *Send password recovery*, o define password desde el panel.
4. En **User** → **App Metadata** (JSON):

```json
{
  "role": "super_admin"
}
```

No pongas `clinic_id` de una clínica demo en el admin global.

5. Login en `/sign-up-login-screen` → redirige a `/global-admin-panel`.

## Seguridad

Nunca compartas la contraseña en el chat. Solo en el panel de Supabase Auth.
