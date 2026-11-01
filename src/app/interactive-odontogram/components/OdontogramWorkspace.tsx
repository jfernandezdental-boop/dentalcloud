'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import {
  OdontogramData,
  ToolId,
  Surface,
  applyTool,
  cloneData,
  countFindings,
  getTool,
  initialData,
  setToothNote,
  toothLabel,
  formatUsd,
} from '@/lib/odontogram';
import ToolPalette from './ToolPalette';
import OdontogramChart from './OdontogramChart';
import LegendPanel from './LegendPanel';
import FindingsSummary from './FindingsSummary';
import RevisionHistory, { Revision } from './RevisionHistory';
import ToothDetailPanel from './ToothDetailPanel';
import BudgetPanel from './BudgetPanel';

const HISTORY_LIMIT = 50;

const seedRevisions: (Revision & { data: OdontogramData })[] = [
  { id: 'rev-004', label: 'Revisión 4', date: '31/10/2026 09:48', doctor: 'Dra. Camila Andrade', findings: 12, note: 'Control post profilaxis', data: cloneData(initialData) },
  {
    id: 'rev-003', label: 'Revisión 3', date: '17/10/2026 10:20', doctor: 'Dra. Camila Andrade', findings: 11, note: 'Resina en 26 realizada',
    data: { chart: { '16': initialData.chart['16'], '46': initialData.chart['46'], '48': initialData.chart['48'], '38': initialData.chart['38'], '14': initialData.chart['14'], '11': initialData.chart['11'], '55': initialData.chart['55'], '36': initialData.chart['36'], '24': initialData.chart['24'], '21': initialData.chart['21'], '75': initialData.chart['75'] }, recession: { '16': '1' }, mobility: { '31': '1', '41': '2' } },
  },
  {
    id: 'rev-002', label: 'Revisión 2', date: '03/10/2026 08:35', doctor: 'Dra. Camila Andrade', findings: 12, note: 'Valoración inicial',
    data: { chart: { '46': initialData.chart['46'], '48': initialData.chart['48'], '38': initialData.chart['38'], '14': initialData.chart['14'], '16': initialData.chart['16'] }, recession: {}, mobility: { '31': '1' } },
  },
  {
    id: 'rev-001', label: 'Revisión 1', date: '12/06/2026 11:02', doctor: 'Dr. Santiago Moscoso', findings: 6, note: 'Extracción de 38',
    data: { chart: { '38': initialData.chart['38'], '16': initialData.chart['16'] }, recession: {}, mobility: {} },
  },
];

