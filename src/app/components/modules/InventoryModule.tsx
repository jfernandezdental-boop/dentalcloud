import React from 'react';
import Badge from '@/components/ui/Badge';

const items = [
  { id: 'inv-001', sku: 'ANE-LID-02', name: 'Anestesia lidocaina 2 % con epinefrina', cat: 'Anestesia', stock: 4, min: 10, unit: 'cajas x50', expiry: '14/02/2027', cost: 38.5 },
  { id: 'inv-002', sku: 'RES-A2-FIL', name: 'Resina Filtek Z350 A2', cat: 'Restauracion', stock: 2, min: 5, unit: 'jeringas', expiry: '09/08/2027', cost: 53.2 },
  { id: 'inv-003', sku: 'GUA-NIT-M', name: 'Guantes de nitrilo talla M', cat: 'Bioseguridad', stock: 18, min: 12, unit: 'cajas x100', expiry: '30/05/2028', cost: 9.8 },
  { id: 'inv-004', sku: 'ENDO-K15', name: 'Limas K 15-40 (25 mm)', cat: 'Endodoncia', stock: 7, min: 6, unit: 'estuches', expiry: '—', cost: 14.75 },
  { id: 'inv-005', sku: 'SEL-CEM-IV', name: 'Ionomero de vidrio cemento', cat: 'Cementos', stock: 3, min: 4, unit: 'kits', expiry: '21/11/2026', cost: 46 },
  { id: 'inv-006', sku: 'MAS-N95', name: 'Mascarilla N95', cat: 'Bioseguridad', stock: 26, min: 20, unit: 'cajas x20', expiry: '12/01/2029', cost: 21.4 },
  { id: 'inv-007', sku: 'ALG-CRO-500', name: 'Alginato cromatico 500 g', cat: 'Impresion', stock: 1, min: 4, unit: 'bolsas', expiry: '05/12/2026', cost: 12.9 },
];

export default function InventoryModule() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-xs text-muted-foreground">Criticos (&lt;= 50 % del minimo)</p>
          <p className="tabular text-2xl font-bold text-destructive">3</p>
        </div>
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
          <p className="text-xs text-muted-foreground">Por vencer en 30 dias</p>
          <p className="tabular text-2xl font-bold">2</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs text-muted-foreground">Valor del inventario</p>
          <p className="tabular text-2xl font-bold">$4 218,60</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border scrollbar-thin">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {['SKU', 'Insumo', 'Categoria', 'Existencia', 'Nivel', 'Caducidad', 'Costo unit.', 'Estado'].map((h) => (
                <th key={`ih-${h}`} className="px-3 py-2.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((i) => {
              const pct = Math.min(100, Math.round((i.stock / (i.min * 2)) * 100));
              const critical = i.stock <= i.min / 2;
              const low = i.stock < i.min;
              return (
                <tr key={i.id} className="transition-colors hover:bg-muted/40">
                  <td className="tabular px-3 py-3 text-xs font-semibold">{i.sku}</td>
                  <td className="px-3 py-3 font-medium">{i.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{i.cat}</td>
                  <td className="tabular px-3 py-3">
                    {i.stock} <span className="text-xs text-muted-foreground">{i.unit}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${critical ? 'bg-destructive' : low ? 'bg-warning' : 'bg-success'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </td>
                  <td className="tabular px-3 py-3">{i.expiry}</td>
                  <td className="tabular px-3 py-3">${i.cost.toFixed(2)}</td>
                  <td className="px-3 py-3">
                    <Badge tone={critical ? 'danger' : low ? 'warning' : 'success'} dot>
                      {critical ? 'Critico' : low ? 'Bajo minimo' : 'Optimo'}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
