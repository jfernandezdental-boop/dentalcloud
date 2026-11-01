'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/ui/AppIcon';
import Toggle from '@/components/ui/Toggle';
import { FieldError, RequiredMark, RequiredLegend, inputClass, ariaFor } from '@/components/ui/FormField';
import { todayISO } from '@/lib/validators';
import { doctors, patients, procedures } from '@/lib/mockData';

export interface NewCitaPayload {
  patientId: string;
  patientName: string;
  doctorId: string;
  date: string;
  start: string;
  duration: number;
  procedure: string;
  chair: string;
  reminder: boolean;
  notes: string;
}

interface FormValues {
  patientId: string;
  doctorId: string;
  date: string;
  start: string;
  duration: number;
  procedure: string;
  chair: string;
  notes: string;
}

interface NewAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  defaults: { date: string; start: string };
  onCreate: (p: NewCitaPayload) => void;
}

export default function NewAppointmentModal({ open, onClose, defaults, onCreate }: NewAppointmentModalProps) {
  const [reminder, setReminder] = useState(true);
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onTouched',
    defaultValues: { patientId: '', doctorId: 'doc-001', date: defaults.date, start: defaults.start, duration: 30, procedure: procedures[0], chair: 'Sillón 1', notes: '' },
  });
  const selectedDate = watch('date');
  const duration = watch('duration');

  useEffect(() => {
    if (open) {
      reset({ patientId: '', doctorId: 'doc-001', date: defaults.date, start: defaults.start, duration: 30, procedure: procedures[0], chair: 'Sillón 1', notes: '' });
      setReminder(true);
      setSaving(false);
    }
  }, [open, defaults, reset]);

  const submit = (v: FormValues) => {
    setSaving(true);
    const patient = patients.find((p) => p.id === v.patientId);
    setTimeout(() => {
      onCreate({
        patientId: v.patientId,
        patientName: patient ? patient.name : 'Paciente',
        doctorId: v.doctorId,
        date: v.date,
        start: v.start,
        duration: Number(v.duration),
        procedure: v.procedure,
        chair: v.chair,
        reminder,
        notes: v.notes.trim(),
      });
    }, 600);
  };

  const endsAfterClose = (start: string) => {
    if (!start) return true;
    const [h, m] = start.split(':').map(Number);
    return h * 60 + m + Number(duration) <= 19 * 60;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Nueva cita"
      subtitle="El bot IA enviará recordatorios al paciente y al doctor según tu configuración."
      footer={
        <>
          <button onClick={onClose} className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95">Cancelar</button>
          <button
            form="new-cita-form"
            type="submit"
            disabled={saving}
            className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-70"
          >
            {saving ? (<><Icon name="ArrowPathIcon" size={16} className="animate-spin" />Agendando…</>) : 'Agendar cita'}
          </button>
        </>
      }
    >
      <form id="new-cita-form" onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <div className="sm:col-span-2"><RequiredLegend /></div>

        <div className="sm:col-span-2">
          <label htmlFor="patientId" className="mb-1.5 block text-sm font-semibold">Paciente<RequiredMark /></label>
          <select
            id="patientId"
            className={inputClass(!!errors.patientId)}
            {...ariaFor('patientId', !!errors.patientId)}
            {...register('patientId', { required: 'Selecciona un paciente de la lista' })}
          >
            <option value="">Buscar paciente por nombre o cédula…</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — C.I. {p.cedula}</option>
            ))}
          </select>
          <FieldError id="patientId" message={errors.patientId?.message} />
        </div>

        <div>
          <label htmlFor="doctorId" className="mb-1.5 block text-sm font-semibold">Odontólogo<RequiredMark /></label>
          <select id="doctorId" className={inputClass(!!errors.doctorId)} {...ariaFor('doctorId', !!errors.doctorId)} {...register('doctorId', { required: 'Selecciona un odontólogo' })}>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name} · {d.specialty}</option>
            ))}
          </select>
          <FieldError id="doctorId" message={errors.doctorId?.message} />
        </div>
        <div>
          <label htmlFor="procedure" className="mb-1.5 block text-sm font-semibold">Procedimiento<RequiredMark /></label>
          <select id="procedure" className={inputClass(!!errors.procedure)} {...ariaFor('procedure', !!errors.procedure)} {...register('procedure', { required: 'Selecciona un procedimiento' })}>
            {procedures.map((p) => (
              <option key={`proc-${p}`} value={p}>{p}</option>
            ))}
          </select>
          <FieldError id="procedure" message={errors.procedure?.message} />
        </div>

        <div>
          <label htmlFor="date" className="mb-1.5 block text-sm font-semibold">Fecha<RequiredMark /></label>
          <input
            id="date"
            type="date"
            min={todayISO()}
            className={inputClass(!!errors.date, 'tabular')}
            {...ariaFor('date', !!errors.date)}
            {...register('date', {
              required: 'Selecciona la fecha de la cita',
              validate: (v) => {
                if (v < todayISO()) return 'No se puede agendar en una fecha pasada';
                const d = new Date(`${v}T00:00:00`);
                if (d.getDay() === 0) return 'La clínica no atiende los domingos';
                return true;
              },
            })}
          />
          <FieldError id="date" message={errors.date?.message} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="start" className="mb-1.5 block text-sm font-semibold">Hora<RequiredMark /></label>
            <input
              id="start"
              type="time"
              step={900}
              className={inputClass(!!errors.start, 'tabular')}
              {...ariaFor('start', !!errors.start)}
              {...register('start', {
                required: 'Indica la hora de la cita',
                validate: (v) => {
                  if (v < '08:00' || v > '18:30') return 'Horario de atención: 08:00 – 18:30';
                  if (!endsAfterClose(v)) return 'La cita termina después de las 19:00';
                  if (selectedDate === todayISO()) {
                    const now = new Date();
                    const nowStr = `${`${now.getHours()}`.padStart(2, '0')}:${`${now.getMinutes()}`.padStart(2, '0')}`;
                    if (v < nowStr) return 'La hora ya pasó';
                  }
                  return true;
                },
              })}
            />
            <FieldError id="start" message={errors.start?.message} />
          </div>
          <div>
            <label htmlFor="duration" className="mb-1.5 block text-sm font-semibold">Duración<RequiredMark /></label>
            <select id="duration" className={inputClass(!!errors.duration)} {...register('duration', { required: 'Selecciona la duración' })}>
              {[15, 30, 45, 60, 90, 120].map((m) => (
                <option key={`dur-${m}`} value={m}>{m} min</option>
              ))}
            </select>
            <FieldError id="duration" message={errors.duration?.message} />
          </div>
        </div>

        <div>
          <label htmlFor="chair" className="mb-1.5 block text-sm font-semibold">Sillón / consultorio<RequiredMark /></label>
          <select id="chair" className={inputClass(!!errors.chair)} {...register('chair', { required: 'Selecciona un sillón' })}>
            {['Sillón 1', 'Sillón 2', 'Sillón 3', 'Sillón 4'].map((c) => (
              <option key={`chair-${c}`} value={c}>{c}</option>
            ))}
          </select>
          <FieldError id="chair" message={errors.chair?.message} />
        </div>
        <div className="flex items-end">
          <div className="flex w-full items-center justify-between rounded-lg border border-input bg-muted/40 px-3.5 py-2">
            <div>
              <p className="text-sm font-semibold">Recordatorio bot IA</p>
              <p className="text-[11px] text-muted-foreground">WhatsApp 1 día antes + 2 h antes</p>
            </div>
            <Toggle checked={reminder} onChange={setReminder} label="Recordatorio automático" />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="notes" className="mb-1.5 block text-sm font-semibold">Notas internas</label>
          <p className="mb-1.5 text-xs text-muted-foreground">Solo visible para el personal de la clínica. Máximo 300 caracteres.</p>
          <textarea
            id="notes"
            rows={3}
            className={inputClass(!!errors.notes)}
            placeholder="Ej. Paciente con ansiedad dental, requiere sedación consciente…"
            {...ariaFor('notes', !!errors.notes)}
            {...register('notes', { maxLength: { value: 300, message: 'Las notas no pueden superar 300 caracteres' } })}
          />
          <FieldError id="notes" message={errors.notes?.message} />
        </div>
      </form>
    </Modal>
  );
}