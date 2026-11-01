'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { seedDemoClinic, DEMO_ACCESS } from '@/lib/supabase/seedDemoClinic';

export default function SeedDemoButton({ onDone }: { onDone?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState('');

  const run = async () => {
    if (
      !confirm(
        'Crear clinica demo Sonrisa Boreal con admin, doctor y recepcion?\n\nSi ya existe, puede fallar parcialmente (usuarios ya registrados).',
      )
    ) {
      return;
    }
    setLoading(true);
    setLog('');
    try {
      const res = await seedDemoClinic();
      const lines = [
        res.message,
        res.usersCreated.length ? 'Creados: ' + res.usersCreated.join(', ') : '',
        ...res.usersFailed.map((f) => `Fallo ${f.email}: ${f.error}`),
        '',
        'Accesos:',
        ...DEMO_ACCESS.map((a) => `${a.role}: ${a.email} / ${a.password}`),
      ].filter(Boolean);
      setLog(lines.join('\n'));
      onDone?.();
    } catch (e: unknown) {
      setLog(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold">Clinica demo</h3>
          <p className="text-xs text-muted-foreground">
            Sonrisa Boreal · accesos admin / doctor / recepcion (no priorizada en el ranking)
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={run}
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-muted/50 px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-70"
        >
          {loading ? (
            <>
              <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <Icon name="BuildingOffice2Icon" size={16} />
              Crear clinica demo
            </>
          )}
        </button>
      </div>
      {log ? (
        <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-muted/60 p-3 text-[11px] leading-relaxed whitespace-pre-wrap">
          {log}
        </pre>
      ) : null}
    </div>
  );
}
