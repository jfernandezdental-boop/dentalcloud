import { moneyFmt } from './print';

export type ProformaLine = {
  piece: string;
  procedure: string;
  qty: number;
  unit: number;
};

export type ProformaDocInput = {
  code: string;
  date: string;
  status: string;
  clinicName: string;
  clinicCity?: string;
  clinicRuc?: string;
  patientName: string;
  patientId?: string;
  patientPhone?: string;
  doctorName?: string;
  lines: ProformaLine[];
  paid: number;
  notes?: string;
};

export function buildProformaOficioHtml(p: ProformaDocInput): string {
  const total = p.lines.reduce((a, l) => a + l.qty * l.unit, 0);
  const saldo = total - (p.paid || 0);
  const rows = p.lines
    .map(
      (l, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(l.piece)}</td>
        <td>${escapeHtml(l.procedure)}</td>
        <td class="num">${l.qty}</td>
        <td class="num">${moneyFmt(l.unit)}</td>
        <td class="num">${moneyFmt(l.qty * l.unit)}</td>
      </tr>`,
    )
    .join('');

  return `
  <div class="head">
    <div>
      <div class="brand">${escapeHtml(p.clinicName)}
        <small>${escapeHtml(p.clinicCity || '')}${p.clinicRuc ? ' · RUC ' + escapeHtml(p.clinicRuc) : ''}</small>
      </div>
    </div>
    <div class="doc-title">
      <strong>PROFORMA / PRESUPUESTO</strong>
      <span>${escapeHtml(p.code)}</span>
    </div>
  </div>

  <div class="meta">
    <div><span>Paciente</span><b>${escapeHtml(p.patientName)}</b></div>
    <div><span>Fecha</span><b>${escapeHtml(p.date)}</b></div>
    <div><span>Documento / HC</span><b>${escapeHtml(p.patientId || '—')}</b></div>
    <div><span>Estado</span><b>${escapeHtml(p.status)}</b></div>
    <div><span>Odontologo</span><b>${escapeHtml(p.doctorName || '—')}</b></div>
    <div><span>Telefono</span><b>${escapeHtml(p.patientPhone || '—')}</b></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Pieza</th>
        <th>Procedimiento</th>
        <th class="num">Cant.</th>
        <th class="num">P. unitario</th>
        <th class="num">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="6">Sin items</td></tr>'}
    </tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Subtotal</span><span>${moneyFmt(total)}</span></div>
    <div class="row"><span>Abonado</span><span>${moneyFmt(p.paid || 0)}</span></div>
    <div class="row"><span>Saldo</span><span>${moneyFmt(saldo)}</span></div>
  </div>

  <div class="notes">
    <p><strong>Condiciones:</strong> Este documento es una proforma / presupuesto odontologico.
    No constituye factura hasta su aprobacion y registro en finanzas.
    Validez referencial: 15 dias salvo indicacion contraria.</p>
    ${p.notes ? `<p>${escapeHtml(p.notes)}</p>` : ''}
  </div>

  <div class="signs">
    <div class="sign">Firma y sello del profesional</div>
    <div class="sign">Conformidad del paciente / representante</div>
  </div>

  <div class="footer">Documento generado por DentalCloud · ${escapeHtml(p.code)}</div>
  `;
}

function escapeHtml(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
