import React from 'react';
import AppLayout from '@/components/AppLayout';
import ClinicDataGate from '@/components/ClinicDataGate';
import PatientHeader from './components/PatientHeader';
import PatientTabs from './components/PatientTabs';

export default function PatientRecordPage() {
  return (
    <AppLayout>
      <ClinicDataGate module="Ficha del paciente">
        <div className="space-y-5">
          <PatientHeader />
          <PatientTabs />
        </div>
      </ClinicDataGate>
    </AppLayout>
  );
}