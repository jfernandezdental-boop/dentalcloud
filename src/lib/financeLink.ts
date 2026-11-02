/**
 * Puente proforma aprobada -> finanzas (cliente).
 * Guarda cargos pendientes en localStorage para el modulo de facturacion.
 * Cuando exista RPC/tablas, se puede sustituir por insert en invoices/cargos.
 */

export type FinanceCharge = {
  id: string;
  proformaCode: string;
  patientName: string;
  patientId?: string;
  concept: string;
  total: number;
  paid: number;
  status: 'Pendiente' | 'Parcial' | 'Pagada';
  approvedAt: string;
  source: 'proforma_aprobada';
};

const KEY = 'dentalcloud_finance_charges_v1';

export function listFinanceCharges(): FinanceCharge[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FinanceCharge[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFinanceCharges(list: FinanceCharge[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

/** Al aprobar proforma: crea cargo pendiente si no existe */
export function linkApprovedProformaToFinance(input: {
  proformaCode: string;
  patientName: string;
  patientId?: string;
  concept: string;
  total: number;
  paid?: number;
}): FinanceCharge {
  const list = listFinanceCharges();
  const existing = list.find((c) => c.proformaCode === input.proformaCode);
  if (existing) return existing;

  const charge: FinanceCharge = {
    id: `chg-${Date.now()}`,
    proformaCode: input.proformaCode,
    patientName: input.patientName,
    patientId: input.patientId,
    concept: input.concept,
    total: input.total,
    paid: input.paid ?? 0,
    status: (input.paid ?? 0) > 0 ? 'Parcial' : 'Pendiente',
    approvedAt: new Date().toISOString().slice(0, 10),
    source: 'proforma_aprobada',
  };
  saveFinanceCharges([charge, ...list]);
  return charge;
}
