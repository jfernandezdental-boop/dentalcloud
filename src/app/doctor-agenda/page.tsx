import React from 'react';
import AppLayout from '@/components/AppLayout';
import ClinicDataGate from '@/components/ClinicDataGate';
import AgendaWorkspace from './components/AgendaWorkspace';

export default function DoctorAgendaPage() {
  return (
    <AppLayout>
      <ClinicDataGate module="Agenda del doctor">
        <AgendaWorkspace />
      </ClinicDataGate>
    </AppLayout>
  );
}