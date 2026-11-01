'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import AdminHeader from './components/AdminHeader';
import ClinicsTable from './components/ClinicsTable';
import RolesMatrix from './components/RolesMatrix';
import SeedDemoButton from './components/SeedDemoButton';
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
        Verificando acceso de administrador global...
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <AdminHeader />
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          Panel de <strong>plataforma</strong>. La clinica demo se puede crear abajo; no se prioriza
          en el ranking de tenants.
        </div>
        <SeedDemoButton />
        <ClinicsTable />
        <div id="usuarios">
          <RolesMatrix />
        </div>
      </div>
    </AppLayout>
  );
}
