export type InvoiceStatus = 'Pagada' | 'Parcial' | 'Pendiente' | 'Vencida';

export interface Invoice {
  id: string;
  number: string;
  patientId: string;
  patient: string;
  issuedAt: string;
  dueAt: string;
  treatment: string;
  proforma: string;
  total: number;
  paid: number;
  status: InvoiceStatus;
}

export interface Receipt {
  id: string;
  number: string;
  patient: string;
  date: string;
  method: string;
  invoiceNumber: string;
  concept: string;
  amount: number;
}

export interface Proforma {
  code: string;
  patient: string;
  treatment: string;
  approved: number;
  invoiced: number;
  collected: number;
}

export const invoices: Invoice[] = [
  { id: 'inv-001', number: 'FAC 001-001-000004812', patientId: 'pac-0412', patient: 'Andrea Villacís Toapanta', issuedAt: '2026-10-31', dueAt: '2026-10-31', treatment: 'Profilaxis y flúor', proforma: 'PRF-2026-0402', total: 45, paid: 45, status: 'Pagada' },
  { id: 'inv-002', number: 'FAC 001-001-000004809', patientId: 'pac-0388', patient: 'Marco Tulio Cevallos', issuedAt: '2026-10-31', dueAt: '2026-11-15', treatment: 'Endodoncia pieza 36', proforma: 'PRF-2026-0390', total: 370, paid: 185, status: 'Parcial' },
  { id: 'inv-003', number: 'FAC 001-001-000004801', patientId: 'pac-0501', patient: 'Valentina Carrión Paredes', issuedAt: '2026-10-28', dueAt: '2026-11-12', treatment: 'Control de ortodoncia', proforma: 'PRF-2026-0377', total: 60, paid: 60, status: 'Pagada' },
  { id: 'inv-004', number: 'FAC 001-001-000004788', patientId: 'pac-0345', patient: 'Mónica Altamirano', issuedAt: '2026-10-19', dueAt: '2026-10-29', treatment: 'Blanqueamiento sesión 1', proforma: 'PRF-2026-0361', total: 140, paid: 0, status: 'Vencida' },
  { id: 'inv-005', number: 'FAC 001-001-000004771', patientId: 'pac-0489', patient: 'Felipe Guamán Chicaiza', issuedAt: '2026-10-22', dueAt: '2026-11-21', treatment: 'Resina compuesta piezas 14 y 15', proforma: 'PRF-2026-0384', total: 95, paid: 0, status: 'Pendiente' },
  { id: 'inv-006', number: 'FAC 001-001-000004577', patientId: 'pac-0412', patient: 'Andrea Villacís Toapanta', issuedAt: '2026-10-03', dueAt: '2026-10-03', treatment: 'Consulta y radiografías', proforma: 'PRF-2026-0355', total: 30, paid: 30, status: 'Pagada' },
  { id: 'inv-007', number: 'FAC 001-001-000004702', patientId: 'pac-0388', patient: 'Marco Tulio Cevallos', issuedAt: '2026-09-14', dueAt: '2026-09-24', treatment: 'Limpieza profunda', proforma: 'PRF-2026-0338', total: 80, paid: 40, status: 'Vencida' },
];

export const receipts: Receipt[] = [
  { id: 'rec-001', number: 'REC 000224', patient: 'Andrea Villacís Toapanta', date: '2026-10-31', method: 'Tarjeta crédito', invoiceNumber: 'FAC 001-001-000004812', concept: 'Pago total profilaxis y flúor', amount: 45 },
  { id: 'rec-002', number: 'REC 000223', patient: 'Marco Tulio Cevallos', date: '2026-10-31', method: 'Transferencia', invoiceNumber: 'FAC 001-001-000004809', concept: 'Cuota 1/2 PRF-2026-0390', amount: 185 },
  { id: 'rec-003', number: 'REC 000222', patient: 'Valentina Carrión Paredes', date: '2026-10-28', method: 'Efectivo', invoiceNumber: 'FAC 001-001-000004801', concept: 'Pago control de ortodoncia', amount: 60 },
  { id: 'rec-004', number: 'REC 000221', patient: 'Marco Tulio Cevallos', date: '2026-10-17', method: 'Transferencia', invoiceNumber: 'FAC 001-001-000004702', concept: 'Abono limpieza profunda', amount: 40 },
  { id: 'rec-005', number: 'REC 000219', patient: 'Andrea Villacís Toapanta', date: '2026-10-03', method: 'Efectivo', invoiceNumber: 'FAC 001-001-000004577', concept: 'Pago consulta y radiografías', amount: 30 },
];

export const proformas: Proforma[] = [
  { code: 'PRF-2026-0390', patient: 'Marco Tulio Cevallos', treatment: 'Endodoncia pieza 36 + corona', approved: 370, invoiced: 370, collected: 185 },
  { code: 'PRF-2026-0384', patient: 'Felipe Guamán Chicaiza', treatment: 'Resina compuesta piezas 14 y 15', approved: 95, invoiced: 95, collected: 0 },
  { code: 'PRF-2026-0377', patient: 'Valentina Carrión Paredes', treatment: 'Ortodoncia — control mensual', approved: 720, invoiced: 60, collected: 60 },
  { code: 'PRF-2026-0361', patient: 'Mónica Altamirano', treatment: 'Blanqueamiento (2 sesiones)', approved: 280, invoiced: 140, collected: 0 },
];

export const statusTone: Record<InvoiceStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  Pagada: 'success',
  Parcial: 'info',
  Pendiente: 'warning',
  Vencida: 'danger',
};

export function money(value: number): string {
  const fixed = value.toFixed(2);
  const [int, dec] = fixed.split('.');
  return `$${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`;
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
