'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/ui/AppIcon';
import { FieldError, RequiredMark, RequiredLegend, inputClass, ariaFor } from '@/components/ui/FormField';
import { rules } from '@/lib/validators';

export interface NewClinic {
  name: string;
  ruc: string;
  mspCode: string;
  city: string;
  plan: 'Inicial' | 'Clínica Pro' | 'Red de clínicas';
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  maxDoctors: number;
}

interface CreateClinicModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (c: NewClinic) => void;
}

export default function CreateClinicModal({ open, onClose, onCreate }: CreateClinicModalProps) {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewClinic>({
    mode: 'onTouched',
    defaultValues: { plan: 'Clínica Pro', city: 'Quito', maxDoctors: 5 },
  });

  useEffect(() => {
    if (open) {
      reset({ plan: 'Clínica Pro', city: 'Quito', maxDoctors: 5 });
      setSaving(false);
    }
  }, [open, reset]);

  const submit = (v: NewClinic) => {
    setSaving(true);
    setTimeout(() => onCreate({ ...v, name: v.name.trim(), maxDoctors: Number(v.maxDoctors) }), 700);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Crear nueva clínica"
      subtitle="Se aprovisiona un espacio aislado (tenant) y se envía el acceso al administrador de la clínica."
      footer={
        <>
          <button onClick={onClose} className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95">Cancelar</button>
          <button
            form="create-clinic-form"
            type="submit"
            disabled={saving}
            className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-70"
          >
            {saving ? (<><Icon name="ArrowPathIcon" size={16} className="animate-spin" />Creando…</>) : 'Crear clínica'}
          </button>
        </>
      }
    >
      <form id="create-clinic-form" onSubmit={handleSubmit(submit)} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><RequiredLegend /></div>
        <div className="sm:col-span-2">
          <label htmlFor="cc-name" className="mb-1.5 block text-sm font-semibold">Nombre comercial<RequiredMark /></label>
          <input
            id="cc-name"
            className={inputClass(!!errors.name)}
            placeholder="Ej. Clínica Dental Altos del Valle"
            {...ariaFor('cc-name', !!errors.name)}
            {...register('name', {
              required: 'Ingresa el nombre comercial',
              minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              maxLength: { value: 100, message: 'Máximo 100 caracteres' },
              validate: (v) => v.trim().length >= 3 || 'El nombre no puede estar vacío',
            })}
          />
          <FieldError id="cc-name" message={errors.name?.message} />
        </div>
        <div>
          <label htmlFor="cc-ruc" className="mb-1.5 block text-sm font-semibold">RUC<RequiredMark /></label>
          <input id="cc-ruc" inputMode="numeric" maxLength={13} className={inputClass(!!errors.ruc, 'tabular')} placeholder="1792345678001" {...ariaFor('cc-ruc', !!errors.ruc)} {...register('ruc', rules.ruc())} />
          <FieldError id="cc-ruc" message={errors.ruc?.message} />
        </div>
        <div>
          <label htmlFor="cc-msp" className="mb-1.5 block text-sm font-semibold">Código de establecimiento MSP<RequiredMark /></label>
          <input
            id="cc-msp"
            inputMode="numeric"
            className={inputClass(!!errors.mspCode, 'tabular')}
            placeholder="0001234"
            {...ariaFor('cc-msp', !!errors.mspCode)}
            {...register('mspCode', { required: 'Ingresa el código MSP', pattern: { value: /^\d{5,10}$/, message: 'Debe tener entre 5 y 10 dígitos' } })}
          />
          <FieldError id="cc-msp" message={errors.mspCode?.message} />
        </div>
        <div>
          <label htmlFor="cc-city" className="mb-1.5 block text-sm font-semibold">Ciudad<RequiredMark /></label>
          <select id="cc-city" className={inputClass(!!errors.city)} {...register('city', { required: 'Selecciona una ciudad' })}>
            {['Quito', 'Guayaquil', 'Cuenca', 'Ambato', 'Loja', 'Manta', 'Ibarra', 'Riobamba', 'Machala'].map((c) => (
              <option key={`cc-city-${c}`} value={c}>{c}</option>
            ))}
          </select>
          <FieldError id="cc-city" message={errors.city?.message} />
        </div>
        <div>
          <label htmlFor="cc-plan" className="mb-1.5 block text-sm font-semibold">Plan<RequiredMark /></label>
          <select id="cc-plan" className={inputClass(!!errors.plan)} {...register('plan', { required: 'Selecciona un plan' })}>
            {['Inicial', 'Clínica Pro', 'Red de clínicas'].map((p) => (
              <option key={`cc-plan-${p}`} value={p}>{p}</option>
            ))}
          </select>
          <FieldError id="cc-plan" message={errors.plan?.message} />
        </div>
        <div>
          <label htmlFor="cc-admin" className="mb-1.5 block text-sm font-semibold">Administrador de la clínica<RequiredMark /></label>
          <input id="cc-admin" className={inputClass(!!errors.adminName)} placeholder="Nombre y apellido" {...ariaFor('cc-admin', !!errors.adminName)} {...register('adminName', rules.name('El nombre del administrador'))} />
          <FieldError id="cc-admin" message={errors.adminName?.message} />
        </div>
        <div>
          <label htmlFor="cc-email" className="mb-1.5 block text-sm font-semibold">Correo del administrador<RequiredMark /></label>
          <input id="cc-email" type="email" className={inputClass(!!errors.adminEmail)} placeholder="admin@clinica.ec" {...ariaFor('cc-email', !!errors.adminEmail)} {...register('adminEmail', rules.email(true))} />
          <FieldError id="cc-email" message={errors.adminEmail?.message} />
        </div>
        <div>
          <label htmlFor="cc-phone" className="mb-1.5 block text-sm font-semibold">Celular del administrador<RequiredMark /></label>
          <input id="cc-phone" inputMode="tel" maxLength={10} className={inputClass(!!errors.adminPhone, 'tabular')} placeholder="0998123456" {...ariaFor('cc-phone', !!errors.adminPhone)} {...register('adminPhone', rules.mobile(true))} />
          <FieldError id="cc-phone" message={errors.adminPhone?.message} />
        </div>
        <div>
          <label htmlFor="cc-max" className="mb-1.5 block text-sm font-semibold">Límite de doctores<RequiredMark /></label>
          <p className="mb-1.5 text-xs text-muted-foreground">Controla las licencias de profesionales activos (1 a 50).</p>
          <input
            id="cc-max"
            type="number"
            min={1}
            max={50}
            step={1}
            className={inputClass(!!errors.maxDoctors, 'tabular')}
            {...ariaFor('cc-max', !!errors.maxDoctors)}
            {...register('maxDoctors', {
              required: 'Indica un límite de doctores',
              valueAsNumber: true,
              min: { value: 1, message: 'Mínimo 1 doctor' },
              max: { value: 50, message: 'Máximo 50 doctores' },
              validate: (v) => Number.isInteger(Number(v)) || 'Debe ser un número entero',
            })}
          />
          <FieldError id="cc-max" message={errors.maxDoctors?.message} />
        </div>
      </form>
    </Modal>
  );
}