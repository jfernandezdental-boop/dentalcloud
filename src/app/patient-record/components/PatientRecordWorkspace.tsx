'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import Toast from '@/components/ui/Toast';
import NewPatientModal, { type NewPatient } from './NewPatientModal';
import PatientListPanel, { type PatientListItem } from './PatientListPanel';
import PatientTabs from './PatientTabs';
import { listPatients } from '@/lib/supabase/data';
import { getSupabase, hasSupabaseEnv } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';

function mapPatient(row: Record<string, unknown>): PatientListItem {
  const first =
    String(row.first_name || row.nombres || '') ||
    String(row.full_name || row.name || '').split(' ').slice(0, -1).join(' ');
  const last =
    String(row.last_name || row.apellidos || '') ||
    String(row.full_name || row.name || '').split(' ').slice(-1).join(' ');
  const fullName =
    String(row.full_name || row.name || '').trim() ||
    [first, last].filter(Boolean).join(' ') ||
    'Paciente';
  return {
    id: String(row.id),
    fullName,
    firstName: first || fullName.split(' ')[0] || '',
    lastName: last || fullName.split(' ').slice(1).join(' ') || '',
    document: String(row.cedula || row.document || row.national_id || row.rut || ''),
    phone: String(row.phone || row.mobile || row.celular || ''),
    email: String(row.email || ''),
    sex: String(row.sex || row.gender || row.sexo || ''),
    birth: String(row.birth_date || row.fecha_nacimiento || row.birth || '').slice(0, 10),
    city: String(row.city || row.ciudad || ''),
    address: String(row.address || row.direccion || ''),
    insurance: String(row.insurance || row.seguro || ''),
    allergies: String(row.allergies || row.alergias || ''),
    bloodType: String(row.blood_type || row.grupo_sanguineo || ''),
    emergencyName: String(row.emergency_name || row.emergency_contact || row.contacto_emergencia || ''),
    emergencyPhone: String(row.emergency_phone || ''),
    occupation: String(row.occupation || row.ocupacion || ''),
    civil: String(row.civil_status || row.estado_civil || ''),
    raw: row,
  };
}

export default function PatientRecordWorkspace() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (!hasSupabaseEnv()) {
        setPatients([]);
        return;
      }
      const rows = (await listPatients(200)) as Record<string, unknown>[];
      const mapped = rows.map(mapPatient);
      setPatients(mapped);
      setSelectedId((prev) => {
        if (prev && mapped.some((p) => p.id === prev)) return prev;
        return mapped[0]?.id ?? null;
      });
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.document.includes(q) ||
        p.phone.includes(q) ||
        p.email.toLowerCase().includes(q),
    );
  }, [patients, query]);

  const selected = patients.find((p) => p.id === selectedId) || null;

  const handleCreate = async (p: NewPatient) => {
    if (!hasSupabaseEnv()) {
      setToast('Configura Supabase para guardar pacientes');
      setOpenNew(false);
      return;
    }
    const fullName = `${p.firstName.trim()} ${p.lastName.trim()}`.trim();
    if (!user?.clinicId) {
      setToast('No hay una clinica activa en tu sesion. Cierra sesion y vuelve a entrar.');
      return;
    }
    // Columnas reales de la tabla patients (clinic_id es obligatorio; RLS exige que sea tu clinica).
    const payload: Record<string, unknown> = {
      clinic_id: user.clinicId,
      first_name: p.firstName.trim(),
      last_name: p.lastName.trim(),
      cedula: p.cedula.trim(),
      birth_date: p.birthDate || null,
      sex: p.sex,
      phone: p.phone.trim(),
      email: p.email.trim() || null,
      address: p.address.trim() || null,
      insurance: p.insurance || null,
      allergies: p.allergies.trim() || null,
      emergency_name: p.emergencyContact.trim() || null,
    };
    const { data, error } = await getSupabase().from('patients').insert(payload).select('*').maybeSingle();
    if (error) {
      const dup = /duplicate|unique/i.test(error.message);
      setToast(dup ? 'Ya existe un paciente con esa cedula en tu clinica.' : `No se pudo registrar: ${error.message}`);
      return;
    }
    setOpenNew(false);
    setToast(`Paciente ${fullName} registrado`);
    await load();
    if (data && (data as { id?: string }).id) {
      setSelectedId(String((data as { id: string }).id));
    }
  };

  const handleProfileSaved = async (values: Record<string, string>) => {
    if (!selected || !hasSupabaseEnv()) return;
    const payload: Record<string, unknown> = {
      first_name: values.firstName.trim(),
      last_name: values.lastName.trim(),
      cedula: values.cedula.trim(),
      birth_date: values.birth || null,
      sex: values.sex,
      phone: values.phone.trim(),
      email: values.email.trim() || null,
      address: values.address.trim() || null,
      city: values.city.trim() || null,
      insurance: values.insurance || null,
      allergies: values.allergies.trim() || null,
      blood_type: values.bloodType || null,
      emergency_name: values.emergencyName.trim() || null,
      emergency_phone: values.emergencyPhone.trim() || null,
      occupation: values.occupation.trim() || null,
      civil_status: values.civil || null,
    };
    const { error } = await getSupabase().from('patients').update(payload).eq('id', selected.id);
    if (error) {
      setToast(`Error al guardar: ${error.message}`);
      return;
    }
    setToast('Datos del paciente guardados');
    await load();
  };

  const initials = selected
    ? selected.fullName
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || '')
        .join('')
    : '—';

  return (
    <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
      <PatientListPanel
        patients={filtered}
        selectedId={selectedId}
        query={query}
        onQuery={setQuery}
        onSelect={setSelectedId}
        loading={loading}
      />

      <div className="space-y-5">
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start gap-5">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              {selected ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold">{selected.fullName}</h1>
                    <Badge tone="success" dot>
                      Seleccionado
                    </Badge>
                    {selected.allergies && selected.allergies.toLowerCase() !== 'ninguna' ? (
                      <Badge tone="warning">Alergia: {selected.allergies}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    C.I. {selected.document || '—'} · {selected.sex || '—'} · {selected.insurance || '—'}
                  </p>
                  <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-xs text-muted-foreground">Celular</dt>
                      <dd className="font-semibold">{selected.phone || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Correo</dt>
                      <dd className="truncate font-semibold">{selected.email || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Ciudad</dt>
                      <dd className="font-semibold">{selected.city || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Nacimiento</dt>
                      <dd className="font-semibold">{selected.birth || '—'}</dd>
                    </div>
                  </dl>
                </>
              ) : (
                <div>
                  <h1 className="text-xl font-semibold">Sin paciente seleccionado</h1>
                  <p className="text-sm text-muted-foreground">Elige uno de la lista o crea uno nuevo.</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setOpenNew(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary"
              >
                <Icon name="UserPlusIcon" size={16} />
                Nuevo paciente
              </button>
              <Link
                href="/interactive-odontogram"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <Icon name="PuzzlePieceIcon" size={16} />
                Odontograma
              </Link>
              <Link
                href="/doctor-agenda"
                className="inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2.5 text-sm font-semibold"
              >
                <Icon name="CalendarDaysIcon" size={16} />
                Agendar
              </Link>
            </div>
          </div>
        </section>

        {selected ? (
          <PatientTabs patient={selected} onProfileSaved={handleProfileSaved} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Selecciona un paciente para ver y editar su ficha.
          </div>
        )}
      </div>

      <NewPatientModal open={openNew} onClose={() => setOpenNew(false)} onCreate={(p) => void handleCreate(p)} />
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
