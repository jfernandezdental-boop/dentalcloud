'use client';
import React from 'react';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';
import EmptyState from '@/components/ui/EmptyState';
import { Movement, money, formatDate } from './inventoryData';

interface MovementsListProps {
  movements: Movement[];
}

export default function MovementsList({ movements }: MovementsListProps) {
  if (movements.length === 0) {
    return <EmptyState icon={<Icon name="ArrowPathIcon" size={24} />} title="Sin movimientos" description="Los reabastecimientos que registres aparecerán aquí." />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border scrollbar-thin">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {['Fecha', 'Insumo', 'Tipo', 'Cantidad', 'Costo total', 'Proveedor', 'Factura de compra', 'Cuenta contable'].map((h) => (
              <th key={`mov-h-${h}`} className="px-4 py-2.5 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {movements.map((m) => (
            <tr key={m.id} className="hover:bg-muted/40">
              <td className="tabular px-4 py-3">{formatDate(m.date)}</td>
              <td className="px-4 py-3 font-medium">{m.itemName}</td>
              <td className="px-4 py-3"><Badge tone={m.type === 'Compra' ? 'info' : 'accent'}>{m.type}</Badge></td>
              <td className="tabular px-4 py-3 font-bold">+{m.qty}</td>
              <td className="tabular px-4 py-3 font-bold">{money(m.qty * m.unitCost)}</td>
              <td className="px-4 py-3 text-muted-foreground">{m.supplier}</td>
              <td className="tabular px-4 py-3 text-xs text-muted-foreground">{m.invoiceRef || '—'}</td>
              <td className="tabular px-4 py-3 text-xs text-muted-foreground">{m.account}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
