'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { id: 'tc-1', name: 'Sonrisa Boreal', pacientes: 1284 },
  { id: 'tc-2', name: 'Dental Costa Azul', pacientes: 1176 },
  { id: 'tc-3', name: 'OdontoSierra', pacientes: 982 },
  { id: 'tc-4', name: 'Clinica Perla', pacientes: 874 },
  { id: 'tc-5', name: 'Dentis Austro', pacientes: 611 },
  { id: 'tc-6', name: 'Sonrie Manta', pacientes: 244 },
];

export default function TopClinicsChart() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold">Pacientes por clinica (octubre)</h3>
        <p className="text-xs text-muted-foreground">Top 5 y clinica con menor actividad</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: 'var(--muted)' }} formatter={(v: number) => [v.toLocaleString('en-US'), 'Pacientes']} />
            <Bar dataKey="pacientes" radius={[0, 6, 6, 0]}>
              {data.map((d, i) => (
                <Cell key={d.id} fill={i === data.length - 1 ? 'var(--destructive)' : 'var(--primary)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