export default function OdontogramWorkspace() {
  const [tool, setTool] = useState<ToolId>('caries');
  const [data, setData] = useState<OdontogramData>(() => cloneData(initialData));
  const [past, setPast] = useState<OdontogramData[]>([]);
  const [future, setFuture] = useState<OdontogramData[]>([]);
  const [revisions, setRevisions] = useState(seedRevisions);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveNote, setSaveNote] = useState('');
  const [saveOpen, setSaveOpen] = useState(false);
  const draftRef = useRef<OdontogramData | null>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const readOnly = viewingId !== null;
  const activeTool = getTool(tool);
  const findingsCount = useMemo(() => countFindings(data.chart), [data.chart]);

  const commit = useCallback((next: OdontogramData) => {
    setPast((p) => [...p.slice(-(HISTORY_LIMIT - 1)), data]);
    setFuture([]);
    setData(next);
    setDirty(true);
  }, [data]);

  const undo = useCallback(() => {
    setPast((p) => {
      if (!p.length) return p;
      const prev = p[p.length - 1];
      setFuture((f) => [data, ...f]);
      setData(prev);
      setDirty(true);
      return p.slice(0, -1);
    });
  }, [data]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      const [nxt, ...rest] = f;
      setPast((p) => [...p, data]);
      setData(nxt);
      setDirty(true);
      return rest;
    });
  }, [data]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !readOnly) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, readOnly]);

  const applyToTooth = useCallback(
    (tooth: number, surface?: Surface) => {
      if (readOnly) return;
      setSelected(tooth);
      const chart = applyTool(data.chart, tool, tooth, surface);
      if (chart === data.chart) return;
      commit({ ...data, chart });
    },
    [data, tool, readOnly, commit]
  );

  const setValue = (kind: 'rec' | 'mob', tooth: number, value: string) => {
    if (readOnly) return;
    const clean = value.replace(/[^1-4]/g, '').slice(0, 1);
    const field = kind === 'rec' ? 'recession' : 'mobility';
    const map = { ...data[field] };
    if (clean) map[String(tooth)] = clean;
    else delete map[String(tooth)];
    commit({ ...data, [field]: map });
  };

  const changeNote = (tooth: number, note: string) => {
    if (readOnly) return;
    // Se agrupan las pulsaciones de teclado en un solo paso de historial
    if (!draftRef.current) {
      draftRef.current = data;
      setPast((p) => [...p.slice(-(HISTORY_LIMIT - 1)), data]);
      setFuture([]);
    }
    setData((d) => ({ ...d, chart: setToothNote(d.chart, tooth, note) }));
    setDirty(true);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => { draftRef.current = null; }, 800);
  };

  const viewRevision = (id: string) => {
    if (viewingId === id) return exitView();
    const rev = revisions.find((r) => r.id === id);
    if (!rev) return;
    if (!viewingId) draftRef.current = null;
    setViewingId(id);
    setSelected(null);
    setToast(`Mostrando ${rev.label} en modo solo lectura`);
  };

  const exitView = () => {
    setViewingId(null);
    setToast('Volviste a la revisión de trabajo');
  };

  const clearAll = () => {
    commit({ chart: {}, recession: {}, mobility: {} });
    setSelected(null);
    setConfirmClear(false);
    setToast('Odontograma limpiado — guarda una nueva revisión para conservar el cambio');
  };

  const nowLabel = () => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  const saveRevision = () => {
    setSaving(true);
    // Backend integration: POST /api/patients/pac-0412/odontogram-revisions
    setTimeout(() => {
      const n = revisions.length + 1;
      const rev = {
        id: `rev-${String(n).padStart(3, '0')}`,
        label: `Revisión ${n}`,
        date: nowLabel(),
        doctor: 'Dra. Camila Andrade',
        findings: findingsCount,
        note: saveNote.trim() || 'Guardada desde el odontograma interactivo',
        data: cloneData(data),
      };
      setRevisions((prev) => [rev, ...prev]);
      setSaving(false);
      setDirty(false);
      setSaveOpen(false);
      setSaveNote('');
      setToast(`Revisión ${n} guardada correctamente`);
    }, 700);
  };

  const shownData = useMemo(() => {
    if (!viewingId) return data;
    return revisions.find((r) => r.id === viewingId)?.data ?? data;
  }, [viewingId, revisions, data]);

  const generateBudget = (total: number, lines: number) => {
    // Backend integration: POST /api/patients/pac-0412/budgets
    setToast(`Proforma generada: ${lines} tratamientos por ${formatUsd(total)}. Revísala en la ficha del paciente.`);
  };

  const viewingLabel = revisions.find((r) => r.id === viewingId)?.label;

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap items-end justify-between gap-3">
        <div>
          <nav className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Migas de pan">
            <Link href="/patient-record" className="font-semibold text-primary hover:underline">Andrea Villacís Toapanta</Link>
            <Icon name="ChevronRightIcon" size={12} />
            <span>HC 0412</span>
          </nav>
          <h1 className="text-2xl font-semibold">Odontograma</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pintar con <strong className="text-destructive">ROJO</strong> para patología actual y <strong className="text-[var(--tooth-blue)]">AZUL</strong> para tratamiento realizado.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {dirty && !readOnly && <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">Cambios sin guardar</span>}
          <span className="tabular rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{countFindings(shownData.chart)} hallazgos</span>
        </div>
      </div>

      {readOnly && (
        <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <p className="text-sm"><strong>{viewingLabel}</strong> — modo solo lectura. Tu trabajo actual no se ha perdido.</p>
          <button onClick={exitView} className="rounded-lg bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95">Volver a la revisión actual</button>
        </div>
      )}

      <section className="rounded-2xl border border-border bg-card">
        <div className="rounded-t-2xl bg-sidebar px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-sidebar-foreground">H. Odontograma</div>
        <div className="space-y-4 p-5">
          <div className="no-print">
            <p className="mb-2 text-sm font-semibold">Herramienta odontograma:</p>
            <ToolPalette active={tool} onSelect={setTool} disabled={readOnly} />
          </div>

          <div className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="flex min-h-[28px] flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
              <span>Herramienta activa: <strong className="text-foreground">{activeTool.label}</strong></span>
              <span className="inline-block min-w-[260px] rounded bg-muted px-2 py-0.5 text-xs">
                {hover ? toothLabel(hover) : 'Pasa el cursor sobre una pieza'}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              <button onClick={undo} disabled={readOnly || !past.length} aria-label="Deshacer" title="Deshacer (Ctrl+Z)" className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95 disabled:cursor-not-allowed disabled:opacity-40">
                <Icon name="ArrowUturnLeftIcon" size={16} />Deshacer
              </button>
              <button onClick={redo} disabled={readOnly || !future.length} aria-label="Rehacer" title="Rehacer (Ctrl+Shift+Z)" className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95 disabled:cursor-not-allowed disabled:opacity-40">
                <Icon name="ArrowUturnRightIcon" size={16} />Rehacer
              </button>
              <button onClick={() => setConfirmClear(true)} disabled={readOnly} className="rounded-lg border border-destructive/40 bg-card px-3.5 py-2 text-sm font-semibold text-destructive transition-all hover:bg-destructive/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40">
                Limpiar odontograma
              </button>
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95">
                <Icon name="PrinterIcon" size={16} />Imprimir / PDF
              </button>
              <button
                onClick={() => setSaveOpen(true)}
                disabled={saving || !dirty || readOnly}
                className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Guardar como nueva revisión
              </button>
            </div>
          </div>

          <OdontogramChart
            chart={shownData.chart}
            recession={shownData.recession}
            mobility={shownData.mobility}
            selected={selected}
            readOnly={readOnly}
            onApply={applyToTooth}
            onValue={setValue}
            onHover={setHover}
          />
        </div>
      </section>

      <LegendPanel />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <FindingsSummary chart={shownData.chart} onSelectTooth={(t) => setSelected(t)} />
          <BudgetPanel chart={shownData.chart} onGenerate={generateBudget} />
        </div>
        <div className="space-y-5">
          <ToothDetailPanel
            tooth={selected}
            chart={shownData.chart}
            recession={shownData.recession}
            mobility={shownData.mobility}
            readOnly={readOnly}
            onNote={changeNote}
            onClose={() => setSelected(null)}
          />
          <RevisionHistory revisions={revisions} viewingId={viewingId} onView={viewRevision} />
        </div>
      </div>

      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="¿Limpiar todo el odontograma?"
        subtitle="Se borrarán todas las marcas, recesión y movilidad de la revisión actual. Las revisiones guardadas no se modifican."
        footer={
          <>
            <button onClick={() => setConfirmClear(false)} className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95">Cancelar</button>
            <button onClick={clearAll} className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-all hover:opacity-90 active:scale-95">Sí, limpiar</button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">Esta acción afecta {findingsCount} hallazgos registrados en pantalla. Puedes deshacerla con “Deshacer”.</p>
      </Modal>

      <Modal
        open={saveOpen}
        onClose={() => !saving && setSaveOpen(false)}
        title="Guardar nueva revisión"
        subtitle={`Se registrará una versión con ${findingsCount} hallazgos.`}
        footer={
          <>
            <button onClick={() => setSaveOpen(false)} disabled={saving} className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95 disabled:opacity-50">Cancelar</button>
            <button onClick={saveRevision} disabled={saving} className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-60">
              {saving ? (<><Icon name="ArrowPathIcon" size={16} className="animate-spin" />Guardando…</>) : 'Guardar revisión'}
            </button>
          </>
        }
      >
        <label htmlFor="rev-note" className="mb-1 block text-sm font-semibold">Nota de la revisión</label>
        <input
          id="rev-note"
          value={saveNote}
          maxLength={120}
          onChange={(e) => setSaveNote(e.target.value)}
          placeholder="Ej.: Control post tratamiento"
          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20"
        />
      </Modal>
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}