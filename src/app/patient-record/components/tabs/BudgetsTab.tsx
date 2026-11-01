'use client';
import React, { useState } from 'react';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';
import Toast from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import { printHtml } from '@/lib/print';

type BudgetStatus = 'Borrador' | 'Enviada' | 'Aprobada' | 'Parcialmente pagada' | 'Pagada';

interface Line {
  id: string;
  piece: string;
  procedure: string;
  qty: number;
  unit: number;
}

interface Budget {
  id: string;
  code: string;
  date: string;
  status: BudgetStatus;
  paid: number;
  lines: Line[];
}

const initial: Budget[] = [
  {
    id: 'bud-001',
    code: 'PRF-2026-0390',
    date: '03/10/2026',
    status: 'Parcialmente pagada',
    paid: 100,
    lines: [
      { id: 'bl-001', piece: '46', procedure: 'Resina compuesta cuadruple (OMDV)', qty: 1, unit: 85 },
      { id: 'bl-002', piece: '36', procedure: 'Corona ceramica sobre metal', qty: 1, unit: 280 },
      { id: 'bl-003', piece: 'Todas', procedure: 'Profilaxis y fluor', qty: 1, unit: 45 },
    ],
  },
  {
    id: 'bud-002',
    code: 'PRF-2026-0412',
    date: '31/10/2026',
    status: 'Borrador',
    paid: 0,
    lines: [
      { id: 'bl-004', piece: 'Sup.', procedure: 'Guarda oclusal rigida', qty: 1, unit: 150 },
      { id: 'bl-005', piece: 'Todas', procedure: 'Blanqueamiento en consultorio', qty: 1, unit: 180 },
    ],
  },
];

const tone: Record<BudgetStatus, 'neutral' | 'info' | 'success' | 'warning'> = {
  Borrador: 'neutral',
  Enviada: 'info',
  Aprobada: 'success',
  'Parcialmente pagada': 'warning',
  Pagada: 'success',
};

const total = (b: Budget) => b.lines.reduce((a, l) => a + l.qty * l.unit, 0);

function todayLabel() {
  const d = new Date();
  return d.toLocaleDateString('es-EC');
}

function nextCode(list: Budget[]) {
  const n = list.length + 390;
  return `PRF-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`;
}

