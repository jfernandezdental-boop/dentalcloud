'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import { getSupabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Field, fld, btnGhost, btnPrimary, today } from '@/app/patient-record/components/tabs/formKit';

type Patient = { id: string; first_name: string; last_name: string; cedula: string | null; phone: string | null };
type Doctor = { id: string; full_name: string; specialty: string | null };
type Appt = {
  id: string; patient_id: string; doctor_id: string; date: string; start_time: string; duration_min: number | null;
  procedure: string | null; chair: string | null; status: string | null; notes: string | null;
  patients: { first_name: string; last_name: string; phone: string | null } | null;
  doctors: { full_name: string } | null;
};
const STATUSES = ['Pendiente', 'Confirmada', 'En sala', 'En atención', 'Atendida', 'No asistió', 'Cancelada'];
const hhmm = (t: string) => String(t).slice(0, 5);
const toMin = (t: string) => {
  const [h, m] = hhmm(t).split(':').map(Number);
  return h * 60 + m;
};
const addDays = (d: string, n: number) => {
  const x = new Date(`${d}T12:00:00`);
  x.setDate(x.getDate() + n);
  return x.toLocaleDateString('en-CA');
};

type Form = { id: string | null; patient_id: string; doctor_id: string; date: string; time: string; duration: number; procedure: string; chair: string; notes: string; status: string };

