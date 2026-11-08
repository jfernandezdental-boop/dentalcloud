'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function TopClinicsChart({ data: rows }: { data: { name: string; pacientes: number }[] }) {
  const data = rows.map((r, i) => ({ ...r, id: `tc-${i}` }));
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold">Pacientes por clinica</h3>
        <p className="text-xs text-muted-foreground">Pacientes activos registrados (hasta 6 clinicas)</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: 'var(--muted)' }} formatter={(v: number) => [v.toLocaleString('en-US'), 'Pacientes']} />
            <Bar dataKey="pacientes" radius={[0, 6, 6, 0]}>
              {data.map((d) => (
                <Cell key={d.id} fill="var(--primary)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
