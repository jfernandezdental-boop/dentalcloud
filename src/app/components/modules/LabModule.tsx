'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import { listPatients, listLabOrders } from '@/lib/supabase/data';
import { getSupabase, hasSupabaseEnv } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';

type LabStatus = 'Falta procesar' | 'Procesado' | 'Ajuste correcto';

interface LabOrder {
  id: string;
  code: string;
  patientId: string | null;
  patient: string;
  piece: string;
  type: string;
  lab: string;
  sent: string;
  due: string;
  status: LabStatus;
  late: boolean;
}

interface PatientOpt {
  id: string;
  label: string;
  document?: string;
}

const tone: Record<LabStatus, 'warning' | 'info' | 'success'> = {
  'Falta procesar': 'warning',
  Procesado: 'info',
  'Ajuste correcto': 'success',
};
const flow: LabStatus[] = ['Falta procesar', 'Procesado', 'Ajuste correcto'];

function patientLabel(p: Record<string, unknown>): string {
  const full =
    (p.full_name as string) ||
    [p.first_name, p.last_name].filter(Boolean).join(' ') ||
    (p.name as string) ||
    'Paciente';
  const doc = (p.cedula as string) || (p.document as string) || (p.national_id as string) || '';
  return doc ? `${full} · ${doc}` : full;
}

function mapOrder(row: Record<string, unknown>): LabOrder {
  // La base guarda exactamente estos tres estados (constraint lab_orders_status_check).
  const statusRaw = String(row.status || 'Falta procesar');
  const status: LabStatus = (flow as string[]).includes(statusRaw) ? (statusRaw as LabStatus) : 'Falta procesar';
  const patientName =
    (row.patient_name as string) ||
    (row.patient as string) ||
    (typeof row.patients === 'object' && row.patients
      ? patientLabel(row.patients as Record<string, unknown>)
      : '') ||
    'Paciente';
  return {
    id: String(row.id),
    code: String(row.code || row.order_code || row.id).slice(0, 20),
    patientId: row.patient_id ? String(row.patient_id) : null,
    patient: patientName,
    piece: String(row.piece || row.tooth || '—'),
    type: String(row.work_type || row.type || row.description || 'Trabajo lab'),
    lab: String(row.lab_name || row.laboratory || row.lab || 'Laboratorio'),
    sent: String(row.sent_at || row.created_at || '').slice(0, 10),
    due: String(row.due_date || row.due_at || '').slice(0, 10) || '—',
    status,
    late: Boolean(row.late),
  };
}

