'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/ui/AppIcon';
import { FieldError, RequiredMark, RequiredLegend, inputClass, ariaFor } from '@/components/ui/FormField';
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
  onCreate: (p: NewPatient) => void;
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

  const submit = (v: NewPatient) => {
    setSaving(true);
    setTimeout(() => onCreate({ ...v, firstName: v.firstName.trim(), lastName: v.lastName.trim() }), 400);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Nuevo paciente"
      subtitle="Registra los datos basicos para abrir la historia clinica."
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
          <label htmlFor="np-first" className="mb-1.5 block text-sm font-semibold">
            Nombres
            <RequiredMark />
          </label>
          <input id="np-first" className={inputClass(!!errors.firstName)} {...register('firstName', rules.name('El nombre'))} />
          <FieldError id="np-first" message={errors.firstName?.message} />
        </div>
        <div>
          <label htmlFor="np-last" className="mb-1.5 block text-sm font-semibold">
            Apellidos
            <RequiredMark />
          </label>
          <input id="np-last" className={inputClass(!!errors.lastName)} {...register('lastName', rules.name('El apellido'))} />
          <FieldError id="np-last" message={errors.lastName?.message} />
        </div>
        <div>
          <label htmlFor="np-ced" className="mb-1.5 block text-sm font-semibold">
            Cedula
            <RequiredMark />
          </label>
          <input id="np-ced" inputMode="numeric" maxLength={10} className={inputClass(!!errors.cedula, 'tabular')} {...register('cedula', rules.cedula())} />
          <FieldError id="np-ced" message={errors.cedula?.message} />
        </div>
        <div>
          <label htmlFor="np-birth" className="mb-1.5 block text-sm font-semibold">
            Fecha de nacimiento
            <RequiredMark />
          </label>
          <input id="np-birth" type="date" className={inputClass(!!errors.birthDate)} {...register('birthDate', rules.pastDate('La fecha de nacimiento'))} />
          <FieldError id="np-birth" message={errors.birthDate?.message} />
        </div>
        <div>
          <label htmlFor="np-sex" className="mb-1.5 block text-sm font-semibold">
            Sexo
            <RequiredMark />
          </label>
          <select id="np-sex" className={inputClass(!!errors.sex)} {...register('sex', { required: 'Selecciona el sexo' })}>
            {['Femenino', 'Masculino', 'Otro'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <FieldError id="np-sex" message={errors.sex?.message} />
        </div>
        <div>
          <label htmlFor="np-phone" className="mb-1.5 block text-sm font-semibold">
            Celular
            <RequiredMark />
          </label>
          <input id="np-phone" inputMode="tel" maxLength={10} className={inputClass(!!errors.phone, 'tabular')} {...register('phone', rules.mobile(true))} />
          <FieldError id="np-phone" message={errors.phone?.message} />
        </div>
        <div>
          <label htmlFor="np-email" className="mb-1.5 block text-sm font-semibold">
            Correo electronico
          </label>
          <input id="np-email" type="email" className={inputClass(!!errors.email)} {...register('email', rules.email(false))} />
          <FieldError id="np-email" message={errors.email?.message} />
        </div>
        <div>
          <label htmlFor="np-ins" className="mb-1.5 block text-sm font-semibold">
            Seguro / afiliacion
          </label>
          <select id="np-ins" className={inputClass(false)} {...register('insurance')}>
            {['Particular', 'IESS afiliado', 'ISSFA', 'ISSPOL', 'Seguro privado'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="np-addr" className="mb-1.5 block text-sm font-semibold">
            Direccion
          </label>
          <input id="np-addr" className={inputClass(false)} {...register('address')} />
        </div>
        <div>
          <label htmlFor="np-all" className="mb-1.5 block text-sm font-semibold">
            Alergias conocidas
          </label>
          <input id="np-all" className={inputClass(false)} {...register('allergies')} />
        </div>
        <div>
          <label htmlFor="np-emg" className="mb-1.5 block text-sm font-semibold">
            Contacto de emergencia
          </label>
          <input id="np-emg" className={inputClass(false)} {...register('emergencyContact')} />
        </div>
      </form>
    </Modal>
  );
}