/** Agenda REAL: appointments + patients + doctors de tu clinica. Los pacientes registrados aparecen solos al agendar. */
export default function RealAgenda() {
  const { user } = useAuth();
  const [date, setDate] = useState(today());
  const [appts, setAppts] = useState<Appt[] | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [pq, setPq] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [docForm, setDocForm] = useState({ name: '', specialty: 'Odontología general' });

  const loadDay = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from('appointments')
      .select('id, patient_id, doctor_id, date, start_time, duration_min, procedure, chair, status, notes, patients(first_name, last_name, phone), doctors(full_name)')
      .eq('date', date)
      .order('start_time');
    if (error) setToast('No se pudo cargar la agenda.');
    else setAppts((data as unknown as Appt[]) || []);
  }, [date]);

  const loadBase = useCallback(async () => {
    const sb = getSupabase();
    const [p, d] = await Promise.all([
      sb.from('patients').select('id, first_name, last_name, cedula, phone').eq('active', true).order('last_name'),
      sb.from('doctors').select('id, full_name, specialty').eq('active', true).order('full_name'),
    ]);
    setPatients((p.data as Patient[]) || []);
    setDoctors((d.data as Doctor[]) || []);
  }, []);

  useEffect(() => { loadBase(); }, [loadBase]);
  useEffect(() => { setAppts(null); loadDay(); }, [loadDay]);

  // Llegar desde la ficha del paciente: /doctor-agenda?patient=ID abre "Nueva cita" con ese paciente.
  useEffect(() => {
    if (!doctors || typeof window === 'undefined') return;
    const pid = new URLSearchParams(window.location.search).get('patient');
    if (pid && doctors.length > 0) {
      openNew(pid);
      window.history.replaceState({}, '', '/doctor-agenda');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors]);

  function openNew(patientId = '') {
    setPq('');
    setForm({
      id: null, patient_id: patientId, doctor_id: doctors?.[0]?.id || '', date, time: '09:00', duration: 30,
      procedure: '', chair: '', notes: '', status: 'Pendiente',
    });
  }
  function openEdit(a: Appt) {
    setPq('');
    setForm({
      id: a.id, patient_id: a.patient_id, doctor_id: a.doctor_id, date: a.date, time: hhmm(a.start_time),
      duration: a.duration_min || 30, procedure: a.procedure || '', chair: a.chair || '', notes: a.notes || '', status: a.status || 'Pendiente',
    });
  }
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((s) => (s ? { ...s, [k]: v } : s));

  async function addDoctor(self: boolean) {
    if (!user?.clinicId) return;
    const name = self ? user.fullName : docForm.name.trim();
    if (name.length < 3) return setToast('Escribe el nombre del odontólogo.');
    const { error } = await getSupabase().from('doctors').insert({
      clinic_id: user.clinicId, full_name: name, specialty: docForm.specialty.trim() || null, profile_id: self ? user.id : null,
    });
    if (error) return setToast(`No se pudo agregar: ${error.message}`);
    setToast('Odontólogo agregado.');
    loadBase();
  }

  async function save() {
    if (!form || !user?.clinicId) return;
    if (!form.patient_id) return setToast('Elige el paciente.');
    if (!form.doctor_id) return setToast('Elige el odontólogo.');
    if (!form.date || !form.time) return setToast('Indica fecha y hora.');
    setSaving(true);
    const sb = getSupabase();
    // Evitar dos citas al mismo tiempo con el mismo odontólogo
    const { data: dayRows } = await sb.from('appointments').select('id, start_time, duration_min, status').eq('doctor_id', form.doctor_id).eq('date', form.date);
    const s0 = toMin(form.time), e0 = s0 + form.duration;
    const clash = (dayRows || []).find((r) => r.id !== form.id && r.status !== 'Cancelada' && toMin(r.start_time) < e0 && toMin(r.start_time) + (r.duration_min || 30) > s0);
    if (clash && form.status !== 'Cancelada') {
      setSaving(false);
      return setToast(`El odontólogo ya tiene una cita a las ${hhmm(clash.start_time)} en ese horario.`);
    }
    const payload = {
      patient_id: form.patient_id, doctor_id: form.doctor_id, date: form.date, start_time: form.time, duration_min: form.duration,
      procedure: form.procedure.trim() || null, chair: form.chair.trim() || null, notes: form.notes.trim() || null, status: form.status,
    };
    const { error } = form.id
      ? await sb.from('appointments').update(payload).eq('id', form.id)
      : await sb.from('appointments').insert({ ...payload, clinic_id: user.clinicId });
    setSaving(false);
    if (error) return setToast(`No se pudo guardar: ${error.message}`);
    setForm(null);
    setToast(form.id ? 'Cita actualizada.' : 'Cita agendada.');
    if (form.date !== date) setDate(form.date);
    else loadDay();
  }

  async function setStatus(a: Appt, status: string) {
    const prev = a.status;
    setAppts((rs) => (rs || []).map((r) => (r.id === a.id ? { ...r, status } : r)));
    const { error } = await getSupabase().from('appointments').update({ status, ...(status === 'En sala' ? { arrived_at: new Date().toISOString() } : {}) }).eq('id', a.id);
    if (error) {
      setAppts((rs) => (rs || []).map((r) => (r.id === a.id ? { ...r, status: prev } : r)));
      setToast('No se pudo cambiar el estado.');
    }
  }

  const filteredPatients = useMemo(() => {
    const q = pq.trim().toLowerCase();
    const list = q ? patients.filter((p) => `${p.first_name} ${p.last_name} ${p.cedula || ''}`.toLowerCase().includes(q)) : patients;
    return list.slice(0, 50);
  }, [patients, pq]);

  const label = new Date(`${date}T12:00:00`).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const noDoctors = doctors !== null && doctors.length === 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Agenda</h1>
          <p className="text-sm capitalize text-muted-foreground">{label}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={btnGhost} onClick={() => setDate(addDays(date, -1))} aria-label="Día anterior"><Icon name="ChevronLeftIcon" size={16} /></button>
          <input type="date" className={`${fld} w-auto`} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
          <button type="button" className={btnGhost} onClick={() => setDate(addDays(date, 1))} aria-label="Día siguiente"><Icon name="ChevronRightIcon" size={16} /></button>
          <button type="button" className={btnGhost} onClick={() => setDate(today())}>Hoy</button>
          <button type="button" className={btnPrimary(noDoctors)} disabled={noDoctors || doctors === null} onClick={() => openNew()}>
            <Icon name="PlusIcon" size={16} /> Nueva cita
          </button>
        </div>
      </div>

      {noDoctors && (
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Primero agrega un odontólogo</h2>
          <p className="mt-1 text-sm text-muted-foreground">Para agendar citas necesitas al menos un odontólogo en tu clínica.</p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <button type="button" className={btnPrimary()} onClick={() => addDoctor(true)}>Soy yo: {user?.fullName}</button>
            <span className="text-sm text-muted-foreground">o agrega a otro:</span>
            <Field label="Nombre"><input className={fld} value={docForm.name} onChange={(e) => setDocForm((s) => ({ ...s, name: e.target.value }))} /></Field>
            <Field label="Especialidad"><input className={fld} value={docForm.specialty} onChange={(e) => setDocForm((s) => ({ ...s, specialty: e.target.value }))} /></Field>
            <button type="button" className={btnGhost} onClick={() => addDoctor(false)}>Agregar</button>
          </div>
        </section>
      )}

      {!appts && <div className="h-32 animate-pulse rounded-xl bg-muted/40" />}
      {appts && appts.length === 0 && !noDoctors && (
        <EmptyState icon={<Icon name="CalendarDaysIcon" size={24} />} title="Sin citas este día" description="Pulsa «Nueva cita» para agendar a un paciente registrado." />
      )}
      {appts && appts.length > 0 && (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {appts.map((a) => (
            <li key={a.id} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[90px_1fr_auto] sm:items-center">
              <div className="font-semibold">{hhmm(a.start_time)}<span className="block text-xs font-normal text-muted-foreground">{a.duration_min || 30} min</span></div>
              <div>
                <p className="font-semibold">{a.patients ? `${a.patients.first_name} ${a.patients.last_name}` : 'Paciente'}</p>
                <p className="text-muted-foreground">{[a.procedure, a.doctors?.full_name, a.chair && `Sillón ${a.chair}`].filter(Boolean).join(' · ')}</p>
                {a.notes && <p className="text-xs text-muted-foreground">{a.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                <select aria-label="Estado de la cita" className={`${fld} w-auto`} value={a.status || 'Pendiente'} onChange={(e) => setStatus(a, e.target.value)}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <button type="button" className={btnGhost} onClick={() => openEdit(a)}><Icon name="PencilSquareIcon" size={14} /> Editar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground"><Badge>{appts?.length ?? 0}</Badge> cita(s) este día. Los pacientes registrados en «Ficha del paciente» aparecen aquí automáticamente.</p>

      <Modal
        open={!!form}
        onClose={() => !saving && setForm(null)}
        size="lg"
        title={form?.id ? 'Editar cita' : 'Nueva cita'}
        subtitle="Los campos con * son obligatorios"
        footer={
          <>
            <button type="button" className={btnGhost} onClick={() => setForm(null)} disabled={saving}>Cancelar</button>
            <button type="button" className={btnPrimary(saving)} onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </>
        }
      >
        {form && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Buscar paciente (nombre o cédula)" className="sm:col-span-2">
              <input className={fld} value={pq} onChange={(e) => setPq(e.target.value)} placeholder="Escribe para filtrar…" />
            </Field>
            <Field label="Paciente" required className="sm:col-span-2">
              <select className={fld} value={form.patient_id} onChange={(e) => set('patient_id', e.target.value)}>
                <option value="">{patients.length ? 'Selecciona un paciente' : 'No hay pacientes registrados'}</option>
                {filteredPatients.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} · {p.cedula || 's/c'}</option>)}
                {form.patient_id && !filteredPatients.some((p) => p.id === form.patient_id) && patients.filter((p) => p.id === form.patient_id).map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
              </select>
            </Field>
            <Field label="Odontólogo" required>
              <select className={fld} value={form.doctor_id} onChange={(e) => set('doctor_id', e.target.value)}>
                {(doctors || []).map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
              </select>
            </Field>
            <Field label="Estado">
              <select className={fld} value={form.status} onChange={(e) => set('status', e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            </Field>
            <Field label="Fecha" required><input type="date" className={fld} value={form.date} onChange={(e) => set('date', e.target.value)} /></Field>
            <Field label="Hora" required><input type="time" className={fld} value={form.time} onChange={(e) => set('time', e.target.value)} /></Field>
            <Field label="Duración (min)"><input type="number" min="5" step="5" className={fld} value={form.duration} onChange={(e) => set('duration', Math.max(5, Number(e.target.value) || 30))} /></Field>
            <Field label="Sillón"><input className={fld} value={form.chair} onChange={(e) => set('chair', e.target.value)} /></Field>
            <Field label="Motivo o procedimiento" className="sm:col-span-2"><input className={fld} value={form.procedure} onChange={(e) => set('procedure', e.target.value)} /></Field>
            <Field label="Notas" className="sm:col-span-2"><textarea rows={2} className={fld} value={form.notes} onChange={(e) => set('notes', e.target.value)} /></Field>
          </div>
        )}
      </Modal>
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
