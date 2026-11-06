'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import { getSupabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Field, fld, btnGhost, btnPrimary, money } from '@/app/patient-record/components/tabs/formKit';

type Tab = 'brand' | 'procedures' | 'medications';

type Brand = {
  name: string;
  phone: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  ruc: string;
  msp_code: string;
  doctor_name: string;
  doctor_license: string;
  doctor_degree: string;
  specialty: string;
  specialty_license: string;
  logo_url: string;
  timezone: string;
};

type Proc = { id: string; name: string; price: number | null; active: boolean | null };
type Med = {
  id: string;
  name: string;
  dose: string | null;
  duration: string | null;
  indications: string | null;
  category: string | null;
  active: boolean | null;
};

const emptyBrand = (): Brand => ({
  name: '',
  phone: '',
  mobile: '',
  email: '',
  address: '',
  city: '',
  ruc: '',
  msp_code: '',
  doctor_name: '',
  doctor_license: '',
  doctor_degree: '',
  specialty: '',
  specialty_license: '',
  logo_url: '',
  timezone: 'America/Guayaquil',
});

const MED_CATS = ['Analgésico / AINE', 'Antiinflamatorio', 'Antibiótico', 'Antiséptico', 'Anestésico / Otros'];

const DEFAULT_MEDS: Omit<Med, 'id' | 'active'>[] = [
  { name: 'Ibuprofeno 400 mg tabletas', dose: '1 tableta cada 8 horas', duration: '3 días', indications: 'Tomar con alimentos.', category: 'Analgésico / AINE' },
  { name: 'Paracetamol 500 mg tabletas', dose: '1 tableta cada 6–8 horas', duration: '3 días', indications: 'No exceder 4 g/día.', category: 'Analgésico / AINE' },
  { name: 'Amoxicilina 500 mg cápsulas', dose: '1 cápsula cada 8 horas', duration: '7 días', indications: 'Completar el tratamiento.', category: 'Antibiótico' },
  { name: 'Amoxicilina + ác. clavulánico 875/125 mg', dose: '1 tableta cada 12 horas', duration: '7 días', indications: 'Tomar con alimentos.', category: 'Antibiótico' },
  { name: 'Clindamicina 300 mg cápsulas', dose: '1 cápsula cada 8 horas', duration: '7 días', indications: 'Alternativa en alergia a penicilina.', category: 'Antibiótico' },
  { name: 'Clorhexidina 0,12 % enjuague', dose: '15 ml 30 s cada 12 h', duration: '7 días', indications: 'No ingerir.', category: 'Antiséptico' },
];

