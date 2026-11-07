'use client';
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Icon from '@/components/ui/AppIcon';
import EmptyState from '@/components/ui/EmptyState';

const DEMO_LOG = [
  { id: 'n1', title: 'Recordatorio demo', body: 'Solo visible en clínica demo', at: 'Hoy 08:00' },
];

export default function NotificationsModule() {
  const { user } = useAuth();
  const log = user?.clinicIsDemo ? DEMO_LOG : [];
  const [botOn, setBotOn] = useState(true);
  const [auto, setAuto] = useState(true);
  const [docHours, setDocHours] = useState('12');
  const [patDays, setPatDays] = useState('1');

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
          <span className="font-semibold">Bot de recordatorios</span>
          <input type="checkbox" checked={botOn} onChange={(e) => setBotOn(e.target.checked)} />
        </label>
        <label className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
          <span className="font-semibold">Envío automático</span>
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
        </label>
        <label className="text-sm font-semibold">Horas antes (doctor)
          <input className="mt-1 w-full rounded-lg border px-3 py-2" value={docHours} onChange={(e) => setDocHours(e.target.value)} />
        </label>
        <label className="text-sm font-semibold">Días antes (paciente)
          <input className="mt-1 w-full rounded-lg border px-3 py-2" value={patDays} onChange={(e) => setPatDays(e.target.value)} />
        </label>
      </div>

      {log.length === 0 ? (
        <EmptyState
          icon={<Icon name="BellIcon" size={24} />}
          title="Sin notificaciones"
          description="El historial de envíos de tu clínica aparecerá aquí."
        />
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {log.map((n) => (
            <li key={n.id} className="px-4 py-3">
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.body}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{n.at}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
