import { printHtml } from './print';

/**
 * Documentos imprimibles (PDF desde el navegador) con formato profesional:
 *  - Presupuesto odontológico (proforma)
 *  - Receta médica odontológica
 * Los campos opcionales que la clínica no tenga cargados (dirección, teléfono, registro, etc.) simplemente no se imprimen.
 */
export type DocClinic = {
  name: string;
  ruc?: string | null;
  mspCode?: string | null;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
};
export type DocPatient = {
  name: string;
  cedula?: string | null;
  hc?: string | null;
  birthDate?: string | null;
  sex?: string | null;
  allergies?: string | null;
};
export type BudgetDocLine = { piece?: string | null; procedure: string; qty: number; unit: number };
export type BudgetDocInput = {
  code: string;
  date: string;
  clinic: DocClinic;
  patient: DocPatient;
  lines: BudgetDocLine[];
  paid: number;
  doctorName?: string | null;
  doctorRegistry?: string | null;
  validityDays?: number;
};
export type RxDocItem = { name: string; dose?: string | null; duration?: string | null; quantity?: string | null; note?: string | null };
export type RxDocInput = {
  code: string;
  date: string;
  clinic: DocClinic;
  patient: DocPatient;
  items: RxDocItem[];
  diagnosis?: { code?: string | null; text: string } | null;
  recommendations?: string | null;
  doctorName?: string | null;
  doctorRegistry?: string | null;
  validityDays?: number;
};

