'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import EmptyState from '@/components/ui/EmptyState';
import { FieldError, RequiredMark, RequiredLegend, inputClass } from '@/components/ui/FormField';
import {
  CLINIC_STAFF_ROLES,
  inviteClinicStaff,
  listClinicStaffFromDb,
  listLocalStaff,
  type ClinicStaffRole,
  type StaffMember,
} from '@/lib/supabase/clinicStaff';
import { rules } from '@/lib/validators';

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  role: ClinicStaffRole;
  password: string;
};

export default function ClinicStaffPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { role: 'doctor', fullName: '', email: '', phone: '', password: '' },
  });

  const load = useCallback(async () => {
    if (!user?.clinicId) return;
    const fromDb = await listClinicStaffFromDb(user.clinicId);
    const local = listLocalStaff(user.clinicId);
    const byEmail = new Map<string, StaffMember>();
    [...fromDb, ...local].forEach((m) => {
      if (!byEmail.has(m.email.toLowerCase())) byEmail.set(m.email.toLowerCase(), m);
    });
    setStaff(Array.from(byEmail.values()));
  }, [user?.clinicId]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/sign-up-login-screen');
      return;
    }
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      router.replace('/');
      return;
    }
    void load();
  }, [user, loading, router, load]);

  const onCreate = async (v: FormValues) => {
    if (!user?.clinicId) return;
    setSaving(true);
    setFormError('');
    try {
      const res = await inviteClinicStaff({
        fullName: v.fullName,
        email: v.email,
        phone: v.phone,
        role: v.role,
        password: v.password,
        clinicId: user.clinicId,
      });
      setToast(res.message);
      setOpen(false);
      reset({ role: 'doctor', fullName: '', email: '', phone: '', password: '' });
      await load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'No se pudo crear el usuario');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Personal de la clinica</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {user.clinicName || 'Tu clinica'} — crea doctores, recepcion y personal con su rol de acceso.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFormError('');
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Icon name="UserPlusIcon" size={16} />
            Nuevo usuario
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Roles disponibles: <strong>Administrador</strong>, <strong>Odontologo</strong>, <strong>Recepcion</strong>,{' '}
          <strong>Personal</strong>. Cada uno entra al sistema con su correo y contrasena.
        </div>

        {staff.length === 0 ? (
          <EmptyState
            icon={<Icon name="UsersIcon" size={24} />}
            title="Aun no hay personal registrado"
            description="Crea el primer usuario de tu clinica (por ejemplo un odontologo o recepcion)."
            actionLabel="Nuevo usuario"
            onAction={() => setOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  {['Nombre', 'Correo', 'Rol', 'Estado', 'Alta'].map((h) => (
                    <th key={h} className="px-4 py-2.5 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staff.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-semibold">{m.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                    <td className="px-4 py-3">
                      <Badge tone="info">{m.roleLabel}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={m.active ? 'success' : 'neutral'} dot>
                        {m.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                      {m.source === 'local' ? (
                        <span className="ml-2 text-[10px] text-muted-foreground">local</span>
                      ) : null}
                    </td>
                    <td className="tabular px-4 py-3 text-muted-foreground">{m.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo usuario de la clinica"
        subtitle="Asigna rol y contrasena temporal. El usuario inicia sesion en la misma pantalla de login."
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2 text-sm font-semibold">
              Cancelar
            </button>
            <button
              form="staff-form"
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
            >
              {saving ? 'Creando...' : 'Crear usuario'}
            </button>
          </>
        }
      >
        <form id="staff-form" onSubmit={handleSubmit(onCreate)} className="grid gap-3" noValidate>
          <RequiredLegend />
          {formError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</div>
          ) : null}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Nombre completo
              <RequiredMark />
            </label>
            <input className={inputClass(!!errors.fullName)} {...register('fullName', rules.name('El nombre'))} />
            <FieldError id="fullName" message={errors.fullName?.message} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Correo
              <RequiredMark />
            </label>
            <input type="email" className={inputClass(!!errors.email)} {...register('email', rules.email(true))} />
            <FieldError id="email" message={errors.email?.message} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Celular</label>
            <input className={inputClass(false)} {...register('phone')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Rol
              <RequiredMark />
            </label>
            <select className={inputClass(false)} {...register('role', { required: true })}>
              {CLINIC_STAFF_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Contrasena temporal
              <RequiredMark />
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className={inputClass(!!errors.password)}
              {...register('password', rules.password())}
            />
            <FieldError id="password" message={errors.password?.message} />
          </div>
        </form>
      </Modal>

      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </AppLayout>
  );
}
