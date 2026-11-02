import React from 'react';
import AppLayout from '@/components/AppLayout';
import ClinicDataGate from '@/components/ClinicDataGate';
import BillingWorkspace from './components/BillingWorkspace';

export default function BillingStatementsPage() {
  return (
    <AppLayout>
      <ClinicDataGate module="Facturación">
        <BillingWorkspace />
      </ClinicDataGate>
    </AppLayout>
  );
}
