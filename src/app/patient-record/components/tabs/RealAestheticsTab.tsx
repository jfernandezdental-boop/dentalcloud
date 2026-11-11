'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import { getSupabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { btnGhost, btnPrimary, today } from './formKit';
import FaceSelector from '@/components/aesthetics/FaceSelector';
import {
  PROCEDURE_TYPES,
  SAFETY_ITEMS,
  SIDE_LABEL,
  ZONES,
  procedureLabel,
  zoneLabel,
  type ProcedureType,
  type Side,
  type ZoneCode,
} from '@/lib/aesthetics';

type ZoneRow = { zone_code: string; side: string; amount: number | null; unit: string };
type SessionRow = {
  id: string;
  session_date: string;
  procedure_type: string;
  product: string | null;
  lot: string | null;
  notes: string | null;
  followup_date: string | null;
  aesthetic_session_zones: ZoneRow[];
};
type Sel = Partial<Record<ZoneCode, { side: Side; amount: string }>>;

const input = 'h-10 w-full rounded-lg border border-input bg-background px-3 text-sm';

export default function RealAestheticsTab({ patientId }: { patientId: string }) {
  const { user } = useAuth();
  const [rows, setRows] = useState<SessionRow[] | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const [type, setType] = useState<ProcedureType>('toxina_botulinica');
  const [sel, setSel] = useState<Sel>({});
  const [product, setProduct] = useState('');
  const [lot, setLot] = useState('');
  const [expiry, setExpiry] = useState('');
  const [dilution, setDilution] = useState('');
  const [technique, setTechnique] = useState('');
  const [notes, setNotes] = useState('');
  const [followup, setFollowup] = useState('');
  const [consent, setConsent] = useState(false);
  const [safety, setSafety] = useState<Record<string, boolean>>({});

  const unit = PROCEDURE_TYPES.find((p) => p.code === type)?.unit ?? 'U';

  const load = useCallback(async () => {
    try {
      const { data, error: e } = await getSupabase()
        .from('aesthetic_sessions')
        .select(
          'id, session_date, procedure_type, product, lot, notes, followup_date, aesthetic_session_zones(zone_code, side, amount, unit)',
        )
        .eq('patient_id', patientId)
        .order('session_date', { ascending: false });
      if (e) {
        setError(e.message);
        setRows([]);
        return;
      }
      setRows((data as SessionRow[]) || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
      setRows([]);
    }
  }, [patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedZones = useMemo(() => new Set(Object.keys(sel) as ZoneCode[]), [sel]);
  const total = useMemo(
    () => Object.values(sel).reduce((a, v) => a + (Number(v?.amount) || 0), 0),
    [sel],
  );

  const toggleZone = (code: ZoneCode) => {
    setSel((prev) => {
      if (prev[code]) {
        const next = { ...prev };
        delete next[code];
        return next;
      }
      const z = ZONES.find((x) => x.code === code);
      return { ...prev, [code]: { side: z?.defaultSide ?? 'central', amount: '' } };
    });
  };

  const resetForm = () => {
    setType('toxina_botulinica');
    setSel({});
    setProduct('');
    setLot('');
    setExpiry('');
    setDilution('');
    setTechnique('');
    setNotes('');
    setFollowup('');
    setConsent(false);
    setSafety({});
  };

  const save = async () => {
    if (!consent) {
      setToast('Marca el consentimiento informado');
      return;
    }
    if (Object.keys(sel).length === 0) {
      setToast('Selecciona al menos una zona');
      return;
    }
    if (!user?.clinicId) {
      setToast('No hay clínica activa en la sesión');
      return;
    }
    setSaving(true);
    try {
      const clinicId = user.clinicId;
      const payload = {
        clinic_id: clinicId,
        patient_id: patientId,
        procedure_type: type,
        product: product || null,
        lot: lot || null,
        expiry: expiry || null,
        dilution: dilution || null,
        technique: technique || null,
        notes: notes || null,
        followup_date: followup || null,
        consent_signed: consent,
        safety,
        session_date: today(),
      };
      const { data, error: e } = await getSupabase()
        .from('aesthetic_sessions')
        .insert(payload)
        .select('id')
        .single();
      if (e || !data) {
        setToast(e?.message || 'Error al guardar');
        setSaving(false);
        return;
      }
      const zones = Object.entries(sel).map(([zone_code, v]) => ({
        clinic_id: clinicId,
        session_id: data.id,
        zone_code,
        side: v!.side,
        amount: v!.amount ? Number(v!.amount) : null,
        unit,
      }));
      if (zones.length) {
        await getSupabase().from('aesthetic_session_zones').insert(zones);
      }
      setOpen(false);
      resetForm();
      setToast('Sesión de estética guardada');
      void load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Estética facial</h2>
          <p className="text-sm text-muted-foreground">Sesiones, zonas tratadas y lista de seguridad.</p>
        </div>
        <button type="button" className={btnPrimary()} onClick={() => setOpen(true)}>
          <Icon name="PlusIcon" size={16} /> Nueva sesión
        </button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!rows ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Icon name="SparklesIcon" size={24} />}
          title="Sin sesiones de estética"
          description="Registra la primera sesión de toxina, rellenos u otros procedimientos."
        />
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {rows.map((r) => (
            <li key={r.id} className="px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold">{procedureLabel(r.procedure_type)}</span>
                <span className="text-xs tabular-nums text-muted-foreground">{r.session_date}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {(r.aesthetic_session_zones || [])
                  .map(
                    (z) =>
                      `${zoneLabel(z.zone_code)} (${SIDE_LABEL[z.side as Side] || z.side}${z.amount != null ? ` · ${z.amount}${z.unit}` : ''})`,
                  )
                  .join(' · ') || 'Sin zonas'}
              </p>
              {r.product ? (
                <p className="text-xs text-muted-foreground">
                  Producto: {r.product}
                  {r.lot ? ` · Lote ${r.lot}` : ''}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title="Nueva sesión de estética"
        footer={
          <>
            <button type="button" className={btnGhost} onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button type="button" className={btnPrimary(saving)} disabled={saving} onClick={() => void save()}>
              {saving ? 'Guardando…' : 'Guardar sesión'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Tipo de procedimiento</label>
            <select
              className={input}
              value={type}
              onChange={(e) => setType(e.target.value as ProcedureType)}
            >
              {PROCEDURE_TYPES.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <FaceSelector selected={selectedZones} onToggle={toggleZone} />
            <div className="space-y-2">
              <p className="text-sm font-semibold">Zonas y dosis ({unit})</p>
              {ZONES.map((z) => {
                const s = sel[z.code];
                if (!s) return null;
                return (
                  <div key={z.code} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2">
                    <span className="min-w-[120px] text-sm font-medium">{z.label}</span>
                    <select
                      className="h-9 rounded-md border border-input px-2 text-xs"
                      value={s.side}
                      onChange={(e) =>
                        setSel((p) => ({ ...p, [z.code]: { ...s, side: e.target.value as Side } }))
                      }
                    >
                      {(Object.keys(SIDE_LABEL) as Side[]).map((k) => (
                        <option key={k} value={k}>
                          {SIDE_LABEL[k]}
                        </option>
                      ))}
                    </select>
                    <input
                      className="h-9 w-20 rounded-md border border-input px-2 text-sm tabular-nums"
                      placeholder={unit}
                      value={s.amount}
                      onChange={(e) =>
                        setSel((p) => ({ ...p, [z.code]: { ...s, amount: e.target.value } }))
                      }
                    />
                  </div>
                );
              })}
              <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm font-semibold">
                <span>Total</span>
                <span>
                  {Math.round(total * 100) / 100} {unit}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs text-muted-foreground">
              Producto
              <input className={input} value={product} onChange={(e) => setProduct(e.target.value)} />
            </label>
            <label className="text-xs text-muted-foreground">
              Lote
              <input className={input} value={lot} onChange={(e) => setLot(e.target.value)} />
            </label>
            <label className="text-xs text-muted-foreground">
              Vencimiento
              <input type="date" className={input} value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </label>
            <label className="text-xs text-muted-foreground">
              Dilución
              <input className={input} value={dilution} onChange={(e) => setDilution(e.target.value)} />
            </label>
            <label className="text-xs text-muted-foreground">
              Técnica / aguja
              <input className={input} value={technique} onChange={(e) => setTechnique(e.target.value)} />
            </label>
            <label className="text-xs text-muted-foreground">
              Control programado
              <input type="date" className={input} value={followup} onChange={(e) => setFollowup(e.target.value)} />
            </label>
          </div>

          <div className="grid gap-1 sm:grid-cols-2">
            {SAFETY_ITEMS.map((it) => (
              <label key={it.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={!!safety[it.key]}
                  onChange={(e) => setSafety((p) => ({ ...p, [it.key]: e.target.checked }))}
                />
                {it.label}
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              Consentimiento informado firmado
            </label>
          </div>

          <label className="block text-xs text-muted-foreground">
            Notas
            <textarea
              rows={2}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
      </Modal>

      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
