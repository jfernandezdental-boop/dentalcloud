'use client';
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

const DEMO_DATA = [
  { id: 'ch-1', name: 'Sillón 1', value: 88, fill: 'var(--primary)' },
  { id: 'ch-2', name: 'Sillón 2', value: 74, fill: 'var(--accent)' },
  { id: 'ch-3', name: 'Sillón 3', value: 61, fill: 'var(--success)' },
  { id: 'ch-4', name: 'Sillón 4', value: 39, fill: 'var(--warning)' },
];

export default function ChairOccupancyChart() {
  const { user } = useAuth();
  const data = user?.clinicIsDemo ? DEMO_DATA : [];
  const avg = data.length
    ? Math.round(data.reduce((a, d) => a + d.value, 0) / data.length)
    : 0;

  return (
    <div className="h-full rounded-2xl border border-border bg-card p-5">
      <div className="mb-2">
        <h3 className="text-base font-semibold">Ocupación de sillones</h3>
        <p className="text-xs text-muted-foreground">
          {data.length === 0
            ? 'Sin datos de ocupación aún'
            : `Horas productivas hoy · promedio ${avg} %`}
        </p>
      </div>
      <div className="h-44">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            La ocupación de tus sillones se calculará con las citas del día.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="25%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" background={{ fill: 'var(--muted)' }} cornerRadius={8} />
            </RadialBarChart>
          </ResponsiveContainer>
        )}
      </div>
      {data.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {data.map((d) => (
            <li key={d.id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.fill }} />
                {d.name}
              </span>
              <span className="tabular font-semibold">{d.value} %</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
