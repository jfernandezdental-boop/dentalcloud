'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import { Cita, CitaStatus } from '@/lib/mockData';
import { getSupabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { today } from '@/app/patient-record/components/tabs/formKit';
import AgendaToolbar from './AgendaToolbar';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import MiniCalendar from './MiniCalendar';
import NewAppointmentModal, { NewCitaPayload } from './NewAppointmentModal';
import AppointmentDetail from './AppointmentDetail';
import RealAgenda from './RealAgenda';
import type { ViewMode } from './AgendaWorkspace';

/**
 * Agenda del doctor para clínicas REALES.
 * Lee y escribe en appointments / patients / doctors / procedures.
 * Nunca usa datos de mock.
 */
type Row = {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  start_time: string;
  duration_min: number | null;
  procedure: string | null;
  chair: string | null;
  status: string | null;
  notes: string | null;
  patients: { first_name: string; last_name: string } | null;
  doctors: { full_name: string } | null;
};
type PatientOpt = { id: string; name: string; cedula: string | null };
type DoctorOpt = { id: string; name: string; specialty: string | null };

const STATUSES: CitaStatus[] = [
  'Pendiente',
  'Confirmada',
  'En sala',
  'En atención',
  'Atendida',
  'No asistió',
  'Cancelada',
];
const hhmm = (t: string) => String(t).slice(0, 5);
const toMin = (t: string) => {
  const [h, m] = hhmm(t).split(':').map(Number);
  return h * 60 + m;
};
const toIso = (d: Date) => d.toLocaleDateString('en-CA');
const toCita = (r: Row): Cita => ({
  id: r.id,
  patientId: r.patient_id,
  patient: r.patients ? `${r.patients.first_name} ${r.patients.last_name}`.trim() : 'Paciente',
  doctorId: r.doctor_id,
  doctor: r.doctors?.full_name || 'Sin asignar',
  date: r.date,
  start: hhmm(r.start_time),
  duration: r.duration_min || 30,
  procedure: r.procedure || 'Consulta',
  chair: r.chair || '—',
  status: STATUSES.includes(r.status as CitaStatus) ? (r.status as CitaStatus) : 'Pendiente',
  reminder: false,
});

export default function RealAgendaWorkspace() {
  const { user } = useAuth();
  const clinicId = user?.clinicId || null;
  const [view, setView] = useState<ViewMode>('day');
  const [cursor, setCursor] = useState<string>(today());
  const [doctorId, setDoctorId] = useState<string>('all');
  const [list, setList] = useState<Cita[]>([]);
  const [patients, setPatients] = useState<PatientOpt[]>([]);
  const [doctors, setDoctors] = useState<DoctorOpt[] | null>(null);
  const [procedures, setProcedures] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [prefill, setPrefill] = useState<{ date: string; start: string; patientId?: string }>({
    date: today(),
    start: '09:00',
  });
  const [selected, setSelected] = useState<Cita | null>(null);
  const [toast, setToast] = useState('');

  const month = cursor.slice(0, 7);
  const range = useMemo(() => {
    const d = new Date(`${month}-01T12:00:00`);
    const a = new Date(d.getFullYear(), d.getMonth(), 1, 12);
    a.setDate(a.getDate() - 7);
    const b = new Date(d.getFullYear(), d.getMonth() + 1, 0, 12);
    b.setDate(b.getDate() + 7);
    return { from: toIso(a), to: toIso(b) };
  }, [month]);

  const load = useCallback(async () => {
    let q = getSupabase()
      .from('appointments')
      .select(
        'id, patient_id, doctor_id, date, start_time, duration_min, procedure, chair, status, notes, patients(first_name, last_name), doctors(full_name)',
      )
      .gte('date', range.from)
      .lte('date', range.to)
      .order('start_time');
    if (clinicId) q = q.eq('clinic_id', clinicId);
    const { data, error } = await q;
    if (error) setToast('No se pudo cargar la agenda.');
    else setList(((data as unknown as Row[]) || []).map(toCita));
  }, [range.from, range.to, clinicId]);

  const loadBase = useCallback(async () => {
    if (!clinicId) return;
    const sb = getSupabase();
    const [p, d, proc] = await Promise.all([
      sb
        .from('patients')
        .select('id, first_name, last_name, cedula')
        .eq('active', true)
        .eq('clinic_id', clinicId)
        .order('last_name'),
      sb
        .from('doctors')
        .select('id, full_name, specialty')
        .eq('active', true)
        .eq('clinic_id', clinicId)
        .order('full_name'),
      sb
        .from('procedures')
        .select('name')
        .eq('active', true)
        .eq('clinic_id', clinicId)
        .order('name'),
    ]);
    setPatients(
      ((p.data as { id: string; first_name: string; last_name: string; cedula: string | null }[]) || []).map(
        (x) => ({ id: x.id, name: `${x.first_name} ${x.last_name}`.trim(), cedula: x.cedula }),
      ),
    );
    setDoctors(
      ((d.data as { id: string; full_name: string; specialty: string | null }[]) || []).map((x) => ({
        id: x.id,
        name: x.full_name,
        specialty: x.specialty,
      })),
    );
    setProcedures(((proc.data as { name: string }[]) || []).map((x) => x.name));
  }, [clinicId]);

  useEffect(() => {
    loadBase();
  }, [loadBase]);
  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!doctors || doctors.length === 0 || typeof window === 'undefined') return;
    const pid = new URLSearchParams(window.location.search).get('patient');
    if (pid) {
      setPrefill({ date: today(), start: '09:00', patientId: pid });
      setModalOpen(true);
      window.history.replaceState({}, '', '/doctor-agenda');
    }
  }, [doctors]);

  const filtered = useMemo(
    () => list.filter((c) => doctorId === 'all' || c.doctorId === doctorId),
    [list, doctorId],
  );

  const shift = (dir: -1 | 1) => {
    const d = new Date(`${cursor}T12:00:00`);
    if (view === 'day') d.setDate(d.getDate() + dir);
    if (view === 'week') d.setDate(d.getDate() + dir * 7);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
    setCursor(toIso(d));
  };

  const openBooking = useCallback((date: string, start: string = '09:00') => {
    setPrefill({ date, start });
    setModalOpen(true);
  }, []);

  async function handleCreate(p: NewCitaPayload) {
    if (!clinicId) return;
    const sb = getSupabase();
    const { data: dayRows } = await sb
      .from('appointments')
      .select('id, start_time, duration_min, status')
      .eq('doctor_id', p.doctorId)
      .eq('date', p.date);
    const s0 = toMin(p.start);
    const e0 = s0 + p.duration;
    const clash = (dayRows || []).find(
      (r) =>
        r.status !== 'Cancelada' &&
        toMin(r.start_time) < e0 &&
        toMin(r.start_time) + (r.duration_min || 30) > s0,
    );
    if (clash) {
      setToast(`El odontólogo ya tiene una cita a las ${hhmm(clash.start_time)} en ese horario.`);
      return;
    }
    const { error } = await sb.from('appointments').insert({
      clinic_id: clinicId,
      patient_id: p.patientId,
      doctor_id: p.doctorId,
      date: p.date,
      start_time: p.start,
      duration_min: p.duration,
      procedure: p.procedure || null,
      chair: p.chair || null,
      notes: p.notes || null,
      status: 'Pendiente',
    });
    if (error) {
      setToast(`No se pudo guardar: ${error.message}`);
      return;
    }
    setModalOpen(false);
    setCursor(p.date);
    setToast(`Cita agendada para ${p.patientName} el ${p.date.split('-').reverse().join('/')} a las ${p.start}`);
    load();
  }

  async function updateStatus(id: string, status: Cita['status']) {
    const prev = list.find((c) => c.id === id)?.status;
    setList((rs) => rs.map((c) => (c.id === id ? { ...c, status } : c)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
    const { error } = await getSupabase()
      .from('appointments')
      .update({ status, ...(status === 'En sala' ? { arrived_at: new Date().toISOString() } : {}) })
      .eq('id', id);
    if (error) {
      if (prev) {
        setList((rs) => rs.map((c) => (c.id === id ? { ...c, status: prev } : c)));
        setSelected((s) => (s && s.id === id ? { ...s, status: prev } : s));
      }
      setToast('No se pudo cambiar el estado.');
      return;
    }
    setToast(`Estado actualizado a «${status}»`);
  }

  if (doctors && doctors.length === 0) return <RealAgenda />;

  const todayCount = filtered.filter((c) => c.date === cursor).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Agenda del doctor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Selecciona un día o una franja horaria para agendar una cita. {todayCount}{' '}
            {todayCount === 1 ? 'cita' : 'citas'} en el día seleccionado.
          </p>
        </div>
        <button
          onClick={() => openBooking(cursor)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-95"
        >
          <Icon name="PlusIcon" size={16} />
          Nueva cita
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
        <div className="space-y-5">
          <MiniCalendar cursor={cursor} citas={filtered} onSelect={(d) => setCursor(d)} onBook={(d) => openBooking(d)} />
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold">Estados de cita</h3>
            <ul className="space-y-2 text-sm">
              {[
                { id: 'lg-1', label: 'Atendida', cls: 'bg-muted-foreground' },
                { id: 'lg-2', label: 'En atención', cls: 'bg-success' },
                { id: 'lg-3', label: 'En sala', cls: 'bg-accent' },
                { id: 'lg-4', label: 'Confirmada', cls: 'bg-primary' },
                { id: 'lg-5', label: 'Pendiente', cls: 'bg-warning' },
                { id: 'lg-6', label: 'No asistió', cls: 'bg-destructive' },
              ].map((l) => (
                <li key={l.id} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${l.cls}`} />
                  {l.label}
                  <span className="tabular ml-auto text-xs text-muted-foreground">
                    {filtered.filter((c) => c.date === cursor && c.status === l.label).length}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-border bg-card">
          <AgendaToolbar
            view={view}
            onView={setView}
            cursor={cursor}
            onPrev={() => shift(-1)}
            onNext={() => shift(1)}
            onToday={() => setCursor(today())}
            doctorId={doctorId}
            onDoctor={setDoctorId}
            doctors={doctors || []}
          />
          <div className="animate-fade-in" key={`${view}-${cursor}-${doctorId}`}>
            {view === 'day' && (
              <DayView date={cursor} citas={filtered} onSlot={(t) => openBooking(cursor, t)} onSelect={setSelected} />
            )}
            {view === 'week' && (
              <WeekView date={cursor} citas={filtered} onSlot={(d, t) => openBooking(d, t)} onSelect={setSelected} />
            )}
            {view === 'month' && (
              <MonthView
                date={cursor}
                citas={filtered}
                onDay={(d) => {
                  setCursor(d);
                  setView('day');
                }}
                onBook={(d) => openBooking(d)}
              />
            )}
          </div>
        </div>
      </div>

      <NewAppointmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaults={prefill}
        onCreate={handleCreate}
        doctors={doctors || []}
        patients={patients}
        procedures={procedures}
      />
      <AppointmentDetail cita={selected} onClose={() => setSelected(null)} onStatus={updateStatus} />
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
