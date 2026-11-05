'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import MetricCard from '@/components/ui/MetricCard';
import Toast from '@/components/ui/Toast';
import { useAuth } from '@/components/AuthProvider';
import { todayISO } from '@/lib/validators';
import StockTable from './StockTable';
import MovementsList from './MovementsList';
import StockFormModal, { NewItemPayload, RestockPayload } from './StockFormModal';
import { InventoryItem, Movement, initialItems, initialMovements, stockStatus, money, accounts } from './inventoryData';

type TabId = 'stock' | 'movements';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'stock', label: 'Niveles de stock', icon: 'CubeIcon' },
  { id: 'movements', label: 'Compras y movimientos', icon: 'ArrowPathIcon' },
];

export default function InventoryWorkspace() {
  const [tab, setTab] = useState<TabId>('stock');
  const { user } = useAuth();
  const isDemo = !!user?.clinicIsDemo;
  // Una clínica real nace vacía; los ejemplos de inventoryData.ts son solo para la clínica demo.
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  useEffect(() => {
    if (isDemo) {
      setItems(initialItems);
      setMovements(initialMovements);
    }
  }, [isDemo]);
  const [modal, setModal] = useState<{ open: boolean; mode: 'restock' | 'new'; item: InventoryItem | null }>({ open: false, mode: 'restock', item: null });
  const [toast, setToast] = useState<string | null>(null);

  const closeToast = useCallback(() => setToast(null), []);
  const closeModal = useCallback(() => setModal((m) => ({ ...m, open: false })), []);

  const totalValue = items.reduce((s, i) => s + i.stock * i.unitCost, 0);
  const lowCount = items.filter((i) => stockStatus(i) === 'Bajo').length;
  const outCount = items.filter((i) => stockStatus(i) === 'Agotado').length;
  const monthPurchases = movements.reduce((s, m) => s + m.qty * m.unitCost, 0);

  const handleRestock = (p: RestockPayload) => {
    const target = items.find((i) => i.id === p.itemId);
    if (!target) return;
    setItems((prev) => prev.map((i) => (i.id === p.itemId ? { ...i, stock: i.stock + p.qty, unitCost: p.unitCost, supplier: p.supplier } : i)));
    setMovements((prev) => [
      { id: `mov-${prev.length + 1}-${p.itemId}`, date: p.date, itemId: target.id, itemName: target.name, qty: p.qty, unitCost: p.unitCost, supplier: p.supplier, invoiceRef: p.invoiceRef, account: target.account, type: 'Compra' },
      ...prev,
    ]);
    closeModal();
    setToast(`Se agregaron ${p.qty} a ${target.name}`);
  };

  const handleCreate = (p: NewItemPayload) => {
    const id = `itm-${items.length + 1}-${p.sku}`;
    const created: InventoryItem = {
      id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      supplier: p.supplier,
      stock: p.qty,
      min: p.min,
      unit: p.unit,
      unitCost: p.unitCost,
      account: p.account,
      expiry: p.expiry,
    };
    setItems((prev) => [created, ...prev]);
    setMovements((prev) => [
      { id: `mov-${prev.length + 1}-${id}`, date: todayISO(), itemId: id, itemName: p.name, qty: p.qty, unitCost: p.unitCost, supplier: p.supplier, invoiceRef: p.invoiceRef, account: p.account, type: 'Alta de ítem' },
      ...prev,
    ]);
    closeModal();
    setToast(`Insumo "${p.name}" creado`);
  };

  const openRestock = (item: InventoryItem | null) => setModal({ open: true, mode: 'restock', item: item ?? items[0] ?? null });
  const openNew = () => setModal({ open: true, mode: 'new', item: null });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventario y reabastecimiento</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stock de insumos vinculado a cuentas de inventario y facturas de compra · {accounts.length} cuentas contables activas
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openRestock(null)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95"
          >
            <Icon name="ArrowPathIcon" size={16} />
            Reabastecer
          </button>
          <button
            onClick={openNew}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            <Icon name="PlusIcon" size={16} />
            Nuevo insumo
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Valor del inventario" value={money(totalValue)} icon="BanknotesIcon" tone="hero" helper={`${items.length} insumos registrados`} />
        <MetricCard label="Compras registradas" value={money(monthPurchases)} icon="ShoppingCartIcon" tone="success" helper={`${movements.length} movimientos`} />
        <MetricCard label="Stock bajo" value={String(lowCount)} icon="ExclamationTriangleIcon" tone="warning" helper="Por debajo del mínimo" />
        <MetricCard label="Agotados" value={String(outCount)} icon="XCircleIcon" tone="alert" helper="Requieren compra urgente" />
      </div>

      <div>
        <div role="tablist" className="mb-4 flex gap-1 overflow-x-auto border-b border-border scrollbar-thin">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'stock' && <StockTable items={items} onRestock={openRestock} />}
        {tab === 'movements' && <MovementsList movements={movements} />}
      </div>

      <StockFormModal open={modal.open} mode={modal.mode} item={modal.item} items={items} onClose={closeModal} onRestock={handleRestock} onCreate={handleCreate} />
      {toast && <Toast message={toast} onDone={closeToast} />}
    </div>
  );
}
