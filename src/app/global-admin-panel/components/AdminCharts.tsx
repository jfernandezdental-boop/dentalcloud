import React from 'react';
import PatientFlowGlobalChart from './charts/PatientFlowGlobalChart';
import TopClinicsChart from './charts/TopClinicsChart';
import type { PlatformOverview } from '@/lib/supabase/usePlatformOverview';

export default function AdminCharts({ overview }: { overview: PlatformOverview }) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <PatientFlowGlobalChart data={overview.weekly_flow} />
      <TopClinicsChart data={overview.top_clinics} />
    </section>
  );
}
