'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Toggle from '@/components/ui/Toggle';
import Badge from '@/components/ui/Badge';

const log = [
  { id: 'nl-001', to: 'Daniela Escobar Ruiz', channel: 'WhatsApp', msg: 'Recordatorio de cita hoy 10:00 — Colocación de brackets', sent: '31/10 08:00', state: 'Leído' },
  { id: 'nl-002', to: 'Dr. Santiago Moscoso', channel: 'Push', msg: 'Tienes 6 pacientes mañana; primera cita 08:30', sent: '30/10 18:00', state: 'Entregado' },
  { id: 'nl-003', to: 'Lucía Fernanda Mora', channel: 'SMS', msg: 'Confirma tu cita de las 11:00 respondiendo SÍ', sent: '31/10 07:30', state: 'Respondió SÍ' },
  { id: 'nl-004', to: 'Mónica Altamirano', channel: 'WhatsApp', msg: 'Te esperamos hoy 15:00 — blanqueamiento sesión 2', sent: '31/10 08:00', state: 'Sin respuesta' },
  { id: 'nl-005', to: 'Esteban Quishpe Yánez', channel: 'Correo', msg: 'Indicaciones previas a extracción pieza 48', sent: '30/10 17:00', state: 'Leído' },
];

const stateTone = (s: string): 'success' | 'info' | 'warning' | 'neutral' =>
  s === 'Leído' || s === 'Respondió SÍ' ? 'success' : s === 'Entregado' ? 'info' : s === 'Sin respuesta' ? 'warning' : 'neutral';

export default function NotificationsModule() {
  const [botOn, setBotOn] = useState(true);
  const [auto, setAuto] = useState(true);
  const [docHours, setDocHours] = useState('12');
  const [patDays, setPatDays] = useState('1');

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Icon name="SparklesIcon" size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold">Bot IA de notificaciones</p>
                <p className="text-xs text-muted-foreground">{botOn ? 'Activo — enviando según agenda' : 'Pausado — no se enviarán avisos'}</p>
              </div>
            </div>
            <Toggle checked={botOn} onChange={setBotOn} label="Activar bot IA" />
          </div>
          <div className={`mt-4 space-y-3 transition-opacity ${botOn ? 'opacity-100' : 'pointer-events-none opacity-50'}`}>
            <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Envío automático a pacientes</p>
                <p className="text-xs text-muted-foreground">{auto ? 'Automático según agenda' : 'Manual: tú apruebas cada envío'}</p>
              </div>
              <Toggle checked={auto} onChange={setAuto} label="Modo automático" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="patDays" className="mb-1 block text-xs font-semibold">Aviso al paciente con anticipación</label>
                <select id="patDays" value={patDays} onChange={(e) => setPatDays(e.target.value)} className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary">
                  {['1', '2', '3'].map((d) => (
                    <option key={`pd-${d}`} value={d}>{d} día{d !== '1' ? 's' : ''} antes + 2 h antes</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="docHours" className="mb-1 block text-xs font-semibold">Recordatorio al doctor</label>
                <select id="docHours" value={docHours} onChange={(e) => setDocHours(e.target.value)} className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary">
                  {['2', '6', '12', '24'].map((h) => (
                    <option key={`dh-${h}`} value={h}>{h} horas antes de su primera cita</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'ns-1', label: 'Enviados esta semana', value: '186', tone: 'text-primary' },
            { id: 'ns-2', label: 'Confirmaron cita', value: '71 %', tone: 'text-success' },
            { id: 'ns-3', label: 'Sin respuesta', value: '19', tone: 'text-warning' },
            { id: 'ns-4', label: 'No-show evitados', value: '9', tone: 'text-accent' },
          ].map((s) => (
            <div key={s.id} className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`tabular mt-1 text-2xl font-bold ${s.tone}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-semibold">Bitácora de envíos</h4>
          {!auto && (
            <button className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-all hover:opacity-90 active:scale-95">
              Aprobar 14 envíos pendientes
            </button>
          )}
        </div>
        <ul className="divide-y divide-border rounded-xl border border-border">
          {log.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
              <Badge tone="neutral">{l.channel}</Badge>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{l.to}</p>
                <p className="truncate text-xs text-muted-foreground">{l.msg}</p>
              </div>
              <span className="tabular text-xs text-muted-foreground">{l.sent}</span>
              <Badge tone={stateTone(l.state)} dot>{l.state}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}