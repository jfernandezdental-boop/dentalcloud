/**
 * Puente proforma aprobada -> finanzas (cliente).
 * Al crear el cargo/factura desde una proforma copia:
 *   patient_id, guest_name, guest_phone del presupuesto.
 */

export type FinanceCharge = {
  id: string;
  proformaCode: string;
  patientName: string;
  patientId?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
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

/**
 * Al aprobar proforma / crear factura: crea cargo pendiente si no existe.
 * Copia patient_id, guest_name y guest_phone del presupuesto.
 */
export function linkApprovedProformaToFinance(input: {
  proformaCode: string;
  patientName: string;
  patientId?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  concept: string;
  total: number;
  paid?: number;
}): FinanceCharge {
  const list = listFinanceCharges();
  const existing = list.find((c) => c.proformaCode === input.proformaCode);
  if (existing) {
    // Actualiza datos de paciente/guest si llegaron después (ej. al registrar ficha)
    const merged: FinanceCharge = {
      ...existing,
      patientId: input.patientId ?? existing.patientId,
      guestName: input.guestName ?? existing.guestName,
      guestPhone: input.guestPhone ?? existing.guestPhone,
      patientName: input.patientName || existing.patientName,
    };
    saveFinanceCharges(list.map((c) => (c.proformaCode === input.proformaCode ? merged : c)));
    return merged;
  }

  const displayName =
    input.patientName ||
    input.guestName ||
    (input.guestPhone ? `Cliente ${input.guestPhone}` : 'Cliente proforma');

  const charge: FinanceCharge = {
    id: `chg-${Date.now()}`,
    proformaCode: input.proformaCode,
    patientName: displayName,
    patientId: input.patientId ?? null,
    guestName: input.guestName ?? null,
    guestPhone: input.guestPhone ?? null,
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

/**
 * Payload listo para insertar en tabla invoices (Supabase),
 * copiando patient_id / guest del presupuesto.
 */
export function invoicePayloadFromProforma(input: {
  clinicId: string;
  proformaCode: string;
  patientId?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  concept: string;
  total: number;
  paid?: number;
  date?: string;
}) {
  return {
    clinic_id: input.clinicId,
    proforma_code: input.proformaCode,
    patient_id: input.patientId ?? null,
    guest_name: input.guestName ?? null,
    guest_phone: input.guestPhone ?? null,
    concept: input.concept,
    total: input.total,
    paid: input.paid ?? 0,
    date: input.date || new Date().toISOString().slice(0, 10),
    status: (input.paid ?? 0) >= input.total ? 'Pagada' : (input.paid ?? 0) > 0 ? 'Parcial' : 'Pendiente',
  };
}
