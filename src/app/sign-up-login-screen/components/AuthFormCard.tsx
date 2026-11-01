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

  const onSubmit = (values: LoginValues) => {
    setAuthError('');
    setLoading(true);
    // Backend integration: POST /api/auth/login with tenant resolution
    setTimeout(() => {
      const match = demoAccounts.find((a) => a.email === values.email && a.password === values.password);
      setLoading(false);
      if (!match) {
        setAuthError('Credenciales inválidas — usa las cuentas demo de abajo para ingresar');
        return;
      }
      router.push(match.id === 'cred-global' ? '/global-admin-panel' : '/');
    }, 900);
  };

  return (
    <section className="flex items-center justify-center bg-background px-5 py-10 sm:px-10">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-6 flex items-center gap-2 lg:hidden">
          <AppLogo size={36} />
          <span className="text-xl font-bold">DentalCloud</span>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-xl bg-muted p-1" role="tablist">
          {(['login', 'register'] as const).map((t) => (
            <button
              key={`tab-${t}`}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-lg py-2 text-sm font-semibold transition-all duration-150 ${
                tab === t ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'login' ? 'Ingresar' : 'Registrar clínica'}
            </button>
          ))}
        </div>

        {tab === 'login' ? (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold">Bienvenida de nuevo</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ingresa al espacio de trabajo de tu clínica.</p>

            {authError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                <Icon name="ExclamationTriangleIcon" size={18} />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
              <RequiredLegend />
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Correo institucional<RequiredMark /></label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@tuclinica.ec"
                  className={inputClass(!!errors.email)}
                  {...ariaFor('email', !!errors.email)}
                  {...register('email', {
                    required: 'Ingresa tu correo institucional',
                    validate: (v) => EMAIL_PATTERN.test(v.trim()) || 'El formato del correo no es válido',
                  })}
                />
                <FieldError id="email" message={errors.email?.message} />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold">Contraseña<RequiredMark /></label>
                  <button type="button" className="text-xs font-semibold text-primary hover:underline">¿Olvidaste tu contraseña?</button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Mínimo 8 caracteres"
                    className={inputClass(!!errors.password, 'pr-11')}
                    {...ariaFor('password', !!errors.password)}
                    {...register('password', { required: 'Ingresa tu contraseña', minLength: { value: 8, message: 'Debe tener al menos 8 caracteres' } })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
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

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              o continúa con
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Google Workspace', 'Microsoft 365'].map((p) => (
                <button key={`sso-${p}`} className="rounded-lg border border-input bg-card py-2 text-sm font-semibold transition-colors hover:bg-muted active:scale-95">
                  {p}
                </button>
              ))}
            </div>

            <DemoCredentialsBox credentials={demoAccounts} onUse={useCredential} />
          </div>
        ) : (
          <RegisterClinicForm onDone={() => setTab('login')} />
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Al continuar aceptas los <Link href="/sign-up-login-screen" className="font-semibold text-primary hover:underline">Términos del servicio</Link> y la{' '}
          <Link href="/sign-up-login-screen" className="font-semibold text-primary hover:underline">Política de privacidad</Link>, conforme a la Ley Orgánica de Protección de Datos Personales.
        </p>
      </div>
    </section>
  );
}