import React from 'react';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';

const payments = [
  { id: 'pay-001', date: '31/10/2026', concept: 'Profilaxis y flúor', method: 'Tarjeta crédito', doc: 'FAC 001-001-000004812', amount: 45, state: 'Pagado' },
  { id: 'pay-002', date: '17/10/2026', concept: 'Abono PRF-2026-0390', method: 'Transferencia', doc: 'REC 000221', amount: 100, state: 'Pagado' },
  { id: 'pay-003', date: '03/10/2026', concept: 'Consulta y radiografías', method: 'Efectivo', doc: 'FAC 001-001-000004577', amount: 30, state: 'Pagado' },
  { id: 'pay-004', date: '12/06/2026', concept: 'Extracción pieza 38', method: 'Tarjeta débito', doc: 'FAC 001-001-000003902', amount: 120, state: 'Pagado' },
  { id: 'pay-005', date: '15/11/2026', concept: 'Cuota 2/2 PRF-2026-0390', method: 'Pendiente', doc: '—', amount: 185, state: 'Por cobrar' },
];

export default function PaymentsTab() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs text-muted-foreground">Total facturado 2026</p>
          <p className="tabular mt-1 text-2xl font-bold">$480,00</p>
        </div>
        <div className="rounded-xl border border-success/30 bg-success/10 p-4">
          <p className="text-xs text-muted-foreground">Total cobrado</p>
          <p className="tabular mt-1 text-2xl font-bold text-success">$295,00</p>
        </div>
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-xs text-muted-foreground">Saldo por cobrar</p>
          <p className="tabular mt-1 text-2xl font-bold text-destructive">$185,00</p>
        </div>
      </div>
      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95">
          <Icon name="BanknotesIcon" size={16} />
          Registrar pago
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border scrollbar-thin">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {['Fecha', 'Concepto', 'Forma de pago', 'Comprobante', 'Monto', 'Estado']?.map((h) => (
                <th key={`pyh-${h}`} className="px-4 py-2.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments?.map((p) => (
              <tr key={p?.id} className="hover:bg-muted/40">
                <td className="tabular px-4 py-3">{p?.date}</td>
                <td className="px-4 py-3 font-medium">{p?.concept}</td>
                <td className="px-4 py-3 text-muted-foreground">{p?.method}</td>
                <td className="tabular px-4 py-3 text-xs text-muted-foreground">{p?.doc}</td>
                <td className="tabular px-4 py-3 font-bold">${p?.amount?.toFixed(2)}</td>
                <td className="px-4 py-3"><Badge tone={p?.state === 'Pagado' ? 'success' : 'warning'} dot>{p?.state}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}