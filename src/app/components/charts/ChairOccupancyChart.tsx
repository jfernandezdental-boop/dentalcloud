'use client';
import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

const data = [
  { id: 'ch-1', name: 'Sillón 1', value: 88, fill: 'var(--primary)' },
  { id: 'ch-2', name: 'Sillón 2', value: 74, fill: 'var(--accent)' },
  { id: 'ch-3', name: 'Sillón 3', value: 61, fill: 'var(--success)' },
  { id: 'ch-4', name: 'Sillón 4', value: 39, fill: 'var(--warning)' },
];

export default function ChairOccupancyChart() {
  return (
    <div className="h-full rounded-2xl border border-border bg-card p-5">
      <div className="mb-2">
        <h3 className="text-base font-semibold">Ocupación de sillones</h3>
        <p className="text-xs text-muted-foreground">Horas productivas hoy · promedio 65 %</p>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="25%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" background={{ fill: 'var(--muted)' }} cornerRadius={8} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 space-y-1.5">
        {data?.map((d) => (
          <li key={d?.id} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: d?.fill }} />
              {d?.name}
            </span>
            <span className="tabular font-semibold">{d?.value} %</span>
          </li>
        ))}
      </ul>
    </div>
  );
}