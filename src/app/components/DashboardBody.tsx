'use client';
import React from 'react';
import MetricsBentoGrid from './MetricsBentoGrid';
import ChartsRow from './ChartsRow';
import WaitingRoomPanel from './WaitingRoomPanel';
import ModuleTabs from './ModuleTabs';

/** Dashboard clínico completo: métricas, gráficos, módulos y sala de espera. */
export default function DashboardBody() {
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
