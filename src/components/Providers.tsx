'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import { canAccessPath } from '@/lib/supabase/roles';

const PUBLIC = ['/sign-up-login-screen'];

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Cargando">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

/**
 * Compuerta de acceso: ninguna pantalla de la clinica se pinta (ni en el HTML del servidor ni en el
 * navegador) hasta confirmar una sesion valida con permiso para esa ruta. Sin sesion -> solo el login.
 */
function Gate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname() || '/';
  const isPublic = PUBLIC.some((p) => pathname.startsWith(p));
  if (isPublic) return <>{children}</>;
  if (loading || !user) return <Splash />;
  if (!canAccessPath(user.role, pathname)) return <Splash />;
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Gate>{children}</Gate>
    </AuthProvider>
  );
}
