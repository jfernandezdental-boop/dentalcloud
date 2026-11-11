import React from 'react';
import AppLayout from '@/components/AppLayout';
import ClinicDataGate from '@/components/ClinicDataGate';
import AestheticsWorkspace from './components/AestheticsWorkspace';

export default function AestheticsPage() {
  return (
    <AppLayout>
      <ClinicDataGate module="Estética facial">
        <AestheticsWorkspace />
      </ClinicDataGate>
    </AppLayout>
  );
}
