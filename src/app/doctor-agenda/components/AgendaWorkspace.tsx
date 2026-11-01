'use client';
import React, { useCallback, useMemo, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import { citas as initialCitas, doctors, Cita } from '@/lib/mockData';
import AgendaToolbar from './AgendaToolbar';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import MiniCalendar from './MiniCalendar';
import NewAppointmentModal, { NewCitaPayload } from './NewAppointmentModal';
import AppointmentDetail from './AppointmentDetail';

export type ViewMode = 'day' | 'week' | 'month';

const toIso = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function AgendaWorkspace() {
  const [view, setView] = useState<ViewMode>('day');
  const [cursor, setCursor] = useState<string>('2026-10-31');
  const [doctorId, setDoctorId] = useState<string>('all');
  const [list, setList] = useState<Cita[]>(initialCitas);
  const [modalOpen, setModalOpen] = useState(false);
  const [prefill, setPrefill] = useState<{ date: string; start: string }>({ date: '2026-10-31', start: '09:00' });
  const [selected, setSelected] = useState<Cita | null>(null);
  const [toast, setToast] = useState('');

  const filtered = useMemo(() => list.filter((c) => doctorId === 'all' || c.doctorId === doctorId), [list, doctorId]);

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

  const handleCreate = (payload: NewCitaPayload) => {
    const doc = doctors.find((d) => d.id === payload.doctorId);
    const created: Cita = {
      id: `cita-${String(list.length + 1).padStart(3, '0')}`,
      patientId: payload.patientId,
      patient: payload.patientName,
      doctorId: payload.doctorId,
      doctor: doc ? doc.name : 'Sin asignar',
      date: payload.date,
      start: payload.start,
      duration: payload.duration,
      procedure: payload.procedure,
      chair: payload.chair,
      status: 'Pendiente',
      reminder: payload.reminder,
    };
    // Backend integration: POST /api/appointments (validate chair/doctor overlap server-side)
    setList((prev) => [...prev, created]);
    setModalOpen(false);
    setCursor(payload.date);
    setToast(`Cita agendada para ${payload.patientName} el ${payload.date.split('-').reverse().join('/')} a las ${payload.start}`);
  };

  const updateStatus = (id: string, status: Cita['status']) => {
    setList((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    setToast(`Estado actualizado a «${status}»`);
  };

  const todayCount = filtered.filter((c) => c.date === cursor).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Agenda del doctor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Selecciona un día o una franja horaria para agendar una cita. {todayCount} citas en el día seleccionado.
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
                  <span className="tabular ml-auto text-xs text-muted-foreground">{filtered.filter((c) => c.status === l.label).length}</span>
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
            onToday={() => setCursor('2026-10-31')}
            doctorId={doctorId}
            onDoctor={setDoctorId}
          />
          <div className="animate-fade-in" key={`${view}-${cursor}-${doctorId}`}>
            {view === 'day' && <DayView date={cursor} citas={filtered} onSlot={(t) => openBooking(cursor, t)} onSelect={setSelected} />}
            {view === 'week' && <WeekView date={cursor} citas={filtered} onSlot={(d, t) => openBooking(d, t)} onSelect={setSelected} />}
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
      />
      <AppointmentDetail cita={selected} onClose={() => setSelected(null)} onStatus={updateStatus} />
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}