'use client';
import React, { useState } from 'react';
import Badge from '@/components/ui/Badge';

type LabStatus = 'Falta procesar' | 'Procesado' | 'Ajuste correcto';

interface LabOrder {
  id: string;
  code: string;
  patient: string;
  piece: string;
  type: string;
  lab: string;
  sent: string;
  due: string;
  status: LabStatus;
  late: boolean;
}

const initial: LabOrder[] = [
  { id: 'lab-001', code: 'LAB-2026-0214', patient: 'Ricardo Benitez Sosa', piece: '46', type: 'Corona sobre implante (zirconio)', lab: 'Laboratorio Dental Andino', sent: '18/10/2026', due: '30/10/2026', status: 'Procesado', late: true },
  { id: 'lab-002', code: 'LAB-2026-0219', patient: 'Patricio Naranjo Leon', piece: '36', type: 'Corona metal-porcelana', lab: 'Laboratorio Dental Andino', sent: '21/10/2026', due: '03/11/2026', status: 'Falta procesar', late: false },
  { id: 'lab-003', code: 'LAB-2026-0221', patient: 'Marco Tulio Cevallos', piece: 'Sup.', type: 'Protesis total superior', lab: 'DentArt Lab', sent: '12/10/2026', due: '28/10/2026', status: 'Falta procesar', late: true },
  { id: 'lab-004', code: 'LAB-2026-0224', patient: 'Valentina Carrion', piece: 'Sup./Inf.', type: 'Placa de retencion (Hawley)', lab: 'OrthoLab Quito', sent: '24/10/2026', due: '02/11/2026', status: 'Procesado', late: false },
  { id: 'lab-005', code: 'LAB-2026-0198', patient: 'Jorge Luis Almeida', piece: '25-27', type: 'Protesis fija 3 unidades', lab: 'DentArt Lab', sent: '05/10/2026', due: '20/10/2026', status: 'Ajuste correcto', late: false },
];

const tone: Record<LabStatus, 'warning' | 'info' | 'success'> = {
  'Falta procesar': 'warning',
  Procesado: 'info',
  'Ajuste correcto': 'success',
};

const flow: LabStatus[] = ['Falta procesar', 'Procesado', 'Ajuste correcto'];

export default function LabModule() {
  const [orders, setOrders] = useState<LabOrder[]>(initial);

  const next = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const idx = flow.indexOf(o.status);
        return idx < flow.length - 1 ? { ...o, status: flow[idx + 1], late: false } : o;
      }),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {flow.map((s) => (
          <span key={s} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold">
            <Badge tone={tone[s]}>{orders.filter((o) => o.status === s).length}</Badge>
            {s}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-border scrollbar-thin">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {['Orden', 'Paciente', 'Pieza', 'Trabajo', 'Laboratorio', 'Enviado', 'Entrega', 'Estado', ''].map((h) => (
                <th key={h || 'act'} className="px-3 py-2.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-muted/40">
                <td className="tabular px-3 py-3 text-xs font-semibold">{o.code}</td>
                <td className="px-3 py-3 font-medium">{o.patient}</td>
                <td className="tabular px-3 py-3">{o.piece}</td>
                <td className="px-3 py-3">{o.type}</td>
                <td className="px-3 py-3 text-muted-foreground">{o.lab}</td>
                <td className="tabular px-3 py-3">{o.sent}</td>
                <td className={`tabular px-3 py-3 font-semibold ${o.late ? 'text-destructive' : ''}`}>{o.due}</td>
                <td className="px-3 py-3">
                  <Badge tone={tone[o.status]} dot>
                    {o.status}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-right">
                  {o.status !== 'Ajuste correcto' ? (
                    <button type="button" onClick={() => next(o.id)} className="rounded-md border border-input px-2.5 py-1 text-xs font-semibold hover:bg-primary hover:text-primary-foreground">
                      Avanzar
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
