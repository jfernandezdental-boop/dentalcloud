'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';
import EmptyState from '@/components/ui/EmptyState';
import {
  InventoryItem,
  initialItems,
  stockStatus,
  statusTone,
  money,
  formatDate,
} from '@/app/inventory-restock/components/inventoryData';

/**
 * Pestaña Inventario del dashboard.
 * Comparte el mismo catálogo de ejemplo que /inventory-restock (solo demo).
 * En producción arranca vacío y redirige al módulo completo para altas reales.
 */
export default function InventoryModule() {
  const { user } = useAuth();
  const isDemo = !!user?.clinicIsDemo;
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    setItems(isDemo ? initialItems : []);
  }, [isDemo]);

  const critical = useMemo(
    () => items.filter((i) => stockStatus(i) === 'Agotado' || stockStatus(i) === 'Bajo').length,
    [items],
  );
  const value = useMemo(() => items.reduce((a, i) => a + i.stock * i.unitCost, 0), [items]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="grid w-full gap-3 sm:grid-cols-3 sm:w-auto sm:flex-1">
          <div className="rounded-xl border border-border px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Críticos</p>
            <p className="text-lg font-bold tabular-nums text-destructive">{critical}</p>
          </div>
          <div className="rounded-xl border border-border px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Ítems</p>
            <p className="text-lg font-bold tabular-nums">{items.length}</p>
          </div>
          <div className="rounded-xl border border-border px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Valor inventario</p>
            <p className="text-lg font-bold tabular-nums">{money(value)}</p>
          </div>
        </div>
        <Link
          href="/inventory-restock"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
        >
          <Icon name="CubeIcon" size={14} /> Abrir inventario completo
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Icon name="CubeIcon" size={24} />}
          title="Inventario vacío"
          description="Los insumos se gestionan en Inventario y reabastecimiento (mismo módulo). No se muestran productos de ejemplo."
          actionLabel="Ir a inventario"
          onAction={() => {
            if (typeof window !== 'undefined') window.location.href = '/inventory-restock';
          }}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                {['SKU', 'Insumo', 'Categoría', 'Existencia', 'Mín', 'Caducidad', 'Costo', 'Estado'].map((h) => (
                  <th key={h} className="px-3 py-2.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((i) => {
                const st = stockStatus(i);
                return (
                  <tr key={i.id} className="hover:bg-muted/40">
                    <td className="px-3 py-2.5 font-mono text-xs">{i.sku}</td>
                    <td className="px-3 py-2.5 font-medium">{i.name}</td>
                    <td className="px-3 py-2.5">{i.category}</td>
                    <td className="px-3 py-2.5">
                      {i.stock} {i.unit}
                    </td>
                    <td className="px-3 py-2.5">{i.min}</td>
                    <td className="px-3 py-2.5">{formatDate(i.expiry)}</td>
                    <td className="px-3 py-2.5 tabular-nums">{money(i.unitCost)}</td>
                    <td className="px-3 py-2.5">
                      <Badge tone={statusTone[st]} dot>
                        {st === 'Bajo' || st === 'Agotado' ? 'Crítico' : st}
                      </Badge>
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
