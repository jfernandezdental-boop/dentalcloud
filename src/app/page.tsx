import React from 'react';
import AppLayout from '@/components/AppLayout';
import ClinicDataGate from '@/components/ClinicDataGate';
import DashboardHeader from './components/DashboardHeader';
import MetricsBentoGrid from './components/MetricsBentoGrid';
import ChartsRow from './components/ChartsRow';
import WaitingRoomPanel from './components/WaitingRoomPanel';
import ModuleTabs from './components/ModuleTabs';

export default function ClinicDashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <DashboardHeader />
        <ClinicDataGate module="Dashboard">
          <MetricsBentoGrid />
          <ChartsRow />
          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <ModuleTabs />
            <WaitingRoomPanel />
          </div>
        </ClinicDataGate>
      </div>
    </AppLayout>
  );
}