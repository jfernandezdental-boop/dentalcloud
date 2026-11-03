import React from 'react';
import AppLayout from '@/components/AppLayout';
import ClinicDataGate from '@/components/ClinicDataGate';
import OdontogramWorkspace from './components/OdontogramWorkspace';

export default function InteractiveOdontogramPage() {
  return (
    <AppLayout>
      <ClinicDataGate module="Odontograma">
        <OdontogramWorkspace />
      </ClinicDataGate>
    </AppLayout>
  );
}
