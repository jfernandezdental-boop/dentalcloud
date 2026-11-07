'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/components/AuthProvider';
import { getSupabase } from '@/lib/supabase/client';
import {
  OdontogramData,
  ToolId,
  Surface,
  applyTool,
  cloneData,
  countFindings,
  getTool,
  emptyData,
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

type PatientOpt = { id: string; label: string; hc?: string };
type StoredRevision = Revision & { data: OdontogramData };

function patientLabel(p: Record<string, unknown>): string {
  const full =
    (p.full_name as string) ||
    [p.first_name, p.last_name].filter(Boolean).join(' ') ||
    (p.name as string) ||
    'Paciente';
  const doc = (p.cedula as string) || (p.document as string) || '';
  return doc ? `${full} · ${doc}` : full;
}

function nowLabel() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function parseData(raw: unknown): OdontogramData {
  if (!raw || typeof raw !== 'object') return emptyData();
  const o = raw as Partial<OdontogramData>;
  return {
    chart: (o.chart && typeof o.chart === 'object' ? o.chart : {}) as OdontogramData['chart'],
    recession: (o.recession && typeof o.recession === 'object' ? o.recession : {}) as OdontogramData['recession'],
    mobility: (o.mobility && typeof o.mobility === 'object' ? o.mobility : {}) as OdontogramData['mobility'],
  };
}

export default function OdontogramWorkspace() {
  const { user } = useAuth();
  const search = useSearchParams();
  const demo = !!user?.clinicIsDemo;

  const [patients, setPatients] = useState<PatientOpt[]>([]);
  const [patientId, setPatientId] = useState<string>('');
  const [patientQuery, setPatientQuery] = useState('');
  const [loadingPatient, setLoadingPatient] = useState(false);

  const [tool, setTool] = useState<ToolId>('caries');
  const [data, setData] = useState<OdontogramData>(() => (demo ? cloneData(initialData) : emptyData()));
  const [past, setPast] = useState<OdontogramData[]>([]);
  const [future, setFuture] = useState<OdontogramData[]>([]);
  const [revisions, setRevisions] = useState<StoredRevision[]>([]);
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

  const selectedPatient = patients.find((p) => p.id === patientId);

  // Lista de pacientes de la clínica (RLS filtra por clinic_id en Supabase)
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user?.clinicId) return;
      const sb = getSupabase();
      let q = sb
        .from('patients')
        .select('id, first_name, last_name, full_name, cedula, document, chart_number, hc')
        .order('created_at', { ascending: false })
        .limit(300);
      // Si existe clinic_id, filtramos; RLS también debe limitar
      q = q.eq('clinic_id', user.clinicId);
      const { data: rows, error } = await q;
      if (!alive) return;
      if (error) {
        // fallback sin clinic_id en select filter si la columna no está en RLS path
        const r2 = await sb.from('patients').select('id, first_name, last_name, full_name, cedula').order('created_at', { ascending: false }).limit(300);
        if (!alive) return;
        setPatients(
          ((r2.data as Record<string, unknown>[]) || []).map((p) => ({
            id: String(p.id),
            label: patientLabel(p),
          })),
        );
      } else {
        setPatients(
          ((rows as Record<string, unknown>[]) || []).map((p) => ({
            id: String(p.id),
            label: patientLabel(p),
            hc: String(p.chart_number || p.hc || ''),
          })),
        );
      }
    })();
    return () => {
      alive = false;
    };
  }, [user?.clinicId]);

  // ?patient=id desde ficha
  useEffect(() => {
    const qid = search?.get('patient');
    if (qid) setPatientId(qid);
  }, [search]);

  // Cargar revisiones del paciente seleccionado
  const loadRevisions = useCallback(
    async (pid: string) => {
      if (!pid) {
        setRevisions([]);
        setData(demo ? cloneData(initialData) : emptyData());
        setDirty(false);
        setPast([]);
        setFuture([]);
        setViewingId(null);
        setSelected(null);
        return;
      }
      setLoadingPatient(true);
      setViewingId(null);
      setSelected(null);
      setPast([]);
      setFuture([]);

      if (demo) {
        // Demo: maqueta, no toca la base
        setData(cloneData(initialData));
        setRevisions([]);
        setDirty(false);
        setLoadingPatient(false);
        return;
      }

      const sb = getSupabase();
      const { data: rows, error } = await sb
        .from('odontogram_revisions')
        .select('id, label, note, findings, doctor_name, created_at, chart, recession, mobility, data')
        .eq('patient_id', pid)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        // Tabla ausente o RLS: odontograma limpio, se podrá intentar guardar
        setRevisions([]);
        setData(emptyData());
        setDirty(false);
        setLoadingPatient(false);
        if (/odontogram_revisions/i.test(error.message || '')) {
          setToast('Crea la tabla odontogram_revisions en Supabase para persistir revisiones.');
        }
        return;
      }

      const list: StoredRevision[] = ((rows as Record<string, unknown>[]) || []).map((r, i) => {
        const payload =
          r.data != null
            ? parseData(r.data)
            : {
                chart: (r.chart as OdontogramData['chart']) || {},
                recession: (r.recession as OdontogramData['recession']) || {},
                mobility: (r.mobility as OdontogramData['mobility']) || {},
              };
        const created = r.created_at ? new Date(String(r.created_at)) : new Date();
        const p = (n: number) => String(n).padStart(2, '0');
        const dateStr = `${p(created.getDate())}/${p(created.getMonth() + 1)}/${created.getFullYear()} ${p(created.getHours())}:${p(created.getMinutes())}`;
        return {
          id: String(r.id),
          label: String(r.label || `Revisión ${((rows as unknown[]) || []).length - i}`),
          date: dateStr,
          doctor: String(r.doctor_name || '—'),
          findings: Number(r.findings ?? countFindings(payload.chart)),
          note: String(r.note || ''),
          data: payload,
        };
      });

      setRevisions(list);
      // Última revisión = trabajo actual; si no hay, limpio
      setData(list[0] ? cloneData(list[0].data) : emptyData());
      setDirty(false);
      setLoadingPatient(false);
    },
    [demo],
  );

  useEffect(() => {
    void loadRevisions(patientId);
  }, [patientId, loadRevisions]);

  const filteredPatients = useMemo(() => {
    const q = patientQuery.trim().toLowerCase();
    if (!q) return patients.slice(0, 50);
    return patients.filter((p) => p.label.toLowerCase().includes(q)).slice(0, 50);
  }, [patients, patientQuery]);

  const readOnly = viewingId !== null || !patientId;
  const activeTool = getTool(tool);
  const findingsCount = useMemo(() => countFindings(data.chart), [data.chart]);

  const commit = useCallback(
    (next: OdontogramData) => {
      setPast((p) => [...p.slice(-(HISTORY_LIMIT - 1)), data]);
      setFuture([]);
      setData(next);
      setDirty(true);
    },
    [data],
  );

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
    [data, tool, readOnly, commit],
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
    if (!draftRef.current) {
      draftRef.current = data;
      setPast((p) => [...p.slice(-(HISTORY_LIMIT - 1)), data]);
      setFuture([]);
    }
    setData((d) => ({ ...d, chart: setToothNote(d.chart, tooth, note) }));
    setDirty(true);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => {
      draftRef.current = null;
    }, 800);
  };

  const viewRevision = (id: string) => {
    if (viewingId === id) return exitView();
    const rev = revisions.find((r) => r.id === id);
    if (!rev) return;
    setViewingId(id);
    setSelected(null);
    setToast(`Mostrando ${rev.label} en modo solo lectura`);
  };

  const exitView = () => {
    setViewingId(null);
    setToast('Volviste a la revisión de trabajo');
  };

  const clearAll = () => {
    commit(emptyData());
    setSelected(null);
    setConfirmClear(false);
    setToast('Odontograma limpiado — guarda una nueva revisión para conservar el cambio');
  };

  const saveRevision = async () => {
    if (!patientId) return setToast('Selecciona un paciente antes de guardar.');
    if (!user?.clinicId) return setToast('Sin clínica activa en la sesión.');
    setSaving(true);

    if (demo) {
      const n = revisions.length + 1;
      const rev: StoredRevision = {
        id: `rev-local-${Date.now()}`,
        label: `Revisión ${n}`,
        date: nowLabel(),
        doctor: user.fullName || 'Doctor',
        findings: findingsCount,
        note: saveNote.trim() || 'Guardada (demo)',
        data: cloneData(data),
      };
      setRevisions((prev) => [rev, ...prev]);
      setSaving(false);
      setDirty(false);
      setSaveOpen(false);
      setSaveNote('');
      setToast(`Revisión ${n} guardada (modo demo).`);
      return;
    }

    const payload = {
      clinic_id: user.clinicId,
      patient_id: patientId,
      label: `Revisión ${revisions.length + 1}`,
      note: saveNote.trim() || null,
      findings: findingsCount,
      doctor_name: user.fullName || null,
      chart: data.chart,
      recession: data.recession,
      mobility: data.mobility,
      data: cloneData(data),
    };

    const sb = getSupabase();
    let ins = await sb.from('odontogram_revisions').insert(payload).select('id, created_at').maybeSingle();

    // Fallback si columnas chart/recession/mobility no existen: solo data jsonb
    if (ins.error && /chart|recession|mobility|column/i.test(ins.error.message || '')) {
      const slim = {
        clinic_id: user.clinicId,
        patient_id: patientId,
        label: payload.label,
        note: payload.note,
        findings: payload.findings,
        doctor_name: payload.doctor_name,
        data: payload.data,
      };
      ins = await sb.from('odontogram_revisions').insert(slim).select('id, created_at').maybeSingle();
    }

    setSaving(false);
    if (ins.error) {
      return setToast(
        /odontogram_revisions/i.test(ins.error.message || '')
          ? 'No existe la tabla odontogram_revisions. Ejecuta el SQL indicado.'
          : `No se pudo guardar: ${ins.error.message}`,
      );
    }

    setDirty(false);
    setSaveOpen(false);
    setSaveNote('');
    setToast('Revisión guardada y vinculada al paciente.');
    await loadRevisions(patientId);
  };

  const shownData = useMemo(() => {
    if (!viewingId) return data;
    return revisions.find((r) => r.id === viewingId)?.data ?? data;
  }, [viewingId, revisions, data]);

  const generateBudget = (total: number, lines: number) => {
    setToast(`Proforma generada: ${lines} tratamientos por ${formatUsd(total)}. Revísala en la ficha del paciente.`);
  };

  const viewingLabel = revisions.find((r) => r.id === viewingId)?.label;

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <nav className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Migas de pan">
            <Link href="/patient-record" className="font-semibold text-primary hover:underline">
              Ficha del paciente
            </Link>
            {selectedPatient && (
              <>
                <Icon name="ChevronRightIcon" size={12} />
                <span className="truncate">{selectedPatient.label}</span>
              </>
            )}
          </nav>
          <h1 className="text-2xl font-semibold">Odontograma</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paciente nuevo = odontograma limpio. Al guardar, la revisión queda ligada a ese paciente.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {dirty && !readOnly && (
            <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">Cambios sin guardar</span>
          )}
          <span className="tabular rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {countFindings(shownData.chart)} hallazgos
          </span>
        </div>
      </div>

      <div className="no-print rounded-xl border border-border bg-card p-4">
        <p className="mb-2 text-sm font-semibold">Paciente *</p>
        <div className="grid gap-2 sm:grid-cols-[1fr_2fr]">
          <input
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="Buscar por nombre o cédula…"
            value={patientQuery}
            onChange={(e) => setPatientQuery(e.target.value)}
          />
          <select
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            value={patientId}
            onChange={(e) => {
              if (dirty && !window.confirm('Hay cambios sin guardar. ¿Cambiar de paciente?')) return;
              setPatientId(e.target.value);
            }}
          >
            <option value="">— Selecciona paciente —</option>
            {filteredPatients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        {!patientId && (
          <p className="mt-2 text-xs text-muted-foreground">
            Elige un paciente para editar. Los nuevos aparecen con el odontograma vacío.
          </p>
        )}
        {loadingPatient && <p className="mt-2 text-xs text-muted-foreground">Cargando revisiones…</p>}
      </div>

      {readOnly && patientId && viewingId && (
        <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <p className="text-sm">
            <strong>{viewingLabel}</strong> — modo solo lectura. Tu trabajo actual no se ha perdido.
          </p>
          <button
            onClick={exitView}
            className="rounded-lg bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            Volver a la revisión actual
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-border bg-card">
        <div className="rounded-t-2xl bg-sidebar px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-sidebar-foreground">
          H. Odontograma
        </div>
        <div className="space-y-4 p-5">
          <div className="no-print">
            <p className="mb-2 text-sm font-semibold">Herramienta odontograma:</p>
            <ToolPalette active={tool} onSelect={setTool} disabled={readOnly} />
          </div>

          <div className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="flex min-h-[28px] flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
              <span>
                Herramienta activa: <strong className="text-foreground">{activeTool.label}</strong>
              </span>
              <span className="inline-block min-w-[260px] rounded bg-muted px-2 py-0.5 text-xs">
                {hover ? toothLabel(hover) : 'Pasa el cursor sobre una pieza'}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={undo}
                disabled={readOnly || !past.length}
                aria-label="Deshacer"
                title="Deshacer (Ctrl+Z)"
                className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="ArrowUturnLeftIcon" size={16} />
                Deshacer
              </button>
              <button
                onClick={redo}
                disabled={readOnly || !future.length}
                aria-label="Rehacer"
                title="Rehacer (Ctrl+Shift+Z)"
                className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="ArrowUturnRightIcon" size={16} />
                Rehacer
              </button>
              <button
                onClick={() => setConfirmClear(true)}
                disabled={readOnly}
                className="rounded-lg border border-destructive/40 bg-card px-3.5 py-2 text-sm font-semibold text-destructive transition-all hover:bg-destructive/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Limpiar odontograma
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95"
              >
                <Icon name="PrinterIcon" size={16} />
                Imprimir / PDF
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
        subtitle="Se borrarán marcas, recesión y movilidad de la revisión actual. Las revisiones guardadas no se modifican."
        footer={
          <>
            <button
              onClick={() => setConfirmClear(false)}
              className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95"
            >
              Cancelar
            </button>
            <buttonutton
              onClick={clearAll}
              className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-all hover:opacity-90 active:scale-95"
            >
              Sí, limpiar
            </button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Esta acción afecta {findingsCount} hallazgos en pantalla. Puedes deshacerla con “Deshacer”.
        </p>
      </Modal>

      <Modal
        open={saveOpen}
        onClose={() => !saving && setSaveOpen(false)}
        title="Guardar nueva revisión"
        subtitle={`Se registrará una versión con ${findingsCount} hallazgos vinculada al paciente.`}
        footer={
          <>
            <button
              onClick={() => setSaveOpen(false)}
              disabled={saving}
              className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => void saveRevision()}
              disabled={saving}
              className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                  Guardando…
                </>
              ) : (
                'Guardar revisión'
              )}
            </button>
          </>
        }
      >
        <label htmlFor="rev-note" className="mb-1 block text-sm font-semibold">
          Nota de la revisión
        </label>
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