export default function LabModule() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [patients, setPatients] = useState<PatientOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);
  const [patientQuery, setPatientQuery] = useState('');
  const [form, setForm] = useState({
    patientId: '',
    piece: '',
    type: '',
    lab: '',
    due: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (hasSupabaseEnv()) {
        const [pRows, oRows] = await Promise.all([
          listPatients(200).catch(() => []),
          listLabOrders(100).catch(() => []),
        ]);
        setPatients(
          (pRows as Record<string, unknown>[]).map((p) => ({
            id: String(p.id),
            label: patientLabel(p),
            document: String(p.cedula || p.document || p.national_id || ''),
          })),
        );
        setOrders((oRows as Record<string, unknown>[]).map(mapOrder));
      } else {
        setPatients([]);
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredPatients = useMemo(() => {
    const q = patientQuery.trim().toLowerCase();
    if (!q) return patients.slice(0, 40);
    return patients.filter((p) => p.label.toLowerCase().includes(q)).slice(0, 40);
  }, [patients, patientQuery]);

  const selectedPatient = patients.find((p) => p.id === form.patientId);

  const next = async (id: string) => {
    const current = orders.find((o) => o.id === id);
    if (!current) return;
    const idx = flow.indexOf(current.status);
    if (idx < 0 || idx >= flow.length - 1) return;
    const nextStatus = flow[idx + 1];
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: nextStatus, late: false } : o)));
    if (hasSupabaseEnv()) {
      try {
        const { error } = await getSupabase().from('lab_orders').update({ status: nextStatus }).eq('id', id);
        if (error) throw error;
      } catch {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: current.status } : o)));
        setToast('No se pudo cambiar el estado. Intenta de nuevo.');
      }
    }
  };

  const save = async () => {
    if (!form.patientId) {
      setToast('Selecciona un paciente de la clinica');
      return;
    }
    if (!form.type.trim()) {
      setToast('Indica el tipo de trabajo');
      return;
    }
    const patient = patients.find((p) => p.id === form.patientId);
    if (!patient) {
      setToast('Paciente no encontrado');
      return;
    }

    setSaving(true);
    try {
        if (!user?.clinicId) {
        setToast('No hay una clinica activa en tu sesion. Cierra sesion y vuelve a entrar.');
        setSaving(false);
        return;
      }
      // Columnas reales de lab_orders: clinic_id, patient_id, code, piece, type, lab, sent_at, due_at, status.
      const code = `LAB-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const payload: Record<string, unknown> = {
        clinic_id: user.clinicId,
        patient_id: form.patientId,
        code,
        piece: form.piece.trim() || null,
        type: form.type.trim(),
        lab: form.lab.trim() || 'Laboratorio',
        sent_at: new Date().toISOString().slice(0, 10),
        due_at: form.due || null,
        status: 'Falta procesar',
      };

      let createdId = '';
      if (!hasSupabaseEnv()) {
        setToast('Servicio no disponible por el momento.');
        setSaving(false);
        return;
      }
      const { data, error } = await getSupabase().from('lab_orders').insert(payload).select('id').maybeSingle();
      if (error || !data) {
        setToast(`No se pudo guardar la orden: ${error?.message || 'sin respuesta'}`);
        setSaving(false);
        return;
      }
      createdId = String((data as { id: string }).id);

      setOrders((prev) => [
        {
          id: createdId,
          code,
          patientId: form.patientId,
          patient: patient.label,
          piece: form.piece.trim() || '—',
          type: form.type.trim(),
          lab: form.lab.trim() || 'Laboratorio',
          sent: new Date().toISOString().slice(0, 10),
          due: form.due || '—',
          status: 'Falta procesar',
          late: false,
        },
        ...prev,
      ]);
      setOpen(false);
      setForm({ patientId: '', piece: '', type: '', lab: '', due: '' });
      setPatientQuery('');
      setToast(`Orden creada y enlazada a ${patient.label}`);
      void load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {flow.map((s) => (
            <span key={s} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
              <Badge tone={tone[s]}>{orders.filter((o) => o.status === s).length}</Badge>
              {s}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
        >
          <Icon name="PlusIcon" size={14} />
          Nueva orden
        </button>
      </div>

      {loading ? (
        <div className="h-32 animate-pulse rounded-xl bg-muted/40" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                {['Orden', 'Paciente', 'Pieza', 'Trabajo', 'Laboratorio', 'Enviado', 'Entrega', 'Estado', ''].map((h) => (
                  <th key={h || 'a'} className="px-3 py-2.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">
                    No hay ordenes. Crea una enlazada a un paciente registrado.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/40">
                    <td className="px-3 py-3 text-xs font-semibold">{o.code}</td>
                    <td className="px-3 py-3 font-medium">{o.patient}</td>
                    <td className="px-3 py-3">{o.piece}</td>
                    <td className="px-3 py-3">{o.type}</td>
                    <td className="px-3 py-3 text-muted-foreground">{o.lab}</td>
                    <td className="px-3 py-3">{o.sent}</td>
                    <td className={`px-3 py-3 font-semibold ${o.late ? 'text-destructive' : ''}`}>{o.due}</td>
                    <td className="px-3 py-3">
                      <Badge tone={tone[o.status]} dot>
                        {o.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {o.status !== 'Ajuste correcto' ? (
                        <button
                          type="button"
                          onClick={() => void next(o.id)}
                          className="rounded-md border px-2.5 py-1 text-xs font-semibold hover:bg-primary hover:text-primary-foreground"
                        >
                          Avanzar
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva orden de laboratorio"
        subtitle="El paciente debe existir en la ficha clinica (tabla patients)"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2 text-sm font-semibold">
              Cancelar
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Crear orden'}
            </button>
          </>
        }
      >
        <div className="grid gap-3">
          <div>
            <label className="mb-1 block text-sm font-semibold">Paciente *</label>
            <input
              className="mb-2 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Buscar por nombre o cedula..."
              value={patientQuery}
              onChange={(e) => setPatientQuery(e.target.value)}
            />
            <select
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={form.patientId}
              onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            >
              <option value="">— Selecciona paciente —</option>
              {filteredPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            {patients.length === 0 ? (
              <p className="mt-1 text-xs text-destructive">
                No hay pacientes en la base. Crea uno en Ficha del paciente.
              </p>
            ) : selectedPatient ? (
              <p className="mt-1 text-xs text-muted-foreground">Seleccionado: {selectedPatient.label}</p>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Pieza dental"
              value={form.piece}
              onChange={(e) => setForm({ ...form, piece: e.target.value })}
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Laboratorio"
              value={form.lab}
              onChange={(e) => setForm({ ...form, lab: e.target.value })}
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm sm:col-span-2"
              placeholder="Tipo de trabajo *"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            />
            <input
              type="date"
              className="rounded-lg border px-3 py-2 text-sm sm:col-span-2"
              value={form.due}
              onChange={(e) => setForm({ ...form, due: e.target.value })}
            />
          </div>
        </div>
      </Modal>
      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
