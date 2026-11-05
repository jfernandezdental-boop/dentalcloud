'use client';
import React, { useMemo, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { printHtml } from '@/lib/print';

interface RxItem {
  id: string;
  drug: string;
  dose: string;
  duration: string;
  quantity: string;
  indications: string;
}

interface Rx {
  id: string;
  date: string;
  items: RxItem[];
  recommendations: string;
  doctor: string;
}

type Med = {
  id: string;
  name: string;
  dose: string;
  duration: string;
  indications: string;
  category: string;
};

const CATALOG: Med[] = [
  { id: 'm1', name: 'Ibuprofeno 400 mg tabletas', dose: '1 tableta cada 8 horas', duration: '3 días', indications: 'Tomar con alimentos. Suspender si presenta molestias gástricas.', category: 'Analgésico / AINE' },
  { id: 'm2', name: 'Ibuprofeno 600 mg tabletas', dose: '1 tableta cada 8 horas', duration: '3 días', indications: 'Tomar con alimentos. Suspender si presenta molestias gástricas.', category: 'Analgésico / AINE' },
  { id: 'm3', name: 'Paracetamol 500 mg tabletas', dose: '1 tableta cada 6 u 8 horas si hay dolor', duration: '3 días', indications: 'No exceder 4 tabletas en 24 horas.', category: 'Analgésico / AINE' },
  { id: 'm4', name: 'Paracetamol 1 g tabletas', dose: '1 tableta cada 8 horas si hay dolor', duration: '3 días', indications: 'No exceder 3 g al día.', category: 'Analgésico / AINE' },
  { id: 'm5', name: 'Ketorolaco 10 mg tabletas sublinguales', dose: '1 tableta cada 8 horas', duration: '3 días', indications: 'Uso corto. Evitar si hay úlcera gástrica.', category: 'Analgésico / AINE' },
  { id: 'm6', name: 'Diclofenaco 50 mg tabletas', dose: '1 tableta cada 12 horas', duration: '3 días', indications: 'Tomar con alimentos.', category: 'Antiinflamatorio' },
  { id: 'm7', name: 'Naproxeno 550 mg tabletas', dose: '1 tableta cada 12 horas', duration: '3 días', indications: 'Tomar con alimentos.', category: 'Antiinflamatorio' },
  { id: 'm8', name: 'Amoxicilina 500 mg cápsulas', dose: '1 cápsula cada 8 horas', duration: '7 días', indications: 'Completar el tratamiento aunque mejore.', category: 'Antibiótico' },
  { id: 'm9', name: 'Amoxicilina + ácido clavulánico 875/125 mg', dose: '1 tableta cada 12 horas', duration: '7 días', indications: 'Tomar con alimentos. Completar el tratamiento.', category: 'Antibiótico' },
  { id: 'm10', name: 'Clindamicina 300 mg cápsulas', dose: '1 cápsula cada 8 horas', duration: '7 días', indications: 'Alternativa en alergia a penicilina.', category: 'Antibiótico' },
  { id: 'm11', name: 'Azitromicina 500 mg tabletas', dose: '1 tableta cada 24 horas', duration: '3 días', indications: 'Tomar 1 hora antes o 2 horas después de alimentos.', category: 'Antibiótico' },
  { id: 'm12', name: 'Metronidazol 500 mg tabletas', dose: '1 tableta cada 8 horas', duration: '7 días', indications: 'Evitar alcohol durante el tratamiento.', category: 'Antibiótico' },
  { id: 'm13', name: 'Clorhexidina 0,12 % enjuague', dose: '15 ml, enjuagar 30 segundos cada 12 h', duration: '7 días', indications: 'No ingerir. No enjuagar con agua después.', category: 'Antiséptico' },
  { id: 'm14', name: 'Nistatina 100 000 UI/ml suspensión oral', dose: '5 ml, mantener en boca 2 minutos y tragar, cada 6 horas', duration: '10 días', indications: 'Para candidiasis oral. Limpiar prótesis diariamente.', category: 'Anestésico / Otros' },
  { id: 'm15', name: 'Lidocaína 2 % gel tópico', dose: 'Aplicar una capa fina en la zona cada 8 horas', duration: '3 días', indications: 'Uso tópico. No tragar en exceso.', category: 'Anestésico / Otros' },
  { id: 'm16', name: 'Triamcinolona 0,1 % pasta oral', dose: 'Aplicar sobre la úlcera cada 8 horas', duration: '7 días', indications: 'Aplicar con dedo limpio o hisopo.', category: 'Anestésico / Otros' },
  { id: 'm17', name: 'Fluoruro de sodio 0,05 % enjuague', dose: '10 ml, enjuagar 1 minuto cada noche', duration: '30 días', indications: 'No ingerir. Ideal después del cepillado nocturno.', category: 'Anestésico / Otros' },
];

const CATEGORIES = ['Todos', 'Analgésico / AINE', 'Antiinflamatorio', 'Antibiótico', 'Antiséptico', 'Anestésico / Otros'];

const initial: Rx[] = [
  {
    id: 'rx-001',
    date: '31/10/2026',
    items: [
      { id: 'i1', drug: 'Ibuprofeno 400 mg tabletas', dose: '1 tableta cada 8 horas', duration: '3 días', quantity: '', indications: 'Tomar con alimentos. Suspender si presenta molestias gástricas.' },
    ],
    recommendations: 'Dieta blanda, evitar masticar del lado tratado.',
    doctor: 'Dra. Camila Andrade',
  },
];

export default function PrescriptionsTab() {
  const [list, setList] = useState<Rx[]>(initial);
  const [toast, setToast] = useState('');
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState('Todos');
  const [q, setQ] = useState('');
  const [items, setItems] = useState<RxItem[]>([]);
  const [recs, setRecs] = useState('Dieta blanda, evitar masticar del lado tratado...');
  const [dx, setDx] = useState('');

  const filtered = useMemo(() => {
    let meds = CATALOG;
    if (cat !== 'Todos') meds = meds.filter((m) => m.category === cat);
    const qq = q.trim().toLowerCase();
    if (qq) meds = meds.filter((m) => m.name.toLowerCase().includes(qq));
    return meds;
  }, [cat, q]);

  const addMed = (m: Med) => {
    setItems((prev) => [
      ...prev,
      {
        id: `it-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        drug: m.name,
        dose: m.dose,
        duration: m.duration,
        quantity: '',
        indications: m.indications,
      },
    ]);
  };

  const updateItem = (id: string, key: keyof RxItem, val: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [key]: val } : it)));
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id));

  const emit = () => {
    if (items.length === 0) {
      setToast('Agrega al menos un medicamento a la receta.');
      return;
    }
    setList((prev) => [
      {
        id: `rx-${Date.now()}`,
        date: new Date().toLocaleDateString('es-EC'),
        items: [...items],
        recommendations: recs.trim(),
        doctor: 'Profesional tratante',
      },
      ...prev,
    ]);
    setOpen(false);
    setItems([]);
    setRecs('Dieta blanda, evitar masticar del lado tratado...');
    setDx('');
    setQ('');
    setCat('Todos');
    setToast('Receta emitida');
  };

  const printRx = (r: Rx) => {
    const body = r.items
      .map(
        (it, i) =>
          `<div class="box"><h2>${i + 1}. ${it.drug}</h2><p><strong>Dosis:</strong> ${it.dose}</p><p><strong>Duración:</strong> ${it.duration}</p>${it.quantity ? `<p><strong>Cantidad:</strong> ${it.quantity}</p>` : ''}<p><strong>Indicaciones:</strong> ${it.indications || '—'}</p></div>`,
      )
      .join('');
    printHtml(
      `Receta ${r.date}`,
      `<h1>Receta médica odontológica</h1><p class="muted">${r.date} · ${r.doctor}</p>${body}${r.recommendations ? `<p><strong>Recomendaciones:</strong> ${r.recommendations}</p>` : ''}<p class="muted">Usa "Guardar como PDF" o Imprimir.</p>`,
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Recetario</h2>
          <p className="text-sm text-muted-foreground">
            Prescripciones del paciente. Alergia registrada: <strong className="text-destructive">penicilina</strong>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
        >
          <Icon name="PlusIcon" size={16} />
          Nueva receta
        </button>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<Icon name="BeakerIcon" size={24} />}
          title="Aún no hay recetas"
          description="Las prescripciones emitidas a este paciente quedarán registradas aquí."
          actionLabel="Emitir primera receta"
          onAction={() => setOpen(true)}
        />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {list.map((r) => (
            <li key={r.id} className="rounded-xl border border-border bg-background p-4 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="tabular text-xs font-semibold text-muted-foreground">{r.date} · {r.doctor}</span>
                <button type="button" aria-label="Imprimir receta" onClick={() => printRx(r)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <Icon name="PrinterIcon" size={16} />
                </button>
              </div>
              <ul className="mt-2 space-y-2">
                {r.items.map((it) => (
                  <li key={it.id}>
                    <h3 className="text-sm font-bold">{it.drug}</h3>
                    <p className="text-sm">{it.dose} · <span className="font-semibold">{it.duration}</span></p>
                    {it.indications && <p className="mt-1 rounded-lg bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground">{it.indications}</p>}
                  </li>
                ))}
              </ul>
              {r.recommendations && <p className="mt-2 text-xs text-muted-foreground">Recs: {r.recommendations}</p>}
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="xl"
        title="Recetario"
        subtitle="Prescripciones emitidas al paciente. Alergia registrada: penicilina."
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-semibold hover:bg-muted">Cancelar</button>
            <button type="button" onClick={emit} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Emitir receta</button>
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Catálogo */}
          <div>
            <p className="mb-2 text-sm font-semibold">Medicamentos más comunes</p>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar medicamento (ibuprofeno, amoxicilina...)"
              className="mb-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <div className="mb-3 flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    cat === c ? 'bg-primary text-primary-foreground' : 'border border-input bg-card hover:bg-muted'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <ul className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {filtered.map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.dose} · {m.duration}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addMed(m)}
                    className="shrink-0 rounded-full border border-primary p-1 text-primary hover:bg-primary/10"
                    aria-label={`Agregar ${m.name}`}
                  >
                    <Icon name="PlusIcon" size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Receta armada */}
          <div>
            <p className="mb-2 text-sm font-semibold">Diagnóstico (CIE-10)</p>
            <input
              value={dx}
              onChange={(e) => setDx(e.target.value)}
              placeholder="Buscar por código (K02.1) o palabra (caries, pulpitis...)"
              className="mb-4 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />

            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Receta ({items.length})</p>
              <button
                type="button"
                className="text-xs font-semibold text-primary hover:underline"
                onClick={() =>
                  setItems((prev) => [
                    ...prev,
                    { id: `it-${Date.now()}`, drug: '', dose: '', duration: '', quantity: '', indications: '' },
                  ])
                }
              >
                + Medicamento manual
              </button>
            </div>

            {items.length === 0 ? (
              <div className="mb-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Selecciona medicamentos de la lista para armar la receta. La dosis se completa automáticamente y puedes editarla.
              </div>
            ) : (
              <ul className="mb-4 max-h-[280px] space-y-3 overflow-y-auto">
                {items.map((it, idx) => (
                  <li key={it.id} className="rounded-lg border border-border bg-card p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{idx + 1}</span>
                      <input
                        value={it.drug}
                        onChange={(e) => updateItem(it.id, 'drug', e.target.value)}
                        className="min-w-0 flex-1 rounded border border-input bg-background px-2 py-1 text-sm font-semibold outline-none focus:border-primary"
                        placeholder="Medicamento"
                      />
                      <button type="button" onClick={() => removeItem(it.id)} className="text-muted-foreground hover:text-destructive" aria-label="Quitar">
                        <Icon name="TrashIcon" size={16} />
                      </button>
                    </div>
                    <div className="mb-2 grid grid-cols-3 gap-2">
                      <input value={it.dose} onChange={(e) => updateItem(it.id, 'dose', e.target.value)} className="rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:border-primary" placeholder="Dosis" />
                      <input value={it.duration} onChange={(e) => updateItem(it.id, 'duration', e.target.value)} className="rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:border-primary" placeholder="Duración" />
                      <input value={it.quantity} onChange={(e) => updateItem(it.id, 'quantity', e.target.value)} className="rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:border-primary" placeholder="Cantidad total" />
                    </div>
                    <textarea
                      value={it.indications}
                      onChange={(e) => updateItem(it.id, 'indications', e.target.value)}
                      rows={2}
                      className="w-full rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:border-primary"
                      placeholder="Indicaciones"
                    />
                  </li>
                ))}
              </ul>
            )}

            <p className="mb-1.5 text-sm font-semibold">Recomendaciones generales</p>
            <textarea
              value={recs}
              onChange={(e) => setRecs(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Dieta blanda, evitar masticar del lado tratado..."
            />
          </div>
        </div>
      </Modal>

      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
