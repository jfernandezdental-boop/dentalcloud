'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import Toast from '@/components/ui/Toast';

interface HcValues {
  reason: string;
  currentIllness: string;
  pa: string;
  fc: string;
  fr: string;
  temp: string;
  weight: string;
  height: string;
  lips: string;
  cheeks: string;
  tongue: string;
  palate: string;
  floor: string;
  gums: string;
  atm: string;
  plaque: string;
  calculus: string;
  gingivitis: string;
  diagnosis: string;
  plan: string;
}

const antecedentes = [
  { id: 'an-alergia', label: 'Alergia antibiótico' },
  { id: 'an-anest', label: 'Alergia anestesia' },
  { id: 'an-hemor', label: 'Hemorragias' },
  { id: 'an-vih', label: 'VIH / SIDA' },
  { id: 'an-tbc', label: 'Tuberculosis' },
  { id: 'an-asma', label: 'Asma' },
  { id: 'an-diab', label: 'Diabetes' },
  { id: 'an-hiper', label: 'Hipertensión arterial' },
  { id: 'an-cardio', label: 'Enfermedad cardiaca' },
  { id: 'an-otro', label: 'Otro' },
];

const sections = [
  { id: 'sec-a', code: 'A', title: 'Motivo de consulta' },
  { id: 'sec-b', code: 'B', title: 'Enfermedad actual' },
  { id: 'sec-c', code: 'C', title: 'Antecedentes personales y familiares' },
  { id: 'sec-d', code: 'D', title: 'Signos vitales' },
  { id: 'sec-e', code: 'E', title: 'Examen del sistema estomatognático' },
  { id: 'sec-f', code: 'F', title: 'Indicadores de salud bucal' },
  { id: 'sec-g', code: 'G', title: 'Diagnóstico y plan de tratamiento' },
];

const inputCls = 'w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20';

