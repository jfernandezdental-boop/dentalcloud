import React from 'react';
import PatientFlowGlobalChart from './charts/PatientFlowGlobalChart';
import TopClinicsChart from './charts/TopClinicsChart';

export default function AdminCharts() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <PatientFlowGlobalChart />
      <TopClinicsChart />
    </section>
  );
}