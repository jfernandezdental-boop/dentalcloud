import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardHeader from './components/DashboardHeader';
import DashboardBody from './components/DashboardBody';

export default function ClinicDashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <DashboardHeader />
        <DashboardBody />
      </div>
    </AppLayout>
  );
}
