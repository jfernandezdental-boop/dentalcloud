'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import Badge from '@/components/ui/Badge';
import { getSupabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Field, fld, btnGhost, btnPrimary, today } from './formKit';

type FieldDef = { key: string; label: string; ref?: string; options?: string[] };
type Section = { title: string; fields: FieldDef[] };
type Panel = { id: string; name: string; sections: Section[] };

/** Paneles clínicos estándar (prequirúrgico / laboratorio clínico). */
const PANELS: Panel[] = [
  {
    id: 'uroanalisis',
    name: 'Uroanálisis',
    sections: [
      {
        title: 'Examen físico',
        fields: [
          { key: 'color', label: 'Color', options: ['Amarillo', 'Ámbar', 'Rojo', 'Marrón', 'Incoloro', 'Otro'] },
          { key: 'aspecto', label: 'Aspecto', options: ['Claro', 'Lig. turbio', 'Turbio', 'Opaco'] },
        ],
      },
      {
        title: 'Examen químico',
        fields: [
          { key: 'densidad', label: 'Densidad', ref: '1,001 – 1,035' },
          { key: 'ph', label: 'pH', ref: '5,00 – 9,00' },
          { key: 'leucocitos_q', label: 'Leucocitos', options: ['Negativo', 'Trazas', '+', '++', '+++'] },
          { key: 'nitritos', label: 'Nitritos', options: ['Negativo', 'Positivo'] },
          { key: 'proteinas', label: 'Proteínas', options: ['Negativo', 'Trazas', '+', '++', '+++'] },
          { key: 'glucosa', label: 'Glucosa', options: ['Negativo', 'Trazas', '+', '++', '+++'] },
          { key: 'cetonas', label: 'Cetonas', options: ['Negativo', 'Trazas', '+', '++', '+++'] },
          { key: 'urobilinogeno', label: 'Urobilinógeno', options: ['Negativo', 'Normal', 'Elevado'] },
          { key: 'bilirrubina', label: 'Bilirrubina', options: ['Negativo', '+', '++', '+++'] },
          { key: 'sangre', label: 'Sangre', options: ['Negativo', 'Trazas', '+', '++', '+++'] },
        ],
      },
      {
        title: 'Sedimento',
        fields: [
          { key: 'celulas_epiteliales', label: 'Células epiteliales', options: ['Negativo', 'Escasas', '+', '++', '+++'] },
          { key: 'leucocitos_s', label: 'Leucocitos', ref: '0 – 5 / campo' },
          { key: 'hematies', label: 'Hematíes', ref: '0 – 2 / campo' },
          { key: 'bacterias', label: 'Bacterias', options: ['Negativo', 'Escasas', '+', '++', '+++'] },
          { key: 'cristales', label: 'Cristales', options: ['Negativo', 'Presentes'] },
          { key: 'filamentos_mucosos', label: 'Filamentos mucosos', options: ['Negativo', 'Escasos', '+', '++'] },
          { key: 'cilindros', label: 'Cilindros', options: ['Negativo', 'Hialinos', 'Granulosos', 'Otros'] },
          { key: 'hongos', label: 'Hongos', options: ['Negativo', 'Presentes'] },
          { key: 'levaduras', label: 'Levaduras', options: ['Negativo', 'Presentes'] },
          { key: 'otros', label: 'Otros', options: ['Negativo'] },
        ],
      },
    ],
  },
  {
    id: 'hemograma',
    name: 'Hemograma completo',
    sections: [
      {
        title: 'Serie roja',
        fields: [
          { key: 'hematies', label: 'Hematíes (mill/µL)', ref: 'H 4,5–5,5 · M 4,0–5,0' },
          { key: 'hemoglobina', label: 'Hemoglobina (g/dL)', ref: 'H 13–17 · M 12–15' },
          { key: 'hematocrito', label: 'Hematocrito (%)', ref: 'H 40–50 · M 36–45' },
          { key: 'vcm', label: 'VCM (fL)', ref: '80 – 100' },
          { key: 'hcm', label: 'HCM (pg)', ref: '27 – 32' },
          { key: 'chcm', label: 'CHCM (g/dL)', ref: '32 – 36' },
          { key: 'rdw', label: 'RDW (%)', ref: '11 – 15' },
        ],
      },
      {
        title: 'Serie blanca',
        fields: [
          { key: 'leucocitos', label: 'Leucocitos (/µL)', ref: '4.000 – 10.000' },
          { key: 'neutrofilos', label: 'Neutrófilos (%)', ref: '50 – 70' },
          { key: 'linfocitos', label: 'Linfocitos (%)', ref: '20 – 40' },
          { key: 'monocitos', label: 'Monocitos (%)', ref: '2 – 10' },
          { key: 'eosinofilos', label: 'Eosinófilos (%)', ref: '1 – 4' },
          { key: 'basofilos', label: 'Basófilos (%)', ref: '0 – 1' },
        ],
      },
      {
        title: 'Plaquetas',
        fields: [{ key: 'plaquetas', label: 'Plaquetas (/µL)', ref: '150.000 – 400.000' }],
      },
    ],
  },
  {
    id: 'glucosa_ayunas',
    name: 'Glucosa en ayunas',
    sections: [
      {
        title: 'Resultado',
        fields: [
          { key: 'glucosa', label: 'Glucosa (mg/dL)', ref: '70 – 100 (ayunas)' },
          { key: 'observaciones', label: 'Observaciones' },
        ],
      },
    ],
  },
  {
    id: 'coagulacion',
    name: 'Perfil de coagulación',
    sections: [
      {
        title: 'Tiempos',
        fields: [
          { key: 'tp', label: 'Tiempo de protrombina (seg)', ref: '11 – 13,5' },
          { key: 'inr', label: 'INR', ref: '0,8 – 1,2' },
          { key: 'ttp', label: 'TTP / aPTT (seg)', ref: '25 – 35' },
          { key: 'sangria', label: 'Tiempo de sangría (min)', ref: '1 – 3' },
          { key: 'coagulacion', label: 'Tiempo de coagulación (min)', ref: '5 – 10' },
        ],
      },
    ],
  },
  {
    id: 'quimica_basica',
    name: 'Química sanguínea básica',
    sections: [
      {
        title: 'Parámetros',
        fields: [
          { key: 'creatinina', label: 'Creatinina (mg/dL)', ref: '0,6 – 1,3' },
          { key: 'urea', label: 'Urea (mg/dL)', ref: '15 – 40' },
          { key: 'bun', label: 'BUN (mg/dL)', ref: '7 – 20' },
          { key: 'acido_urico', label: 'Ácido úrico (mg/dL)', ref: 'H 3,5–7,2 · M 2,6–6,0' },
        ],
      },
    ],
  },
];