export default function BudgetsTab() {
  const [budgets, setBudgets] = useState<Budget[]>(initial);
  const [toast, setToast] = useState('');
  const [openNew, setOpenNew] = useState(false);
  const [piece, setPiece] = useState('');
  const [procedure, setProcedure] = useState('');
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState(50);
  const [lines, setLines] = useState<Line[]>([]);

  const advance = (id: string) => {
    setBudgets((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        if (b.status === 'Borrador') return { ...b, status: 'Enviada' };
        if (b.status === 'Enviada') return { ...b, status: 'Aprobada' };
        return b;
      }),
    );
    setToast('Proforma actualizada');
  };

  const addLine = () => {
    if (!procedure.trim()) {
      setToast('Indica el procedimiento');
      return;
    }
    setLines((prev) => [
      ...prev,
      {
        id: `nl-${Date.now()}`,
        piece: piece.trim() || '—',
        procedure: procedure.trim(),
        qty: Math.max(1, Number(qty) || 1),
        unit: Math.max(0, Number(unit) || 0),
      },
    ]);
    setPiece('');
    setProcedure('');
    setQty(1);
    setUnit(50);
  };

  const createProforma = () => {
    if (lines.length === 0) {
      setToast('Agrega al menos una linea a la proforma');
      return;
    }
    const b: Budget = {
      id: `bud-${Date.now()}`,
      code: nextCode(budgets),
      date: todayLabel(),
      status: 'Borrador',
      paid: 0,
      lines,
    };
    setBudgets((prev) => [b, ...prev]);
    setLines([]);
    setOpenNew(false);
    setToast(`Proforma ${b.code} creada`);
  };

  const openPdf = (b: Budget) => {
    const t = total(b);
    const rows = b.lines
      .map(
        (l) =>
          `<tr><td>${l.piece}</td><td>${l.procedure}</td><td>${l.qty}</td><td>$${l.unit.toFixed(2)}</td><td>$${(l.qty * l.unit).toFixed(2)}</td></tr>`,
      )
      .join('');
    printHtml(
      b.code,
      `
      <h1>Proforma ${b.code}</h1>
      <p class="muted">Fecha: ${b.date} · Estado: ${b.status}</p>
      <table>
        <thead><tr><th>Pieza</th><th>Procedimiento</th><th>Cant.</th><th>P. unit.</th><th>Subtotal</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="tot">
        <div>Total: <strong>$${t.toFixed(2)}</strong></div>
        <div>Abonado: $${b.paid.toFixed(2)}</div>
        <div>Saldo: <strong>$${(t - b.paid).toFixed(2)}</strong></div>
      </div>
      <p class="muted">Usa "Guardar como PDF" en el dialogo de impresion del navegador.</p>
    `,
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Presupuestos y proformas</h2>
          <p className="text-sm text-muted-foreground">
            Crea proformas, envialas al paciente y descarga PDF.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpenNew(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
        >
          <Icon name="PlusIcon" size={16} />
          Nueva proforma
        </button>
      </div>

      {budgets.map((b) => {
        const t = total(b);
        return (
          <article key={b.id} className="overflow-hidden rounded-xl border border-border">
            <header className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/50 px-4 py-3">
              <span className="tabular text-sm font-bold">{b.code}</span>
              <span className="tabular text-sm text-muted-foreground">{b.date}</span>
              <Badge tone={tone[b.status]} dot>
                {b.status}
              </Badge>
              <div className="ml-auto flex gap-2">
                {(b.status === 'Borrador' || b.status === 'Enviada') && (
                  <button
                    type="button"
                    onClick={() => advance(b.id)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
                  >
                    {b.status === 'Borrador' ? 'Enviar al paciente' : 'Marcar aprobada'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openPdf(b)}
                  className="rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-semibold transition-all hover:bg-muted active:scale-95"
                >
                  PDF
                </button>
              </div>
            </header>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    {['Pieza', 'Procedimiento', 'Cant.', 'P. unitario', 'Subtotal'].map((h) => (
                      <th key={`bh-${b.id}-${h}`} className="px-4 py-2 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {b.lines.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/40">
                      <td className="tabular px-4 py-2.5 font-semibold">{l.piece}</td>
                      <td className="px-4 py-2.5">{l.procedure}</td>
                      <td className="tabular px-4 py-2.5">{l.qty}</td>
                      <td className="tabular px-4 py-2.5">${l.unit.toFixed(2)}</td>
                      <td className="tabular px-4 py-2.5 font-semibold">${(l.qty * l.unit).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="flex flex-wrap items-center justify-end gap-6 border-t border-border bg-muted/30 px-4 py-3 text-sm">
              <span>
                Total <strong className="tabular ml-1 text-base">${t.toFixed(2)}</strong>
              </span>
              <span>
                Abonado <strong className="tabular ml-1 text-success">${b.paid.toFixed(2)}</strong>
              </span>
              <span>
                Saldo{' '}
                <strong
                  className={`tabular ml-1 text-base ${
                    t - b.paid > 0 ? 'text-destructive' : 'text-success'
                  }`}
                >
                  ${(t - b.paid).toFixed(2)}
                </strong>
              </span>
            </footer>
          </article>
        );
      })}

      <Modal
        open={openNew}
        onClose={() => setOpenNew(false)}
        size="lg"
        title="Nueva proforma"
        subtitle="Agrega lineas de tratamiento y crea el borrador."
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpenNew(false)}
              className="rounded-lg border border-input px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={createProforma}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Crear proforma
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-4">
            <input
              className="rounded-lg border border-input px-3 py-2 text-sm sm:col-span-1"
              placeholder="Pieza"
              value={piece}
              onChange={(e) => setPiece(e.target.value)}
            />
            <input
              className="rounded-lg border border-input px-3 py-2 text-sm sm:col-span-1"
              placeholder="Procedimiento"
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
            />
            <input
              type="number"
              min={1}
              className="rounded-lg border border-input px-3 py-2 text-sm"
              placeholder="Cant."
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
            <input
              type="number"
              min={0}
              step={0.01}
              className="rounded-lg border border-input px-3 py-2 text-sm"
              placeholder="Precio"
              value={unit}
              onChange={(e) => setUnit(Number(e.target.value))}
            />
          </div>
          <button
            type="button"
            onClick={addLine}
            className="rounded-lg border border-input px-3 py-1.5 text-xs font-semibold hover:bg-muted"
          >
            + Agregar linea
          </button>
          {lines.length > 0 ? (
            <ul className="rounded-lg border border-border divide-y text-sm">
              {lines.map((l) => (
                <li key={l.id} className="flex justify-between px-3 py-2">
                  <span>
                    {l.piece} · {l.procedure}
                  </span>
                  <span className="font-semibold">${(l.qty * l.unit).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">Sin lineas aun.</p>
          )}
        </div>
      </Modal>

      {toast ? <Toast message={toast} onDone={() => setToast('')} /> : null}
    </div>
  );
}
