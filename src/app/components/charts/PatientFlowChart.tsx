'use client';
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const DEMO_DATA = [
  { id: 'd-lun', day: 'Lun', atendidos: 10, agendados: 14 },
  { id: 'd-mar', day: 'Mar', atendidos: 12, agendados: 16 },
  { id: 'd-mie', day: 'Mié', atendidos: 9, agendados: 15 },
  { id: 'd-jue', day: 'Jue', atendidos: 14, agendados: 18 },
  { id: 'd-vie', day: 'Vie', atendidos: 11, agendados: 17 },
  { id: 'd-sab', day: 'Sáb', atendidos: 8, agendados: 12 },
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
  const { user } = useAuth();
  const data = user?.clinicIsDemo ? DEMO_DATA : [];

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold">Flujo de pacientes</h3>
          <p className="text-xs text-muted-foreground">Atendidos vs. agendados</p>
        </div>
      </div>
      <div className="h-64">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Sin datos aún. Las citas de tu clínica alimentarán este gráfico.
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
