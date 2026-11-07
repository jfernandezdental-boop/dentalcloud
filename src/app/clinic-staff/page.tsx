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
  updateClinicStaff,
  setClinicStaffActive,
  resetClinicStaffPassword,
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

type EditValues = {
  fullName: string;
  phone: string;
  role: ClinicStaffRole;
};

export default function ClinicStaffPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [open, setOpen] = useState(false);
  const [editMember, setEditMember] = useState<StaffMember | null>(null);
  const [resetMember, setResetMember] = useState<StaffMember | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [menuId, setMenuId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { role: 'doctor', fullName: '', email: '', phone: '', password: '' },
  });

  const {
    register: regEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<EditValues>();

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

  const onEdit = async (v: EditValues) => {
    if (!user?.clinicId || !editMember) return;
    setSaving(true);
    setFormError('');
    try {
      await updateClinicStaff({
        id: editMember.id,
        clinicId: user.clinicId,
        fullName: v.fullName,
        phone: v.phone,
        role: v.role,
      });
      setToast('Datos actualizados' + (v.role === 'doctor' ? '. Disponible en la agenda.' : '.'));
      setEditMember(null);
      await load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'No se pudo actualizar');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (m: StaffMember) => {
    if (!user?.clinicId) return;
    if (m.id === user.id) {
      setToast('No puedes desactivar tu propia cuenta.');
      return;
    }
    try {
      await setClinicStaffActive({
        id: m.id,
        clinicId: user.clinicId,
        active: !m.active,
        role: m.role,
        fullName: m.fullName,
      });
      setToast(m.active ? `${m.fullName} desactivado.` : `${m.fullName} activado.`);
      setMenuId(null);
      await load();
    } catch (e: unknown) {
      setToast(e instanceof Error ? e.message : 'No se pudo cambiar el estado');
    }
  };

  const onResetPassword = async () => {
    if (!user?.clinicId || !resetMember) return;
    if (newPassword.length < 8) {
      setFormError('Mínimo 8 caracteres');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const msg = await resetClinicStaffPassword({
        id: resetMember.id,
        clinicId: user.clinicId,
        email: resetMember.email,
        password: newPassword,
      });
      setToast(msg);
      setResetMember(null);
      setNewPassword('');
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'No se pudo resetear');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (m: StaffMember) => {
    setFormError('');
    setEditMember(m);
    resetEdit({ fullName: m.fullName, phone: m.phone || '', role: m.role });
    setMenuId(null);
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
            <h1 className="text-2xl font-semibold">Personal y roles</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {user.clinicName || 'Tu clínica'} — usuarios con acceso al sistema. Los odontólogos se reflejan en la agenda.
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
          <strong>Roles:</strong> Administrador · Odontólogo (aparece en agenda) · Recepción · Personal.
          Acciones: editar, activar/desactivar, resetear clave.
        </div>

        {staff.length === 0 ? (
          <EmptyState
            icon={<Icon name="UsersIcon" size={24} />}
            title="Aún no hay personal registrado"
            description="Crea el primer usuario (por ejemplo un odontólogo). Quedará listo para la agenda."
            actionLabel="Nuevo usuario"
            onAction={() => setOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  {['Nombre', 'Correo', 'Rol', 'Estado', 'Alta', 'Acciones'].map((h) => (
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
                      <Badge tone={m.role === 'doctor' ? 'accent' : 'info'}>{m.roleLabel}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={m.active ? 'success' : 'neutral'} dot>
                        {m.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="tabular px-4 py-3 text-muted-foreground">{m.createdAt}</td>
                    <td className="relative px-4 py-3">
                      <button
                        type="button"
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted"
                        onClick={() => setMenuId(menuId === m.id ? null : m.id)}
                      >
                        Acciones ▾
                      </button>
                      {menuId === m.id && (
                        <div className="absolute right-4 z-20 mt-1 w-48 rounded-xl border border-border bg-card py-1 shadow-lg">
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                            onClick={() => openEdit(m)}
                          >
                            <Icon name="PencilSquareIcon" size={14} /> Editar
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                            onClick={() => void toggleActive(m)}
                          >
                            <Icon name={m.active ? 'NoSymbolIcon' : 'CheckCircleIcon'} size={14} />
                            {m.active ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                            onClick={() => {
                              setFormError('');
                              setNewPassword('');
                              setResetMember(m);
                              setMenuId(null);
                            }}
                          >
                            <Icon name="KeyIcon" size={14} /> Resetear clave
                          </button>
                          {m.id !== user.id && m.active && (
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                              onClick={() => void toggleActive(m)}
                            >
                              <Icon name="TrashIcon" size={14} /> Desactivar (eliminar acceso)
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Crear */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo usuario de la clínica"
        subtitle="Si eliges Odontólogo, también se crea en la agenda del doctor."
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
                  {r.value === 'doctor' ? ' (agenda)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Contraseña temporal
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

      {/* Editar */}
      <Modal
        open={!!editMember}
        onClose={() => setEditMember(null)}
        title="Editar usuario"
        subtitle={editMember?.email}
        footer={
          <>
            <button type="button" onClick={() => setEditMember(null)} className="rounded-lg border px-4 py-2 text-sm font-semibold">
              Cancelar
            </button>
            <button
              form="edit-staff-form"
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </>
        }
      >
        <form id="edit-staff-form" onSubmit={handleEditSubmit(onEdit)} className="grid gap-3" noValidate>
          {formError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</div>
          ) : null}
          <div>
            <label className="mb-1 block text-sm font-semibold">Nombre completo</label>
            <input className={inputClass(!!editErrors.fullName)} {...regEdit('fullName', rules.name('El nombre'))} />
            <FieldError id="editName" message={editErrors.fullName?.message} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Celular</label>
            <input className={inputClass(false)} {...regEdit('phone')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Rol</label>
            <select className={inputClass(false)} {...regEdit('role', { required: true })}>
              {CLINIC_STAFF_ROLES.map((r) => (
                <option key={r.value} value={r.value>
                  {r.label}
                  {r.value === 'doctor' ? ' (agenda)' : ''}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      {/* Reset password */}
      <Modal
        open={!!resetMember}
        onClose={() => setResetMember(null)}
        title="Resetear contraseña"
        subtitle={resetMember ? `${resetMember.fullName} · ${resetMember.email}` : ''}
        footer={
          <>
            <button type="button" onClick={() => setResetMember(null)} className="rounded-lg border px-4 py-2 text-sm font-semibold">
              Cancelar
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void onResetPassword()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
            >
              {saving ? 'Guardando...' : 'Actualizar clave'}
            </button>
          </>
        }
      >
        {formError ? (
          <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</div>
        ) : null}
        <label className="mb-1 block text-sm font-semibold">Nueva contraseña (mín. 8)</label>
        <input
          type="password"
          autoComplete="new-password"
          className={inputClass(false)}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </Modal>

      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </AppLayout>
  );
}
