'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { id: 'w-1', sem: 'S1 sep', pacientes: 8420, nuevas: 3 },
  { id: 'w-2', sem: 'S2 sep', pacientes: 9150, nuevas: 4 },
  { id: 'w-3', sem: 'S3 sep', pacientes: 9310, nuevas: 2 },
  { id: 'w-4', sem: 'S4 sep', pacientes: 8890, nuevas: 5 },
  { id: 'w-5', sem: 'S1 oct', pacientes: 9760, nuevas: 6 },
  { id: 'w-6', sem: 'S2 oct', pacientes: 10240, nuevas: 3 },
  { id: 'w-7', sem: 'S3 oct', pacientes: 9120, nuevas: 4 },
  { id: 'w-8', sem: 'S4 oct', pacientes: 9380, nuevas: 7 },
];

function GTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={`gt-${p.name}`} className="tabular text-muted-foreground">
          {p.name}: <strong className="text-foreground">{p.value.toLocaleString('en-US')}</strong>
        </p>
      ))}
    </div>
  );
}

export default function PatientFlowGlobalChart() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold">Flujo de pacientes en la red</h3>
          <p className="text-xs text-muted-foreground">Pacientes atendidos por semana y altas de clinicas</p>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 12, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="sem" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<GTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
            <Line yAxisId="left" type="monotone" dataKey="pacientes" name="Pacientes atendidos" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line yAxisId="right" type="monotone" dataKey="nuevas" name="Clinicas nuevas" stroke="var(--accent)" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
