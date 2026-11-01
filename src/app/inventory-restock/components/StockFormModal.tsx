'use client';
import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { FieldError, RequiredLegend, RequiredMark, ariaFor, inputClass } from '@/components/ui/FormField';
import { todayISO } from '@/lib/validators';
import { InventoryItem, accounts, categories, money } from './inventoryData';

export interface RestockPayload {
  itemId: string;
  qty: number;
  unitCost: number;
  supplier: string;
  invoiceRef: string;
  date: string;
}

export interface NewItemPayload {
  sku: string;
  name: string;
  category: string;
  supplier: string;
  unit: string;
  min: number;
  qty: number;
  unitCost: number;
  account: string;
  expiry: string;
  invoiceRef: string;
}

interface StockFormModalProps {
  open: boolean;
  mode: 'restock' | 'new';
  item: InventoryItem | null;
  items: InventoryItem[];
  onClose: () => void;
  onRestock: (payload: RestockPayload) => void;
  onCreate: (payload: NewItemPayload) => void;
}

type Errors = Record<string, string>;

const INVOICE_PATTERN = /^\d{3}-\d{3}-\d{9}$/;

export default function StockFormModal({ open, mode, item, items, onClose, onRestock, onCreate }: StockFormModalProps) {
  const [itemId, setItemId] = useState('');
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [unit, setUnit] = useState('');
  const [min, setMin] = useState('');
  const [account, setAccount] = useState(accounts[0].code);
  const [expiry, setExpiry] = useState('');
  const [qty, setQty] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [supplier, setSupplier] = useState('');
  const [invoiceRef, setInvoiceRef] = useState('');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSku('');
    setName('');
    setCategory(categories[0]);
    setUnit('');
    setMin('');
    setAccount(accounts[0].code);
    setExpiry('');
    setQty('');
    setInvoiceRef('');
    setDate(todayISO());
    if (mode === 'restock' && item) {
      setItemId(item.id);
      setUnitCost(String(item.unitCost));
      setSupplier(item.supplier);
    } else {
      setItemId(items[0]?.id ?? '');
      setUnitCost('');
      setSupplier('');
    }
  }, [open, mode, item, items]);

  const selected = items.find((i) => i.id === itemId) ?? null;
  const qtyNum = Number(qty);
  const costNum = Number(unitCost);
  const total = Number.isFinite(qtyNum) && Number.isFinite(costNum) ? qtyNum * costNum : 0;

  const handleItemChange = (id: string) => {
    setItemId(id);
    const found = items.find((i) => i.id === id);
    if (found) {
      setUnitCost(String(found.unitCost));
      setSupplier(found.supplier);
    }
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (mode === 'new') {
      if (!sku.trim()) e.sku = 'El SKU es obligatorio';
      else if (!/^[A-Z0-9-]{4,20}$/.test(sku.trim().toUpperCase())) e.sku = 'Use 4 a 20 caracteres: letras, números o guiones';
      else if (items.some((i) => i.sku === sku.trim().toUpperCase())) e.sku = 'Ya existe un insumo con este SKU';
      if (!name.trim()) e.name = 'El nombre del insumo es obligatorio';
      else if (name.trim().length < 3) e.name = 'El nombre debe tener al menos 3 caracteres';
      if (!unit.trim()) e.unit = 'La unidad de medida es obligatoria';
      if (min === '') e.min = 'El stock mínimo es obligatorio';
      else if (!Number.isInteger(Number(min)) || Number(min) < 0) e.min = 'Ingrese un entero mayor o igual a 0';
      if (expiry && expiry < todayISO()) e.expiry = 'La fecha de caducidad no puede ser pasada';
    } else if (!itemId) {
      e.itemId = 'Seleccione un insumo';
    }
    if (qty === '') e.qty = 'La cantidad es obligatoria';
    else if (!Number.isInteger(qtyNum) || qtyNum <= 0) e.qty = 'Ingrese un entero mayor a 0';
    if (unitCost === '') e.unitCost = 'El costo unitario es obligatorio';
    else if (!Number.isFinite(costNum) || costNum <= 0) e.unitCost = 'Ingrese un costo mayor a 0';
    if (!supplier.trim()) e.supplier = 'El proveedor es obligatorio';
    if (!invoiceRef.trim()) e.invoiceRef = 'La factura de compra es obligatoria para contabilidad';
    else if (!INVOICE_PATTERN.test(invoiceRef.trim())) e.invoiceRef = 'Formato: 001-001-000000123';
    if (mode === 'restock') {
      if (!date) e.date = 'La fecha es obligatoria';
      else if (date > todayISO()) e.date = 'La fecha no puede ser futura';
    }
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (mode === 'restock') {
      onRestock({ itemId, qty: qtyNum, unitCost: costNum, supplier: supplier.trim(), invoiceRef: invoiceRef.trim(), date });
    } else {
      onCreate({
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category,
        supplier: supplier.trim(),
        unit: unit.trim(),
        min: Number(min),
        qty: qtyNum,
        unitCost: costNum,
        account,
        expiry,
        invoiceRef: invoiceRef.trim(),
      });
    }
  };

  const title = mode === 'restock' ? 'Reabastecer insumo' : 'Nuevo insumo de inventario';
  const subtitle =
    mode === 'restock' ? 'Registra la compra y suma el stock. Se asienta en la cuenta de inventario.' : 'Da de alta el insumo con su compra inicial y cuenta contable.';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted">
            Cancelar
          </button>
          <button
            type="submit"
            form="stock-form"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            {mode === 'restock' ? 'Registrar compra' : 'Crear insumo'}
          </button>
        </>
      }
    >
      <form id="stock-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        <RequiredLegend />

        {mode === 'restock' ? (
          <div>
            <label htmlFor="rs-item" className="mb-1 block text-sm font-medium">Insumo<RequiredMark /></label>
            <select id="rs-item" value={itemId} onChange={(e) => handleItemChange(e.target.value)} className={inputClass(!!errors.itemId)} {...ariaFor('rs-item', !!errors.itemId)}>
              {items.map((i) => (
                <option key={`rs-opt-${i.id}`} value={i.id}>{i.name} — stock {i.stock}</option>
              ))}
            </select>
            <FieldError id="rs-item" message={errors.itemId} />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ni-sku" className="mb-1 block text-sm font-medium">SKU<RequiredMark /></label>
              <input id="ni-sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="ANE-ART-04" className={inputClass(!!errors.sku, 'uppercase')} {...ariaFor('ni-sku', !!errors.sku)} />
              <FieldError id="ni-sku" message={errors.sku} />
            </div>
            <div>
              <label htmlFor="ni-cat" className="mb-1 block text-sm font-medium">Categoría<RequiredMark /></label>
              <select id="ni-cat" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass(false)}>
                {categories.map((c) => (
                  <option key={`ni-cat-${c}`} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="ni-name" className="mb-1 block text-sm font-medium">Nombre del insumo<RequiredMark /></label>
              <input id="ni-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Anestesia articaína 4 % con epinefrina" className={inputClass(!!errors.name)} {...ariaFor('ni-name', !!errors.name)} />
              <FieldError id="ni-name" message={errors.name} />
            </div>
            <div>
              <label htmlFor="ni-unit" className="mb-1 block text-sm font-medium">Unidad de medida<RequiredMark /></label>
              <input id="ni-unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="cajas ×50" className={inputClass(!!errors.unit)} {...ariaFor('ni-unit', !!errors.unit)} />
              <FieldError id="ni-unit" message={errors.unit} />
            </div>
            <div>
              <label htmlFor="ni-min" className="mb-1 block text-sm font-medium">Stock mínimo<RequiredMark /></label>
              <input id="ni-min" type="number" min={0} step={1} value={min} onChange={(e) => setMin(e.target.value)} placeholder="5" className={inputClass(!!errors.min)} {...ariaFor('ni-min', !!errors.min)} />
              <FieldError id="ni-min" message={errors.min} />
            </div>
            <div>
              <label htmlFor="ni-acc" className="mb-1 block text-sm font-medium">Cuenta contable<RequiredMark /></label>
              <select id="ni-acc" value={account} onChange={(e) => setAccount(e.target.value)} className={inputClass(false)}>
                {accounts.map((a) => (
                  <option key={`ni-acc-${a.code}`} value={a.code}>{a.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ni-exp" className="mb-1 block text-sm font-medium">Caducidad</label>
              <input id="ni-exp" type="date" min={todayISO()} value={expiry} onChange={(e) => setExpiry(e.target.value)} className={inputClass(!!errors.expiry)} {...ariaFor('ni-exp', !!errors.expiry)} />
              <FieldError id="ni-exp" message={errors.expiry} />
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="rs-qty" className="mb-1 block text-sm font-medium">{mode === 'new' ? 'Cantidad inicial' : 'Cantidad a ingresar'}<RequiredMark /></label>
            <input id="rs-qty" type="number" min={1} step={1} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="10" className={inputClass(!!errors.qty)} {...ariaFor('rs-qty', !!errors.qty)} />
            <FieldError id="rs-qty" message={errors.qty} />
          </div>
          <div>
            <label htmlFor="rs-cost" className="mb-1 block text-sm font-medium">Costo unitario (USD)<RequiredMark /></label>
            <input id="rs-cost" type="number" min={0} step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="0.00" className={inputClass(!!errors.unitCost)} {...ariaFor('rs-cost', !!errors.unitCost)} />
            <FieldError id="rs-cost" message={errors.unitCost} />
          </div>
          {mode === 'restock' && (
            <div>
              <label htmlFor="rs-date" className="mb-1 block text-sm font-medium">Fecha de compra<RequiredMark /></label>
              <input id="rs-date" type="date" max={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass(!!errors.date)} {...ariaFor('rs-date', !!errors.date)} />
              <FieldError id="rs-date" message={errors.date} />
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rs-sup" className="mb-1 block text-sm font-medium">Proveedor<RequiredMark /></label>
            <input id="rs-sup" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Dental Andina S.A." className={inputClass(!!errors.supplier)} {...ariaFor('rs-sup', !!errors.supplier)} />
            <FieldError id="rs-sup" message={errors.supplier} />
          </div>
          <div>
            <label htmlFor="rs-inv" className="mb-1 block text-sm font-medium">Factura de compra<RequiredMark /></label>
            <input id="rs-inv" value={invoiceRef} onChange={(e) => setInvoiceRef(e.target.value)} placeholder="001-001-000000123" className={inputClass(!!errors.invoiceRef)} {...ariaFor('rs-inv', !!errors.invoiceRef)} />
            <FieldError id="rs-inv" message={errors.invoiceRef} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            {mode === 'restock' && selected ? `Stock resultante: ${selected.stock + (Number.isInteger(qtyNum) && qtyNum > 0 ? qtyNum : 0)} ${selected.unit}` : 'Asiento de inventario'}
          </span>
          <span className="tabular font-bold">Total a registrar: {money(total > 0 ? total : 0)}</span>
        </div>
      </form>
    </Modal>
  );
}