export default function ClinicalHistoryTab() {
  const [checks, setChecks] = useState<Record<string, boolean>>({ 'an-alergia': true, 'an-otro': false });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HcValues>({
    defaultValues: {
      reason: 'Dolor al masticar en zona posterior derecha desde hace 10 días.',
      currentIllness: 'Sensibilidad al frío y al dulce en pieza 46. Dolor espontáneo nocturno ocasional que cede con paracetamol 500 mg.',
      pa: '112/74',
      fc: '72',
      fr: '16',
      temp: '36.6',
      weight: '61',
      height: '1.64',
      lips: 'Sin lesiones',
      cheeks: 'Sin lesiones',
      tongue: 'Saburra leve, sin lesiones',
      palate: 'Sin lesiones',
      floor: 'Sin lesiones',
      gums: 'Encía marginal eritematosa en sectores posteriores',
      atm: 'Chasquido leve lado derecho, apertura 42 mm',
      plaque: '1',
      calculus: '1',
      gingivitis: '1',
      diagnosis: 'K02.1 Caries de la dentina (46) · K05.0 Gingivitis aguda localizada',
      plan: '1) Profilaxis y flúor. 2) Resina compuesta pieza 46 (OM). 3) Control en 15 días. 4) Instrucción de higiene oral.',
    },
  });

  const save = () => {
    setSaving(true);
    // Backend integration: PUT /api/patients/pac-0412/clinical-history (MSP form 033)
    setTimeout(() => {
      setSaving(false);
      setToast('Historia clínica guardada en el formulario 033');
    }, 900);
  };

  return (
    <form onSubmit={handleSubmit(save)} noValidate className="grid gap-6 xl:grid-cols-[230px_1fr]">
      <nav className="hidden xl:block">
        <div className="sticky top-24 rounded-xl border border-border bg-background p-3">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Formulario 033</p>
          <ul className="space-y-0.5">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[11px] font-bold text-primary">{s.code}</span>
                  <span className="truncate">{s.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <Icon name="DocumentCheckIcon" size={22} className="text-primary" />
            <div>
              <p className="text-sm font-semibold">Historia clínica única — Formulario MSP-HCU 033</p>
              <p className="text-xs text-muted-foreground">Establecimiento 0001234 · Última actualización 31/10/2026 por Dra. Andrade</p>
            </div>
          </div>
          <Badge tone="success" dot>Completa 92 %</Badge>
        </div>

        <section id="sec-a" className="scroll-mt-24 space-y-3">
          <h3 className="text-base font-semibold"><span className="mr-2 text-primary">A.</span>Motivo de consulta</h3>
          <div>
            <label htmlFor="reason" className="mb-1.5 block text-sm font-semibold">Motivo (palabras del paciente)</label>
            <textarea id="reason" rows={2} className={inputCls} {...register('reason', { required: 'El motivo de consulta es obligatorio en el formulario 033' })} />
            {errors.reason && <p className="mt-1 text-xs text-destructive">{errors.reason.message}</p>}
          </div>
        </section>

        <section id="sec-b" className="scroll-mt-24 space-y-3">
          <h3 className="text-base font-semibold"><span className="mr-2 text-primary">B.</span>Enfermedad o problema actual</h3>
          <div>
            <label htmlFor="currentIllness" className="mb-1.5 block text-sm font-semibold">Cronología, localización y características</label>
            <textarea id="currentIllness" rows={3} className={inputCls} {...register('currentIllness', { required: 'Describe la enfermedad actual' })} />
            {errors.currentIllness && <p className="mt-1 text-xs text-destructive">{errors.currentIllness.message}</p>}
          </div>
        </section>

        <section id="sec-c" className="scroll-mt-24 space-y-3">
          <h3 className="text-base font-semibold"><span className="mr-2 text-primary">C.</span>Antecedentes personales y familiares</h3>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {antecedentes.map((a) => (
              <label key={a.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${checks[a.id] ? 'border-warning/40 bg-warning/10 font-semibold' : 'border-input hover:bg-muted/60'}`}>
                <input type="checkbox" className="h-4 w-4 accent-primary" checked={!!checks[a.id]} onChange={(e) => setChecks((p) => ({ ...p, [a.id]: e.target.checked }))} />
                {a.label}
              </label>
            ))}
          </div>
        </section>

        <section id="sec-d" className="scroll-mt-24 space-y-3">
          <h3 className="text-base font-semibold"><span className="mr-2 text-primary">D.</span>Signos vitales</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {([
              ['pa', 'Presión arterial', 'mmHg'],
              ['fc', 'Frec. cardiaca', 'lpm'],
              ['fr', 'Frec. respiratoria', 'rpm'],
              ['temp', 'Temperatura', '°C'],
              ['weight', 'Peso', 'kg'],
              ['height', 'Talla', 'm'],
            ] as const).map(([id, label, unit]) => (
              <div key={`vs-${id}`}>
                <label htmlFor={id} className="mb-1.5 block text-xs font-semibold">{label} <span className="font-normal text-muted-foreground">({unit})</span></label>
                <input id={id} className={`${inputCls} tabular`} {...register(id, { required: 'Requerido' })} />
                {errors[id] && <p className="mt-1 text-xs text-destructive">{errors[id]?.message}</p>}
              </div>
            ))}
          </div>
        </section>

        <section id="sec-e" className="scroll-mt-24 space-y-3">
          <h3 className="text-base font-semibold"><span className="mr-2 text-primary">E.</span>Examen del sistema estomatognático</h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {([
              ['lips', 'Labios'],
              ['cheeks', 'Mejillas'],
              ['tongue', 'Lengua'],
              ['palate', 'Paladar'],
              ['floor', 'Piso de boca'],
              ['gums', 'Encías'],
            ] as const).map(([id, label]) => (
              <div key={`ex-${id}`}>
                <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label>
                <input id={id} className={inputCls} {...register(id)} />
              </div>
            ))}
            <div className="sm:col-span-2 xl:col-span-3">
              <label htmlFor="atm" className="mb-1.5 block text-sm font-semibold">ATM (articulación temporomandibular)</label>
              <input id="atm" className={inputCls} {...register('atm')} />
            </div>
          </div>
        </section>

        <section id="sec-f" className="scroll-mt-24 space-y-3">
          <h3 className="text-base font-semibold"><span className="mr-2 text-primary">F.</span>Indicadores de salud bucal (0–3)</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {([
              ['plaque', 'Placa bacteriana'],
              ['calculus', 'Cálculo dental'],
              ['gingivitis', 'Gingivitis'],
            ] as const).map(([id, label]) => (
              <div key={`ind-${id}`}>
                <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label>
                <select id={id} className={inputCls} {...register(id)}>
                  {['0', '1', '2', '3'].map((v) => (
                    <option key={`${id}-${v}`} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>

        <section id="sec-g" className="scroll-mt-24 space-y-3">
          <h3 className="text-base font-semibold"><span className="mr-2 text-primary">G.</span>Diagnóstico (CIE-10) y plan de tratamiento</h3>
          <div>
            <label htmlFor="diagnosis" className="mb-1.5 block text-sm font-semibold">Diagnóstico</label>
            <textarea id="diagnosis" rows={2} className={inputCls} {...register('diagnosis', { required: 'Registra al menos un diagnóstico CIE-10' })} />
            {errors.diagnosis && <p className="mt-1 text-xs text-destructive">{errors.diagnosis.message}</p>}
          </div>
          <div>
            <label htmlFor="plan" className="mb-1.5 block text-sm font-semibold">Plan de tratamiento</label>
            <textarea id="plan" rows={3} className={inputCls} {...register('plan')} />
          </div>
        </section>

        <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
          <p className="text-sm text-muted-foreground">Firma digital: <strong className="text-foreground">Dra. Camila Andrade — Reg. SENESCYT 1020-2015-1409</strong></p>
          <button type="submit" disabled={saving} className="inline-flex min-w-[170px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-70">
            {saving ? (<><Icon name="ArrowPathIcon" size={16} className="animate-spin" />Guardando…</>) : 'Guardar historia clínica'}
          </button>
        </div>
      </div>
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </form>
  );
}