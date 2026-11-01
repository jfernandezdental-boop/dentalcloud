'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import { FieldError, RequiredMark, RequiredLegend, inputClass, ariaFor } from '@/components/ui/FormField';
import { rules } from '@/lib/validators';
import type { IdCountry } from '@/lib/validators';
import type { RegisterOptions } from 'react-hook-form';

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

export default function ProfileTab() {
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
    defaultValues: {
      firstName: 'Andrea Carolina',
      lastName: 'Villacís Toapanta',
      idCountry: 'EC',
      cedula: '1712345678',
      birth: '1992-03-14',
      sex: 'Femenino',
      civil: 'Casada',
      occupation: 'Ingeniera de software',
      phone: '0991234567',
      email: 'andrea.villacis@correo.ec',
      address: 'Av. República del Salvador N34-183 y Suecia',
      city: 'Quito',
      insurance: 'IESS',
      emergencyName: 'Pablo Moreno (esposo)',
      emergencyPhone: '0987654321',
      bloodType: 'O+',
      allergies: 'Penicilina (urticaria), látex (leve)',
    },
  });

  const idCountry = (watch('idCountry') || 'EC') as IdCountry;

  const save = () => {
    setSaving(true);
    // Backend integration: PATCH /api/patients/pac-0412
    setTimeout(() => {
      setSaving(false);
      setEditing(false);
      setToast('Datos del paciente guardados');
    }, 800);
  };

  const field = (id: keyof ProfileValues, label: string, opts?: { type?: string; required?: boolean; helper?: string; rules?: FieldRules; max?: string; maxLength?: number; inputMode?: 'numeric' | 'tel' | 'text' }) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}<RequiredMark required={!!opts?.required} /></label>
      {opts?.helper && <p className="mb-1.5 text-xs text-muted-foreground">{opts.helper}</p>}
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
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}<RequiredMark /></label>
      <select id={id} disabled={!editing} className={inputClass(!!errors[id], disabledCls)} {...register(id, { required: `Selecciona ${label.toLowerCase()}` })}>
        {options.map((o) => (
          <option key={`${id}-${o}`} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(save)} noValidate className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Datos personales y de contacto</h2>
          <p className="text-sm text-muted-foreground">Información requerida por el MSP para la apertura de historia clínica.</p>
        </div>
        {!editing ? (
          <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-4 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95">
            <Icon name="PencilSquareIcon" size={16} />
            Editar perfil
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {isDirty && <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">Cambios sin guardar</span>}
            <button type="button" onClick={() => { reset(); setEditing(false); }} className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95">Cancelar</button>
            <button type="submit" disabled={saving} className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-70">
              {saving ? (<><Icon name="ArrowPathIcon" size={16} className="animate-spin" />Guardando…</>) : 'Guardar cambios'}
            </button>
          </div>
        )}
      </div>

      {editing && <RequiredLegend />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {field('firstName', 'Nombres', { required: true, rules: rules.name('Los nombres') })}
        {field('lastName', 'Apellidos', { required: true, rules: rules.name('Los apellidos') })}
        <div>
          <label htmlFor="idCountry" className="mb-1.5 block text-sm font-semibold">País del documento<RequiredMark /></label>
          <select
            id="idCountry"
            disabled={!editing}
            className={inputClass(false, disabledCls)}
            {...register('idCountry', {
              required: 'Selecciona el país del documento',
              onChange: () => {
                if (getValues('cedula')) trigger('cedula');
              },
            })}
          >
            <option value="EC">Ecuador — Cédula</option>
            <option value="CL">Chile — RUT</option>
          </select>
        </div>
        {field(
          'cedula',
          idCountry === 'CL' ? 'RUT' : 'Cédula de identidad',
          {
            required: true,
            inputMode: idCountry === 'CL' ? 'text' : 'numeric',
            maxLength: idCountry === 'CL' ? 12 : 10,
            helper: idCountry === 'CL' ? 'Ej. 12.345.678-5 (con dígito verificador)' : undefined,
            rules: rules.nationalId(() => (getValues('idCountry') || 'EC') as IdCountry),
          }
        )}
        {field('birth', 'Fecha de nacimiento', { type: 'date', required: true, rules: rules.pastDate('La fecha de nacimiento') })}
        {select('sex', 'Sexo', ['Femenino', 'Masculino', 'Otro'])}
        {select('civil', 'Estado civil', ['Soltera', 'Casada', 'Divorciada', 'Viuda', 'Unión de hecho'])}
        {field('occupation', 'Ocupación', { rules: { maxLength: { value: 80, message: 'Máximo 80 caracteres' } } })}
        {select('insurance', 'Seguro de salud', ['IESS', 'ISSFA', 'ISSPOL', 'Seguro privado', 'Sin seguro'])}
        {field('phone', 'Celular', { required: true, inputMode: 'tel', maxLength: 10, rules: rules.mobile(true) })}
        {field('email', 'Correo electrónico', { type: 'email', rules: rules.email(false) })}
        {field('city', 'Ciudad de residencia', { required: true, rules: { required: 'La ciudad es obligatoria', maxLength: { value: 60, message: 'Máximo 60 caracteres' } } })}
        <div className="sm:col-span-2">{field('address', 'Dirección domiciliaria', { required: true, rules: { required: 'La dirección es obligatoria', minLength: { value: 5, message: 'Ingresa una dirección más completa' }, maxLength: { value: 150, message: 'Máximo 150 caracteres' } } })}</div>
        {select('bloodType', 'Grupo sanguíneo', ['O+', 'O−', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−'])}
        {field('emergencyName', 'Contacto de emergencia', { required: true, rules: { required: 'Indica un contacto de emergencia', minLength: { value: 3, message: 'Mínimo 3 caracteres' }, maxLength: { value: 80, message: 'Máximo 80 caracteres' } } })}
        {field('emergencyPhone', 'Teléfono de emergencia', { required: true, inputMode: 'tel', maxLength: 10, rules: rules.phone(true) })}
        <div className="sm:col-span-2 xl:col-span-3">{field('allergies', 'Alergias conocidas', { helper: 'Se muestran como alerta en la cabecera de la ficha. Escribe "Ninguna" si no tiene.', required: true, rules: { required: 'Indica las alergias o escribe "Ninguna"', maxLength: { value: 200, message: 'Máximo 200 caracteres' } } })}</div>
      </div>
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </form>
  );
}