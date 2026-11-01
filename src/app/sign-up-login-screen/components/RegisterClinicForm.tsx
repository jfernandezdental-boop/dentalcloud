'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import { FieldError, RequiredMark, RequiredLegend, inputClass, ariaFor } from '@/components/ui/FormField';
import { rules } from '@/lib/validators';

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
  { id: 'plan-start', value: 'inicial', name: 'Inicial', price: '$29/mes', detail: '1 doctor · 150 pacientes' },
  { id: 'plan-pro', value: 'pro', name: 'Clínica Pro', price: '$79/mes', detail: '5 doctores · ilimitado' },
  { id: 'plan-net', value: 'red', name: 'Red de clínicas', price: '$199/mes', detail: 'Multi-sede · API' },
];

export default function RegisterClinicForm({ onDone }: RegisterClinicFormProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({ mode: 'onTouched', defaultValues: { plan: 'pro', city: 'Quito' } });
  const selectedPlan = watch('plan');
  const passwordValue = watch('password');

  const onSubmit = () => {
    setLoading(true);
    // Backend integration: POST /api/tenants to provision clinic + admin user
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1100);
  };

  if (done) {
    return (
      <div className="animate-scale-in rounded-2xl border border-success/30 bg-success/10 p-6 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success text-success-foreground">
          <Icon name="CheckIcon" size={26} />
        </span>
        <h3 className="text-lg font-bold">Clínica creada correctamente</h3>
        <p className="mt-1 text-sm text-muted-foreground">Enviamos el enlace de activación al correo del administrador. Tienes 14 días de prueba sin costo.</p>
        <button onClick={onDone} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95">
          Ir a ingresar
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold">Crea el espacio de tu clínica</h2>
      <p className="mt-1 text-sm text-muted-foreground">Tú serás el administrador y podrás crear a tu personal con sus roles.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
        <RequiredLegend />
        <div>
          <label htmlFor="clinicName" className="mb-1.5 block text-sm font-semibold">Nombre comercial de la clínica<RequiredMark /></label>
          <input
            id="clinicName"
            className={inputClass(!!errors.clinicName)}
            placeholder="Ej. Clínica Dental Sonrisa Boreal"
            {...ariaFor('clinicName', !!errors.clinicName)}
            {...register('clinicName', {
              required: 'Ingresa el nombre de la clínica',
              minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              maxLength: { value: 100, message: 'Máximo 100 caracteres' },
              validate: (v) => v.trim().length >= 3 || 'El nombre no puede estar vacío',
            })}
          />
          <FieldError id="clinicName" message={errors.clinicName?.message} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ruc" className="mb-1.5 block text-sm font-semibold">RUC<RequiredMark /></label>
            <input id="ruc" inputMode="numeric" maxLength={13} className={inputClass(!!errors.ruc, 'tabular')} placeholder="1792345678001" {...ariaFor('ruc', !!errors.ruc)} {...register('ruc', rules.ruc())} />
            <FieldError id="ruc" message={errors.ruc?.message} />
          </div>
          <div>
            <label htmlFor="mspCode" className="mb-1.5 block text-sm font-semibold">Código de establecimiento MSP<RequiredMark /></label>
            <input
              id="mspCode"
              inputMode="numeric"
              className={inputClass(!!errors.mspCode, 'tabular')}
              placeholder="0001234"
              {...ariaFor('mspCode', !!errors.mspCode)}
              {...register('mspCode', { required: 'Ingresa el código MSP', pattern: { value: /^\d{5,10}$/, message: 'Debe tener entre 5 y 10 dígitos' } })}
            />
            <FieldError id="mspCode" message={errors.mspCode?.message} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="mb-1.5 block text-sm font-semibold">Ciudad<RequiredMark /></label>
            <select id="city" className={inputClass(!!errors.city)} {...register('city', { required: 'Selecciona una ciudad' })}>
              {['Quito', 'Guayaquil', 'Cuenca', 'Ambato', 'Loja', 'Manta', 'Ibarra'].map((c) => (
                <option key={`city-${c}`} value={c}>{c}</option>
              ))}
            </select>
            <FieldError id="city" message={errors.city?.message} />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold">Teléfono de contacto<RequiredMark /></label>
            <input id="phone" inputMode="tel" className={inputClass(!!errors.phone, 'tabular')} placeholder="0998123456" {...ariaFor('phone', !!errors.phone)} {...register('phone', rules.phone(true))} />
            <FieldError id="phone" message={errors.phone?.message} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="adminName" className="mb-1.5 block text-sm font-semibold">Nombre del administrador<RequiredMark /></label>
            <input id="adminName" className={inputClass(!!errors.adminName)} placeholder="Mariana Rosero" {...ariaFor('adminName', !!errors.adminName)} {...register('adminName', rules.name('El nombre'))} />
            <FieldError id="adminName" message={errors.adminName?.message} />
          </div>
          <div>
            <label htmlFor="adminEmail" className="mb-1.5 block text-sm font-semibold">Correo del administrador<RequiredMark /></label>
            <input id="adminEmail" type="email" className={inputClass(!!errors.adminEmail)} placeholder="admin@tuclinica.ec" {...ariaFor('adminEmail', !!errors.adminEmail)} {...register('adminEmail', rules.email(true))} />
            <FieldError id="adminEmail" message={errors.adminEmail?.message} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="regPassword" className="mb-1.5 block text-sm font-semibold">Contraseña<RequiredMark /></label>
            <input id="regPassword" type="password" autoComplete="new-password" className={inputClass(!!errors.password)} placeholder="Mínimo 8 caracteres" {...ariaFor('regPassword', !!errors.password)} {...register('password', rules.password())} />
            <FieldError id="regPassword" message={errors.password?.message} />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold">Confirmar contraseña<RequiredMark /></label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className={inputClass(!!errors.confirmPassword)}
              placeholder="Repite la contraseña"
              {...ariaFor('confirmPassword', !!errors.confirmPassword)}
              {...register('confirmPassword', {
                required: 'Confirma tu contraseña',
                validate: (v) => v === passwordValue || 'Las contraseñas no coinciden',
              })}
            />
            <FieldError id="confirmPassword" message={errors.confirmPassword?.message} />
          </div>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">Plan<RequiredMark /></legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {plans.map((p) => (
              <label
                key={p.id}
                className={`cursor-pointer rounded-xl border p-3 transition-all duration-150 ${
                  selectedPlan === p.value ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-input bg-card hover:border-primary/50'
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
            <span>Acepto el tratamiento de datos de salud conforme a la LOPDP<RequiredMark /></span>
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
              Creando clínica…
            </>
          ) : (
            'Crear clínica y comenzar prueba de 14 días'
          )}
        </button>
      </form>
    </div>
  );
}