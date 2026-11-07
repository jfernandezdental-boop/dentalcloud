'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import { getSupabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Field, fld, btnGhost, btnPrimary, money, today } from './formKit';
import { printBudget } from '@/lib/clinicDocs';
import { useDocContext } from '@/lib/useDocContext';

type Line = { piece: string; procedure: string; qty: number; unit_price: number | ''; discount: number | '' };
type Budget = {
  id: string;
  code: string;
  date: string | null;
  status: string | null;
  paid: number | null;
  budget_lines: { piece: string | null; procedure: string; qty: number | null; unit_price: number | null; discount?: number | null }[];
};
type CatalogItem = { name: string; price: number | null };

const STATUSES = ['Borrador', 'Enviada', 'Aprobada', 'Parcialmente pagada', 'Pagada'];
const blank = (): Line => ({ piece: '', procedure: '', qty: 1, unit_price: '', discount: '' });
const lineNet = (l: { qty: number | null; unit_price: number | null | ''; discount?: number | null | '' }) => {
  const q = Number(l.qty) || 0;
  const u = Number(l.unit_price) || 0;
  const d = Math.min(100, Math.max(0, Number(l.discount) || 0));
  return q * u * (1 - d / 100);
};
const totalOf = (ls: { qty: number | null; unit_price: number | null | ''; discount?: number | null | '' }[]) =>
  ls.reduce((a, l) => a + lineNet(l), 0);