type LabExam = {
  id: string;
  date: string | null;
  panel: string;
  status: string | null;
  results: Record<string, string> | null;
  notes: string | null;
  lab_name: string | null;
};

export default function RealLabExamsTab({ patientId }: { patientId: string }) {
  const { user } = useAuth();
  const [rows, setRows] = useState<LabExam[] | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [panelId, setPanelId] = useState(PANELS[0].id);
  const [date, setDate] = useState(today());
  const [status, setStatus] = useState('Completado');
  const [labName, setLabName] = useState('');
  const [notes, setNotes] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const panel = useMemo(() => PANELS.find((p) => p.id === panelId) || PANELS[0], [panelId]);

  const load = useCallback(async () => {
    const { data, error: e } = await getSupabase()
      .from('lab_exams')
      .select('id, date, panel, status, results, notes, lab_name')
      .eq('patient_id', patientId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (e) {
      setError(e.message.includes('lab_exams') ? 'Crea la tabla lab_exams en Supabase (ver SQL al final).' : 'No se pudieron cargar los exámenes.');
      setRows([]);
    } else {
      setError('');
      setRows((data as LabExam[]) || []);
    }
  }, [patientId]);

  useEffect(() => {
    setRows(null);
    load();
  }, [load]);

  function openNew() {
    setEditingId(null);
    setPanelId('uroanalisis');
    setDate(today());
    setStatus('Completado');
    setLabName('');
    setNotes('');
    setValues({});
    setOpen(true);
  }

  function openEdit(ex: LabExam) {
    setEditingId(ex.id);
    setPanelId(ex.panel || 'uroanalisis');
    setDate(ex.date || today());
    setStatus(ex.status || 'Completado');
    setLabName(ex.lab_name || '');
    setNotes(ex.notes || '');
    setValues(ex.results || {});
    setOpen(true);
  }

  function setVal(key: string, v: string) {
    setValues((s) => ({ ...s, [key]: v }));
  }

  async function save() {
    if (!user?.clinicId) return setToast('Sin clínica activa.');
    setSaving(true);
    const payload = {
      clinic_id: user.clinicId,
      patient_id: patientId,
      date: date || today(),
      panel: panelId,
      status,
      results: values,
      notes: notes.trim() || null,
      lab_name: labName.trim() || null,
    };
    const sb = getSupabase();
    const { error: e } = editingId
      ? await sb.from('lab_exams').update(payload).eq('id', editingId)
      : await sb.from('lab_exams').insert(payload);
    setSaving(false);
    if (e) return setToast(`No se pudo guardar: ${e.message}`);
    setOpen(false);
    setToast('Examen de laboratorio guardado.');
    load();
  }

  const panelName = (id: string) => PANELS.find((p) => p.id === id)?.name || id;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Exámenes de laboratorio</h3>
          <p className="text-xs text-muted-foreground">
            Uroanálisis, hemograma, coagulación y química con campos estándar y valores de referencia.
          </p>
        </div>
        <button type="button" className={btnPrimary()} onClick={openNew}>
          <Icon name="PlusIcon" size={16} /> Nuevo examen
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
      {!rows && !error && <div className="h-24 animate-pulse rounded-xl bg-muted/40" />}
      {rows && rows.length === 0 && !error && (
        <EmptyState
          icon={<Icon name="BeakerIcon" size={24} />}
          title="Sin exámenes"
          description="Registra uroanálisis, hemograma u otros paneles prequirúrgicos."
        />
      )}

      <div className="space-y-3">
        {rows?.map((ex) => (
          <article key={ex.id} className="rounded-xl border border-border">
            <header className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
              <span className="text-sm font-semibold">{panelName(ex.panel)}</span>
              <span className="text-xs text-muted-foreground">{ex.date}</span>
              {ex.status && <Badge>{ex.status}</Badge>}
              {ex.lab_name && <span className="text-xs text-muted-foreground">{ex.lab_name}</span>}
              <button type="button" className={`${btnGhost} ml-auto`} onClick={() => openEdit(ex)}>
                <Icon name="PencilSquareIcon" size={14} /> Editar
              </button>
            </header>
            <div className="overflow-x-auto p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-muted-foreground">
                    <th className="pb-2 pr-4">Prueba</th>
                    <th className="pb-2 pr-4">Resultado</th>
                    <th className="pb-2">Valores de ref.</th>
                  </tr>
                </thead>
                <tbody>
                  {(PANELS.find((p) => p.id === ex.panel)?.sections || []).flatMap((sec) =>
                    sec.fields.map((fd) => (
                      <tr key={fd.key} className="border-t border-border/60">
                        <td className="py-1.5 pr-4 text-muted-foreground">{fd.label}</td>
                        <td className="py-1.5 pr-4 font-semibold">{(ex.results || {})[fd.key] || '—'}</td>
                        <td className="py-1.5 text-xs text-muted-foreground">{fd.ref || ''}</td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
              {ex.notes && <p className="mt-3 text-xs text-muted-foreground">{ex.notes}</p>}
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => !saving && setOpen(false)}
        size="xl"
        title={editingId ? 'Editar examen' : 'Nuevo examen de laboratorio'}
        subtitle="Completa los resultados según el estándar del panel"
        footer={
          <>
            <button type="button" className={btnGhost} onClick={() => setOpen(false)} disabled={saving}>Cancelar</button>
            <button type="button" className={btnPrimary(saving)} onClick={save} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar resultados'}
            </button>
          </>
        }
      >
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Field label="Tipo de examen">
            <select
              className={fld}
              value={panelId}
              onChange={(e) => {
                setPanelId(e.target.value);
                setValues({});
              }}
              disabled={!!editingId}
            >
              {PANELS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Fecha"><input type="date" className={fld} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Estado">
            <select className={fld} value={status} onChange={(e) => setStatus(e.target.value)}>
              {['Solicitado', 'En proceso', 'Completado', 'Revisado'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Laboratorio" className="sm:col-span-2">
            <input className={fld} value={labName} onChange={(e) => setLabName(e.target.value)} placeholder="Nombre del laboratorio" />
          </Field>
        </div>

        {panel.sections.map((sec) => (
          <div key={sec.title} className="mb-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">{sec.title}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {sec.fields.map((fd) => (
                <div key={fd.key}>
                  <label className="mb-1 flex items-baseline justify-between gap-2 text-sm font-semibold">
                    <span>{fd.label}</span>
                    {fd.ref && <span className="text-[10px] font-normal text-muted-foreground">Ref. {fd.ref}</span>}
                  </label>
                  {fd.options ? (
                    <select className={fld} value={values[fd.key] || ''} onChange={(e) => setVal(fd.key, e.target.value)}>
                      <option value="">—</option>
                      {fd.options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input className={fld} value={values[fd.key] || ''} onChange={(e) => setVal(fd.key, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <Field label="Observaciones / interpretación">
          <textarea rows={2} className={fld} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
      </Modal>

      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
