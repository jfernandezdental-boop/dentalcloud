import React from 'react';
import AppLayout from '@/components/AppLayout';
import AdminHeader from './components/AdminHeader';
import AdminMetrics from './components/AdminMetrics';
import AdminCharts from './components/AdminCharts';
import ClinicsTable from './components/ClinicsTable';
import RolesMatrix from './components/RolesMatrix';

export default function GlobalAdminPanelPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <AdminHeader />
        <AdminMetrics />
        <AdminCharts />
        <ClinicsTable />
        <RolesMatrix />
      </div>
    </AppLayout>
  );
}