export default function RealBudgetsTab({ patientId }: { patientId: string }) {
  const { user } = useAuth();
  const doc = useDocContext(patientId);
  const [rows, setRows] = useState<Budget[] | null>(null);
  const [error, setError] = useState('');
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [editing, setEditing] = useState<{ id: string | null; code: string } | null>(null);
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('Borrador');
  const [paid, setPaid] = useState('0');
  const [lines, setLines] = useState<Line[]>([blank()]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    const sb = getSupabase();
    let { data, error: e } = await sb
      .from('budgets')
      .select('id, code, date, status, paid, budget_lines(piece, procedure, qty, unit_price, discount)')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    if (e && /discount/i.test(e.message || '')) {
      const retry = await sb
        .from('budgets')
        .select('id, code, date, status, paid, budget_lines(piece, procedure, qty, unit_price)')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      data = retry.data as typeof data;
      e = retry.error;
    }
    if (e) setError('No se pudieron cargar los presupuestos.');
    else {
      setError('');
      setRows((data as unknown as Budget[]) || []);
    }
  }, [patientId]);

  useEffect(() => {
    setRows(null);
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      if (!user?.clinicId) return;
      let { data, error } = await getSupabase()
        .from('procedures')
        .select('name, price')
        .eq('clinic_id', user.clinicId)
        .order('name');
      if (error) {
        const r = await getSupabase().from('procedures').select('name, price').order('name');
        data = r.data;
      }
      setCatalog(((data as CatalogItem[]) || []).filter((c) => c.name));
    })();
  }, [user?.clinicId]);

  const total = useMemo(() => totalOf(lines), [lines]);
  const discountTotal = useMemo(
    () =>
      lines.reduce((a, l) => {
        const q = Number(l.qty) || 0;
        const u = Number(l.unit_price) || 0;
        const d = Math.min(100, Math.max(0, Number(l.discount) || 0));
        return a + q * u * (d / 100);
      }, 0),
    [lines],
  );

  function openNew() {
    setEditing({ id: null, code: `PRE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}` });
    setDate(today());
    setStatus('Borrador');
    setPaid('0');
    setLines([blank()]);
  }

  function openEdit(b: Budget) {
    setEditing({ id: b.id, code: b.code });
    setDate(b.date || today());
    setStatus(b.status || 'Borrador');
    setPaid(String(b.paid ?? 0));
    setLines(
      b.budget_lines.length
        ? b.budget_lines.map((l) => ({
            piece: l.piece || '',
            procedure: l.procedure,
            qty: l.qty || 1,
            unit_price: l.unit_price == null || Number(l.unit_price) === 0 ? '' : Number(l.unit_price),
            discount: l.discount == null || Number(l.discount) === 0 ? '' : Number(l.discount),
          }))
        : [blank()],
    );
  }

  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((ls) =>
      ls.map((l, idx) => {
        if (idx !== i) return l;
        const next = { ...l, ...patch };
        if (patch.procedure !== undefined) {
          const hit = catalog.find((c) => c.name.toLowerCase() === patch.procedure!.trim().toLowerCase());
          if (hit && (l.unit_price === '' || !l.unit_price)) next.unit_price = Number(hit.price || 0) || '';
        }
        if (patch.unit_price !== undefined) {
          next.unit_price = patch.unit_price === '' ? '' : Number(patch.unit_price) || 0;
        }
        if (patch.discount !== undefined) {
          next.discount = patch.discount === '' ? '' : Math.min(100, Math.max(0, Number(patch.discount) || 0));
        }
        return next;
      }),
    );

  async function save() {
    if (!editing) return;
    if (!user?.clinicId) return setToast('No hay una clínica activa en tu sesión.');
    const valid = lines.filter((l) => l.procedure.trim());
    if (valid.length === 0) return setToast('Agrega al menos un procedimiento.');
    if (valid.some((l) => l.qty < 1 || (l.unit_price !== '' && Number(l.unit_price) < 0))) return setToast('Revisa cantidades y precios.');
    const paidN = Number(paid) || 0;
    const tot = totalOf(valid);
    if (paidN < 0 || paidN > tot + 0.001) return setToast('El abono no puede ser mayor al total ni negativo.');
    setSaving(true);
    const sb = getSupabase();
    const header = { date: date || today(), status, paid: paidN };
    let budgetId = editing.id;
    let err: string | null = null;

    if (budgetId) {
      const { error: e } = await sb.from('budgets').update(header).eq('id', budgetId);
      err = e?.message || null;
      if (!err) {
        const del = await sb.from('budget_lines').delete().eq('budget_id', budgetId);
        err = del.error?.message || null;
      }
    } else {
      const { data, error: e } = await sb
        .from('budgets')
        .insert({ ...header, clinic_id: user.clinicId, patient_id: patientId, code: editing.code })
        .select('id')
        .maybeSingle();
      err = e?.message || (data ? null : 'sin respuesta');
      budgetId = data ? String((data as { id: string }).id) : null;
    }
    if (!err && budgetId) {
      const payloadWithDiscount = valid.map((l) => ({
        clinic_id: user.clinicId,
        budget_id: budgetId,
        piece: l.piece.trim() || null,
        procedure: l.procedure.trim(),
        qty: l.qty,
        unit_price: Number(l.unit_price) || 0,
        discount: Number(l.discount) || 0,
      }));
      let ins = await sb.from('budget_lines').insert(payloadWithDiscount);
      if (ins.error && /discount/i.test(ins.error.message || '')) {
        ins = await sb.from('budget_lines').insert(
          valid.map((l) => ({
            clinic_id: user.clinicId,
            budget_id: budgetId,
            piece: l.piece.trim() || null,
            procedure: Number(l.discount) > 0 ? `${l.procedure.trim()} (−${l.discount}%)` : l.procedure.trim(),
            qty: l.qty,
            unit_price: Number(((Number(l.unit_price) || 0) * (1 - (Number(l.discount) || 0) / 100)).toFixed(2)),
          })),
        );
      }
      err = ins.error?.message || null;
      if (err && !editing.id) await sb.from('budgets').delete().eq('id', budgetId);
    }
    setSaving(false);
    if (err) return setToast(`No se pudo guardar: ${err}`);
    setEditing(null);
    setToast('Presupuesto guardado.');
    load();
  }

  const printOne = (b: Budget) => {
    if (!doc) return setToast('Preparando datos del documento…');
    const items = b.budget_lines.map((l) => ({
      piece: l.piece,
      name: l.procedure,
      qty: Number(l.qty) || 1,
      unit: Number(l.unit_price) || 0,
      discount: Number(l.discount) || 0,
      total: lineNet(l),
    }));
    printBudget({
      code: b.code,
      date: b.date || today(),
      status: b.status,
      clinic: doc.clinic,
      patient: doc.patient,
      items,
      paid: Number(b.paid) || 0,
      doctorName: user?.role === 'doctor' ? user.fullName : null,
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Presupuestos</h3>
          <p className="text-xs text-muted-foreground">Incluye descuento por ítem. Los totales se calculan netos.</p>
        </div>
        <button type="button" className={btnPrimary()} onClick={openNew}>
          <Icon name="PlusIcon" size={16} /> Nuevo presupuesto
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {!rows && !error && <div className="h-24 animate-pulse rounded-xl bg-muted/40" />}
      {rows && rows.length === 0 && (
        <EmptyState icon={<Icon name="DocumentTextIcon" size={24} />} title="Sin presupuestos" description="Crea el primero con procedimientos y precios." />
      )}

      <div className="space-y-4">
        {rows?.map((b) => {
          const t = totalOf(b.budget_lines);
          return (
            <article key={b.id} className="rounded-xl border border-border">
              <header className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
                <span className="font-mono text-sm font-semibold">{b.code}</span>
                <span className="text-xs text-muted-foreground">{b.date || ''}</span>
                {b.status && <Badge>{b.status}</Badge>}
                <div className="ml-auto flex gap-1">
                  <button type="button" className={btnGhost} onClick={() => printOne(b)} title="PDF">
                    <Icon name="PrinterIcon" size={14} />
                  </button>
                  <button type="button" className={btnGhost} onClick={() => openEdit(b)}>
                    <Icon name="PencilSquareIcon" size={14} /> Editar
                  </button>
                </div>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-muted-foreground">
                      <th className="px-4 py-2">Pieza</th>
                      <th className="px-4 py-2">Procedimiento</th>
                      <th className="px-4 py-2">Cant.</th>
                      <th className="px-4 py-2">P. unitario</th>
                      <th className="px-4 py-2">Desc. %</th>
                      <th className="px-4 py-2">Neto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {b.budget_lines.map((l, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-4 py-2">{l.piece || '—'}</td>
                        <td className="px-4 py-2">{l.procedure}</td>
                        <td className="px-4 py-2">{l.qty ?? 1}</td>
                        <td className="px-4 py-2">{money(Number(l.unit_price || 0))}</td>
                        <td className="px-4 py-2">{Number(l.discount) ? `${Number(l.discount)} %` : '—'}</td>
                        <td className="px-4 py-2 font-semibold">{money(lineNet(l))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <footer className="flex flex-wrap justify-end gap-4 border-t border-border px-4 py-3 text-sm">
                <span>Total <strong>{money(t)}</strong></span>
                <span className="text-muted-foreground">Abonado {money(Number(b.paid || 0))}</span>
              </footer>
            </article>
          );
        })}
      </div>

      <Modal
        open={!!editing}
        onClose={() => !saving && setEditing(null)}
        size="xl"
        title={editing?.id ? `Editar ${editing.code}` : 'Nuevo presupuesto'}
        subtitle={editing ? `Código ${editing.code}` : undefined}
        footer={
          <>
            <span className="mr-auto text-sm">
              {discountTotal > 0 && <span className="mr-3 text-muted-foreground">Desc. {money(discountTotal)}</span>}
              Total <strong>{money(total)}</strong>
            </span>
            <button type="button" className={btnGhost} onClick={() => setEditing(null)} disabled={saving}>Cancelar</button>
            <button type="button" className={btnPrimary(saving)} onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Fecha"><input type="date" className={fld} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Estado">
            <select className={fld} value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Abonado ($)"><input type="number" min="0" step="0.01" className={fld} value={paid} onChange={(e) => setPaid(e.target.value)} /></Field>
        </div>

        <p className="mb-2 mt-4 text-sm font-semibold">Procedimientos</p>
        <datalist id="proc-catalog">{catalog.map((c) => <option key={c.name} value={c.name} />)}</datalist>
        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-12 items-end gap-2">
              <Field label={i === 0 ? 'Pieza' : ''} className="col-span-1"><input className={fld} value={l.piece} onChange={(e) => setLine(i, { piece: e.target.value })} placeholder="46" /></Field>
              <Field label={i === 0 ? 'Procedimiento *' : ''} className="col-span-4"><input list="proc-catalog" className={fld} value={l.procedure} onChange={(e) => setLine(i, { procedure: e.target.value })} /></Field>
              <Field label={i === 0 ? 'Cant.' : ''} className="col-span-1"><input type="number" min="1" className={fld} value={l.qty} onChange={(e) => setLine(i, { qty: Number(e.target.value) })} /></Field>
              <Field label={i === 0 ? 'P. unitario' : ''} className="col-span-2"><input type="number" min="0" step="0.01" className={fld} value={l.unit_price} onChange={(e) => setLine(i, { unit_price: e.target.value === '' ? '' : Number(e.target.value) })} /></Field>
              <Field label={i === 0 ? 'Desc. %' : ''} className="col-span-2"><input type="number" min="0" max="100" step="1" className={fld} value={l.discount} onChange={(e) => setLine(i, { discount: e.target.value === '' ? '' : Number(e.target.value) })} /></Field>
              <div className="col-span-1 mb-2 text-right text-xs font-semibold tabular-nums">{money(lineNet(l))}</div>
              <button type="button" aria-label="Quitar línea" className="col-span-1 mb-1 rounded-md p-2 text-muted-foreground hover:bg-muted" onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((_, k) => k !== i) : ls))}>
                <Icon name="TrashIcon" size={16} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" className={`${btnGhost} mt-3`} onClick={() => setLines((ls) => [...ls, blank()])}>
          <Icon name="PlusIcon" size={14} /> Agregar procedimiento
        </button>
      </Modal>
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
