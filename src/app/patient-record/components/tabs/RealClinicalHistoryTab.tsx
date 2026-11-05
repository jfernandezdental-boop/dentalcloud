'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

const CIE10_DENTAL: { code: string; label: string }[] = [
  { code: 'K00.0', label: 'Anodoncia' },
  { code: 'K00.1', label: 'Dientes supernumerarios' },
  { code: 'K00.2', label: 'Anomalías del tamaño y de la forma del diente' },
  { code: 'K00.3', label: 'Dientes moteados (fluorosis dental)' },
  { code: 'K00.4', label: 'Alteraciones en la formación dentaria' },
  { code: 'K00.5', label: 'Alteraciones hereditarias de la estructura dental' },
  { code: 'K00.6', label: 'Alteraciones en la erupción dentaria' },
  { code: 'K00.7', label: 'Síndrome de la dentición' },
  { code: 'K00.8', label: 'Otros trastornos del desarrollo de los dientes' },
  { code: 'K00.9', label: 'Trastorno del desarrollo de los dientes, no especificado' },
  { code: 'K01.0', label: 'Dientes incluidos' },
  { code: 'K01.1', label: 'Dientes impactados' },
  { code: 'K02.0', label: 'Caries limitada al esmalte' },
  { code: 'K02.1', label: 'Caries de la dentina' },
  { code: 'K02.2', label: 'Caries del cemento' },
  { code: 'K02.3', label: 'Caries detenida' },
  { code: 'K02.4', label: 'Odontoclasia' },
  { code: 'K02.5', label: 'Caries con exposición de la pulpa' },
  { code: 'K02.8', label: 'Otras caries dentales' },
  { code: 'K02.9', label: 'Caries dental, no especificada' },
  { code: 'K03.0', label: 'Atrición excesiva de los dientes' },
  { code: 'K03.1', label: 'Abrasión de los dientes' },
  { code: 'K03.2', label: 'Erosión de los dientes' },
  { code: 'K03.3', label: 'Reabsorción patológica de los dientes' },
  { code: 'K03.4', label: 'Hipercementosis' },
  { code: 'K03.5', label: 'Anquilosis de los dientes' },
  { code: 'K03.6', label: 'Depósitos (acrecciones) en los dientes: sarro, placa, tinciones' },
  { code: 'K03.7', label: 'Cambios de color de los tejidos duros dentales posteriores a la erupción' },
  { code: 'K03.8', label: 'Otras enfermedades especificadas de los tejidos duros de los dientes' },
  { code: 'K03.9', label: 'Enfermedad de los tejidos duros de los dientes, no especificada' },
  { code: 'K04.0', label: 'Pulpitis' },
  { code: 'K04.1', label: 'Necrosis de la pulpa' },
  { code: 'K04.2', label: 'Degeneración de la pulpa' },
  { code: 'K04.3', label: 'Formación anormal de tejido duro en la pulpa' },
  { code: 'K04.4', label: 'Periodontitis apical aguda de origen pulpar' },
  { code: 'K04.5', label: 'Periodontitis apical crónica' },
  { code: 'K04.6', label: 'Absceso periapical con fístula' },
  { code: 'K04.7', label: 'Absceso periapical sin fístula' },
  { code: 'K04.8', label: 'Quiste radicular' },
  { code: 'K04.9', label: 'Otras enfermedades y las no especificadas de la pulpa y de los tejidos periapicales' },
  { code: 'K05.0', label: 'Gingivitis aguda' },
  { code: 'K05.1', label: 'Gingivitis crónica' },
  { code: 'K05.2', label: 'Periodontitis aguda' },
  { code: 'K05.3', label: 'Periodontitis crónica' },
  { code: 'K05.4', label: 'Periodontosis' },
  { code: 'K05.5', label: 'Otras enfermedades periodontales' },
  { code: 'K05.6', label: 'Enfermedad periodontal, no especificada' },
  { code: 'K06.0', label: 'Retracción gingival' },
  { code: 'K06.1', label: 'Hiperplasia gingival' },
  { code: 'K06.2', label: 'Lesiones de la encía y de la zona edéntula asociadas con traumatismo' },
  { code: 'K06.8', label: 'Otros trastornos especificados de la encía y de la zona edéntula' },
  { code: 'K06.9', label: 'Trastorno de la encía y de la zona edéntula' },
  { code: 'K07.0', label: 'Anomalías significativas del tamaño de los maxilares' },
  { code: 'K07.1', label: 'Anomalías de la relación entre los maxilares y la base del cráneo' },
  { code: 'K07.2', label: 'Anomalías de la relación entre los arcos dentarios' },
  { code: 'K07.3', label: 'Anomalías de la posición del diente' },
  { code: 'K07.4', label: 'Maloclusión, no especificada' },
  { code: 'K07.5', label: 'Anomalías dentofaciales funcionales' },
  { code: 'K07.6', label: 'Trastornos de la articulación temporomandibular' },
  { code: 'K07.8', label: 'Otras anomalías dentofaciales' },
  { code: 'K07.9', label: 'Anomalía dentofacial, no especificada' },
  { code: 'K08.0', label: 'Exfoliación de los dientes debida a causas sistémicas' },
  { code: 'K08.1', label: 'Pérdida de dientes debida a accidente, extracción o enfermedad periodontal local' },
  { code: 'K08.2', label: 'Atrofia de reborde alveolar desdentado' },
  { code: 'K08.3', label: 'Raíz dental retenida' },
  { code: 'K08.8', label: 'Otros trastornos especificados de los dientes y de sus estructuras de sostén' },
  { code: 'K08.9', label: 'Trastorno de los dientes y de sus estructuras de sostén, no especificado' },
  { code: 'K09.0', label: 'Quistes originados por el desarrollo de los maxilares' },
  { code: 'K09.1', label: 'Quistes de las fisuras (no odontogénicos) de la región bucal' },
  { code: 'K09.2', label: 'Otros quistes de los maxilares' },
  { code: 'K09.8', label: 'Otros quistes de la región bucal, no clasificados en otra parte' },
  { code: 'K09.9', label: 'Quiste de la región bucal, no especificado' },
  { code: 'K10.0', label: 'Trastornos del desarrollo de los maxilares' },
  { code: 'K10.1', label: 'Granuloma central de células gigantes' },
  { code: 'K10.2', label: 'Afecciones inflamatorias de los maxilares' },
  { code: 'K10.3', label: 'Alveolitis del maxilar' },
  { code: 'K10.8', label: 'Otros trastornos especificados de los maxilares' },
  { code: 'K10.9', label: 'Trastorno de los maxilares, no especificado' },
  { code: 'K11.0', label: 'Atrofia de glándula salival' },
  { code: 'K11.1', label: 'Hipertrofia de glándula salival' },
  { code: 'K11.2', label: 'Sialoadenitis' },
  { code: 'K11.3', label: 'Absceso de glándula salival' },
  { code: 'K11.4', label: 'Fístula de glándula salival' },
  { code: 'K11.5', label: 'Sialolitiasis' },
  { code: 'K11.6', label: 'Mucocele de glándula salival' },
  { code: 'K11.7', label: 'Alteraciones de la secreción salival' },
  { code: 'K11.8', label: 'Otras enfermedades de las glándulas salivales' },
  { code: 'K11.9', label: 'Enfermedad de glándula salival, no especificada' },
  { code: 'K12.0', label: 'Aftas bucales recidivantes' },
  { code: 'K12.1', label: 'Otras formas de estomatitis' },
  { code: 'K12.2', label: 'Celulitis y absceso de boca' },
  { code: 'K12.3', label: 'Mucositis oral (ulcerativa)' },
  { code: 'K13.0', label: 'Enfermedades de los labios' },
  { code: 'K13.1', label: 'Mordedura del labio y de la mejilla' },
  { code: 'K13.2', label: 'Leucoplasia y otras alteraciones de la mucosa oral' },
  { code: 'K13.3', label: 'Leucoplasia vellosa' },
  { code: 'K13.4', label: 'Granuloma y lesiones granulomatosas de la mucosa oral' },
  { code: 'K13.5', label: 'Fibrosis de la submucosa oral' },
  { code: 'K13.6', label: 'Hiperplasia irritativa de la mucosa oral' },
  { code: 'K13.7', label: 'Otras lesiones y las no especificadas de la mucosa oral' },
  { code: 'K14.0', label: 'Glositis' },
  { code: 'K14.1', label: 'Lengua geográfica' },
  { code: 'K14.2', label: 'Glositis romboidea media' },
  { code: 'K14.3', label: 'Hipertrofia de las papilas linguales' },
  { code: 'K14.4', label: 'Atrofia de las papilas linguales' },
  { code: 'K14.5', label: 'Lengua plegada' },
  { code: 'K14.6', label: 'Glosodinia' },
  { code: 'K14.8', label: 'Otras enfermedades de la lengua' },
  { code: 'K14.9', label: 'Enfermedad de la lengua, no especificada' },
  { code: 'S02.5', label: 'Fractura de diente' },
  { code: 'S03.2', label: 'Luxación de diente' },
  { code: 'Z46.3', label: 'Colocación y ajuste de prótesis dental' },
  { code: 'Z46.4', label: 'Colocación y ajuste de aparato ortodóncico' },
  { code: 'Z96.5', label: 'Presencia de implantes de raíz dental y de mandíbula' },
];

