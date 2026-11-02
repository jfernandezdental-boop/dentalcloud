/**
 * Genera HTML completo y abre impresion / Guardar como PDF.
 * Usa Blob URL para evitar PDF vacio (fallo frecuente de document.write + onload).
 */
export function printHtml(title: string, bodyHtml: string) {
  const safeTitle = String(title || 'Documento').replace(/[<>]/g, '');
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${safeTitle}</title>
<style>
  @page { size: letter; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
    color: #0f172a;
    font-size: 12px;
    line-height: 1.45;
    margin: 0;
    padding: 0;
  }
  .sheet { max-width: 190mm; margin: 0 auto; }
  .head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 2px solid #0d9488;
    padding-bottom: 12px;
    margin-bottom: 16px;
  }
  .brand { font-size: 18px; font-weight: 700; color: #0f766e; }
  .brand small { display: block; font-size: 11px; font-weight: 500; color: #64748b; }
  .doc-title { text-align: right; }
  .doc-title strong { display: block; font-size: 16px; }
  .meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 24px;
    margin-bottom: 16px;
    padding: 10px 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }
  .meta div span { display: block; font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.04em; }
  .meta div b { font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 12px; }
  th {
    text-align: left;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #475569;
    border-bottom: 1px solid #cbd5e1;
    padding: 8px 6px;
    background: #f1f5f9;
  }
  td { padding: 8px 6px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .totals {
    width: 260px;
    margin-left: auto;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }
  .totals row, .totals .row {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid #e2e8f0;
  }
  .totals .row:last-child { border-bottom: 0; background: #ecfdf5; font-weight: 700; }
  .notes {
    margin-top: 18px;
    font-size: 11px;
    color: #475569;
  }
  .signs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 40px;
  }
  .sign {
    text-align: center;
    border-top: 1px solid #94a3b8;
    padding-top: 8px;
    font-size: 11px;
    color: #475569;
  }
  .footer {
    margin-top: 28px;
    padding-top: 10px;
    border-top: 1px solid #e2e8f0;
    font-size: 10px;
    color: #94a3b8;
    text-align: center;
  }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
<div class="sheet">
${bodyHtml}
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank', 'noopener,noreferrer,width=900,height=700');
  if (!w) {
    URL.revokeObjectURL(url);
    alert('Permite ventanas emergentes para ver el PDF / imprimir.');
    return;
  }
  // Imprimir cuando la ventana cargue el blob
  const tryPrint = () => {
    try {
      w.focus();
      w.print();
    } catch {
      /* usuario puede imprimir manualmente */
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };
  // Algunos navegadores disparan load; otros no con blob
  w.addEventListener?.('load', () => setTimeout(tryPrint, 300));
  setTimeout(tryPrint, 600);
}

export function moneyFmt(n: number): string {
  const v = Number(n) || 0;
  return v.toLocaleString('es-EC', { style: 'currency', currency: 'USD' });
}
