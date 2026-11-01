import React from 'react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/AppIcon';
import { ChartState, buildFindings } from '@/lib/odontogram';

interface FindingsSummaryProps {
  chart: ChartState;
  onSelectTooth?: (tooth: number) => void;
}

export default function FindingsSummary({ chart, onSelectTooth }: FindingsSummaryProps) {
  const rows = buildFindings(chart);
  const pending = rows.filter((r) => r.tone === 'danger').length;
  const done = rows.filter((r) => r.tone === 'info').length;

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">Resumen de hallazgos</h2>
          <p className="text-xs text-muted-foreground">Generado en tiempo real desde el odontograma</p>
        </div>
        <div className="flex gap-2">
          <Badge tone="danger" dot>{pending} por tratar</Badge>
          <Badge tone="info" dot>{done} realizados</Badge>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<Icon name="PuzzlePieceIcon" size={24} />}
            title="Sin hallazgos registrados"
            description="Selecciona una herramienta y haz clic sobre una pieza o superficie para registrar caries, obturaciones o tratamientos."
          />
        </div>
      ) : (
        <ul className="max-h-80 divide-y divide-border overflow-y-auto scrollbar-thin">
          {rows.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onSelectTooth?.(r.tooth)}
                className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-muted/40"
              >
                <span className="tabular flex h-8 w-10 items-center justify-center rounded-md bg-muted text-sm font-bold">{r.tooth}</span>
                <span className="flex-1 text-sm">{r.text}</span>
                <Badge tone={r.tone}>{r.tone === 'danger' ? 'Por tratar' : r.tone === 'info' ? 'Realizado' : 'Registro'}</Badge>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}