const esc = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const usd = (n: number) => '$' + (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 'YYYY-MM-DD' → 'DD/MM/YYYY'; cualquier otro texto se deja igual. */
export function fmtDocDate(d: string | null | undefined): string {
  const m = String(d || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(d || '');
}
function ageSex(p: DocPatient): string {
  const parts: string[] = [];
  const m = String(p.birthDate || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const now = new Date();
    let age = now.getFullYear() - Number(m[1]);
    if (now.getMonth() + 1 < Number(m[2]) || (now.getMonth() + 1 === Number(m[2]) && now.getDate() < Number(m[3]))) age -= 1;
    if (age >= 0 && age < 130) parts.push(`${age} años`);
  }
  const sx = String(p.sex || '').trim().toLowerCase();
  if (sx) parts.push(sx.startsWith('f') ? 'Femenino' : sx.startsWith('m') ? 'Masculino' : p.sex!);
  return parts.join(' · ') || '—';
}
/** Iniciales para el logo: "Clínica Dental DentalCloud" → "DC"; "Estudio dental Vittoria" → "VI". */
function initials(name: string): string {
  const skip = new Set(['clinica', 'clínica', 'consultorio', 'centro', 'estudio', 'dental', 'odontologico', 'odontológico', 'odontologia', 'odontología', 'de', 'del', 'la', 'el']);
  const words = name.split(/\s+/).filter((w) => w && !skip.has(w.toLowerCase()));
  const base = (words.length ? words : name.split(/\s+/)).join(' ');
  const camel = base.match(/[A-ZÁÉÍÓÚÑ][a-záéíóúñ0-9]*/g) || [];
  if (camel.length >= 2) return ((camel[0] || '')[0] + (camel[1] || '')[0]).toUpperCase();
  const w = base.split(/\s+/).filter(Boolean);
  if (w.length >= 2) return (w[0][0] + w[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

const CSS = `
  @page { size: A4; margin: 12mm 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Helvetica Neue", Arial, "Segoe UI", sans-serif; color: #1f2937; font-size: 11.5px; line-height: 1.45; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sheet { max-width: 186mm; margin: 0 auto; }
  .dh { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; padding-bottom: 12px; border-bottom: 3px solid #0f766e; margin-bottom: 14px; }
  .dh-l { display: flex; gap: 12px; align-items: flex-start; }
  .logo { min-width: 36px; font-weight: 800; font-size: 20px; color: #9aa3a0; letter-spacing: -1px; padding-top: 4px; }
  .clinic { font-size: 18px; font-weight: 700; color: #0f766e; line-height: 1.15; }
  .cl-sub { font-size: 10px; color: #4b5563; margin-top: 3px; line-height: 1.5; }
  .dh-r { text-align: right; }
  .dt { font-size: 19px; font-weight: 800; color: #111827; letter-spacing: .2px; }
  .code { font-size: 13.5px; font-weight: 700; color: #0f766e; margin-top: 2px; }
  .date { font-size: 10.5px; color: #6b7280; margin-top: 2px; }
  .pbox { display: grid; grid-template-columns: 1.7fr 1.1fr .7fr 1.2fr; gap: 0 18px; border: 1px solid #d1d5db; border-radius: 8px; padding: 9px 14px; margin-bottom: 14px; }
  .pbox span { display: block; font-size: 8px; text-transform: uppercase; letter-spacing: .07em; color: #6b7280; margin-bottom: 2px; }
  .pbox b { font-size: 11.5px; font-weight: 700; }
  .sec { font-size: 10px; font-weight: 800; color: #0f766e; text-transform: uppercase; letter-spacing: .08em; margin: 16px 0 8px; }
  .sec.line { padding-bottom: 5px; border-bottom: 1px solid #c7d2cf; }
  table.items { width: 100%; border-collapse: collapse; }
  .items th { font-size: 8.5px; text-transform: uppercase; letter-spacing: .07em; color: #6b7280; font-weight: 700; text-align: left; padding: 7px 6px; border-bottom: 1px solid #d1d5db; }
  .items td { padding: 9px 6px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  .items .n { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .items .q { text-align: right; color: #b45309; font-weight: 700; }
  .items .p { font-weight: 800; }
  .tot { width: 48%; margin: 12px 0 0 auto; font-variant-numeric: tabular-nums; }
  .tot .r { display: flex; justify-content: space-between; padding: 4px 0; }
  .tot .grand { display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #0f766e; border-bottom: 2px solid #0f766e; padding: 7px 0; margin: 4px 0; color: #0f766e; font-weight: 800; font-size: 15px; }
  .tot .saldo { font-weight: 800; border-top: 1px solid #d1d5db; margin-top: 2px; padding-top: 6px; }
  .cond { border: 1px solid #d1d5db; border-radius: 8px; padding: 10px 14px; margin-top: 18px; font-size: 10px; color: #374151; }
  .cond b { display: block; font-size: 10.5px; margin-bottom: 4px; color: #111827; }
  .cond ul { margin: 0; padding-left: 16px; }
  .cond li { margin: 2px 0; }
  .sign2 { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 50px; page-break-inside: avoid; }
  .sg { border-top: 1px solid #111827; padding-top: 6px; text-align: center; font-size: 10.5px; color: #374151; }
  .sg small { display: block; font-size: 9.5px; color: #4b5563; margin-top: 1px; }
  .foot { margin-top: 22px; padding-top: 8px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 9.5px; color: #6b7280; }
  .alert { border-left: 4px solid #b91c1c; background: #fef2f2; color: #b91c1c; font-weight: 700; font-size: 10.5px; padding: 8px 12px; margin: 0 0 12px; }
  .dx { font-size: 11.5px; margin: 0 0 4px; }
  .rp { font-family: Georgia, "Times New Roman", serif; font-size: 36px; font-weight: 800; color: #0f766e; margin: 2px 0 6px; line-height: 1.1; }
  .rx { display: grid; grid-template-columns: 22px 1fr; gap: 0 8px; padding: 10px 0; border-bottom: 1px dashed #c7d2cf; page-break-inside: avoid; }
  .rx .no { font-size: 10px; color: #9ca3af; padding-top: 2px; }
  .rx .nm { font-weight: 800; font-size: 13px; }
  .rx .ln { margin-top: 3px; font-size: 11px; }
  .rx .note { font-style: italic; color: #6b7280; font-size: 10.5px; margin-top: 3px; }
  .recs { margin-top: 12px; font-size: 11px; }
`;

function header(clinic: DocClinic, title: string, code: string, date: string): string {
  const addr = [clinic.address, clinic.city && !clinic.address ? clinic.city : null].filter(Boolean).join(', ');
  const contact = [clinic.phone, clinic.mobile, clinic.email].filter(Boolean).join(' · ');
  const reg = [clinic.mspCode ? `Establecimiento MSP N.º ${clinic.mspCode}` : null, clinic.ruc ? `RUC ${clinic.ruc}` : null].filter(Boolean).join(' · ');
  const sub = [addr, contact, reg].filter(Boolean).map((x) => `<div>${esc(x)}</div>`).join('');
  return `
  <div class="dh">
    <div class="dh-l">
      <div class="logo">${esc(initials(clinic.name))}</div>
      <div><div class="clinic">${esc(clinic.name)}</div>${sub ? `<div class="cl-sub">${sub}</div>` : ''}</div>
    </div>
    <div class="dh-r"><div class="dt">${esc(title)}</div><div class="code">${esc(code)}</div><div class="date">Fecha: ${esc(fmtDocDate(date))}</div></div>
  </div>`;
}
function patientBox(p: DocPatient): string {
  return `
  <div class="pbox">
    <div><span>Paciente</span><b>${esc(p.name)}</b></div>
    <div><span>Cédula</span><b>${esc(p.cedula || '—')}</b></div>
    <div><span>HC N.º</span><b>${esc(p.hc || '—')}</b></div>
    <div><span>Edad / Sexo</span><b>${esc(ageSex(p))}</b></div>
  </div>`;
}
function signature(left: { line1: string; line2?: string | null }, right: { line1: string; line2?: string | null }): string {
  const sg = (x: { line1: string; line2?: string | null }) => `<div class="sg">${esc(x.line1)}${x.line2 ? `<small>${esc(x.line2)}</small>` : ''}</div>`;
  return `<div class="sign2">${sg(left)}${sg(right)}</div>`;
}

export function buildBudgetDoc(p: BudgetDocInput): string {
  const total = p.lines.reduce((a, l) => a + l.qty * l.unit, 0);
  const saldo = Math.max(total - (p.paid || 0), 0);
  const days = p.validityDays ?? 30;
  const rows = p.lines
    .map(
      (l, i) => `<tr><td>${i + 1}</td><td><b>${esc(l.piece || '—')}</b></td><td>${esc(l.procedure)}</td><td class="q">${l.qty}</td><td class="n">${usd(l.unit)}</td><td class="n p">${usd(l.qty * l.unit)}</td></tr>`,
    )
    .join('');
  return `
  ${header(p.clinic, 'PRESUPUESTO ODONTOLÓGICO', p.code, p.date)}
  ${patientBox(p.patient)}
  <div class="sec line">Plan de tratamiento propuesto</div>
  <table class="items">
    <thead><tr><th>#</th><th>Pieza</th><th>Procedimiento</th><th class="n">Cant.</th><th class="n">P. unit.</th><th class="n">Subtotal</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="6">Sin ítems.</td></tr>'}</tbody>
  </table>
  <div class="tot">
    <div class="r"><span>Subtotal</span><span>${usd(total)}</span></div>
    <div class="grand"><span>TOTAL</span><span>${usd(total)}</span></div>
    <div class="r"><span>Abonado</span><span>${usd(p.paid || 0)}</span></div>
    <div class="r saldo"><span>Saldo</span><span>${usd(saldo)}</span></div>
  </div>
  <div class="cond"><b>Condiciones</b><ul>
    <li>Presupuesto válido por ${days} días desde la fecha de emisión.</li>
    <li>Los valores pueden variar si durante el tratamiento se detectan nuevos hallazgos clínicos.</li>
    <li>Se aceptan pagos en efectivo, transferencia y tarjeta de crédito/débito.</li>
    <li>El inicio del tratamiento requiere la aceptación firmada de este presupuesto.</li>
  </ul></div>
  ${signature(
    { line1: p.doctorName || 'Firma y sello del profesional', line2: p.doctorRegistry ? `Reg. SENESCYT ${p.doctorRegistry}` : null },
    { line1: 'Aceptación del paciente', line2: 'Firma y C.I.' },
  )}
  <div class="foot">Gracias por confiar en nosotros · ${esc(p.clinic.name)}${[p.clinic.phone, p.clinic.mobile].filter(Boolean).length ? ' · ' + esc([p.clinic.phone, p.clinic.mobile].filter(Boolean).join(' · ')) : ''}</div>`;
}

export function buildPrescriptionDoc(p: RxDocInput): string {
  const days = p.validityDays ?? 30;
  const allergy = String(p.patient.allergies || '').trim();
  const hasAllergy = allergy && !/^(ninguna?|no|n\/a|-|—)$/i.test(allergy);
  const meds = p.items
    .map((it, i) => {
      const bits = [
        it.dose ? `<b>Dosis:</b> ${esc(it.dose)}` : '',
        it.duration ? `<b>Duración:</b> ${esc(it.duration)}` : '',
        it.quantity ? `<b>Cantidad:</b> ${esc(it.quantity)}` : '',
      ].filter(Boolean);
      return `<div class="rx"><div class="no">${i + 1}</div><div><div class="nm">${esc(it.name)}</div>${bits.length ? `<div class="ln">${bits.join(' &nbsp;·&nbsp; ')}</div>` : ''}${it.note ? `<div class="note">${esc(it.note)}</div>` : ''}</div></div>`;
    })
    .join('');
  return `
  ${header(p.clinic, 'RECETA MÉDICA ODONTOLÓGICA', p.code, p.date)}
  ${patientBox(p.patient)}
  ${hasAllergy ? `<div class="alert">ALERGIA REGISTRADA: ${esc(allergy)}</div>` : ''}
  ${p.diagnosis ? `<div class="sec line">Diagnóstico (CIE-10)</div><div class="dx">${p.diagnosis.code ? `<b>${esc(p.diagnosis.code)}</b> ` : ''}${esc(p.diagnosis.text)}</div>` : ''}
  <div class="sec line">Prescripción</div>
  <div class="rp">Rp/</div>
  ${meds || '<p>Sin medicamentos.</p>'}
  ${p.recommendations ? `<div class="recs"><b>Recomendaciones:</b> ${esc(p.recommendations)}</div>` : ''}
  ${signature(
    { line1: p.doctorName || 'Profesional tratante', line2: p.doctorRegistry ? `Reg. SENESCYT ${p.doctorRegistry}` : null },
    { line1: 'Sello del establecimiento', line2: p.clinic.mspCode ? `MSP N.º ${p.clinic.mspCode}` : null },
  )}
  <div class="foot">Esta receta es válida por ${days} días desde su emisión · ${esc(p.clinic.name)}</div>`;
}

/** Clínica y paciente de ejemplo: solo para la clínica demo. */
export const DEMO_DOC_CLINIC: DocClinic = {
  name: 'Clínica Dental DentalCloud',
  address: 'Av. República del Salvador N34-183 y Suecia, Quito',
  phone: '(02) 245-6789',
  mobile: '0998 123 456',
  email: 'contacto@dentalcloud.ec',
  mspCode: '0001234',
};
export const DEMO_DOC_PATIENT: DocPatient = {
  name: 'Andrea Villacís Toapanta',
  cedula: '1712345678',
  hc: '0412',
  birthDate: '1992-03-14',
  sex: 'Femenino',
  allergies: 'Penicilina',
};

export function printBudget(p: BudgetDocInput) {
  printHtml(`Presupuesto ${p.code}`, buildBudgetDoc(p), CSS);
}
export function printPrescription(p: RxDocInput) {
  printHtml(`Receta ${p.code}`, buildPrescriptionDoc(p), CSS);
}