export default function RealClinicalHistoryTab({ patientId }: { patientId: string }) {
  const { user } = useAuth();
  const [rows, setRows] = useState<History[] | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<{ id: string | null } | null>(null);
  const [f, setF] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [selectedDx, setSelectedDx] = useState<{ code: string; label: string }[]>([]);
  const [dxQuery, setDxQuery] = useState('');
  const [dxOpen, setDxOpen] = useState(false);

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

  const filteredDx = useMemo(() => {
    const q = dxQuery.trim().toLowerCase();
    if (!q) return CIE10_DENTAL.slice(0, 40);
    return CIE10_DENTAL.filter((d) => d.code.toLowerCase().includes(q) || d.label.toLowerCase().includes(q)).slice(0, 50);
  }, [dxQuery]);

  const addDx = (d: { code: string; label: string }) => {
    if (selectedDx.some((x) => x.code === d.code)) return;
    const next = [...selectedDx, d];
    setSelectedDx(next);
    setF((s) => ({ ...s, diagnosis: next.map((x) => `${x.code} ${x.label}`).join(' · ') }));
    setDxQuery('');
    setDxOpen(false);
  };

  const removeDx = (code: string) => {
    const next = selectedDx.filter((x) => x.code !== code);
    setSelectedDx(next);
    setF((s) => ({ ...s, diagnosis: next.map((x) => `${x.code} ${x.label}`).join(' · ') }));
  };

  function openNew() {
    setF({ ...EMPTY, date: today() });
    setSelectedDx([]);
    setDxQuery('');
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
    const parts = (h.diagnosis || '').split('·').map((s) => s.trim()).filter(Boolean);
    const parsed = parts.map((p) => {
      const m = p.match(/^(K\d{2}\.?\d?|S\d{2}\.?\d?|Z\d{2}\.?\d?)\s+(.+)$/i);
      return m ? { code: m[1], label: m[2] } : { code: p.slice(0, 6), label: p };
    });
    setSelectedDx(parsed);
    setDxQuery('');
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

          <div className="sm:col-span-2">
            <p className="mb-1.5 text-sm font-semibold">Diagnóstico (CIE-10)</p>
            <p className="mb-2 text-xs text-muted-foreground">Escribe código o palabra; selecciona y se agrega al diagnóstico.</p>
            <div className="relative">
              <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-input bg-card px-2 py-1.5">
                {selectedDx.map((d) => (
                  <span key={d.code} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    <span className="font-bold">{d.code}</span> {d.label}
                    <button type="button" onClick={() => removeDx(d.code)} className="ml-0.5 rounded hover:bg-primary/20" aria-label={`Quitar ${d.code}`}>×</button>
                  </span>
                ))}
                <input
                  value={dxQuery}
                  onChange={(e) => { setDxQuery(e.target.value); setDxOpen(true); }}
                  onFocus={() => setDxOpen(true)}
                  placeholder="Buscar por código (K02.1) o palabra (caries...)"
                  className="min-w-[180px] flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none"
                />
              </div>
              {dxOpen && (
                <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-input bg-card shadow-lg">
                  {filteredDx.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</li>
                  ) : (
                    filteredDx.map((d) => (
                      <li key={d.code}>
                        <button type="button" className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => addDx(d)}>
                          <span className="shrink-0 font-bold text-primary">{d.code}</span>
                          <span>{d.label}</span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>

          <Field label="Plan de tratamiento" className="sm:col-span-2"><textarea rows={2} className={fld} value={f.plan} onChange={(e) => set('plan', e.target.value)} /></Field>
        </div>
      </Modal>
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
