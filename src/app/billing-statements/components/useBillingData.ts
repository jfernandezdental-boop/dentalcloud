'use client';
import { useAuth } from '@/components/AuthProvider';
import {
  invoices as demoInvoices,
  receipts as demoReceipts,
  proformas as demoProformas,
} from './billingData';

/**
 * Datos de Facturación.
 * Los ejemplos de billingData.ts son SOLO para la clínica demo (msp_code MSP-DEMO-*).
 * Una clínica real nace vacía: nunca se le muestran datos de ejemplo.
 */
export function useBillingData() {
  const { user } = useAuth();
  const demo = !!user?.clinicIsDemo;
  return {
    demo,
    invoices: demo ? demoInvoices : [],
    receipts: demo ? demoReceipts : [],
    proformas: demo ? demoProformas : [],
  };
}
