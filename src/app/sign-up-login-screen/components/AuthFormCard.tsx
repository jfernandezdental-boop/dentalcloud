'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';
import Link from 'next/link';
import DemoCredentialsBox, { DemoCredential } from './DemoCredentialsBox';
import RegisterClinicForm from './RegisterClinicForm';
import { FieldError, RequiredMark, RequiredLegend, inputClass, ariaFor } from '@/components/ui/FormField';
import { EMAIL_PATTERN } from '@/lib/validators';
import { signInWithPassword } from '@/lib/supabase/auth';

interface LoginValues {
  email: string;
  password: string;
  remember: boolean;
}

const demoAccounts: DemoCredential[] = [
  { id: 'cred-admin', role: 'Admin de clínica', email: 'mrosero@sonrisaboreal.ec', password: 'Clinica#2026' },
  { id: 'cred-doctor', role: 'Odontólogo', email: 'candrade@sonrisaboreal.ec', password: 'Doctora#2026' },
  { id: 'cred-recep', role: 'Recepción', email: 'recepcion@sonrisaboreal.ec', password: 'Recepcion#2026' },
  { id: 'cred-global', role: 'Admin global', email: 'plataforma@dentalcloud.ec', password: 'Global#2026' },
];

export default function AuthFormCard() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({ defaultValues: { email: '', password: '', remember: true } });

  const useCredential = (c: DemoCredential) => {
    setValue('email', c.email, { shouldValidate: true });
    setValue('password', c.password, { shouldValidate: true });
    setAuthError('');
  };

  const onSubmit = async (values: LoginValues) => {
    setAuthError('');
    setLoading(true);
    try {
      await signInWithPassword({ email: values.email, password: values.password });
      router.push('/');
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No se pudo iniciar sesión';
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex items-center justify-center bg-background px-5 py-10 sm:px-10">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 flex items-center justify-center lg:hidden">
          <AppLogo />
        </div>

        <div className="mb-6 flex rounded-xl border border-border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              tab === 'login' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Ingresar
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              tab === 'register' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Registrar clínica
          </button>
        </div>

        {tab === 'login' ? (
          <div>
            <h2 className="text-2xl font-bold">Bienvenido de nuevo</h2>
            <p className="mt-1 text-sm text-muted-foreground">Accede con tu cuenta de clínica o plataforma.</p>
            <RequiredLegend />

            {authError ? (
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {authError}
              </div>
            ) : null}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
                  Correo electrónico
                  <RequiredMark />
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  className={inputClass(!!errors.email)}
                  {...ariaFor('email', !!errors.email)}
                  {...register('email', {
                    required: 'El correo es obligatorio',
                    pattern: { value: EMAIL_PATTERN, message: 'Correo no válido' },
                  })}
                />
                <FieldError id="email" message={errors.email?.message} />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
                  Contraseña
                  <RequiredMark />
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={inputClass(!!errors.password) + ' pr-10'}
                    {...ariaFor('password', !!errors.password)}
                    {...register('password', { required: 'La contraseña es obligatoria' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                    aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <Icon name={showPwd ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                  </button>
                </div>
                <FieldError id="password" message={errors.password?.message} />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4 rounded border-input accent-primary" {...register('remember')} />
                Mantener sesión iniciada en este equipo
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
                    Verificando…
                  </>
                ) : (
                  'Ingresar a mi clínica'
                )}
              </button>
            </form>

            <DemoCredentialsBox credentials={demoAccounts} onUse={useCredential} />
          </div>
        ) : (
          <RegisterClinicForm onDone={() => setTab('login')} />
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Al continuar aceptas los{' '}
          <Link href="/sign-up-login-screen" className="font-semibold text-primary hover:underline">
            Términos del servicio
          </Link>{' '}
          y la{' '}
          <Link href="/sign-up-login-screen" className="font-semibold text-primary hover:underline">
            Política de privacidad
          </Link>
          , conforme a la Ley Orgánica de Protección de Datos Personales.
        </p>
      </div>
    </section>
  );
}
