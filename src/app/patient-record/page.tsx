import React from 'react';
import AppLayout from '@/components/AppLayout';
import PatientHeader from './components/PatientHeader';
import PatientTabs from './components/PatientTabs';

export default function PatientRecordPage() {
  return (
    <AppLayout>
      <div className="space-y-5">
        <PatientHeader />
        <PatientTabs />
      </div>
    </AppLayout>
  );
}