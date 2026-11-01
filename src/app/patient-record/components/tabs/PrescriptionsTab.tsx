'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import EmptyState from '@/components/ui/EmptyState';
import { printHtml } from '@/lib/print';

interface Rx {
  id: string;
  date: string;
  drug: string;
  dose: string;
  duration: string;
  indications: string;
  doctor: string;
}

interface RxForm {
  drug: string;
  dose: string;
  duration: string;
  indications: string;
}

const initial: Rx[] = [
  {
    id: 'rx-001',
    date: '31/10/2026',
    drug: 'Ibuprofeno 400 mg tabletas',
    dose: '1 tableta cada 8 horas',
    duration: '3 dias',
    indications: 'Tomar con alimentos. Suspender si presenta molestias gastricas.',
    doctor: 'Dra. Camila Andrade',
  },
  {
    id: 'rx-002',
    date: '12/06/2026',
    drug: 'Amoxicilina + acido clavulanico 875/125 mg',
    dose: '1 tableta cada 12 horas',
    duration: '7 dias',
    indications: 'Paciente alergica a penicilina: SE SUSTITUYO por clindamicina 300 mg cada 8 h.',
    doctor: 'Dr. Santiago Moscoso',
  },
  {
    id: 'rx-003',
    date: '12/06/2026',
    drug: 'Clorhexidina 0,12 % enjuague',
    dose: '15 ml, enjuagar 30 segundos cada 12 h',
    duration: '7 dias',
    indications: 'No ingerir. No enjuagar con agua despues.',
    doctor: 'Dr. Santiago Moscoso',
  },
];

const inputCls =
  'w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20';

export default function PrescriptionsTab() {
  const [list, setList] = useState<Rx[]>(initial);
  const [toast, setToast] = useState('');
  const [adding, setAdding] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RxForm>();

  const add = (v: RxForm) => {
    setList((prev) => [
      {
        id: `rx-${Date.now()}`,
        date: new Date().toLocaleDateString('es-EC'),
        ...v,
        doctor: 'Profesional tratante',
      },
      ...prev,
    ]);
    reset();
    setAdding(false);
    setToast('Receta agregada al recetario');
  };

  const printRx = (r: Rx) => {
    printHtml(
      `Receta ${r.drug}`,
      `
      <h1>Receta medica odontologica</h1>
      <p class="muted">${r.date} · ${r.doctor}</p>
      <div class="box">
        <h2>${r.drug}</h2>
        <p><strong>Dosis:</strong> ${r.dose}</p>
        <p><strong>Duracion:</strong> ${r.duration}</p>
        <p><strong>Indicaciones:</strong> ${r.indications || '—'}</p>
      </div>
      <p class="muted">Usa "Guardar como PDF" o Imprimir en el dialogo del navegador.</p>
    `,
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Recetario</h2>
          <p className="text-sm text-muted-foreground">
            Prescripciones del paciente. Alergia registrada:{' '}
            <strong className="text-destructive">penicilina</strong>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
        >
          <Icon name="PlusIcon" size={16} />
          {adding ? 'Cerrar' : 'Nueva receta'}
        </button>
      </div>

      {adding && (
        <form
          onSubmit={handleSubmit(add)}
          className="grid gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label htmlFor="drug" className="mb-1.5 block text-sm font-semibold">
              Medicamento
            </label>
            <input
              id="drug"
              className={inputCls}
              placeholder="Ej. Ibuprofeno 400 mg"
              {...register('drug', { required: 'Indica el medicamento' })}
            />
            {errors.drug && <p className="mt-1 text-xs text-destructive">{errors.drug.message}</p>}
          </div>
          <div>
            <label htmlFor="dose" className="mb-1.5 block text-sm font-semibold">
              Dosis
            </label>
            <input
              id="dose"
              className={inputCls}
              placeholder="1 tableta cada 8 h"
              {...register('dose', { required: 'Indica la dosis' })}
            />
            {errors.dose && <p className="mt-1 text-xs text-destructive">{errors.dose.message}</p>}
          </div>
          <div>
            <label htmlFor="duration" className="mb-1.5 block text-sm font-semibold">
              Duracion
            </label>
            <input
              id="duration"
              className={inputCls}
              placeholder="5 dias"
              {...register('duration', { required: 'Indica la duracion' })}
            />
            {errors.duration && (
              <p className="mt-1 text-xs text-destructive">{errors.duration.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="indications" className="mb-1.5 block text-sm font-semibold">
              Indicaciones al paciente
            </label>
            <textarea id="indications" rows={2} className={inputCls} {...register('indications')} />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
            >
              Emitir receta
            </button>
          </div>
        </form>
      )}

      {list.length === 0 ? (
        <EmptyState
          icon={<Icon name="BeakerIcon" size={24} />}
          title="Aun no hay recetas"
          description="Las prescripciones emitidas a este paciente quedaran registradas aqui."
          actionLabel="Emitir primera receta"
          onAction={() => setAdding(true)}
        />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {list.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-border bg-background p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="tabular text-xs font-semibold text-muted-foreground">
                  {r.date} · {r.doctor}
                </span>
                <button
                  type="button"
                  aria-label="Imprimir receta"
                  onClick={() => printRx(r)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon name="PrinterIcon" size={16} />
                </button>
              </div>
              <h3 className="mt-1 text-sm font-bold">{r.drug}</h3>
              <p className="mt-1 text-sm">
                {r.dose} · <span className="font-semibold">{r.duration}</span>
              </p>
              <p className="mt-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                {r.indications}
              </p>
            </li>
          ))}
        </ul>
      )}
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
