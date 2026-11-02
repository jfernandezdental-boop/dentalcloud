'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';
import Link from 'next/link';
import RegisterClinicForm from './RegisterClinicForm';
import { FieldError, RequiredMark, RequiredLegend, inputClass, ariaFor } from '@/components/ui/FormField';
import { isValidEmail } from '@/lib/validators';
import { signInAndResolveHome } from '@/lib/supabase/auth';
import { hasSupabaseEnv } from '@/lib/supabase/client';

interface LoginValues {
  email: string;
  password: string;
}

export default function AuthFormCard() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [fails, setFails] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ defaultValues: { email: '', password: '' } });


  const onSubmit = async (values: LoginValues) => {
    setAuthError('');
    if (Date.now() < lockUntil) {
      setAuthError(`Demasiados intentos. Espera ${Math.ceil((lockUntil - Date.now()) / 1000)} segundos.`);
      return;
    }
    if (!hasSupabaseEnv()) {
      console.error('[config] Faltan variables NEXT_PUBLIC_SUPABASE_*');
      setAuthError('Servicio no disponible por el momento. Intenta mas tarde.');
      return;
    }
    setLoading(true);
    try {
      const { href } = await signInAndResolveHome({
        email: values.email,
        password: values.password,
      });
      router.push(href);
      router.refresh();
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : 'No se pudo iniciar sesion');
      const n = fails + 1;
      setFails(n);
      if (n >= 5) {
        setLockUntil(Date.now() + 30_000);
        setFails(0);
      }
    } finally {
      setLoading(false);
    }
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
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-lg py-2 text-sm font-semibold transition-all duration-150 ${
                tab === t ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'login' ? 'Ingresar' : 'Registrar clinica'}
            </button>
          ))}
        </div>

        {tab === 'login' ? (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold">Bienvenido de nuevo</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ingresa con tu correo y contrasena.
            </p>

            {authError ? (
              <div
                className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                role="alert"
              >
                <Icon name="ExclamationTriangleIcon" size={18} />
                <span>{authError}</span>
              </div>
            ) : null}


            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
              <RequiredLegend />
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
                  Correo electronico
                  <RequiredMark />
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@tuclinica.ec"
                  className={inputClass(!!errors.email)}
                  {...ariaFor('email', !!errors.email)}
                  {...register('email', {
                    required: 'Ingresa tu correo',
                    validate: (v) => isValidEmail(v) || 'El formato del correo no es valido',
                  })}
                />
                <FieldError id="email" message={errors.email?.message} />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold">
                    Contrasena
                    <RequiredMark />
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={inputClass(!!errors.password, 'pr-11')}
                    {...ariaFor('password', !!errors.password)}
                    {...register('password', {
                      required: 'Ingresa tu contrasena',
                      minLength: { value: 8, message: 'Debe tener al menos 8 caracteres' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    aria-label={showPwd ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Icon name={showPwd ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                  </button>
                </div>
                <FieldError id="password" message={errors.password?.message} />
              </div>


              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Ingresar a mi clinica'
                )}
              </button>
            </form>

          </div>
        ) : (
          <RegisterClinicForm onDone={() => setTab('login')} />
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Al continuar aceptas los terminos del servicio y la politica de privacidad (LOPDP).
        </p>
      </div>
    </section>
  );
}
