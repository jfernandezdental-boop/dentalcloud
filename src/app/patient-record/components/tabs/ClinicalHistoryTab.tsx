'use client';
import React, { useMemo, useState } from 'react';
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

/** Catálogo CIE-10 odontológico (capítulo K00–K14 y afines frecuentes en odontología) */
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
  { code: 'K06.9', label: 'Trastorno de la encía y de la zona edéntula, no especificado' },
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

const inputCls = 'w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20';

export default function ClinicalHistoryTab() {
  const [checks, setChecks] = useState<Record<string, boolean>>({ 'an-alergia': true, 'an-otro': false });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [selectedDx, setSelectedDx] = useState<{ code: string; label: string }[]>([
    { code: 'K02.1', label: 'Caries de la dentina' },
    { code: 'K05.0', label: 'Gingivitis aguda' },
  ]);
  const [dxQuery, setDxQuery] = useState('');
  const [dxOpen, setDxOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
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
      diagnosis: 'K02.1 Caries de la dentina · K05.0 Gingivitis aguda',
      plan: '1) Profilaxis y flúor. 2) Resina compuesta pieza 46 (OM). 3) Control en 15 días. 4) Instrucción de higiene oral.',
    },
  });

  const filteredDx = useMemo(() => {
    const q = dxQuery.trim().toLowerCase();
    if (!q) return CIE10_DENTAL.slice(0, 40);
    return CIE10_DENTAL.filter(
      (d) => d.code.toLowerCase().includes(q) || d.label.toLowerCase().includes(q),
    ).slice(0, 50);
  }, [dxQuery]);

  const addDx = (d: { code: string; label: string }) => {
    if (selectedDx.some((x) => x.code === d.code)) return;
    const next = [...selectedDx, d];
    setSelectedDx(next);
    setValue('diagnosis', next.map((x) => `${x.code} ${x.label}`).join(' · '));
    setDxQuery('');
    setDxOpen(false);
  };

  const removeDx = (code: string) => {
    const next = selectedDx.filter((x) => x.code !== code);
    setSelectedDx(next);
    setValue('diagnosis', next.map((x) => `${x.code} ${x.label}`).join(' · '));
  };

  const save = () => {
    setSaving(true);
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
            <label className="mb-1.5 block text-sm font-semibold">Diagnóstico (CIE-10)</label>
            <p className="mb-2 text-xs text-muted-foreground">Escribe el código o una palabra, selecciona el resultado y se agregará al diagnóstico.</p>
            <div className="relative">
              <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-input bg-card px-2 py-1.5">
                {selectedDx.map((d) => (
                  <span key={d.code} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    <span className="font-bold">{d.code}</span> {d.label}
                    <button type="button" onClick={() => removeDx(d.code)} className="ml-0.5 rounded hover:bg-primary/20" aria-label={`Quitar ${d.code}`}>
                      ×
                    </button>
                  </span>
                ))}
                <input
                  value={dxQuery}
                  onChange={(e) => {
                    setDxQuery(e.target.value);
                    setDxOpen(true);
                  }}
                  onFocus={() => setDxOpen(true)}
                  placeholder="Buscar por código (K02.1) o palabra (caries...)"
                  className="min-w-[180px] flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none"
                />
              </div>
              {dxOpen && (
                <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-input bg-card shadow-lg">
                  {filteredDx.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</li>
                  ) : (
                    filteredDx.map((d) => (
                      <li key={d.code}>
                        <button
                          type="button"
                          className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                          onClick={() => addDx(d)}
                        >
                          <span className="shrink-0 font-bold text-primary">{d.code}</span>
                          <span>{d.label}</span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
            <input type="hidden" {...register('diagnosis', { required: 'Registra al menos un diagnóstico CIE-10' })} />
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
