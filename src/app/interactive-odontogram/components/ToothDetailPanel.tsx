'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { ChartState, GradeMap, buildFindings, toothLabel } from '@/lib/odontogram';

interface ToothDetailPanelProps {
  tooth: number | null;
  chart: ChartState;
  recession: GradeMap;
  mobility: GradeMap;
  readOnly: boolean;
  onNote: (tooth: number, note: string) => void;
  onClose: () => void;
}

export default function ToothDetailPanel({ tooth, chart, recession, mobility, readOnly, onNote, onClose }: ToothDetailPanelProps) {
  if (tooth === null) {
    return (
      <section className="no-print rounded-2xl border border-dashed border-border bg-card p-5">
        <h2 className="text-base font-semibold">Detalle de pieza</h2>
        <p className="mt-1 text-sm text-muted-foreground">Haz clic en el número de una pieza o en cualquiera de sus superficies para ver su detalle y agregar observaciones.</p>
      </section>
    );
  }

  const key = String(tooth);
  const findings = buildFindings({ [key]: chart[key] ?? { surfaces: {}, marks: [] } });

  return (
    <section className="no-print rounded-2xl border border-border bg-card">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">Pieza {tooth}</h2>
          <p className="text-xs text-muted-foreground">{toothLabel(tooth)}</p>
        </div>
        <button onClick={onClose} aria-label="Cerrar detalle" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted">
          <Icon name="XMarkIcon" size={16} />
        </button>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex gap-3 text-xs">
          <span className="rounded-md bg-muted px-2 py-1 font-semibold">Recesión: {recession[key] || '—'}</span>
          <span className="rounded-md bg-muted px-2 py-1 font-semibold">Movilidad: {mobility[key] || '—'}</span>
        </div>
        {findings.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin hallazgos en esta pieza.</p>
        ) : (
          <ul className="space-y-1.5">
            {findings.map((f) => (
              <li key={f.id} className="flex items-center gap-2 text-sm">
                <span className={`h-2 w-2 shrink-0 rounded-full ${f.tone === 'danger' ? 'bg-destructive' : f.tone === 'info' ? 'bg-[var(--tooth-blue)]' : 'bg-muted-foreground'}`} />
                {f.text}
              </li>
            ))}
          </ul>
        )}
        <label className="block text-xs font-semibold" htmlFor="tooth-note">Observaciones de la pieza</label>
        <textarea
          id="tooth-note"
          rows={3}
          readOnly={readOnly}
          value={chart[key]?.note ?? ''}
          onChange={(e) => onNote(tooth, e.target.value)}
          placeholder="Ej.: sensibilidad al frío, control en 3 meses"
          className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20"
        />
      </div>
    </section>
  );
}
