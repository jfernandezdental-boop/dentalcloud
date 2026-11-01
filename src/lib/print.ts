/** Abre ventana de impresion / guardar como PDF del navegador */
export function printHtml(title: string, bodyHtml: string) {
  const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
  if (!w) {
    alert('Permite ventanas emergentes para imprimir o generar PDF.');
    return;
  }
  w.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${title.replace(/</g, '')}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 18px; margin: 0 0 4px; }
    h2 { font-size: 14px; margin: 16px 0 8px; }
    .muted { color: #666; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th, td { border-bottom: 1px solid #ddd; padding: 8px; text-align: left; }
    th { font-size: 11px; text-transform: uppercase; color: #555; }
    .tot { text-align: right; margin-top: 16px; font-size: 14px; }
    .box { border: 1px solid #ccc; border-radius: 8px; padding: 12px; margin-top: 12px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  ${bodyHtml}
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 200); }<\/script>
</body>
</html>`);
  w.document.close();
}
