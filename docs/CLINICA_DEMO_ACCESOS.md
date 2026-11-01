# Clinica demo — Sonrisa Boreal

## Datos de la clinica

| Campo | Valor |
|-------|--------|
| Nombre | Sonrisa Boreal |
| RUC | 1799999999001 |
| Ciudad | Quito |
| Plan | pro (Clinica Pro) |
| MSP | MSP-DEMO-001 |

## Accesos (Auth)

| Rol | Correo | Contrasena |
|-----|--------|------------|
| Administrador de clinica | `admin.demo@sonrisaboreal.ec` | `ClinicaDemo#2026` |
| Odontologo | `doctor.demo@sonrisaboreal.ec` | `DoctorDemo#2026` |
| Recepcion | `recepcion.demo@sonrisaboreal.ec` | `RecepcionDemo#2026` |

## Como crearlos

### Opcion A — Panel global
Boton **Crear clinica demo** en `/global-admin-panel` (llama a `register_clinic` + signUp).

### Opcion B — Supabase Dashboard
1. Authentication → Users → Add user (cada correo/clave).
2. App Metadata de cada uno:

**Admin**
```json
{ "role": "admin", "clinic_name": "Sonrisa Boreal" }
```

**Doctor**
```json
{ "role": "doctor", "clinic_name": "Sonrisa Boreal" }
```

**Recepcion**
```json
{ "role": "receptionist", "clinic_name": "Sonrisa Boreal" }
```

3. Cuando exista el UUID de la clinica/consultorio, agrega:
```json
{ "consultorio_id": "<uuid>" }
```

## Admin global (plataforma)

| Correo | Rol |
|--------|-----|
| `jfernandez.dental@gmail.com` | `super_admin` |

No mezclar con la clinica demo.

## Nota
La demo **no se prioriza** en el listado global (va al final con etiqueta demo).
