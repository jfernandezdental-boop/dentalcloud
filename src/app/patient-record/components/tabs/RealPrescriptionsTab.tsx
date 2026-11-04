'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import { getSupabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Field, fld, btnGhost, btnPrimary, today } from './formKit';

type Rx = { id: string; date: string | null; drug: string; dose: string | null; duration: string | null; indications: string | null };
const EMPTY = { date: '', drug: '', dose: '', duration: '', indications: '' };

/** Recetario del paciente: tabla prescriptions (RLS por clinica). Nuevo / Editar / Guardar. */
export default function RealPrescriptionsTab({ patientId }: { patientId: string }) {
  const { user } = useAuth();
  const [rows, setRows] = useState<Rx[] | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<{ id: string | null } | null>(null);
  const [f, setF] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    const { data, error: e } = await getSupabase()
      .from('prescriptions')
      .select('id, date, drug, dose, duration, indications')
      .eq('patient_id', patientId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (e) setError('No se pudo cargar el recetario.');
    else {
      setError('');
      setRows((data as Rx[]) || []);
    }
  }, [patientId]);

  useEffect(() => {
    setRows(null);
    load();
  }, [load]);

  const set = (k: keyof typeof EMPTY, v: string) => setF((s) => ({ ...s, [k]: v }));

  async function save() {
    if (!user?.clinicId) return setToast('No hay una clínica activa en tu sesión.');
    if (!f.drug.trim()) return setToast('Escribe el medicamento.');
    setSaving(true);
    const payload = {
      date: f.date || today(),
      drug: f.drug.trim(),
      dose: f.dose.trim() || null,
      duration: f.duration.trim() || null,
      indications: f.indications.trim() || null,
    };
    const sb = getSupabase();
    const { error: e } = editing?.id
      ? await sb.from('prescriptions').update(payload).eq('id', editing.id)
      : await sb.from('prescriptions').insert({ ...payload, clinic_id: user.clinicId, patient_id: patientId });
    setSaving(false);
    if (e) return setToast(`No se pudo guardar: ${e.message}`);
    setEditing(null);
    setToast('Receta guardada.');
    load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Recetario</h3>
          <p className="text-xs text-muted-foreground">Medicamentos recetados a este paciente.</p>
        </div>
        <button type="button" className={btnPrimary()} onClick={() => { setF({ ...EMPTY, date: today() }); setEditing({ id: null }); }}>
          <Icon name="PlusIcon" size={16} /> Nueva receta
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {!rows && !error && <div className="h-24 animate-pulse rounded-xl bg-muted/40" />}
      {rows && rows.length === 0 && (
        <EmptyState icon={<Icon name="BeakerIcon" size={24} />} title="Sin recetas" description="Pulsa «Nueva receta» para registrar la primera." />
      )}
      <ul className="space-y-3">
        {rows?.map((r) => (
          <li key={r.id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold">{r.drug}</span>
              <span className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{r.date}</span>
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => {
                    setF({ date: r.date || today(), drug: r.drug, dose: r.dose || '', duration: r.duration || '', indications: r.indications || '' });
                    setEditing({ id: r.id });
                  }}
                >
                  <Icon name="PencilSquareIcon" size={14} /> Editar
                </button>
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {[r.dose && `Dosis: ${r.dose}`, r.duration && `Duración: ${r.duration}`].filter(Boolean).join(' · ') || 'Sin dosis registrada'}
            </p>
            {r.indications && <p className="mt-1 text-sm">{r.indications}</p>}
          </li>
        ))}
      </ul>

      <Modal
        open={!!editing}
        onClose={() => !saving && setEditing(null)}
        title={editing?.id ? 'Editar receta' : 'Nueva receta'}
        subtitle="Los campos con * son obligatorios"
        footer={
          <>
            <button type="button" className={btnGhost} onClick={() => setEditing(null)} disabled={saving}>Cancelar</button>
            <button type="button" className={btnPrimary(saving)} onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Fecha"><input type="date" className={fld} value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
          <Field label="Medicamento" required><input className={fld} value={f.drug} onChange={(e) => set('drug', e.target.value)} placeholder="Ej. Amoxicilina 500 mg" /></Field>
          <Field label="Dosis"><input className={fld} value={f.dose} onChange={(e) => set('dose', e.target.value)} placeholder="1 cápsula cada 8 horas" /></Field>
          <Field label="Duración"><input className={fld} value={f.duration} onChange={(e) => set('duration', e.target.value)} placeholder="7 días" /></Field>
          <Field label="Indicaciones" className="sm:col-span-2"><textarea rows={3} className={fld} value={f.indications} onChange={(e) => set('indications', e.target.value)} /></Field>
        </div>
      </Modal>
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
