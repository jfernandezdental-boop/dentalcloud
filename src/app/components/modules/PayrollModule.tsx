import React from 'react';
import Badge from '@/components/ui/Badge';

const staff = [
  { id: 'stf-001', name: 'Dra. Camila Andrade', role: 'Odontólogo general', base: 1800, extras: 220, iessEmp: 9.45, dec13: 168.5, dec14: 36.17, reserve: 8.33, status: 'Pagado' },
  { id: 'stf-002', name: 'Dr. Santiago Moscoso', role: 'Endodoncista', base: 2200, extras: 340, iessEmp: 9.45, dec13: 211.7, dec14: 36.17, reserve: 8.33, status: 'Pagado' },
  { id: 'stf-003', name: 'Dra. Paola Villavicencio', role: 'Ortodoncista', base: 2100, extras: 180, iessEmp: 9.45, dec13: 190, dec14: 36.17, reserve: 8.33, status: 'Pendiente' },
  { id: 'stf-004', name: 'Mariana Rosero', role: 'Administradora', base: 1100, extras: 0, iessEmp: 9.45, dec13: 91.67, dec14: 36.17, reserve: 8.33, status: 'Pagado' },
  { id: 'stf-005', name: 'Karen Chávez', role: 'Auxiliar odontológica', base: 560, extras: 45, iessEmp: 9.45, dec13: 50.4, dec14: 36.17, reserve: 8.33, status: 'Pendiente' },
  { id: 'stf-006', name: 'Diego Paredes', role: 'Recepción', base: 520, extras: 0, iessEmp: 9.45, dec13: 43.33, dec14: 36.17, reserve: 8.33, status: 'Pendiente' },
];

export default function PayrollModule() {
  const totalNet = staff?.reduce((acc, s) => acc + s?.base + s?.extras - (s?.base + s?.extras) * (s?.iessEmp / 100), 0);
  const totalEmployer = staff?.reduce((acc, s) => acc + (s?.base + s?.extras) * 0.1115, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs font-medium text-muted-foreground">Rol de pagos octubre — neto</p>
          <p className="tabular mt-1 text-2xl font-bold text-primary">${totalNet?.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">6 colaboradores activos</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs font-medium text-muted-foreground">Aporte patronal IESS (11,15 %)</p>
          <p className="tabular mt-1 text-2xl font-bold text-accent">${totalEmployer?.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Vence el 15/11/2026</p>
        </div>
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
          <p className="text-xs font-medium text-muted-foreground">Décimo cuarto (Sierra)</p>
          <p className="tabular mt-1 text-2xl font-bold">$1 301,02</p>
          <p className="text-xs text-muted-foreground">Provisionado · pago hasta 15/08</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border scrollbar-thin">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {['Colaborador', 'Cargo', 'Sueldo base', 'Comis./Extras', 'IESS 9,45 %', 'Neto a recibir', 'Dec. 13º prov.', 'Dec. 14º prov.', 'F. reserva', 'Estado']?.map((h) => (
                <th key={`ph-${h}`} className="px-3 py-2.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staff?.map((s) => {
              const gross = s?.base + s?.extras;
              const iess = gross * (s?.iessEmp / 100);
              return (
                <tr key={s?.id} className="transition-colors hover:bg-muted/40">
                  <td className="px-3 py-3 font-semibold">{s?.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{s?.role}</td>
                  <td className="tabular px-3 py-3">${s?.base?.toFixed(2)}</td>
                  <td className="tabular px-3 py-3">${s?.extras?.toFixed(2)}</td>
                  <td className="tabular px-3 py-3 text-destructive">−${iess?.toFixed(2)}</td>
                  <td className="tabular px-3 py-3 font-bold">${(gross - iess)?.toFixed(2)}</td>
                  <td className="tabular px-3 py-3">${s?.dec13?.toFixed(2)}</td>
                  <td className="tabular px-3 py-3">${s?.dec14?.toFixed(2)}</td>
                  <td className="tabular px-3 py-3">${(s?.base * (s?.reserve / 100))?.toFixed(2)}</td>
                  <td className="px-3 py-3"><Badge tone={s?.status === 'Pagado' ? 'success' : 'warning'} dot>{s?.status}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">Beneficios de ley aplicados: aporte personal IESS 9,45 %, décimo tercero, décimo cuarto, fondos de reserva (8,33 % tras el primer año) y vacaciones proporcionales.</p>
    </div>
  );
}