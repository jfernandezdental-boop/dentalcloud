'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import { getSupabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Field, fld, btnGhost, btnPrimary, money, today } from '@/app/patient-record/components/tabs/formKit';
import { linkApprovedProformaToFinance } from '@/lib/financeLink';

type Line = { piece: string; procedure: string; qty: number; unit_price: number; discount: number };
type Budget = {
  id: string;
  code: string;
  date: string | null;
  status: string | null;
  paid: number | null;
  patient_id: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  budget_lines: { piece: string | null; procedure: string; qty: number | null; unit_price: number | null; discount?: number | null }[];
};

const STATUSES = ['Borrador', 'Enviada', 'Aprobada', 'Parcialmente pagada', 'Pagada'];
const blank = (): Line => ({ piece: '', procedure: '', qty: 1, unit_price: 0, discount: 0 });
const lineNet = (l: { qty: number | null; unit_price: number | null; discount?: number | null }) => {
  const q = Number(l.qty) || 0;
  const u = Number(l.unit_price) || 0;
  const d = Math.min(100, Math.max(0, Number(l.discount) || 0));
  return q * u * (1 - d / 100);
};
const totalOf = (ls: { qty: number | null; unit_price: number | null; discount?: number | null }[]) =>
  ls.reduce((a, l) => a + lineNet(l), 0);

/**
 * Presupuestos independientes (sin paciente registrado).
 * Se identifican por código PRF-… Al aceptar, se registran los datos del paciente y se vincula la ficha.
 */
