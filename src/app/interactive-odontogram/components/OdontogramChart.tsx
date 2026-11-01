'use client';
import React from 'react';
import {
  ChartState,
  GradeMap,
  Surface,
  upperPermanent,
  lowerPermanent,
  upperDeciduous,
  lowerDeciduous,
} from '@/lib/odontogram';
import Tooth from './Tooth';

interface OdontogramChartProps {
  chart: ChartState;
  recession: GradeMap;
  mobility: GradeMap;
  selected: number | null;
  readOnly?: boolean;
  onApply: (tooth: number, surface?: Surface) => void;
  onValue: (kind: 'rec' | 'mob', tooth: number, value: string) => void;
  onHover: (n: number | null) => void;
}

const BIG = 44;
const SMALL = 34;

interface ValueRowProps {
  label: string;
  kind: 'rec' | 'mob';
  teeth: number[];
  values: GradeMap;
  readOnly?: boolean;
  onValue: (kind: 'rec' | 'mob', tooth: number, value: string) => void;
}

function ValueRow({ label, kind, teeth, values, readOnly, onValue }: ValueRowProps) {
  const half = teeth.length / 2;
  const cell = (n: number) => (
    <input
      key={`${kind}-${n}`}
      aria-label={`${label} pieza ${n}`}
      inputMode="numeric"
      maxLength={1}
      readOnly={readOnly}
      value={values[String(n)] ?? ''}
      onChange={(e) => onValue(kind, n, e.target.value)}
      className={`tabular h-7 w-10 rounded border bg-card text-center text-xs font-bold outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20 ${
        values[String(n)] ? 'border-warning bg-warning/10' : 'border-input'
      }`}
    />
  );
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-right text-xs font-bold">{label}</span>
      <div className="flex gap-1">{teeth.slice(0, half).map(cell)}</div>
      <div className="w-4" />
      <div className="flex gap-1">{teeth.slice(half).map(cell)}</div>
    </div>
  );
}

export default function OdontogramChart({
  chart,
  recession,
  mobility,
  selected,
  readOnly,
  onApply,
  onValue,
  onHover,
}: OdontogramChartProps) {
  const row = (teeth: number[], size: number) => {
    const half = teeth.length / 2;
    const render = (n: number) => (
      <Tooth
        key={`t-${n}`}
        number={n}
        state={chart[String(n)]}
        size={size}
        selected={selected === n}
        onApply={onApply}
        onHover={onHover}
      />
    );
    return (
      <div className="flex items-end justify-center gap-2">
        <div className="flex gap-1">{teeth.slice(0, half).map(render)}</div>
        <div className="w-4" />
        <div className="flex gap-1">{teeth.slice(half).map(render)}</div>
      </div>
    );
  };

  return (
    <div
      className={`overflow-x-auto rounded-xl border border-border bg-background p-4 scrollbar-thin ${readOnly ? 'pointer-events-none opacity-90' : ''}`}
      style={{ scrollbarGutter: 'stable' }}
    >
      <div className="mx-auto w-fit min-w-[900px] space-y-3">
        <p className="text-xs text-muted-foreground">Movilidad y Recesión: marcar 1, 2, 3 ó 4 si aplica.</p>

        <ValueRow label="Recesión" kind="rec" teeth={upperPermanent} values={recession} readOnly={readOnly} onValue={onValue} />
        <ValueRow label="Movilidad" kind="mob" teeth={upperPermanent} values={mobility} readOnly={readOnly} onValue={onValue} />

        <div className="pl-[4.5rem]">
          <div className="space-y-1">
            {row(upperPermanent, BIG)}
            {row(upperDeciduous, SMALL)}
            {row(lowerDeciduous, SMALL)}
            {row(lowerPermanent, BIG)}
          </div>
        </div>

        <ValueRow label="Movilidad" kind="mob" teeth={lowerPermanent} values={mobility} readOnly={readOnly} onValue={onValue} />
        <ValueRow label="Recesión" kind="rec" teeth={lowerPermanent} values={recession} readOnly={readOnly} onValue={onValue} />
      </div>
    </div>
  );
}