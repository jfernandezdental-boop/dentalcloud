'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import AdminHeader from './components/AdminHeader';
import ClinicsTable from './components/ClinicsTable';
import RolesMatrix from './components/RolesMatrix';
import { useAuth } from '@/components/AuthProvider';

export default function GlobalAdminPanelPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/sign-up-login-screen');
      return;
    }
    if (user.role !== 'super_admin') {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'super_admin') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Verificando acceso de administrador global…
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <AdminHeader />
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          Estás en el <strong>panel de plataforma</strong>. No es el escritorio de una clínica
          operativa. La clínica demo no se da de alta ni se prioriza aquí.
        </div>
        <ClinicsTable />
        <div id="usuarios">
          <RolesMatrix />
        </div>
      </div>
    </AppLayout>
  );
}
