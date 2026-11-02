'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/components/AuthProvider';

/**
 * Los modulos de esta app todavia son maquetas con datos de ejemplo escritos en el codigo
 * (no estan conectados a la base). Esos datos de ejemplo SOLO se muestran en la clinica de
 * demostracion; cualquier clinica real ve un estado vacio y limpio, nunca datos de otra.
 */
export default function ClinicDataGate({ module, children }: { module: string; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-muted/40" />;
  if (user?.clinicIsDemo) return <>{children}</>;
  return (
    <EmptyState
      icon={<Icon name="CubeIcon" size={24} />}
      title={`${module}: aún sin datos`}
      description={`Tu clínica${user?.clinicName ? ` (${user.clinicName})` : ''} está lista. Este módulo todavía no tiene información registrada y se conectará a los datos de tu clínica.`}
    />
  );
}
