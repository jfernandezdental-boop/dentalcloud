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

function ageFromBirth(birth: string): string | null {
  if (!birth || birth.length < 8) return null;
  const d = new Date(birth);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age >= 0 && age < 130 ? `${age} años` : null;
}

function fmtDate(iso: string): string {
  if (!iso || iso.length < 8) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function fmtMoney(n: number): string {
  return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(n);
}

function mapPatient(row: Record<string, unknown>): PatientListItem {
  const first =
    String(row.first_name || row.nombres || '') ||
    String(row.full_name || row.name || '')
      .split(' ')
      .slice(0, -1)
      .join(' ');
  const last =
    String(row.last_name || row.apellidos || '') ||
    String(row.full_name || row.name || '')
      .split(' ')
      .slice(-1)
      .join(' ');
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
    hcNumber: String(row.hc_number || row.hc || row.history_number || ''),
    raw: row,
  };
}

type ExtraInfo = {
  lastVisit: string | null;
  nextAppt: string | null;
  balance: number | null;
  doctorName: string | null;
};

export default function PatientRecordWorkspace() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);
  const [toast, setToast] = useState('');
  const [extra, setExtra] = useState<ExtraInfo>({
    lastVisit: null,
    nextAppt: null,
    balance: null,
    doctorName: null,
  });

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

  // Cargar última visita, próxima cita, saldo y odontólogo del paciente seleccionado
  useEffect(() => {
    if (!selectedId || !hasSupabaseEnv()) {
      setExtra({ lastVisit: null, nextAppt: null, balance: null, doctorName: null });
      return;
    }
    let cancelled = false;
    (async () => {
      const sb = getSupabase();
      const today = new Date().toLocaleDateString('en-CA');

      const [past, future, budgets] = await Promise.all([
        sb
          .from('appointments')
          .select('date, start_time, doctors(full_name)')
          .eq('patient_id', selectedId)
          .lt('date', today)
          .order('date', { ascending: false })
          .limit(1),
        sb
          .from('appointments')
          .select('date, start_time, doctors(full_name)')
          .eq('patient_id', selectedId)
          .gte('date', today)
          .neq('status', 'Cancelada')
          .order('date', { ascending: true })
          .limit(1),
        sb
          .from('budgets')
          .select('paid, budget_lines(qty, unit_price, discount)')
          .eq('patient_id', selectedId),
      ]);

      if (cancelled) return;

      const pastRow = (past.data as { date: string; start_time: string; doctors: { full_name: string } | null }[] | null)?.[0];
      const futureRow = (future.data as { date: string; start_time: string; doctors: { full_name: string } | null }[] | null)?.[0];

      let balance: number | null = null;
      if (budgets.data && Array.isArray(budgets.data)) {
        let total = 0;
        let paid = 0;
        for (const b of budgets.data as {
          paid: number | null;
          budget_lines: { qty: number | null; unit_price: number | null; discount?: number | null }[];
        }[]) {
          paid += Number(b.paid) || 0;
          for (const l of b.budget_lines || []) {
            const q = Number(l.qty) || 0;
            const u = Number(l.unit_price) || 0;
            const d = Math.min(100, Math.max(0, Number(l.discount) || 0));
            total += q * u * (1 - d / 100);
          }
        }
        balance = Math.max(0, total - paid);
      }

      setExtra({
        lastVisit: pastRow ? fmtDate(pastRow.date) : null,
        nextAppt: futureRow
          ? `${fmtDate(futureRow.date)} · ${String(futureRow.start_time || '').slice(0, 5)}`
          : null,
        balance,
        doctorName:
          futureRow?.doctors?.full_name || pastRow?.doctors?.full_name || null,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

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
    if (!user?.clinicId) {
      setToast('No hay una clínica activa en tu sesión. Cierra sesión y vuelve a entrar.');
      return;
    }
    const fullName = `${p.firstName.trim()} ${p.lastName.trim()}`.trim();
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
      setToast(dup ? 'Ya existe un paciente con esa cédula en tu clínica.' : `No se pudo registrar: ${error.message}`);
      return;
    }
    setOpenNew(false);
    setToast(`Paciente ${fullName} registrado`);
    await load();
    if (data && (data as { id?: string }).id) setSelectedId(String((data as { id: string }).id));
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

  const hcLabel = selected
    ? selected.hcNumber
      ? `HC N.º ${selected.hcNumber}`
      : `HC N.º ${selected.id.replace(/\D/g, '').slice(-4).padStart(4, '0') || '—'}`
    : '';

  return (
    <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
      <PatientListPanel
        patients={filtered}
        selectedId={selectedId}
        query={query}
        onQuery={setQuery}
        onSelect={setSelectedId}
        onNew={() => setOpenNew(true)}
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
                      Paciente activa
                    </Badge>
                    {selected.allergies && selected.allergies.toLowerCase() !== 'ninguna' ? (
                      <Badge tone="warning">Alergia: {selected.allergies}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[
                      hcLabel,
                      selected.document ? `C.I. ${selected.document}` : null,
                      ageFromBirth(selected.birth),
                      selected.sex || null,
                      selected.insurance || null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'Sin datos de identificación'}
                  </p>
                  <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-xs text-muted-foreground">Última visita</dt>
                      <dd className="tabular font-semibold">{extra.lastVisit || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Próxima cita</dt>
                      <dd className="tabular font-semibold">{extra.nextAppt || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Saldo pendiente</dt>
                      <dd
                        className={`tabular font-semibold ${
                          extra.balance != null && extra.balance > 0 ? 'text-destructive' : ''
                        }`}
                      >
                        {extra.balance != null ? fmtMoney(extra.balance) : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Odontólogo</dt>
                      <dd className="font-semibold">{extra.doctorName || '—'}</dd>
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
                className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95"
              >
                <Icon name="UserPlusIcon" size={16} />
                Nuevo paciente
              </button>
              <Link
                href="/interactive-odontogram"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
              >
                <Icon name="PuzzlePieceIcon" size={16} />
                Abrir odontograma
              </Link>
              <Link
                href={selected ? `/doctor-agenda?patient=${selected.id}` : '/doctor-agenda'}
                className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-4 py-2.5 text-sm font-semibold transition-all hover:bg-muted active:scale-95"
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
