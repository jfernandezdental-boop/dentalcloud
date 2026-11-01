export type StockStatus = 'Agotado' | 'Bajo' | 'Óptimo';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  supplier: string;
  stock: number;
  min: number;
  unit: string;
  unitCost: number;
  account: string;
  expiry: string;
}

export interface Movement {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  qty: number;
  unitCost: number;
  supplier: string;
  invoiceRef: string;
  account: string;
  type: 'Compra' | 'Alta de ítem';
}

export const categories = ['Anestesia', 'Restauración', 'Bioseguridad', 'Endodoncia', 'Cementos', 'Impresión'];

export const accounts: { code: string; label: string }[] = [
  { code: '1.1.3.01', label: '1.1.3.01 · Inventario de insumos clínicos' },
  { code: '1.1.3.02', label: '1.1.3.02 · Inventario de bioseguridad' },
  { code: '1.1.3.03', label: '1.1.3.03 · Inventario de laboratorio' },
];

export const initialItems: InventoryItem[] = [
  { id: 'itm-001', sku: 'ANE-LID-02', name: 'Anestesia lidocaína 2 % con epinefrina', category: 'Anestesia', supplier: 'Dental Andina S.A.', stock: 4, min: 10, unit: 'cajas ×50', unitCost: 38.5, account: '1.1.3.01', expiry: '2027-02-14' },
  { id: 'itm-002', sku: 'RES-A2-FIL', name: 'Resina Filtek Z350 A2', category: 'Restauración', supplier: 'Dental Andina S.A.', stock: 2, min: 5, unit: 'jeringas', unitCost: 53.2, account: '1.1.3.01', expiry: '2027-08-09' },
  { id: 'itm-003', sku: 'GUA-NIT-M', name: 'Guantes de nitrilo talla M', category: 'Bioseguridad', supplier: 'MediPro Ecuador', stock: 18, min: 12, unit: 'cajas ×100', unitCost: 9.8, account: '1.1.3.02', expiry: '2028-05-30' },
  { id: 'itm-004', sku: 'ENDO-K15', name: 'Limas K 15–40 (25 mm)', category: 'Endodoncia', supplier: 'Odonto Import Cía. Ltda.', stock: 7, min: 6, unit: 'estuches', unitCost: 14.75, account: '1.1.3.01', expiry: '' },
  { id: 'itm-005', sku: 'SEL-CEM-IV', name: 'Ionómero de vidrio cemento', category: 'Cementos', supplier: 'Odonto Import Cía. Ltda.', stock: 3, min: 4, unit: 'kits', unitCost: 46, account: '1.1.3.01', expiry: '2026-11-21' },
  { id: 'itm-006', sku: 'MAS-N95', name: 'Mascarilla N95', category: 'Bioseguridad', supplier: 'MediPro Ecuador', stock: 26, min: 20, unit: 'cajas ×20', unitCost: 21.4, account: '1.1.3.02', expiry: '2029-01-12' },
  { id: 'itm-007', sku: 'ALG-CRO-500', name: 'Alginato cromático 500 g', category: 'Impresión', supplier: 'Dental Andina S.A.', stock: 0, min: 4, unit: 'bolsas', unitCost: 12.9, account: '1.1.3.03', expiry: '2026-12-05' },
];

export const initialMovements: Movement[] = [
  { id: 'mov-001', date: '2026-10-29', itemId: 'itm-003', itemName: 'Guantes de nitrilo talla M', qty: 10, unitCost: 9.8, supplier: 'MediPro Ecuador', invoiceRef: 'FAC 002-001-000018734', account: '1.1.3.02', type: 'Compra' },
  { id: 'mov-002', date: '2026-10-24', itemId: 'itm-006', itemName: 'Mascarilla N95', qty: 12, unitCost: 21.4, supplier: 'MediPro Ecuador', invoiceRef: 'FAC 002-001-000018610', account: '1.1.3.02', type: 'Compra' },
  { id: 'mov-003', date: '2026-10-18', itemId: 'itm-001', itemName: 'Anestesia lidocaína 2 % con epinefrina', qty: 6, unitCost: 38.5, supplier: 'Dental Andina S.A.', invoiceRef: 'FAC 001-003-000005521', account: '1.1.3.01', type: 'Compra' },
];

export function stockStatus(item: InventoryItem): StockStatus {
  if (item.stock <= 0) return 'Agotado';
  if (item.stock < item.min) return 'Bajo';
  return 'Óptimo';
}

export const statusTone: Record<StockStatus, 'danger' | 'warning' | 'success'> = {
  Agotado: 'danger',
  Bajo: 'warning',
  Óptimo: 'success',
};

export function money(value: number): string {
  const fixed = value.toFixed(2);
  const [int, dec] = fixed.split('.');
  return `$${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`;
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
