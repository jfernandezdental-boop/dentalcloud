'use client';
import React, { useEffect, useState } from 'react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/AppIcon';
import { getSupabase } from '@/lib/supabase/client';

type Line = { piece: string | null; procedure: string; qty: number | null; unit_price: number | null };
type Budget = { id: string; code: string; date: string | null; status: string | null; paid: number | null; budget_lines: Line[] };

const money = (n: number) => new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(n);

/** Presupuestos REALES del paciente (tablas budgets + budget_lines, protegidas por RLS de tu clinica). */
export default function RealBudgetsTab({ patientId }: { patientId: string }) {
  const [rows, setRows] = useState<Budget[] | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    setRows(null);
    setErr('');
    getSupabase()
      .from('budgets')
      .select('id, code, date, status, paid, budget_lines(piece, procedure, qty, unit_price)')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) setErr('No se pudieron cargar los presupuestos.');
        else setRows((data as unknown as Budget[]) || []);
      });
    return () => {
      alive = false;
    };
  }, [patientId]);

  if (err) return <p className="text-sm text-destructive">{err}</p>;
  if (!rows) return <div className="h-24 animate-pulse rounded-xl bg-muted/40" />;
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<Icon name="DocumentTextIcon" size={24} />}
        title="Sin presupuestos"
        description="Este paciente todavía no tiene presupuestos ni proformas registrados."
      />
    );
  }
  return (
    <div className="space-y-4">
      {rows.map((b) => {
        const total = b.budget_lines.reduce((a, l) => a + (l.qty || 0) * (l.unit_price || 0), 0);
        const paid = Number(b.paid || 0);
        return (
          <article key={b.id} className="rounded-xl border border-border">
            <header className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
              <span className="font-mono text-sm font-semibold">{b.code}</span>
              <span className="text-xs text-muted-foreground">{b.date || ''}</span>
              {b.status && <Badge>{b.status}</Badge>}
            </header>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-2">Pieza</th>
                  <th className="px-4 py-2">Procedimiento</th>
                  <th className="px-4 py-2">Cant.</th>
                  <th className="px-4 py-2">P. unitario</th>
                </tr>
              </thead>
              <tbody>
                {b.budget_lines.map((l, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-2">{l.piece || '—'}</td>
                    <td className="px-4 py-2">{l.procedure}</td>
                    <td className="px-4 py-2">{l.qty ?? 1}</td>
                    <td className="px-4 py-2">{money(Number(l.unit_price || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <footer className="flex justify-end gap-4 border-t border-border px-4 py-3 text-sm">
              <span>Total <strong>{money(total)}</strong></span>
              <span>Abonado <strong className="text-success">{money(paid)}</strong></span>
              <span>Saldo <strong className="text-destructive">{money(Math.max(total - paid, 0))}</strong></span>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
