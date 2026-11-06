'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import { getSupabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { btnGhost, btnPrimary, today } from './formKit';
import { printPrescription } from '@/lib/clinicDocs';
import { useDocContext } from '@/lib/useDocContext';

type Rx = { id: string; date: string | null; created_at: string | null; drug: string; dose: string | null; duration: string | null; indications: string | null };

type Med = { id: string; name: string; dose: string; duration: string; indications: string; category: string };
type RxItem = { id: string; drug: string; dose: string; duration: string; quantity: string; indications: string };

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

export default function RealPrescriptionsTab({ patientId }: { patientId: string }) {
  const { user } = useAuth();
  const doc = useDocContext(patientId);
  const [rows, setRows] = useState<Rx[] | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState('Todos');
  const [q, setQ] = useState('');
  const [items, setItems] = useState<RxItem[]>([]);
  const [recs, setRecs] = useState('Dieta blanda, evitar masticar del lado tratado...');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [catalog, setCatalog] = useState<Med[]>(CATALOG);

  const load = useCallback(async () => {
    const { data, error: e } = await getSupabase()
      .from('prescriptions')
      .select('id, date, created_at, drug, dose, duration, indications')
      .eq('patient_id', patientId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (e) setError('No se pudo cargar el recetario.');
    else {
      setError('');
      setRows((data as Rx[]) || []);
    }
  }, [patientId]);

  const loadCatalog = useCallback(async () => {
    const sb = getSupabase();
    let { data, error } = await sb
      .from('medications')
      .select('id, name, dose, duration, indications, category, active')
      .eq('active', true)
      .order('name');
    if (error) {
      const r = await sb.from('medications').select('id, name, dose, duration, indications, category').order('name');
      data = r.data;
      error = r.error;
    }
    if (!error && data && data.length > 0) {
      setCatalog(
        (data as { id: string; name: string; dose: string | null; duration: string | null; indications: string | null; category: string | null }[]).map((m) => ({
          id: m.id,
          name: m.name,
          dose: m.dose || '',
          duration: m.duration || '',
          indications: m.indications || '',
          category: m.category || 'Anestésico / Otros',
        })),
      );
    }
  }, []);

  useEffect(() => {
    setRows(null);
    load();
    loadCatalog();
  }, [load, loadCatalog]);

  const filtered = useMemo(() => {
    let meds = catalog;
    if (cat !== 'Todos') meds = meds.filter((m) => m.category === cat);
    const qq = q.trim().toLowerCase();
    if (qq) meds = meds.filter((m) => m.name.toLowerCase().includes(qq));
    return meds;
  }, [cat, q, catalog]);

  const addMed = (m: Med) => {
    setItems((prev) => [
      ...prev,
      { id: `it-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, drug: m.name, dose: m.dose, duration: m.duration, quantity: '', indications: m.indications },
    ]);
  };

  const updateItem = (id: string, key: keyof RxItem, val: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [key]: val } : it)));
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id));

  async function emit() {
    if (!user?.clinicId) return setToast('No hay una clínica activa en tu sesión.');
    if (items.length === 0) return setToast('Agrega al menos un medicamento.');
    setSaving(true);
    const sb = getSupabase();
    const date = today();
    for (const it of items) {
      if (!it.drug.trim()) continue;
      const { error: e } = await sb.from('prescriptions').insert({
        clinic_id: user.clinicId,
        patient_id: patientId,
        date,
        drug: it.drug.trim(),
        dose: it.dose.trim() || null,
        duration: it.duration.trim() || null,
        indications: [it.indications.trim(), recs.trim()].filter(Boolean).join(' | ') || null,
      });
      if (e) {
        setSaving(false);
        return setToast(`No se pudo guardar: ${e.message}`);
      }
    }
    setSaving(false);
    setOpen(false);
    setItems([]);
    setRecs('Dieta blanda, evitar masticar del lado tratado...');
    setQ('');
    setCat('Todos');
    setToast('Receta emitida.');
    load();
  }

  const printRx = (r: Rx) => {
    if (!doc) return setToast('Preparando los datos del documento… intenta de nuevo en un segundo.');
    const t0 = new Date(r.created_at || 0).getTime();
    const group = (rows || [])
      .filter((x) => x.date === r.date && Math.abs(new Date(x.created_at || 0).getTime() - t0) <= 120_000)
      .sort((a, b) => String(a.created_at || '').localeCompare(String(b.created_at || '')));
    const list = group.length ? group : [r];
    const parts = list.map((x) => String(x.indications || '').split(' | '));
    const last = parts[0]?.[parts[0].length - 1] || '';
    const common = parts.every((p) => p.length >= 2 && p[p.length - 1] === last) ? last : '';
    printPrescription({
      code: `RX-${String(r.date || '').slice(0, 4) || new Date().getFullYear()}-${(list[0]?.id || r.id).slice(-4).toUpperCase()}`,
      date: r.date || today(),
      clinic: doc.clinic,
      patient: doc.patient,
      items: list.map((x, i) => ({
        name: x.drug,
        dose: x.dose,
        duration: x.duration,
        note: common ? (parts[i] || []).slice(0, -1).join(' | ') : x.indications,
      })),
      recommendations: common || null,
      doctorName: user?.role === 'doctor' ? user.fullName : null,
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Recetario</h3>
          <p className="text-xs text-muted-foreground">Prescripciones emitidas a este paciente. Catálogo editable en Configuración.</p>
        </div>
        <button type="button" className={btnPrimary()} onClick={() => { setItems([]); setOpen(true); }}>
          <Icon name="PlusIcon" size={16} /> Nueva receta
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {!rows && !error && <div className="h-24 animate-pulse rounded-xl bg-muted/40" />}
      {rows && rows.length === 0 && (
        <EmptyState icon={<Icon name="BeakerIcon" size={24} />} title="Sin recetas" description="Pulsa «Nueva receta» para registrar la primera." />
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {rows?.map((r) => (
          <li key={r.id} className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">{r.date}</p>
                <h4 className="mt-0.5 text-sm font-bold leading-snug">{r.drug}</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[r.dose, r.duration].filter(Boolean).join(' · ') || 'Sin dosis registrada'}
                </p>
                {r.indications && (
                  <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">{r.indications}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => printRx(r)}
                className="shrink-0 rounded-lg border border-input p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Imprimir receta"
                title="Imprimir receta completa / PDF"
              >
                <Icon name="PrinterIcon" size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Modal
        open={open}
        onClose={() => !saving && setOpen(false)}
        size="xl"
        title="Nueva receta"
        subtitle="Elige del catálogo de la clínica. La dosis viene lista y es editable."
        footer={
          <>
            <button type="button" className={btnGhost} onClick={() => setOpen(false)} disabled={saving}>Cancelar</button>
            <button type="button" className={btnPrimary(saving)} onClick={emit} disabled={saving}>
              {saving ? 'Guardando…' : 'Emitir receta'}
            </button>
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold">Medicamentos del catálogo</p>
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
                  <button type="button" onClick={() => addMed(m)} className="shrink-0 rounded-full border border-primary p-1 text-primary hover:bg-primary/10" aria-label={`Agregar ${m.name}`}>
                    <Icon name="PlusIcon" size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Receta ({items.length})</p>
              <button
                type="button"
                className="text-xs font-semibold text-primary hover:underline"
                onClick={() => setItems((prev) => [...prev, { id: `it-${Date.now()}`, drug: '', dose: '', duration: '', quantity: '', indications: '' }])}
              >
                + Medicamento manual
              </button>
            </div>

            {items.length === 0 ? (
              <div className="mb-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Selecciona medicamentos de la lista. La dosis se completa y puedes editarla.
              </div>
            ) : (
              <ul className="mb-4 max-h-[280px] space-y-3 overflow-y-auto">
                {items.map((it, idx) => (
                  <li key={it.id} className="rounded-lg border border-border bg-card p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{idx + 1}</span>
                      <input value={it.drug} onChange={(e) => updateItem(it.id, 'drug', e.target.value)} className="min-w-0 flex-1 rounded border border-input bg-background px-2 py-1 text-sm font-semibold outline-none focus:border-primary" placeholder="Medicamento" />
                      <button type="button" onClick={() => removeItem(it.id)} className="text-muted-foreground hover:text-destructive" aria-label="Quitar">
                        <Icon name="TrashIcon" size={16} />
                      </button>
                    </div>
                    <div className="mb-2 grid grid-cols-3 gap-2">
                      <input value={it.dose} onChange={(e) => updateItem(it.id, 'dose', e.target.value)} className="rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:border-primary" placeholder="Dosis" />
                      <input value={it.duration} onChange={(e) => updateItem(it.id, 'duration', e.target.value)} className="rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:border-primary" placeholder="Duración" />
                      <input value={it.quantity} onChange={(e) => updateItem(it.id, 'quantity', e.target.value)} className="rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:border-primary" placeholder="Cantidad total" />
                    </div>
                    <textarea value={it.indications} onChange={(e) => updateItem(it.id, 'indications', e.target.value)} rows={2} className="w-full rounded border border-input bg-background px-2 py-1 text-xs outline-none focus:border-primary" placeholder="Indicaciones" />
                  </li>
                ))}
              </ul>
            )}

            <p className="mb-1.5 text-sm font-semibold">Recomendaciones generales</p>
            <textarea value={recs} onChange={(e) => setRecs(e.target.value)} rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Dieta blanda, evitar masticar del lado tratado..." />
          </div>
        </div>
      </Modal>
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
