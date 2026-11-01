'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { id: 'd-lun', day: 'Lun 26', atendidos: 21, agendados: 24 },
  { id: 'd-mar', day: 'Mar 27', atendidos: 24, agendados: 26 },
  { id: 'd-mie', day: 'Mié 28', atendidos: 19, agendados: 25 },
  { id: 'd-jue', day: 'Jue 29', atendidos: 22, agendados: 23 },
  { id: 'd-vie', day: 'Vie 30', atendidos: 11, agendados: 21 },
  { id: 'd-sab', day: 'Sáb 31', atendidos: 14, agendados: 23 },
];

function FlowTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={`tt-${p.name}`} className="tabular text-muted-foreground">
          {p.name}: <strong className="text-foreground">{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

export default function PatientFlowChart() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold">Flujo de pacientes</h3>
          <p className="text-xs text-muted-foreground">Atendidos vs. agendados — últimos 6 días</p>
        </div>
        <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">Viernes: lluvia −48 %</span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="gradAtendidos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.45} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<FlowTooltip />} />
            <Area type="monotone" dataKey="agendados" name="Agendados" stroke="var(--muted-foreground)" strokeDasharray="4 4" fill="none" strokeWidth={2} />
            <Area type="monotone" dataKey="atendidos" name="Atendidos" stroke="var(--primary)" fill="url(#gradAtendidos)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}