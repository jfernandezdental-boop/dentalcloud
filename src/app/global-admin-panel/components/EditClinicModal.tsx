'use client';
import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/ui/AppIcon';
import { FieldError, RequiredMark, inputClass } from '@/components/ui/FormField';
import type { ClinicRecord } from '@/lib/supabase/clinicsAdmin';
import { updateClinic } from '@/lib/supabase/clinicsAdmin';

interface Props {
  open: boolean;
  clinic: ClinicRecord | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditClinicModal({ open, clinic, onClose, onSaved }: Props) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [plan, setPlan] = useState('pro');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && clinic) {
      setName(clinic.name === '—' ? '' : clinic.name);
      setCity(clinic.city === '—' ? '' : clinic.city);
      setPlan(clinic.plan === '—' ? 'pro' : clinic.plan);
      setAdminName(clinic.admin === '—' ? '' : clinic.admin);
      setAdminEmail(clinic.adminEmail || '');
      setError('');
      setSaving(false);
    }
  }, [open, clinic]);

  const save = async () => {
    if (!clinic) return;
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateClinic(clinic.table, clinic.id, {
        name: name.trim(),
        city: city.trim(),
        plan: plan.trim(),
        admin_name: adminName.trim(),
        admin_email: adminEmail.trim().toLowerCase(),
      });
      onSaved();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Editar clinica"
      subtitle={clinic ? `ID: ${clinic.id}` : ''}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-input px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
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
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {error ? (
          <div className="sm:col-span-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-semibold">
            Nombre <RequiredMark />
          </label>
          <input className={inputClass(false)} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Ciudad</label>
          <input className={inputClass(false)} value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Plan</label>
          <select className={inputClass(false)} value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="inicial">Inicial</option>
            <option value="pro">Clinica Pro</option>
            <option value="red">Red de clinicas</option>
            <option value="Inicial">Inicial (label)</option>
            <option value="Clinica Pro">Clinica Pro (label)</option>
            <option value="Red de clinicas">Red de clinicas (label)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Admin (nombre)</label>
          <input className={inputClass(false)} value={adminName} onChange={(e) => setAdminName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Admin (email)</label>
          <input
            type="email"
            className={inputClass(false)}
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
