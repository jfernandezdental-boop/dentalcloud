import React from 'react';
import { ToolId } from '@/lib/odontogram';

interface ToolGlyphProps {
  id: ToolId;
  size?: number;
}

export default function ToolGlyph({ id, size = 16 }: ToolGlyphProps) {
  const red = 'var(--tooth-red)';
  const blue = 'var(--tooth-blue)';
  const dark = 'var(--tooth-line)';
  const common = { width: size, height: size, viewBox: '0 0 16 16', 'aria-hidden': true } as const;

  switch (id) {
    case 'caries':
      return <svg {...common}><rect x="2" y="2" width="12" height="12" rx="2" fill={red} /></svg>;
    case 'obturado':
      return <svg {...common}><rect x="2" y="2" width="12" height="12" rx="2" fill={blue} /></svg>;
    case 'sellante-necesario':
      return <svg {...common}><rect x="5.5" y="2" width="5" height="12" rx="2" fill="none" stroke={red} strokeWidth="1.6" /></svg>;
    case 'sellante-realizado':
      return <svg {...common}><rect x="5.5" y="2" width="5" height="12" rx="2" fill="none" stroke={blue} strokeWidth="1.6" /></svg>;
    case 'extraccion-indicada':
      return <svg {...common}><path d="M3 3l10 10M13 3L3 13" stroke={red} strokeWidth="1.8" strokeLinecap="round" /></svg>;
    case 'perdida-caries':
      return <svg {...common}><path d="M3 3l10 10M13 3L3 13" stroke={blue} strokeWidth="1.8" strokeLinecap="round" /></svg>;
    case 'perdida-otra':
      return <svg {...common}><rect x="5.5" y="2" width="5" height="12" rx="2" fill="none" stroke={dark} strokeWidth="1.6" /></svg>;
    case 'endodoncia-por-realizar':
      return <svg {...common}><path d="M8 2L14 13H2z" fill="none" stroke={red} strokeWidth="1.5" strokeLinejoin="round" /></svg>;
    case 'endodoncia-realizada':
      return <svg {...common}><path d="M8 2L14 13H2z" fill="none" stroke={dark} strokeWidth="1.5" strokeLinejoin="round" /></svg>;
    case 'protesis-fija-indicada':
      return <svg {...common} viewBox="0 0 20 16" width={size * 1.4}><circle cx="3" cy="8" r="1.8" fill="none" stroke={red} strokeWidth="1.3" /><path d="M5 8h10" stroke={red} strokeWidth="1.3" strokeDasharray="2 1.5" /><circle cx="17" cy="8" r="1.8" fill="none" stroke={red} strokeWidth="1.3" /></svg>;
    case 'protesis-fija-realizada':
      return <svg {...common} viewBox="0 0 20 16" width={size * 1.4}><circle cx="3" cy="8" r="1.8" fill="none" stroke={dark} strokeWidth="1.3" /><path d="M5 8h10" stroke={dark} strokeWidth="1.3" strokeDasharray="2 1.5" /><circle cx="17" cy="8" r="1.8" fill="none" stroke={dark} strokeWidth="1.3" /></svg>;
    case 'protesis-removible-indicada':
      return <svg {...common} viewBox="0 0 20 16" width={size * 1.3}><path d="M1 8h18" stroke={red} strokeWidth="1.5" strokeDasharray="1.5 2" /></svg>;
    case 'protesis-removible-realizada':
      return <svg {...common} viewBox="0 0 20 16" width={size * 1.3}><path d="M1 8h18" stroke={dark} strokeWidth="1.5" strokeDasharray="1.5 2" /></svg>;
    case 'protesis-total-indicada':
      return <svg {...common} viewBox="0 0 20 16" width={size * 1.3}><path d="M1 6h18M1 10h18" stroke={red} strokeWidth="1.6" /></svg>;
    case 'protesis-total-realizada':
      return <svg {...common} viewBox="0 0 20 16" width={size * 1.3}><path d="M1 6h18M1 10h18" stroke={dark} strokeWidth="1.6" /></svg>;
    case 'corona-indicada':
      return <svg {...common}><circle cx="8" cy="8" r="2.6" fill={red} /></svg>;
    case 'corona-realizada':
      return <svg {...common}><circle cx="8" cy="8" r="2.6" fill={dark} /></svg>;
    case 'ausente':
      return <svg {...common}><text x="8" y="12.5" textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor">A</text></svg>;
    case 'borrar':
      return <svg {...common}><path d="M3 3l10 10M13 3L3 13" stroke={red} strokeWidth="1.8" strokeLinecap="round" /></svg>;
    default:
      return null;
  }
}