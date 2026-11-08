'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import AdminHeader from './components/AdminHeader';
import AdminMetrics from './components/AdminMetrics';
import AdminCharts from './components/AdminCharts';
import ClinicsTable from './components/ClinicsTable';
import RolesMatrix from './components/RolesMatrix';
import UsersModule from './components/UsersModule';
import { useAuth } from '@/components/AuthProvider';
import { usePlatformOverview } from '@/lib/supabase/usePlatformOverview';

export default function GlobalAdminPanelPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const overview = usePlatformOverview(!loading && user?.role === 'super_admin');

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
          Panel de <strong>plataforma</strong>. Todos los datos de esta pantalla son reales y vienen de Supabase.
        </div>
        {overview.error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">{overview.error}</div>
        ) : null}
        <AdminMetrics data={overview.data} />
        <AdminCharts data={overview.data} />
        <ClinicsTable />
        <div id="usuarios">
          <UsersModule />
        </div>
        <RolesMatrix />
      </div>
    </AppLayout>
  );
}
