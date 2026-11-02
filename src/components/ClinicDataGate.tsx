'use client';
import React from 'react';
import { useAuth } from '@/components/AuthProvider';

/**
 * Antes ocultaba TODO el contenido en clinicas no-demo (solo EmptyState).
 * Eso dejaba Agenda, Dashboard, etc. en blanco en Estudio dental Vittoria.
 *
 * Ahora siempre muestra el modulo. Los datos de ejemplo del codigo sirven
 * como UI operativa hasta que cada pantalla lea appointments/patients de Supabase.
 * El aislamiento multi-tenant real sigue en Auth + RLS; no se muestran datos
 * de otra clinica desde el cliente.
 */
export default function ClinicDataGate({
  module,
  children,
}: {
  module: string;
  children: React.ReactNode;
}) {
  const { loading } = useAuth();
  if (loading) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted/40" aria-label={`Cargando ${module}`} />;
  }
  return <>{children}</>;
}
