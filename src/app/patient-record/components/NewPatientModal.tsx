'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/ui/AppIcon';
import { FieldError, RequiredMark, RequiredLegend, inputClass } from '@/components/ui/FormField';
import { rules } from '@/lib/validators';

export interface NewPatient {
  firstName: string;
  lastName: string;
  cedula: string;
  birthDate: string;
  sex: 'Femenino' | 'Masculino' | 'Otro';
  phone: string;
  email: string;
  address: string;
  insurance: string;
  allergies: string;
  emergencyContact: string;
}

interface NewPatientModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (p: NewPatient) => void | Promise<void>;
}

const defaults: Partial<NewPatient> = { sex: 'Femenino', insurance: 'Particular' };

export default function NewPatientModal({ open, onClose, onCreate }: NewPatientModalProps) {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewPatient>({ mode: 'onTouched', defaultValues: defaults });

  useEffect(() => {
    if (open) {
      reset(defaults);
      setSaving(false);
    }
  }, [open, reset]);

  const submit = async (v: NewPatient) => {
    setSaving(true);
    try {
      await onCreate({ ...v, firstName: v.firstName.trim(), lastName: v.lastName.trim() });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Nuevo paciente"
      subtitle="Se guarda en la tabla patients de tu clinica."
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-semibold hover:bg-muted">
            Cancelar
          </button>
          <button
            form="new-patient-form"
            type="submit"
            disabled={saving}
            className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
          >
            {saving ? (
              <>
                <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                Guardando...
              </>
            ) : (
              'Registrar paciente'
            )}
          </button>
        </>
      }
    >
      <form id="new-patient-form" onSubmit={handleSubmit(submit)} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <RequiredLegend />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            Nombres
            <RequiredMark />
          </label>
          <input className={inputClass(!!errors.firstName)} {...register('firstName', rules.name('El nombre'))} />
          <FieldError id="firstName" message={errors.firstName?.message} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            Apellidos
            <RequiredMark />
          </label>
          <input className={inputClass(!!errors.lastName)} {...register('lastName', rules.name('El apellido'))} />
          <FieldError id="lastName" message={errors.lastName?.message} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            Cedula
            <RequiredMark />
          </label>
          <input inputMode="numeric" maxLength={10} className={inputClass(!!errors.cedula, 'tabular')} {...register('cedula', rules.cedula())} />
          <FieldError id="cedula" message={errors.cedula?.message} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            Fecha de nacimiento
            <RequiredMark />
          </label>
          <input type="date" className={inputClass(!!errors.birthDate)} {...register('birthDate', rules.pastDate('La fecha de nacimiento'))} />
          <FieldError id="birthDate" message={errors.birthDate?.message} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            Sexo
            <RequiredMark />
          </label>
          <select className={inputClass(!!errors.sex)} {...register('sex', { required: true })}>
            {['Femenino', 'Masculino', 'Otro'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            Celular
            <RequiredMark />
          </label>
          <input inputMode="tel" maxLength={10} className={inputClass(!!errors.phone, 'tabular')} {...register('phone', rules.mobile(true))} />
          <FieldError id="phone" message={errors.phone?.message} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">Correo electronico</label>
          <input type="email" className={inputClass(!!errors.email)} {...register('email', rules.email(false))} />
          <FieldError id="email" message={errors.email?.message} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">Seguro / afiliacion</label>
          <select className={inputClass(false)} {...register('insurance')}>
            {['Particular', 'IESS', 'ISSFA', 'ISSPOL', 'Seguro privado'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold">Direccion</label>
          <input className={inputClass(false)} {...register('address')} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">Alergias conocidas</label>
          <input className={inputClass(false)} {...register('allergies')} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">Contacto de emergencia</label>
          <input className={inputClass(false)} {...register('emergencyContact')} />
        </div>
      </form>
    </Modal>
  );
}
