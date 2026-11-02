'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import { FieldError, RequiredMark, RequiredLegend, inputClass, ariaFor } from '@/components/ui/FormField';
import { rules } from '@/lib/validators';
import type { IdCountry } from '@/lib/validators';
import type { RegisterOptions } from 'react-hook-form';
import type { PatientListItem } from '../PatientListPanel';

interface ProfileValues {
  firstName: string;
  lastName: string;
  idCountry: string;
  cedula: string;
  birth: string;
  sex: string;
  civil: string;
  occupation: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  insurance: string;
  emergencyName: string;
  emergencyPhone: string;
  bloodType: string;
  allergies: string;
}

const disabledCls = 'disabled:bg-muted/50 disabled:text-foreground';
type FieldRules = RegisterOptions<ProfileValues, keyof ProfileValues>;

function fromPatient(p: PatientListItem): ProfileValues {
  return {
    firstName: p.firstName || '',
    lastName: p.lastName || '',
    idCountry: 'EC',
    cedula: p.document || '',
    birth: p.birth || '',
    sex: p.sex || 'Femenino',
    civil: p.civil || 'Soltera',
    occupation: p.occupation || '',
    phone: p.phone || '',
    email: p.email || '',
    address: p.address || '',
    city: p.city || '',
    insurance: p.insurance || 'Particular',
    emergencyName: p.emergencyName || '',
    emergencyPhone: p.emergencyPhone || '',
    bloodType: p.bloodType || 'O+',
    allergies: p.allergies || 'Ninguna',
  };
}

export default function ProfileTab({
  patient,
  onSaved,
}: {
  patient: PatientListItem;
  onSaved?: (values: Record<string, string>) => Promise<void> | void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    trigger,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    mode: 'onTouched',
    defaultValues: fromPatient(patient),
  });

  useEffect(() => {
    reset(fromPatient(patient));
    setEditing(false);
  }, [patient.id, patient, reset]);

  const idCountry = (watch('idCountry') || 'EC') as IdCountry;

  const save = async (values: ProfileValues) => {
    setSaving(true);
    try {
      if (onSaved) await onSaved(values as unknown as Record<string, string>);
      else setToast('Datos actualizados en pantalla');
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const field = (
    id: keyof ProfileValues,
    label: string,
    opts?: {
      type?: string;
      required?: boolean;
      helper?: string;
      rules?: FieldRules;
      max?: string;
      maxLength?: number;
      inputMode?: 'numeric' | 'tel' | 'text';
    },
  ) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
        <RequiredMark required={!!opts?.required} />
      </label>
      {opts?.helper ? <p className="mb-1.5 text-xs text-muted-foreground">{opts.helper}</p> : null}
      <input
        id={id}
        type={opts?.type || 'text'}
        disabled={!editing}
        max={opts?.max}
        maxLength={opts?.maxLength}
        inputMode={opts?.inputMode}
        className={inputClass(!!errors[id], disabledCls)}
        {...ariaFor(id, !!errors[id])}
        {...register(id, opts?.rules)}
      />
      <FieldError id={id} message={errors[id]?.message as string | undefined} />
    </div>
  );

  const select = (id: keyof ProfileValues, label: string, options: string[]) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
        <RequiredMark />
      </label>
      <select
        id={id}
        disabled={!editing}
        className={inputClass(!!errors[id], disabledCls)}
        {...register(id, { required: `Selecciona ${label.toLowerCase()}` })}
      >
        {options.map((o) => (
          <option key={`${id}-${o}`} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(save)} noValidate className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Datos personales y de contacto</h2>
          <p className="text-sm text-muted-foreground">Ficha del paciente seleccionado (editable).</p>
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            <Icon name="PencilSquareIcon" size={16} />
            Editar perfil
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {isDirty ? (
              <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">Cambios sin guardar</span>
            ) : null}
            <button
              type="button"
              onClick={() => {
                reset(fromPatient(patient));
                setEditing(false);
              }}
              className="rounded-lg border border-input px-4 py-2 text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
            >
              {saving ? (
                <>
                  <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        )}
      </div>

      {editing ? <RequiredLegend /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {field('firstName', 'Nombres', { required: true, rules: rules.name('Los nombres') })}
        {field('lastName', 'Apellidos', { required: true, rules: rules.name('Los apellidos') })}
        <div>
          <label htmlFor="idCountry" className="mb-1.5 block text-sm font-semibold">
            Pais del documento
            <RequiredMark />
          </label>
          <select
            id="idCountry"
            disabled={!editing}
            className={inputClass(false, disabledCls)}
            {...register('idCountry', {
              required: true,
              onChange: () => {
                if (getValues('cedula')) void trigger('cedula');
              },
            })}
          >
            <option value="EC">Ecuador — Cedula</option>
            <option value="CL">Chile — RUT</option>
          </select>
        </div>
        {field('cedula', idCountry === 'CL' ? 'RUT' : 'Cedula de identidad', {
          required: true,
          inputMode: idCountry === 'CL' ? 'text' : 'numeric',
          maxLength: idCountry === 'CL' ? 12 : 10,
          rules: rules.nationalId(() => (getValues('idCountry') || 'EC') as IdCountry),
        })}
        {field('birth', 'Fecha de nacimiento', { type: 'date', required: true, rules: rules.pastDate('La fecha de nacimiento') })}
        {select('sex', 'Sexo', ['Femenino', 'Masculino', 'Otro'])}
        {select('civil', 'Estado civil', ['Soltera', 'Casada', 'Divorciada', 'Viuda', 'Union de hecho'])}
        {field('occupation', 'Ocupacion')}
        {select('insurance', 'Seguro de salud', ['IESS', 'ISSFA', 'ISSPOL', 'Seguro privado', 'Particular', 'Sin seguro'])}
        {field('phone', 'Celular', { required: true, inputMode: 'tel', maxLength: 10, rules: rules.mobile(true) })}
        {field('email', 'Correo electronico', { type: 'email', rules: rules.email(false) })}
        {field('city', 'Ciudad de residencia', { required: true })}
        <div className="sm:col-span-2">{field('address', 'Direccion domiciliaria', { required: true })}</div>
        {select('bloodType', 'Grupo sanguineo', ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'])}
        {field('emergencyName', 'Contacto de emergencia', { required: true })}
        {field('emergencyPhone', 'Telefono de emergencia', { required: true, inputMode: 'tel', maxLength: 10, rules: rules.phone(true) })}
        <div className="sm:col-span-2 xl:col-span-3">
          {field('allergies', 'Alergias conocidas', { required: true, helper: 'Escribe "Ninguna" si no tiene.' })}
        </div>
      </div>
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </form>
  );
}
