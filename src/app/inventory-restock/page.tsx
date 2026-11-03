import React from 'react';
import AppLayout from '@/components/AppLayout';
import ClinicDataGate from '@/components/ClinicDataGate';
import InventoryWorkspace from './components/InventoryWorkspace';

export default function InventoryRestockPage() {
  return (
    <AppLayout>
      <ClinicDataGate module="Inventario">
        <InventoryWorkspace />
      </ClinicDataGate>
    </AppLayout>
  );
}
