'use client';
import React, { useMemo, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';
import EmptyState from '@/components/ui/EmptyState';
import { InventoryItem, StockStatus, stockStatus, statusTone, money, formatDate } from './inventoryData';

interface StockTableProps {
  items: InventoryItem[];
  onRestock: (item: InventoryItem) => void;
}

const filters: ('Todos' | StockStatus)[] = ['Todos', 'Agotado', 'Bajo', 'Óptimo'];

export default function StockTable({ items, onRestock }: StockTableProps) {
  const [filter, setFilter] = useState<'Todos' | StockStatus>('Todos');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      const matchStatus = filter === 'Todos' || stockStatus(i) === filter;
      const matchQuery =
        !q ||
        i.name.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.supplier.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [items, filter, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={`stock-filter-${f}`}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                filter === f ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <Icon name="MagnifyingGlassIcon" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar insumo, SKU o proveedor"
            aria-label="Buscar insumos"
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<Icon name="CubeIcon" size={24} />} title="Sin insumos" description="No hay insumos que coincidan con el filtro aplicado." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border scrollbar-thin">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {['Insumo', 'Categoría', 'Proveedor', 'Nivel de stock', 'Costo unit.', 'Valor en libros', 'Caducidad', 'Estado', ''].map((h, idx) => (
                  <th key={`stk-h-${idx}`} className="px-4 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {rows.map((i) => {
                const status = stockStatus(i);
                const target = Math.max(i.min * 2, 1);
                const pct = Math.min(100, Math.round((i.stock / target) * 100));
                const bar = status === 'Óptimo' ? 'bg-success' : status === 'Bajo' ? 'bg-warning' : 'bg-destructive';
                return (
                  <tr key={i.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <p className="font-medium">{i.name}</p>
                      <p className="tabular text-xs text-muted-foreground">{i.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{i.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{i.supplier}</td>
                    <td className="px-4 py-3">
                      <div className="w-40">
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="tabular font-bold">{i.stock} <span className="font-normal text-muted-foreground">{i.unit}</span></span>
                          <span className="tabular text-muted-foreground">mín. {i.min}</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className={`h-full rounded-full transition-all duration-500 ${bar}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="tabular px-4 py-3">{money(i.unitCost)}</td>
                    <td className="tabular px-4 py-3 font-bold">{money(i.stock * i.unitCost)}</td>
                    <td className="tabular px-4 py-3">{formatDate(i.expiry)}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone[status]} dot>{status}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onRestock(i)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold transition-all hover:border-primary hover:text-primary active:scale-95"
                      >
                        <Icon name="PlusIcon" size={14} />
                        Reabastecer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
