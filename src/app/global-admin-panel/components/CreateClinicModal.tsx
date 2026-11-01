'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/ui/AppIcon';
import { FieldError, RequiredMark, RequiredLegend, inputClass, ariaFor } from '@/components/ui/FormField';
import { rules } from '@/lib/validators';
import { registerClinic } from '@/lib/supabase/auth';

export interface NewClinic {
  name: string;
  ruc: string;
  mspCode: string;
  city: string;
  plan: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  password: string;
}

interface CreateClinicModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function normalizePlan(plan: string): string {
  const p = plan.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  if (p.includes('inicial')) return 'inicial';
  if (p.includes('red')) return 'red';
  return 'pro';
}

export default function CreateClinicModal({ open, onClose, onCreated }: CreateClinicModalProps) {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formOk, setFormOk] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewClinic>({
    mode: 'onTouched',
    defaultValues: { plan: 'pro', city: 'Quito', password: '' },
  });

  useEffect(() => {
    if (open) {
      reset({ plan: 'pro', city: 'Quito', password: '' });
      setSaving(false);
      setFormError('');
      setFormOk('');
    }
  }, [open, reset]);

  const submit = async (v: NewClinic) => {
    setSaving(true);
    setFormError('');
    setFormOk('');
    try {
      const res = await registerClinic({
        clinicName: v.name.trim(),
        ruc: v.ruc.trim(),
        mspCode: v.mspCode?.trim(),
        city: v.city?.trim(),
        adminName: v.adminName.trim(),
        adminEmail: v.adminEmail.trim(),
        phone: v.adminPhone?.trim(),
        plan: normalizePlan(v.plan),
        password: v.password,
        createdBySuperAdmin: true,
      });
      setFormOk(res.message);
      onCreated();
      // Cerrar tras breve aviso
      setTimeout(() => onClose(), 1200);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'No se pudo crear la clinica');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Crear nueva clinica"
      subtitle="Crea la clinica y su administrador inicial, listo para ingresar. Tu sesion no cambia."
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            form="create-clinic-form"
            type="submit"
            disabled={saving}
            className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
          >
            {saving ? (
              <>
                <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                Creando...
              </>
            ) : (
              'Crear clinica'
            )}
          </button>
        </>
      }
    >
      <form id="create-clinic-form" onSubmit={handleSubmit(submit)} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <RequiredLegend />
          {formError ? (
            <div className="mt-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          ) : null}
          {formOk ? (
            <div className="mt-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
              {formOk}
            </div>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold">
            Nombre de la clinica
            <RequiredMark />
          </label>
          <input className={inputClass(!!errors.name)} {...ariaFor('name', !!errors.name)} {...register('name', { required: 'Obligatorio' })} />
          <FieldError id="name" message={errors.name?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            RUC
            <RequiredMark />
          </label>
          <input className={inputClass(!!errors.ruc)} {...register('ruc', rules.ruc())} />
          <FieldError id="ruc" message={errors.ruc?.message} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">Codigo MSP</label>
          <input className={inputClass(false)} {...register('mspCode')} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">Ciudad</label>
          <input className={inputClass(false)} {...register('city')} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">Plan</label>
          <select className={inputClass(false)} {...register('plan')}>
            <option value="inicial">Inicial</option>
            <option value="pro">Clinica Pro</option>
            <option value="red">Red de clinicas</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            Admin nombre
            <RequiredMark />
          </label>
          <input className={inputClass(!!errors.adminName)} {...register('adminName', { required: 'Obligatorio' })} />
          <FieldError id="adminName" message={errors.adminName?.message} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            Admin email
            <RequiredMark />
          </label>
          <input type="email" className={inputClass(!!errors.adminEmail)} {...register('adminEmail', rules.email())} />
          <FieldError id="adminEmail" message={errors.adminEmail?.message} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">Telefono</label>
          <input className={inputClass(false)} {...register('adminPhone')} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            Contrasena inicial del admin
            <RequiredMark />
          </label>
          <input type="password" className={inputClass(!!errors.password)} {...register('password', rules.password())} />
          <FieldError id="password" message={errors.password?.message} />
        </div>
      </form>
    </Modal>
  );
}
