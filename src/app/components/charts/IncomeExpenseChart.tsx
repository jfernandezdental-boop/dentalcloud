'use client';
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DEMO_DATA = [
  { id: 'm-may', mes: 'May', ingresos: 18400, gastos: 12100 },
  { id: 'm-jun', mes: 'Jun', ingresos: 21250, gastos: 13800 },
  { id: 'm-jul', mes: 'Jul', ingresos: 19780, gastos: 14950 },
  { id: 'm-ago', mes: 'Ago', ingresos: 23600, gastos: 14200 },
  { id: 'm-sep', mes: 'Sep', ingresos: 22140, gastos: 17320 },
  { id: 'm-oct', mes: 'Oct', ingresos: 24860, gastos: 15480 },
];

function MoneyTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold">{label} 2026</p>
      {payload.map((p) => (
        <p key={`mt-${p.name}`} className="tabular text-muted-foreground">
          {p.name}: <strong className="text-foreground">${p.value.toLocaleString('en-US')}</strong>
        </p>
      ))}
    </div>
  );
}

export default function IncomeExpenseChart() {
  const { user } = useAuth();
  const data = user?.clinicIsDemo ? DEMO_DATA : [];
  const utilidad = data.length
    ? data[data.length - 1].ingresos - data[data.length - 1].gastos
    : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold">Ingresos vs. gastos</h3>
          <p className="text-xs text-muted-foreground">
            {data.length === 0
              ? 'Sin movimientos financieros aún'
              : `USD — utilidad octubre: $${utilidad.toLocaleString('en-US')}`}
          </p>
        </div>
        {data.length > 0 ? (
          <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">
            Sep: margen 21,8 %
          </span>
        ) : null}
      </div>
      <div className="h-64">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Los ingresos y gastos de tu clínica alimentarán este gráfico.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 8, left: -12, bottom: 0 }} barGap={4}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v / 1000}k`} />
              <Tooltip content={<MoneyTooltip />} cursor={{ fill: 'var(--muted)' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
              <Bar dataKey="ingresos" name="Ingresos" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="gastos" name="Gastos" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
