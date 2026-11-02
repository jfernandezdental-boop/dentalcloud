'use client';
import React, { useMemo, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';

type Item = {
  id: string;
  sku: string;
  name: string;
  cat: string;
  stock: number;
  min: number;
  unit: string;
  expiry: string;
  cost: number;
};

const seed: Item[] = [
  { id: 'inv-001', sku: 'ANE-LID-02', name: 'Anestesia lidocaina 2 %', cat: 'Anestesia', stock: 4, min: 10, unit: 'cajas', expiry: '14/02/2027', cost: 38.5 },
  { id: 'inv-002', sku: 'RES-A2-FIL', name: 'Resina Filtek Z350 A2', cat: 'Restauracion', stock: 2, min: 5, unit: 'jeringas', expiry: '09/08/2027', cost: 53.2 },
  { id: 'inv-003', sku: 'GUA-NIT-M', name: 'Guantes nitrilo M', cat: 'Bioseguridad', stock: 18, min: 12, unit: 'cajas', expiry: '30/05/2028', cost: 9.8 },
];

export default function InventoryModule() {
  const [items, setItems] = useState<Item[]>(seed);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ sku: '', name: '', cat: 'Anestesia', stock: 1, min: 5, unit: 'unidades', expiry: '', cost: 0 });

  const critical = useMemo(() => items.filter((i) => i.stock <= i.min / 2).length, [items]);
  const value = useMemo(() => items.reduce((a, i) => a + i.stock * i.cost, 0), [items]);

  const save = () => {
    if (!form.name.trim() || !form.sku.trim()) {
      setToast('SKU y nombre son obligatorios');
      return;
    }
    setItems((prev) => [
      {
        id: `inv-${Date.now()}`,
        sku: form.sku.trim().toUpperCase(),
        name: form.name.trim(),
        cat: form.cat,
        stock: Number(form.stock) || 0,
        min: Number(form.min) || 1,
        unit: form.unit.trim() || 'unidades',
        expiry: form.expiry || '—',
        cost: Number(form.cost) || 0,
      },
      ...prev,
    ]);
    setOpen(false);
    setForm({ sku: '', name: '', cat: 'Anestesia', stock: 1, min: 5, unit: 'unidades', expiry: '', cost: 0 });
    setToast('Insumo agregado al inventario');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-xs text-muted-foreground">Criticos</p>
            <p className="tabular text-2xl font-bold text-destructive">{critical}</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">Items</p>
            <p className="tabular text-2xl font-bold">{items.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">Valor inventario</p>
            <p className="tabular text-2xl font-bold">${value.toFixed(2)}</p>
          </div>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
          <Icon name="PlusIcon" size={14} />
          Nuevo insumo
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              {['SKU', 'Insumo', 'Categoria', 'Existencia', 'Min', 'Caducidad', 'Costo', 'Estado'].map((h) => (
                <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((i) => {
              const crit = i.stock <= i.min / 2;
              const low = i.stock < i.min;
              return (
                <tr key={i.id} className="hover:bg-muted/40">
                  <td className="px-3 py-3 text-xs font-semibold">{i.sku}</td>
                  <td className="px-3 py-3 font-medium">{i.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{i.cat}</td>
                  <td className="px-3 py-3">
                    {i.stock} <span className="text-xs text-muted-foreground">{i.unit}</span>
                  </td>
                  <td className="px-3 py-3">{i.min}</td>
                  <td className="px-3 py-3">{i.expiry}</td>
                  <td className="px-3 py-3">${i.cost.toFixed(2)}</td>
                  <td className="px-3 py-3">
                    <Badge tone={crit ? 'danger' : low ? 'warning' : 'success'} dot>
                      {crit ? 'Critico' : low ? 'Bajo' : 'Optimo'}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo insumo"
        subtitle="Registra stock de la clinica"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2 text-sm font-semibold">
              Cancelar
            </button>
            <button type="button" onClick={save} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Guardar
            </button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="rounded-lg border px-3 py-2 text-sm" value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
            {['Anestesia', 'Restauracion', 'Bioseguridad', 'Endodoncia', 'Cementos', 'Impresion', 'Otros'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Unidad" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          <input type="number" className="rounded-lg border px-3 py-2 text-sm" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          <input type="number" className="rounded-lg border px-3 py-2 text-sm" placeholder="Minimo" value={form.min} onChange={(e) => setForm({ ...form, min: Number(e.target.value) })} />
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Caducidad DD/MM/AAAA" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
          <input type="number" step="0.01" className="rounded-lg border px-3 py-2 text-sm" placeholder="Costo unitario" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
        </div>
      </Modal>
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
