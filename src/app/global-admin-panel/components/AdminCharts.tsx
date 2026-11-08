import React from 'react';
import PatientFlowGlobalChart from './charts/PatientFlowGlobalChart';
import TopClinicsChart from './charts/TopClinicsChart';
import type { PlatformOverview } from '@/lib/supabase/usePlatformOverview';

export default function AdminCharts({ data }: { data: PlatformOverview | null }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <PatientFlowGlobalChart data={data?.weekly ?? []} />
      <TopClinicsChart data={data?.top_clinics ?? []} />
    </section>
  );
}
