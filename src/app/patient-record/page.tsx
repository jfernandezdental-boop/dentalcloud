import React from 'react';
import AppLayout from '@/components/AppLayout';
import PatientRecordWorkspace from './components/PatientRecordWorkspace';

export default function PatientRecordPage() {
  return (
    <AppLayout>
      <PatientRecordWorkspace />
    </AppLayout>
  );
}