export default function ProformasPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Budget[] | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<{ id: string | null; code: string } | null>(null);
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('Borrador');
  const [paid, setPaid] = useState('0');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [lines, setLines] = useState<Line[]>([blank()]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [acceptFor, setAcceptFor] = useState<Budget | null>(null);
  const [reg, setReg] = useState({ first_name: '', last_name: '', cedula: '', phone: '', email: '' });

  const load = useCallback(async () => {
    if (!user?.clinicId) return;
    const sb = getSupabase();
    let { data, error: e } = await sb
      .from('budgets')
      .select('id, code, date, status, paid, patient_id, guest_name, guest_phone, budget_lines(piece, procedure, qty, unit_price, discount)')
      .eq('clinic_id', user.clinicId)
      .is('patient_id', null)
      .order('created_at', { ascending: false });
    if (e && /guest_|discount/i.test(e.message || '')) {
      const retry = await sb
        .from('budgets')
        .select('id, code, date, status, paid, patient_id, budget_lines(piece, procedure, qty, unit_price)')
        .eq('clinic_id', user.clinicId)
        .is('patient_id', null)
        .order('created_at', { ascending: false });
      data = retry.data as typeof data;
      e = retry.error;
    }
    if (e) setError(e.message || 'No se pudieron cargar las proformas.');
    else {
      setError('');
      setRows((data as unknown as Budget[]) || []);
    }
  }, [user?.clinicId]);

  useEffect(() => {
    setRows(null);
    load();
  }, [load]);

  const total = useMemo(() => totalOf(lines), [lines]);

  function openNew() {
    setEditing({ id: null, code: `PRF-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}` });
    setDate(today());
    setStatus('Borrador');
    setPaid('0');
    setGuestName('');
    setGuestPhone('');
    setLines([blank()]);
  }

  function openEdit(b: Budget) {
    setEditing({ id: b.id, code: b.code });
    setDate(b.date || today());
    setStatus(b.status || 'Borrador');
    setPaid(String(b.paid ?? 0));
    setGuestName(b.guest_name || '');
    setGuestPhone(b.guest_phone || '');
    setLines(
      b.budget_lines.length
        ? b.budget_lines.map((l) => ({
            piece: l.piece || '',
            procedure: l.procedure,
            qty: l.qty || 1,
            unit_price: Number(l.unit_price || 0),
            discount: Number(l.discount || 0),
          }))
        : [blank()],
    );
  }

  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((ls) =>
      ls.map((l, idx) => {
        if (idx !== i) return l;
        const next = { ...l, ...patch };
        if (patch.discount !== undefined) next.discount = Math.min(100, Math.max(0, Number(patch.discount) || 0));
        return next;
      }),
    );

  async function save() {
    if (!editing || !user?.clinicId) return;
    const valid = lines.filter((l) => l.procedure.trim());
    if (valid.length === 0) return setToast('Agrega al menos un procedimiento.');
    setSaving(true);
    const sb = getSupabase();
    const header: Record<string, unknown> = {
      date: date || today(),
      status,
      paid: Number(paid) || 0,
      patient_id: null,
      clinic_id: user.clinicId,
      code: editing.code,
    };
    header.guest_name = guestName.trim() || null;
    header.guest_phone = guestPhone.trim() || null;

    let budgetId = editing.id;
    let err: string | null = null;

    if (budgetId) {
      let up = await sb.from('budgets').update(header).eq('id', budgetId);
      if (up.error && /guest_/i.test(up.error.message || '')) {
        const { guest_name: _g, guest_phone: _p, ...rest } = header;
        up = await sb.from('budgets').update(rest).eq('id', budgetId);
      }
      err = up.error?.message || null;
      if (!err) {
        const del = await sb.from('budget_lines').delete().eq('budget_id', budgetId);
        err = del.error?.message || null;
      }
    } else {
      let ins = await sb.from('budgets').insert(header).select('id').maybeSingle();
      if (ins.error && /guest_/i.test(ins.error.message || '')) {
        const { guest_name: _g, guest_phone: _p, ...rest } = header;
        ins = await sb.from('budgets').insert(rest).select('id').maybeSingle();
      }
      err = ins.error?.message || (ins.data ? null : 'sin respuesta');
      budgetId = ins.data ? String((ins.data as { id: string }).id) : null;
    }

    if (!err && budgetId) {
      const payload = valid.map((l) => ({
        clinic_id: user.clinicId,
        budget_id: budgetId,
        piece: l.piece.trim() || null,
        procedure: l.procedure.trim(),
        qty: l.qty,
        unit_price: l.unit_price,
        discount: l.discount || 0,
      }));
      let linesIns = await sb.from('budget_lines').insert(payload);
      if (linesIns.error && /discount/i.test(linesIns.error.message || '')) {
        linesIns = await sb.from('budget_lines').insert(
          valid.map((l) => ({
            clinic_id: user.clinicId,
            budget_id: budgetId,
            piece: l.piece.trim() || null,
            procedure: l.discount > 0 ? `${l.procedure.trim()} (−${l.discount}%)` : l.procedure.trim(),
            qty: l.qty,
            unit_price: Number((l.unit_price * (1 - l.discount / 100)).toFixed(2)),
          })),
        );
      }
      err = linesIns.error?.message || null;
      if (err && !editing.id) await sb.from('budgets').delete().eq('id', budgetId);
    }
    setSaving(false);
    if (err) return setToast(`No se pudo guardar: ${err}`);
    setEditing(null);
    setToast(`Proforma ${editing.code} guardada.`);
    load();
  }

  async function acceptAndRegister() {
    if (!acceptFor || !user?.clinicId) return;
    if (!reg.first_name.trim() || !reg.last_name.trim()) return setToast('Nombre y apellido son obligatorios.');
    if (!reg.cedula.trim()) return setToast('La cédula es obligatoria al aceptar.');
    setSaving(true);
    const sb = getSupabase();
    const { data: patient, error: pe } = await sb
      .from('patients')
      .insert({
        clinic_id: user.clinicId,
        first_name: reg.first_name.trim(),
        last_name: reg.last_name.trim(),
        cedula: reg.cedula.trim(),
        phone: reg.phone.trim() || null,
        email: reg.email.trim() || null,
        active: true,
      })
      .select('id')
      .maybeSingle();
    if (pe || !patient) {
      setSaving(false);
      return setToast(`No se pudo registrar el paciente: ${pe?.message || 'error'}`);
    }
    const patientId = (patient as { id: string }).id;
    const guestNameSnap = acceptFor.guest_name;
    const guestPhoneSnap = acceptFor.guest_phone;
    const { error: be } = await sb
      .from('budgets')
      .update({ patient_id: patientId, status: 'Aprobada', guest_name: null, guest_phone: null })
      .eq('id', acceptFor.id);
    setSaving(false);
    if (be) return setToast(`Paciente creado, pero no se vinculó el presupuesto: ${be.message}`);

    // Factura / cargo: copia patient_id, guest_name y guest_phone del presupuesto
    const tot = totalOf(acceptFor.budget_lines);
    const concept = acceptFor.budget_lines.map((l) => l.procedure).join('; ').slice(0, 180);
    linkApprovedProformaToFinance({
      proformaCode: acceptFor.code,
      patientName: `${reg.first_name.trim()} ${reg.last_name.trim()}`.trim(),
      patientId,
      guestName: guestNameSnap,
      guestPhone: guestPhoneSnap,
      concept: concept || `Proforma ${acceptFor.code}`,
      total: tot,
      paid: Number(acceptFor.paid || 0),
    });

    setAcceptFor(null);
    setToast(`Presupuesto ${acceptFor.code} aceptado, paciente registrado y cargo en finanzas.`);
    load();
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Proformas independientes</h1>
            <p className="text-sm text-muted-foreground">
              Para clientes no registrados. Se identifican solo por código. Al aceptar se cargan los datos del paciente.
            </p>
          </div>
          <button type="button" className={btnPrimary()} onClick={openNew}>
            <Icon name="PlusIcon" size={16} /> Nueva proforma
          </button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {!rows && !error && <div className="h-24 animate-pulse rounded-xl bg-muted/40" />}
        {rows && rows.length === 0 && (
          <EmptyState
            icon={<Icon name="DocumentTextIcon" size={24} />}
            title="Sin proformas independientes"
            description="Crea una proforma con código. Cuando el cliente acepte, registras sus datos."
          />
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
                  {(b.guest_name || b.guest_phone) && (
                    <span className="text-xs text-muted-foreground">
                      {b.guest_name || 'Sin nombre'}{b.guest_phone ? ` · ${b.guest_phone}` : ''}
                    </span>
                  )}
                  <div className="ml-auto flex gap-2">
                    {(b.status === 'Borrador' || b.status === 'Enviada') && (
                      <button
                        type="button"
                        className={btnPrimary()}
                        onClick={() => {
                          setAcceptFor(b);
                          setReg({
                            first_name: (b.guest_name || '').split(' ')[0] || '',
                            last_name: (b.guest_name || '').split(' ').slice(1).join(' ') || '',
                            cedula: '',
                            phone: b.guest_phone || '',
                            email: '',
                          });
                        }}
                      >
                        Cliente aceptó · Registrar
                      </button>
                    )}
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
                        <th className="px-4 py-2">P. unit.</th>
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
                <footer className="flex justify-end gap-4 border-t border-border px-4 py-3 text-sm">
                  <span>Total <strong>{money(t)}</strong></span>
                </footer>
              </article>
            );
          })}
        </div>

        <Modal
          open={!!editing}
          onClose={() => !saving && setEditing(null)}
          size="xl"
          title={editing?.id ? `Editar ${editing.code}` : 'Nueva proforma independiente'}
          subtitle={editing ? `Código ${editing.code} · sin ficha de paciente` : undefined}
          footer={
            <>
              <span className="mr-auto text-sm">Total <strong>{money(total)}</strong></span>
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
            <Field label="Nombre de referencia (opcional)" className="sm:col-span-2">
              <input className={fld} value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Ej. Juan Pérez (no registrado)" />
            </Field>
            <Field label="Teléfono (opcional)">
              <input className={fld} value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
            </Field>
          </div>

          <p className="mb-2 mt-4 text-sm font-semibold">Procedimientos</p>
          <div className="space-y-2">
            {lines.map((l, i) => (
              <div key={i} className="grid grid-cols-12 items-end gap-2">
                <Field label={i === 0 ? 'Pieza' : ''} className="col-span-1"><input className={fld} value={l.piece} onChange={(e) => setLine(i, { piece: e.target.value })} /></Field>
                <Field label={i === 0 ? 'Procedimiento *' : ''} className="col-span-4"><input className={fld} value={l.procedure} onChange={(e) => setLine(i, { procedure: e.target.value })} /></Field>
                <Field label={i === 0 ? 'Cant.' : ''} className="col-span-1"><input type="number" min="1" className={fld} value={l.qty} onChange={(e) => setLine(i, { qty: Number(e.target.value) })} /></Field>
                <Field label={i === 0 ? 'P. unitario' : ''} className="col-span-2"><input type="number" min="0" step="0.01" className={fld} value={l.unit_price} onChange={(e) => setLine(i, { unit_price: Number(e.target.value) })} /></Field>
                <Field label={i === 0 ? 'Desc. %' : ''} className="col-span-2"><input type="number" min="0" max="100" className={fld} value={l.discount} onChange={(e) => setLine(i, { discount: Number(e.target.value) })} /></Field>
                <div className="col-span-1 mb-2 text-right text-xs font-semibold">{money(lineNet(l))}</div>
                <button type="button" className="col-span-1 mb-1 rounded-md p-2 text-muted-foreground hover:bg-muted" onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((_, k) => k !== i) : ls))}>
                  <Icon name="TrashIcon" size={16} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className={`${btnGhost} mt-3`} onClick={() => setLines((ls) => [...ls, blank()])}>
            <Icon name="PlusIcon" size={14} /> Agregar procedimiento
          </button>
        </Modal>

        <Modal
          open={!!acceptFor}
          onClose={() => !saving && setAcceptFor(null)}
          size="lg"
          title={`Registrar paciente · ${acceptFor?.code || ''}`}
          subtitle="El cliente aceptó el presupuesto. Completa los datos para crear la ficha y vincularlo."
          footer={
            <>
              <button type="button" className={btnGhost} onClick={() => setAcceptFor(null)} disabled={saving}>Cancelar</button>
              <button type="button" className={btnPrimary(saving)} onClick={acceptAndRegister} disabled={saving}>
                {saving ? 'Guardando…' : 'Registrar y vincular'}
              </button>
            </>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nombres *"><input className={fld} value={reg.first_name} onChange={(e) => setReg((s) => ({ ...s, first_name: e.target.value }))} /></Field>
            <Field label="Apellidos *"><input className={fld} value={reg.last_name} onChange={(e) => setReg((s) => ({ ...s, last_name: e.target.value }))} /></Field>
            <Field label="Cédula *"><input className={fld} value={reg.cedula} onChange={(e) => setReg((s) => ({ ...s, cedula: e.target.value }))} /></Field>
            <Field label="Teléfono"><input className={fld} value={reg.phone} onChange={(e) => setReg((s) => ({ ...s, phone: e.target.value }))} /></Field>
            <Field label="Email" className="sm:col-span-2"><input className={fld} value={reg.email} onChange={(e) => setReg((s) => ({ ...s, email: e.target.value }))} /></Field>
          </div>
        </Modal>

        {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
      </div>
    </AppLayout>
  );
}
