'use client';
import React, { useMemo, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import EmptyState from '@/components/ui/EmptyState';

type Item = {
  id: string;
  sku: string;
  name: string;
  cat: string;
  stock: number;
  min: number;
  unit: string;
  cost: number;
};

const DEMO_SEED: Item[] = [
  { id: 'inv-001', sku: 'AN-01', name: 'Anestesia demo', cat: 'Anestesia', stock: 12, min: 5, unit: 'cajas', cost: 8 },
];

export default function InventoryModule() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>(() => (user?.clinicIsDemo ? DEMO_SEED : []));
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ sku: '', name: '', cat: 'Anestesia', stock: 1, min: 5, unit: 'unidades', cost: 0 });

  const critical = useMemo(() => items.filter((i) => i.stock <= i.min / 2).length, [items]);
  const value = useMemo(() => items.reduce((a, i) => a + i.stock * i.cost, 0), [items]);

  const save = () => {
    if (!form.name.trim()) return setToast('Nombre obligatorio');
    setItems((prev) => [
      {
        id: `inv-${Date.now()}`,
        sku: form.sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
        name: form.name.trim(),
        cat: form.cat,
        stock: Number(form.stock) || 0,
        min: Number(form.min) || 0,
        unit: form.unit,
        cost: Number(form.cost) || 0,
      },
      ...prev,
    ]);
    setOpen(false);
    setForm({ sku: '', name: '', cat: 'Anestesia', stock: 1, min: 5, unit: 'unidades', cost: 0 });
    setToast('Ítem agregado');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {critical > 0 ? `${critical} críticos` : 'Stock de insumos'} · Valor est. ${value.toFixed(2)}
        </p>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
          <Icon name="PlusIcon" size={14} /> Nuevo ítem
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Icon name="CubeIcon" size={24} />}
          title="Inventario vacío"
          description="Registra tus insumos. No se muestran productos de ejemplo."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                {['SKU', 'Nombre', 'Categoría', 'Stock', 'Mín.', 'Costo'].map((h) => (
                  <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((i) => (
                <tr key={i.id} className="hover:bg-muted/40">
                  <td className="px-3 py-2.5 font-mono text-xs">{i.sku}</td>
                  <td className="px-3 py-2.5 font-medium">{i.name}</td>
                  <td className="px-3 py-2.5">{i.cat}</td>
                  <td className="px-3 py-2.5">
                    {i.stock} {i.unit}{' '}
                    {i.stock <= i.min ? <Badge tone="warning">Bajo</Badge> : null}
                  </td>
                  <td className="px-3 py-2.5">{i.min}</td>
                  <td className="px-3 py-2.5 tabular-nums">{i.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo ítem" footer={
        <>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2 text-sm font-semibold">Cancelar</button>
          <button type="button" onClick={save} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Guardar</button>
        </>
      }>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">SKU<input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></label>
          <label className="text-sm font-semibold">Nombre<input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="text-sm font-semibold">Stock<input type="number" className="mt-1 w-full rounded-lg border px-3 py-2" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></label>
          <label className="text-sm font-semibold">Mínimo<input type="number" className="mt-1 w-full rounded-lg border px-3 py-2" value={form.min} onChange={(e) => setForm({ ...form, min: Number(e.target.value) })} /></label>
        </div>
      </Modal>
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
