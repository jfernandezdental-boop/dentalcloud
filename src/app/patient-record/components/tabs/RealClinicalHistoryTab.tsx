'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import { getSupabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Field, fld, btnGhost, btnPrimary, today } from './formKit';

type Json = Record<string, string>;
type History = {
  id: string;
  date: string | null;
  reason: string | null;
  current_illness: string | null;
  diagnosis: string | null;
  plan: string | null;
  antecedents: Json | null;
  vitals: Json | null;
  exam: Json | null;
  oral_health: Json | null;
};

type Form = {
  date: string; reason: string; current_illness: string; diagnosis: string; plan: string;
  personales: string; familiares: string; medicamentos: string;
  pa: string; fc: string; fr: string; temp: string; peso: string;
  extraoral: string; intraoral: string; higiene: string; salud_obs: string;
};
const EMPTY: Form = {
  date: '', reason: '', current_illness: '', diagnosis: '', plan: '',
  personales: '', familiares: '', medicamentos: '',
  pa: '', fc: '', fr: '', temp: '', peso: '',
  extraoral: '', intraoral: '', higiene: '', salud_obs: '',
};
const clean = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v.trim() !== ''));

/** Historia clinica del paciente: tabla clinical_histories (RLS por clinica). Nuevo / Editar / Guardar. */
export default function RealClinicalHistoryTab({ patientId }: { patientId: string }) {
  const { user } = useAuth();
  const [rows, setRows] = useState<History[] | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<{ id: string | null } | null>(null);
  const [f, setF] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    const { data, error: e } = await getSupabase()
      .from('clinical_histories')
      .select('id, date, reason, current_illness, diagnosis, plan, antecedents, vitals, exam, oral_health')
      .eq('patient_id', patientId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (e) setError('No se pudo cargar la historia clínica.');
    else {
      setError('');
      setRows((data as unknown as History[]) || []);
    }
  }, [patientId]);

  useEffect(() => {
    setRows(null);
    load();
  }, [load]);

  const set = (k: keyof Form, v: string) => setF((s) => ({ ...s, [k]: v }));

  function openNew() {
    setF({ ...EMPTY, date: today() });
    setEditing({ id: null });
  }
  function openEdit(h: History) {
    const a = h.antecedents || {}, v = h.vitals || {}, x = h.exam || {}, o = h.oral_health || {};
    setF({
      date: h.date || today(), reason: h.reason || '', current_illness: h.current_illness || '',
      diagnosis: h.diagnosis || '', plan: h.plan || '',
      personales: a.personales || '', familiares: a.familiares || '', medicamentos: a.medicamentos || '',
      pa: v.pa || '', fc: v.fc || '', fr: v.fr || '', temp: v.temp || '', peso: v.peso || '',
      extraoral: x.extraoral || '', intraoral: x.intraoral || '', higiene: o.higiene || '', salud_obs: o.observaciones || '',
    });
    setEditing({ id: h.id });
  }

  async function save() {
    if (!user?.clinicId) return setToast('No hay una clínica activa en tu sesión.');
    if (!f.reason.trim()) return setToast('Escribe el motivo de consulta.');
    setSaving(true);
    const payload = {
      date: f.date || today(),
      reason: f.reason.trim(),
      current_illness: f.current_illness.trim() || null,
      diagnosis: f.diagnosis.trim() || null,
      plan: f.plan.trim() || null,
      antecedents: clean({ personales: f.personales, familiares: f.familiares, medicamentos: f.medicamentos }),
      vitals: clean({ pa: f.pa, fc: f.fc, fr: f.fr, temp: f.temp, peso: f.peso }),
      exam: clean({ extraoral: f.extraoral, intraoral: f.intraoral }),
      oral_health: clean({ higiene: f.higiene, observaciones: f.salud_obs }),
    };
    const sb = getSupabase();
    const { error: e } = editing?.id
      ? await sb.from('clinical_histories').update(payload).eq('id', editing.id)
      : await sb.from('clinical_histories').insert({ ...payload, clinic_id: user.clinicId, patient_id: patientId });
    setSaving(false);
    if (e) return setToast(`No se pudo guardar: ${e.message}`);
    setEditing(null);
    setToast('Historia clínica guardada.');
    load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Historia clínica</h3>
          <p className="text-xs text-muted-foreground">Cada consulta queda registrada con fecha. Puedes editarla si hay algo que corregir.</p>
        </div>
        <button type="button" onClick={openNew} className={btnPrimary()}>
          <Icon name="PlusIcon" size={16} /> Nueva historia
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {!rows && !error && <div className="h-24 animate-pulse rounded-xl bg-muted/40" />}
      {rows && rows.length === 0 && (
        <EmptyState
          icon={<Icon name="ClipboardDocumentListIcon" size={24} />}
          title="Sin historia clínica"
          description="Pulsa «Nueva historia» para registrar la primera consulta de este paciente."
        />
      )}
      <div className="space-y-3">
        {rows?.map((h) => (
          <article key={h.id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold">{h.date}</span>
              <button type="button" onClick={() => openEdit(h)} className={btnGhost}>
                <Icon name="PencilSquareIcon" size={14} /> Editar
              </button>
            </div>
            <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-muted-foreground">Motivo de consulta</dt><dd>{h.reason || '—'}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Diagnóstico</dt><dd>{h.diagnosis || '—'}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Enfermedad actual</dt><dd>{h.current_illness || '—'}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Plan de tratamiento</dt><dd>{h.plan || '—'}</dd></div>
            </dl>
          </article>
        ))}
      </div>

      <Modal
        open={!!editing}
        onClose={() => !saving && setEditing(null)}
        size="xl"
        title={editing?.id ? 'Editar historia clínica' : 'Nueva historia clínica'}
        subtitle="Los campos con * son obligatorios"
        footer={
          <>
            <button type="button" className={btnGhost} onClick={() => setEditing(null)} disabled={saving}>Cancelar</button>
            <button type="button" className={btnPrimary(saving)} onClick={save} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Fecha" required><input type="date" className={fld} value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
          <Field label="Motivo de consulta" required><input className={fld} value={f.reason} onChange={(e) => set('reason', e.target.value)} /></Field>
          <Field label="Enfermedad o problema actual" className="sm:col-span-2"><textarea rows={2} className={fld} value={f.current_illness} onChange={(e) => set('current_illness', e.target.value)} /></Field>

          <p className="sm:col-span-2 mt-1 text-sm font-semibold">Antecedentes</p>
          <Field label="Personales"><textarea rows={2} className={fld} value={f.personales} onChange={(e) => set('personales', e.target.value)} /></Field>
          <Field label="Familiares"><textarea rows={2} className={fld} value={f.familiares} onChange={(e) => set('familiares', e.target.value)} /></Field>
          <Field label="Medicación actual" className="sm:col-span-2"><input className={fld} value={f.medicamentos} onChange={(e) => set('medicamentos', e.target.value)} /></Field>

          <p className="sm:col-span-2 mt-1 text-sm font-semibold">Signos vitales</p>
          <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:grid-cols-5">
            <Field label="Presión arterial"><input className={fld} value={f.pa} onChange={(e) => set('pa', e.target.value)} placeholder="120/80" /></Field>
            <Field label="Frec. cardíaca"><input className={fld} value={f.fc} onChange={(e) => set('fc', e.target.value)} /></Field>
            <Field label="Frec. respiratoria"><input className={fld} value={f.fr} onChange={(e) => set('fr', e.target.value)} /></Field>
            <Field label="Temperatura"><input className={fld} value={f.temp} onChange={(e) => set('temp', e.target.value)} /></Field>
            <Field label="Peso (kg)"><input className={fld} value={f.peso} onChange={(e) => set('peso', e.target.value)} /></Field>
          </div>

          <p className="sm:col-span-2 mt-1 text-sm font-semibold">Examen y salud bucal</p>
          <Field label="Examen extraoral"><textarea rows={2} className={fld} value={f.extraoral} onChange={(e) => set('extraoral', e.target.value)} /></Field>
          <Field label="Examen intraoral"><textarea rows={2} className={fld} value={f.intraoral} onChange={(e) => set('intraoral', e.target.value)} /></Field>
          <Field label="Higiene oral"><input className={fld} value={f.higiene} onChange={(e) => set('higiene', e.target.value)} /></Field>
          <Field label="Observaciones de salud bucal"><input className={fld} value={f.salud_obs} onChange={(e) => set('salud_obs', e.target.value)} /></Field>

          <Field label="Diagnóstico" className="sm:col-span-2"><textarea rows={2} className={fld} value={f.diagnosis} onChange={(e) => set('diagnosis', e.target.value)} /></Field>
          <Field label="Plan de tratamiento" className="sm:col-span-2"><textarea rows={2} className={fld} value={f.plan} onChange={(e) => set('plan', e.target.value)} /></Field>
        </div>
      </Modal>
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
