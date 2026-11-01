'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import { FieldError, RequiredMark, RequiredLegend, inputClass, ariaFor } from '@/components/ui/FormField';
import { rules } from '@/lib/validators';
import { registerClinic } from '@/lib/supabase/auth';

interface RegisterValues {
  clinicName: string;
  ruc: string;
  mspCode: string;
  city: string;
  adminName: string;
  adminEmail: string;
  phone: string;
  plan: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

interface RegisterClinicFormProps {
  onDone: () => void;
}

const plans = [
  { id: 'plan-start', value: 'inicial', name: 'Inicial', price: '$29/mes', detail: '1 doctor - 150 pacientes' },
  { id: 'plan-pro', value: 'pro', name: 'Clinica Pro', price: '$79/mes', detail: '5 doctores - ilimitado' },
  { id: 'plan-net', value: 'red', name: 'Red de clinicas', price: '$199/mes', detail: 'Multi-sede - API' },
];

export default function RegisterClinicForm({ onDone }: RegisterClinicFormProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [info, setInfo] = useState('');
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({ mode: 'onTouched', defaultValues: { plan: 'pro', city: 'Quito' } });
  const selectedPlan = watch('plan');
  const passwordValue = watch('password');

  const onSubmit = async (values: RegisterValues) => {
    setLoading(true);
    setFormError('');
    try {
      const res = await registerClinic({
        clinicName: values.clinicName,
        ruc: values.ruc,
        mspCode: values.mspCode,
        city: values.city,
        adminName: values.adminName,
        adminEmail: values.adminEmail,
        phone: values.phone,
        plan: values.plan,
        password: values.password,
        createdBySuperAdmin: false,
      });
      setInfo(res.message);
      setDone(true);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Error al registrar la clinica');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="animate-scale-in rounded-2xl border border-success/30 bg-success/10 p-6 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success text-success-foreground">
          <Icon name="CheckIcon" size={26} />
        </span>
        <h3 className="text-lg font-bold">Clinica creada correctamente</h3>
        <p className="mt-1 text-sm text-muted-foreground">{info}</p>
        <button
          onClick={onDone}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
        >
          Ir a ingresar
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold">Crear clinica</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Crea el tenant con Auth + funcion register_clinic de Supabase.
      </p>
      <RequiredLegend />
      {formError ? (
        <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
        <div>
          <label htmlFor="clinicName" className="mb-1.5 block text-sm font-semibold">
            Nombre de la clinica
            <RequiredMark />
          </label>
          <input
            id="clinicName"
            className={inputClass(!!errors.clinicName)}
            {...ariaFor('clinicName', !!errors.clinicName)}
            {...register('clinicName', { required: 'Obligatorio' })}
          />
          <FieldError id="clinicName" message={errors.clinicName?.message} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ruc" className="mb-1.5 block text-sm font-semibold">
              RUC
              <RequiredMark />
            </label>
            <input
              id="ruc"
              className={inputClass(!!errors.ruc)}
              {...ariaFor('ruc', !!errors.ruc)}
              {...register('ruc', rules.ruc())}
              placeholder="13 digitos o 10"
            />
            <FieldError id="ruc" message={errors.ruc?.message} />
          </div>
          <div>
            <label htmlFor="mspCode" className="mb-1.5 block text-sm font-semibold">
              Codigo MSP
            </label>
            <input id="mspCode" className={inputClass(false)} {...register('mspCode')} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="mb-1.5 block text-sm font-semibold">
              Ciudad
            </label>
            <input id="city" className={inputClass(false)} {...register('city')} />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold">
              Telefono
            </label>
            <input id="phone" className={inputClass(false)} {...register('phone')} />
          </div>
        </div>

        <div>
          <label htmlFor="adminName" className="mb-1.5 block text-sm font-semibold">
            Nombre del administrador
            <RequiredMark />
          </label>
          <input
            id="adminName"
            className={inputClass(!!errors.adminName)}
            {...ariaFor('adminName', !!errors.adminName)}
            {...register('adminName', { required: 'Obligatorio' })}
          />
          <FieldError id="adminName" message={errors.adminName?.message} />
        </div>

        <div>
          <label htmlFor="adminEmail" className="mb-1.5 block text-sm font-semibold">
            Correo del administrador
            <RequiredMark />
          </label>
          <input
            id="adminEmail"
            type="email"
            autoComplete="email"
            className={inputClass(!!errors.adminEmail)}
            {...ariaFor('adminEmail', !!errors.adminEmail)}
            {...register('adminEmail', rules.email())}
            placeholder="nombre@gmail.com"
          />
          <FieldError id="adminEmail" message={errors.adminEmail?.message} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
              Contrasena
              <RequiredMark />
            </label>
            <input
              id="password"
              type="password"
              className={inputClass(!!errors.password)}
              {...ariaFor('password', !!errors.password)}
              {...register('password', rules.password())}
            />
            <FieldError id="password" message={errors.password?.message} />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold">
              Confirmar contrasena
              <RequiredMark />
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={inputClass(!!errors.confirmPassword)}
              {...ariaFor('confirmPassword', !!errors.confirmPassword)}
              {...register('confirmPassword', {
                required: 'Confirma la contrasena',
                validate: (v) => v === passwordValue || 'Las contrasenas no coinciden',
              })}
            />
            <FieldError id="confirmPassword" message={errors.confirmPassword?.message} />
          </div>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">
            Plan
            <RequiredMark />
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {plans.map((p) => (
              <label
                key={p.id}
                className={`cursor-pointer rounded-xl border p-3 transition-all duration-150 ${
                  selectedPlan === p.value
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-input bg-card hover:border-primary/50'
                }`}
              >
                <input type="radio" value={p.value} className="sr-only" {...register('plan', { required: 'Selecciona un plan' })} />
                <p className="text-sm font-bold">{p.name}</p>
                <p className="text-xs font-semibold text-primary">{p.price}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{p.detail}</p>
              </label>
            ))}
          </div>
          <FieldError id="plan" message={errors.plan?.message} />
        </fieldset>

        <div>
          <label className="flex items-start gap-2 text-sm">
            <input
              id="terms"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded accent-primary"
              {...ariaFor('terms', !!errors.terms)}
              {...register('terms', { required: 'Debes aceptar el tratamiento de datos para continuar' })}
            />
            <span>
              Acepto el tratamiento de datos de salud conforme a la LOPDP
              <RequiredMark />
            </span>
          </label>
          <FieldError id="terms" message={errors.terms?.message} />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
              Creando clinica...
            </>
          ) : (
            'Crear clinica'
          )}
        </button>
      </form>
    </div>
  );
}
