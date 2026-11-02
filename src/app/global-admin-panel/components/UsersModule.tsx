'use client';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import EmptyState from '@/components/ui/EmptyState';
import { FieldError, RequiredMark, RequiredLegend, inputClass, ariaFor } from '@/components/ui/FormField';
import { rules } from '@/lib/validators';

type UserStatus = 'Activo' | 'Inactivo';

const roleOptions = [
  'Administrador de clinica',
  'Odontologo',
  'Recepcion',
  'Auxiliar odontologico',
  'Contador',
];

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  clinic: string;
  status: UserStatus;
}

interface UserForm {
  name: string;
  email: string;
  phone: string;
  role: string;
  clinic: string;
}

const clinics = ['Clinica Dental DentalCloud', 'Sonrisa Andina', 'Dental Pichincha', 'OdontoCentro Guayaquil'];

const initialUsers: PlatformUser[] = [
  { id: 'usr-001', name: 'Camila Andrade', email: 'camila.andrade@dentalcloud.ec', phone: '0998123456', role: 'Odontologo', clinic: 'Clinica Dental DentalCloud', status: 'Activo' },
  { id: 'usr-002', name: 'Santiago Moscoso', email: 'santiago.moscoso@dentalcloud.ec', phone: '0987654321', role: 'Odontologo', clinic: 'Clinica Dental DentalCloud', status: 'Activo' },
  { id: 'usr-003', name: 'Paola Villavicencio', email: 'paola.villavicencio@dentalcloud.ec', phone: '0991122334', role: 'Odontologo', clinic: 'Sonrisa Andina', status: 'Activo' },
  { id: 'usr-004', name: 'Mariana Torres', email: 'recepcion@dentalcloud.ec', phone: '0969988776', role: 'Recepcion', clinic: 'Clinica Dental DentalCloud', status: 'Activo' },
  { id: 'usr-005', name: 'Luis Paredes', email: 'luis.paredes@sonrisaandina.ec', phone: '0955443322', role: 'Administrador de clinica', clinic: 'Sonrisa Andina', status: 'Activo' },
  { id: 'usr-006', name: 'Karla Nunez', email: 'karla.nunez@dentalpichincha.ec', phone: '0944332211', role: 'Auxiliar odontologico', clinic: 'Dental Pichincha', status: 'Inactivo' },
  { id: 'usr-007', name: 'Esteban Ruiz', email: 'contabilidad@odontocentro.ec', phone: '0933221100', role: 'Contador', clinic: 'OdontoCentro Guayaquil', status: 'Activo' },
];

const roleTone = (r: string): 'info' | 'success' | 'warning' | 'neutral' => {
  if (r === 'Administrador de clinica') return 'warning';
  if (r === 'Odontologo') return 'info';
  if (r === 'Recepcion') return 'success';
  return 'neutral';
};

export default function UsersModule() {
  const [users, setUsers] = useState<PlatformUser[]>(initialUsers);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformUser | null>(null);
  const [toast, setToast] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserForm>({ mode: 'onTouched' });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) =>
        (roleFilter === 'Todos' || u.role === roleFilter) &&
        (!q || `${u.name} ${u.email} ${u.clinic}`.toLowerCase().includes(q)),
    );
  }, [users, query, roleFilter]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', email: '', phone: '', role: 'Odontologo', clinic: clinics[0] });
    setOpen(true);
  };

  const openEdit = (u: PlatformUser) => {
    setEditing(u);
    reset({ name: u.name, email: u.email, phone: u.phone, role: u.role, clinic: u.clinic });
    setOpen(true);
  };

  const submit = (v: UserForm) => {
    if (editing) {
      setUsers((prev) => prev.map((u) => (u.id === editing.id ? { ...u, ...v, name: v.name.trim() } : u)));
      setToast('Usuario actualizado (UI local)');
    } else {
      setUsers((prev) => [
        {
          id: `usr-${Date.now()}`,
          ...v,
          name: v.name.trim(),
          status: 'Activo',
        },
        ...prev,
      ]);
      setToast('Usuario creado en listado local (conectar Auth despues)');
    }
    setOpen(false);
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'Activo' ? 'Inactivo' : 'Activo' } : u)),
    );
    setToast('Estado actualizado');
  };

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">Usuarios y roles</h2>
          <p className="text-xs text-muted-foreground">Vista de plataforma (plantilla hasta enlazar profiles de Supabase)</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Icon name="UserPlusIcon" size={16} />
          Nuevo usuario
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
        <div className="relative min-w-[220px] flex-1">
          <Icon name="MagnifyingGlassIcon" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, correo o clinica"
            className="w-full rounded-lg border border-input bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-input bg-card px-3 py-2 text-sm"
        >
          {['Todos', ...roleOptions].map((r) => (
            <option key={r} value={r}>
              {r === 'Todos' ? 'Todos los roles' : r}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="p-5">
          <EmptyState icon={<Icon name="UsersIcon" size={24} />} title="Sin usuarios" description="No hay coincidencias." />
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {['Usuario', 'Rol', 'Clinica', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-5 py-2.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {u.name
                          .split(' ')
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join('')}
                      </span>
                      <div>
                        <p className="font-semibold">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={roleTone(u.role)}>{u.role}</Badge>
                  </td>
                  <td className="px-5 py-3">{u.clinic}</td>
                  <td className="px-5 py-3">
                    <Badge tone={u.status === 'Activo' ? 'success' : 'neutral'} dot>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEdit(u)} className="rounded-lg border border-input px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                        Editar
                      </button>
                      <button type="button" onClick={() => toggleStatus(u.id)} className="rounded-lg border border-input px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                        {u.status === 'Activo' ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar usuario' : 'Nuevo usuario'}
        subtitle="Plantilla UI; el alta real de Auth se hace en Supabase o register_clinic."
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2 text-sm font-semibold">
              Cancelar
            </button>
            <button form="user-form" type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              {editing ? 'Guardar' : 'Crear'}
            </button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSubmit(submit)} noValidate className="grid gap-4">
          <RequiredLegend />
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Nombre
              <RequiredMark />
            </label>
            <input className={inputClass(!!errors.name)} {...register('name', rules.name('El nombre'))} />
            <FieldError id="name" message={errors.name?.message} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Correo
              <RequiredMark />
            </label>
            <input type="email" className={inputClass(!!errors.email)} {...register('email', rules.email(true))} />
            <FieldError id="email" message={errors.email?.message} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Celular
              <RequiredMark />
            </label>
            <input className={inputClass(!!errors.phone, 'tabular')} {...register('phone', rules.mobile(true))} />
            <FieldError id="phone" message={errors.phone?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Rol</label>
              <select className={inputClass(false)} {...register('role')}>
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Clinica</label>
              <select className={inputClass(false)} {...register('clinic')}>
                {clinics.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </section>
  );
}
