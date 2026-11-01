import React from 'react';
import PatientFlowChart from './charts/PatientFlowChart';
import IncomeExpenseChart from './charts/IncomeExpenseChart';
import ChairOccupancyChart from './charts/ChairOccupancyChart';

export default function ChartsRow() {
  return (
    <section className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-[1.3fr_1.3fr_0.9fr]">
      <PatientFlowChart />
      <IncomeExpenseChart />
      <div className="lg:col-span-2 2xl:col-span-1">
        <ChairOccupancyChart />
      </div>
    </section>
  );
}