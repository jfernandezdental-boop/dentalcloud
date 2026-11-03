'use client';
import React, { useEffect, useState } from 'react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/AppIcon';
import { getSupabase } from '@/lib/supabase/client';

type Invoice = { id: string; number: string; issued_at: string | null; total: number | null; paid: number | null; status: string | null };
type Receipt = { id: string; number: string; date: string | null; method: string | null; concept: string | null; amount: number };

const money = (n: number) => new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(n);

/** Facturas y recibos REALES del paciente (RLS de tu clinica). */
export default function RealPaymentsTab({ patientId }: { patientId: string }) {
  const [inv, setInv] = useState<Invoice[] | null>(null);
  const [rec, setRec] = useState<Receipt[] | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    setInv(null);
    setRec(null);
    setErr('');
    const sb = getSupabase();
    Promise.all([
      sb.from('invoices').select('id, number, issued_at, total, paid, status').eq('patient_id', patientId).order('created_at', { ascending: false }),
      sb.from('receipts').select('id, number, date, method, concept, amount').eq('patient_id', patientId).order('created_at', { ascending: false }),
    ]).then(([a, b]) => {
      if (!alive) return;
      if (a.error || b.error) {
        setErr('No se pudieron cargar los pagos.');
        return;
      }
      setInv((a.data as Invoice[]) || []);
      setRec((b.data as Receipt[]) || []);
    });
    return () => {
      alive = false;
    };
  }, [patientId]);

  if (err) return <p className="text-sm text-destructive">{err}</p>;
  if (!inv || !rec) return <div className="h-24 animate-pulse rounded-xl bg-muted/40" />;
  if (inv.length === 0 && rec.length === 0) {
    return (
      <EmptyState
        icon={<Icon name="BanknotesIcon" size={24} />}
        title="Sin pagos registrados"
        description="Este paciente todavía no tiene facturas ni recibos."
      />
    );
  }
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-sm font-semibold">Facturas</h3>
        {inv.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin facturas.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {inv.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <span className="font-mono font-semibold">{f.number}</span>
                <span className="text-muted-foreground">{f.issued_at || ''}</span>
                {f.status && <Badge>{f.status}</Badge>}
                <span>
                  {money(Number(f.paid || 0))} / <strong>{money(Number(f.total || 0))}</strong>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h3 className="mb-2 text-sm font-semibold">Recibos</h3>
        {rec.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin recibos.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {rec.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <span className="font-mono font-semibold">{r.number}</span>
                <span className="text-muted-foreground">{r.date || ''}</span>
                <span>{r.method || ''}</span>
                <span>{r.concept || ''}</span>
                <strong>{money(Number(r.amount))}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
