import React from 'react';
import AppLayout from '@/components/AppLayout';
import ClinicDataGate from '@/components/ClinicDataGate';
import AgendaSwitch from './components/AgendaSwitch';

export default function DoctorAgendaPage() {
  return (
    <AppLayout>
      <ClinicDataGate module="Agenda del doctor">
        <AgendaSwitch />
      </ClinicDataGate>
    </AppLayout>
  );
}