export default function ClinicSettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('brand');
  const [brand, setBrand] = useState<Brand>(emptyBrand());
  const [procs, setProcs] = useState<Proc[] | null>(null);
  const [meds, setMeds] = useState<Med[] | null>(null);
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);
  const [pq, setPq] = useState('');
  const [mq, setMq] = useState('');
  const [procForm, setProcForm] = useState<{ id: string | null; name: string; price: string } | null>(null);
  const [medForm, setMedForm] = useState<{
    id: string | null;
    name: string;
    dose: string;
    duration: string;
    indications: string;
    category: string;
  } | null>(null);

  const loadBrand = useCallback(async () => {
    if (!user?.clinicId) return;
    const { data } = await getSupabase()
      .from('clinics')
      .select('name, phone, mobile, email, address, city, ruc, msp_code, doctor_name, doctor_license, doctor_degree, specialty, specialty_license, logo_url, timezone')
      .eq('id', user.clinicId)
      .maybeSingle();
    if (data) {
      const d = data as Record<string, string | null>;
      setBrand({
        name: d.name || user.clinicName || '',
        phone: d.phone || '',
        mobile: d.mobile || '',
        email: d.email || '',
        address: d.address || '',
        city: d.city || user.clinicCity || '',
        ruc: d.ruc || '',
        msp_code: d.msp_code || '',
        doctor_name: d.doctor_name || '',
        doctor_license: d.doctor_license || '',
        doctor_degree: d.doctor_degree || '',
        specialty: d.specialty || '',
        specialty_license: d.specialty_license || '',
        logo_url: d.logo_url || '',
        timezone: d.timezone || 'America/Guayaquil',
      });
    } else {
      setBrand((b) => ({ ...b, name: user.clinicName || '', city: user.clinicCity || '' }));
    }
  }, [user?.clinicId, user?.clinicName, user?.clinicCity]);

  const loadProcs = useCallback(async () => {
    if (!user?.clinicId) return;
    const { data, error } = await getSupabase()
      .from('procedures')
      .select('id, name, price, active')
      .eq('clinic_id', user.clinicId)
      .order('name');
    if (error) {
      // tabla global sin clinic_id
      const r = await getSupabase().from('procedures').select('id, name, price, active').order('name');
      setProcs((r.data as Proc[]) || []);
    } else setProcs((data as Proc[]) || []);
  }, [user?.clinicId]);

  const loadMeds = useCallback(async () => {
    if (!user?.clinicId) return;
    let { data, error } = await getSupabase()
      .from('medications')
      .select('id, name, dose, duration, indications, category, active')
      .eq('clinic_id', user.clinicId)
      .order('name');
    if (error) {
      const r = await getSupabase().from('medications').select('id, name, dose, duration, indications, category, active').order('name');
      data = r.data;
      error = r.error;
    }
    if (error) setMeds([]);
    else setMeds((data as Med[]) || []);
  }, [user?.clinicId]);

  useEffect(() => {
    loadBrand();
    loadProcs();
    loadMeds();
  }, [loadBrand, loadProcs, loadMeds]);

  const setB = <K extends keyof Brand>(k: K, v: Brand[K]) => setBrand((s) => ({ ...s, [k]: v }));

  async function saveBrand() {
    if (!user?.clinicId) return setToast('Sin clínica activa.');
    setSaving(true);
    const payload: Record<string, string | null> = {
      name: brand.name.trim() || null,
      phone: brand.phone.trim() || null,
      mobile: brand.mobile.trim() || null,
      email: brand.email.trim() || null,
      address: brand.address.trim() || null,
      city: brand.city.trim() || null,
      ruc: brand.ruc.trim() || null,
      msp_code: brand.msp_code.trim() || null,
      doctor_name: brand.doctor_name.trim() || null,
      doctor_license: brand.doctor_license.trim() || null,
      doctor_degree: brand.doctor_degree.trim() || null,
      specialty: brand.specialty.trim() || null,
      specialty_license: brand.specialty_license.trim() || null,
      logo_url: brand.logo_url.trim() || null,
      timezone: brand.timezone || 'America/Guayaquil',
    };
    // Intento completo; si fallan columnas nuevas, guarda las básicas
    let { error } = await getSupabase().from('clinics').update(payload).eq('id', user.clinicId);
    if (error) {
      const basic = {
        name: payload.name,
        phone: payload.phone,
        city: payload.city,
        ruc: payload.ruc,
        msp_code: payload.msp_code,
      };
      ({ error } = await getSupabase().from('clinics').update(basic).eq('id', user.clinicId));
    }
    setSaving(false);
    if (error) return setToast(`No se pudo guardar: ${error.message}`);
    setToast('Datos de la clínica guardados. Se usarán en proformas y recetas.');
  }

  async function saveProc() {
    if (!procForm || !user?.clinicId) return;
    if (!procForm.name.trim()) return setToast('El nombre del procedimiento es obligatorio.');
    setSaving(true);
    const price = Number(procForm.price) || 0;
    const sb = getSupabase();
    let err: string | null = null;
    if (procForm.id) {
      const { error } = await sb.from('procedures').update({ name: procForm.name.trim(), price, active: true }).eq('id', procForm.id);
      err = error?.message || null;
    } else {
      let ins = await sb.from('procedures').insert({ clinic_id: user.clinicId, name: procForm.name.trim(), price, active: true });
      if (ins.error && /clinic_id/i.test(ins.error.message || '')) {
        ins = await sb.from('procedures').insert({ name: procForm.name.trim(), price, active: true });
      }
      err = ins.error?.message || null;
    }
    setSaving(false);
    if (err) return setToast(`No se pudo guardar: ${err}`);
    setProcForm(null);
    setToast('Procedimiento guardado. Ya aparece en proformas.');
    loadProcs();
  }

  async function toggleProc(p: Proc) {
    await getSupabase().from('procedures').update({ active: !p.active }).eq('id', p.id);
    loadProcs();
  }

  async function saveMed() {
    if (!medForm || !user?.clinicId) return;
    if (!medForm.name.trim()) return setToast('El nombre del medicamento es obligatorio.');
    setSaving(true);
    const body = {
      name: medForm.name.trim(),
      dose: medForm.dose.trim() || null,
      duration: medForm.duration.trim() || null,
      indications: medForm.indications.trim() || null,
      category: medForm.category || 'Analgésico / AINE',
      active: true,
      clinic_id: user.clinicId,
    };
    const sb = getSupabase();
    let err: string | null = null;
    if (medForm.id) {
      const { clinic_id: _c, ...upd } = body;
      const { error } = await sb.from('medications').update(upd).eq('id', medForm.id);
      err = error?.message || null;
    } else {
      let ins = await sb.from('medications').insert(body);
      if (ins.error && /clinic_id/i.test(ins.error.message || '')) {
        const { clinic_id: _c, ...rest } = body;
        ins = await sb.from('medications').insert(rest);
      }
      err = ins.error?.message || null;
    }
    setSaving(false);
    if (err) return setToast(`No se pudo guardar: ${err}. ¿Existe la tabla medications?`);
    setMedForm(null);
    setToast('Medicamento guardado. Disponible en el recetario.');
    loadMeds();
  }

  async function seedMeds() {
    if (!user?.clinicId) return;
    setSaving(true);
    const rows = DEFAULT_MEDS.map((m) => ({ ...m, clinic_id: user.clinicId, active: true }));
    let ins = await getSupabase().from('medications').insert(rows);
    if (ins.error && /clinic_id/i.test(ins.error.message || '')) {
      ins = await getSupabase().from('medications').insert(DEFAULT_MEDS.map((m) => ({ ...m, active: true })));
    }
    setSaving(false);
    if (ins.error) return setToast(`No se pudo cargar el catálogo: ${ins.error.message}`);
    setToast('Catálogo base de medicamentos cargado.');
    loadMeds();
  }

  async function toggleMed(m: Med) {
    await getSupabase().from('medications').update({ active: !m.active }).eq('id', m.id);
    loadMeds();
  }

  const filteredProcs = useMemo(() => {
    const q = pq.trim().toLowerCase();
    return (procs || []).filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [procs, pq]);

  const filteredMeds = useMemo(() => {
    const q = mq.trim().toLowerCase();
    return (meds || []).filter((m) => !q || m.name.toLowerCase().includes(q) || (m.category || '').toLowerCase().includes(q));
  }, [meds, mq]);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'brand', label: 'Identidad', icon: 'BuildingOffice2Icon' },
    { id: 'procedures', label: 'Procedimientos', icon: 'ClipboardDocumentListIcon' },
    { id: 'medications', label: 'Medicamentos', icon: 'BeakerIcon' },
  ];

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Configuración de la clínica</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Estos datos aparecen en el encabezado de proformas, recibos y recetas. Los catálogos alimentan presupuestos y el recetario.
          </p>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-border" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'brand' && (
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <p className="mb-5 text-sm text-muted-foreground">Personaliza la marca del consultorio para documentos profesionales.</p>
            <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Logotipo del consultorio</p>
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/40">
                    {brand.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={brand.logo_url} alt="Logo" className="h-full w-full object-contain" />
                    ) : (
                      <Icon name="PhotoIcon" size={28} className="text-muted-foreground" />
                    )}
                  </div>
                  <Field label="URL del logotipo" className="w-full">
                    <input className={fld} value={brand.logo_url} onChange={(e) => setB('logo_url', e.target.value)} placeholder="https://…/logo.png" />
                  </Field>
                  <p className="text-center text-[11px] text-muted-foreground">PNG o JPG · usa una URL pública</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nombre del doctor">
                  <input className={fld} value={brand.doctor_name} onChange={(e) => setB('doctor_name', e.target.value)} placeholder="Dr. / Dra." />
                </Field>
                <Field label="Licenciatura">
                  <input className={fld} value={brand.doctor_degree} onChange={(e) => setB('doctor_degree', e.target.value)} placeholder="Licenciatura en Odontología" />
                </Field>
                <Field label="Cédula profesional">
                  <input className={fld} value={brand.doctor_license} onChange={(e) => setB('doctor_license', e.target.value)} placeholder="Ej. 1234567" />
                </Field>
                <Field label="Especialidad">
                  <input className={fld} value={brand.specialty} onChange={(e) => setB('specialty', e.target.value)} placeholder="Ej. Implantología" />
                </Field>
                <Field label="Cédula de especialidad">
                  <input className={fld} value={brand.specialty_license} onChange={(e) => setB('specialty_license', e.target.value)} placeholder="Ej. 7654321" />
                </Field>
                <Field label="Nombre del consultorio">
                  <input className={fld} value={brand.name} onChange={(e) => setB('name', e.target.value)} placeholder="DentalCloud" />
                </Field>
                <Field label="Teléfono del consultorio">
                  <input className={fld} value={brand.phone} onChange={(e) => setB('phone', e.target.value)} />
                </Field>
                <Field label="Celular / WhatsApp">
                  <input className={fld} value={brand.mobile} onChange={(e) => setB('mobile', e.target.value)} />
                </Field>
                <Field label="Email" className="sm:col-span-2">
                  <input className={fld} value={brand.email} onChange={(e) => setB('email', e.target.value)} />
                </Field>
                <Field label="Dirección" className="sm:col-span-2">
                  <input className={fld} value={brand.address} onChange={(e) => setB('address', e.target.value)} />
                </Field>
                <Field label="Ciudad">
                  <input className={fld} value={brand.city} onChange={(e) => setB('city', e.target.value)} />
                </Field>
                <Field label="Zona horaria">
                  <select className={fld} value={brand.timezone} onChange={(e) => setB('timezone', e.target.value)}>
                    <option value="America/Guayaquil">Ecuador (America/Guayaquil)</option>
                    <option value="America/Santiago">Chile (America/Santiago)</option>
                    <option value="America/Bogota">Colombia (America/Bogota)</option>
                    <option value="America/Lima">Perú (America/Lima)</option>
                  </select>
                </Field>
                <Field label="RUC / NIT">
                  <input className={fld} value={brand.ruc} onChange={(e) => setB('ruc', e.target.value)} />
                </Field>
                <Field label="Código MSP / registro">
                  <input className={fld} value={brand.msp_code} onChange={(e) => setB('msp_code', e.target.value)} />
                </Field>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" className={btnPrimary(saving)} disabled={saving} onClick={saveBrand}>
                {saving ? 'Guardando…' : 'Guardar identidad'}
              </button>
            </div>
          </section>
        )}

        {tab === 'procedures' && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Catálogo de procedimientos</h2>
                <p className="text-xs text-muted-foreground">Nombres y precios que se autocompletan en proformas y presupuestos.</p>
              </div>
              <button
                type="button"
                className={btnPrimary()}
                onClick={() => setProcForm({ id: null, name: '', price: '0' })}
              >
                <Icon name="PlusIcon" size={16} /> Nuevo procedimiento
              </button>
            </div>
            <input
              className={`${fld} max-w-md`}
              placeholder="Buscar procedimiento…"
              value={pq}
              onChange={(e) => setPq(e.target.value)}
            />
            {!procs && <div className="h-24 animate-pulse rounded-xl bg-muted/40" />}
            {procs && procs.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Aún no hay procedimientos. Crea el primero para usarlo en proformas.
              </p>
            )}
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {filteredProcs.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                  <span className={`h-2 w-2 rounded-full ${p.active === false ? 'bg-muted-foreground/40' : 'bg-success'}`} />
                  <span className="min-w-0 flex-1 font-semibold">{p.name}</span>
                  <span className="tabular-nums text-muted-foreground">{money(Number(p.price || 0))}</span>
                  <button type="button" className={btnGhost} onClick={() => setProcForm({ id: p.id, name: p.name, price: String(p.price ?? 0) })}>
                    <Icon name="PencilSquareIcon" size={14} /> Editar
                  </button>
                  <button type="button" className={btnGhost} onClick={() => toggleProc(p)}>
                    {p.active === false ? 'Activar' : 'Desactivar'}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab === 'medications' && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Catálogo de medicamentos</h2>
                <p className="text-xs text-muted-foreground">Carga y edita fármacos con dosis e indicaciones. El doctor solo elige al recetar.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(!meds || meds.length === 0) && (
                  <button type="button" className={btnGhost} onClick={seedMeds} disabled={saving}>
                    Cargar catálogo base
                  </button>
                )}
                <button
                  type="button"
                  className={btnPrimary()}
                  onClick={() =>
                    setMedForm({
                      id: null,
                      name: '',
                      dose: '',
                      duration: '',
                      indications: '',
                      category: 'Analgésico / AINE',
                    })
                  }
                >
                  <Icon name="PlusIcon" size={16} /> Nuevo medicamento
                </button>
              </div>
            </div>
            <input className={`${fld} max-w-md`} placeholder="Buscar medicamento o categoría…" value={mq} onChange={(e) => setMq(e.target.value)} />
            {!meds && <div className="h-24 animate-pulse rounded-xl bg-muted/40" />}
            {meds && meds.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Sin medicamentos. Usa «Cargar catálogo base» o crea uno manual.
              </p>
            )}
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {filteredMeds.map((m) => (
                <li key={m.id} className="flex flex-wrap items-start gap-3 px-4 py-3 text-sm">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.active === false ? 'bg-muted-foreground/40' : 'bg-success'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[m.dose, m.duration, m.category].filter(Boolean).join(' · ')}
                    </p>
                    {m.indications && <p className="mt-0.5 text-xs text-muted-foreground">{m.indications}</p>}
                  </div>
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() =>
                      setMedForm({
                        id: m.id,
                        name: m.name,
                        dose: m.dose || '',
                        duration: m.duration || '',
                        indications: m.indications || '',
                        category: m.category || 'Analgésico / AINE',
                      })
                    }
                  >
                    <Icon name="PencilSquareIcon" size={14} /> Editar
                  </button>
                  <button type="button" className={btnGhost} onClick={() => toggleMed(m)}>
                    {m.active === false ? 'Activar' : 'Desactivar'}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Modal
          open={!!procForm}
          onClose={() => !saving && setProcForm(null)}
          title={procForm?.id ? 'Editar procedimiento' : 'Nuevo procedimiento'}
          subtitle="Se listará al crear proformas"
          footer={
            <>
              <button type="button" className={btnGhost} onClick={() => setProcForm(null)} disabled={saving}>Cancelar</button>
              <button type="button" className={btnPrimary(saving)} onClick={saveProc} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
            </>
          }
        >
          {procForm && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nombre *" className="sm:col-span-2">
                <input className={fld} value={procForm.name} onChange={(e) => setProcForm({ ...procForm, name: e.target.value })} placeholder="Ej. Resina compuesta" />
              </Field>
              <Field label="Precio unitario">
                <input type="number" min="0" step="0.01" className={fld} value={procForm.price} onChange={(e) => setProcForm({ ...procForm, price: e.target.value })} />
              </Field>
            </div>
          )}
        </Modal>

        <Modal
          open={!!medForm}
          onClose={() => !saving && setMedForm(null)}
          title={medForm?.id ? 'Editar medicamento' : 'Nuevo medicamento'}
          subtitle="Dosis predefinida; el doctor puede ajustarla al recetar"
          footer={
            <>
              <button type="button" className={btnGhost} onClick={() => setMedForm(null)} disabled={saving}>Cancelar</button>
              <button type="button" className={btnPrimary(saving)} onClick={saveMed} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
            </>
          }
        >
          {medForm && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nombre *" className="sm:col-span-2">
                <input className={fld} value={medForm.name} onChange={(e) => setMedForm({ ...medForm, name: e.target.value })} />
              </Field>
              <Field label="Dosis habitual">
                <input className={fld} value={medForm.dose} onChange={(e) => setMedForm({ ...medForm, dose: e.target.value })} placeholder="1 tableta cada 8 h" />
              </Field>
              <Field label="Duración">
                <input className={fld} value={medForm.duration} onChange={(e) => setMedForm({ ...medForm, duration: e.target.value })} placeholder="7 días" />
              </Field>
              <Field label="Categoría" className="sm:col-span-2">
                <select className={fld} value={medForm.category} onChange={(e) => setMedForm({ ...medForm, category: e.target.value })}>
                  {MED_CATS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Indicaciones" className="sm:col-span-2">
                <textarea rows={2} className={fld} value={medForm.indications} onChange={(e) => setMedForm({ ...medForm, indications: e.target.value })} />
              </Field>
            </div>
          )}
        </Modal>

        {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
      </div>
    </AppLayout>
  );
}
