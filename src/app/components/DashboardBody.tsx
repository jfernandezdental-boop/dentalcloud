'use client';
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import MetricsBentoGrid from './MetricsBentoGrid';
import ChartsRow from './ChartsRow';
import WaitingRoomPanel from './WaitingRoomPanel';
import ModuleTabs from './ModuleTabs';

/** Clinica demo: maqueta completa. Clinica real: solo lo conectado a la base (Laboratorio). */
export default function DashboardBody() {
  const { user } = useAuth();
  if (user?.clinicIsDemo) {
    return (
      <>
        <MetricsBentoGrid />
        <ChartsRow />
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <ModuleTabs />
          <WaitingRoomPanel />
        </div>
      </>
    );
  }
  return <ModuleTabs realOnly />;
}
