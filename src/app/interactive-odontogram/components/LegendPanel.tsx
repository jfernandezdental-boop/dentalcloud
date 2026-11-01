import React from 'react';
import { ToolId } from '@/lib/odontogram';
import ToolGlyph from './ToolGlyph';

const items: { id: string; tool: ToolId; label: string }[] = [
  { id: 'lg-caries', tool: 'caries', label: 'Caries' },
  { id: 'lg-ext', tool: 'extraccion-indicada', label: 'Extracción indicada' },
  { id: 'lg-sell-n', tool: 'sellante-necesario', label: 'Sellante necesario' },
  { id: 'lg-endo-n', tool: 'endodoncia-por-realizar', label: 'Endodoncia por realizar' },
  { id: 'lg-pf-i', tool: 'protesis-fija-indicada', label: 'Prótesis fija indicada' },
  { id: 'lg-pr-i', tool: 'protesis-removible-indicada', label: 'Prótesis removible indicada' },
  { id: 'lg-pt-i', tool: 'protesis-total-indicada', label: 'Prótesis total indicada' },
  { id: 'lg-cor-i', tool: 'corona-indicada', label: 'Corona indicada' },
  { id: 'lg-obt', tool: 'obturado', label: 'Obturado' },
  { id: 'lg-perd-c', tool: 'perdida-caries', label: 'Pérdida por caries' },
  { id: 'lg-sell-r', tool: 'sellante-realizado', label: 'Sellante realizado' },
  { id: 'lg-endo-r', tool: 'endodoncia-realizada', label: 'Endodoncia realizada' },
  { id: 'lg-pf-r', tool: 'protesis-fija-realizada', label: 'Prótesis fija realizada' },
  { id: 'lg-pr-r', tool: 'protesis-removible-realizada', label: 'Prótesis removible realizada' },
  { id: 'lg-pt-r', tool: 'protesis-total-realizada', label: 'Prótesis total realizada' },
  { id: 'lg-cor-r', tool: 'corona-realizada', label: 'Corona realizada' },
  { id: 'lg-perd-o', tool: 'perdida-otra', label: 'Pérdida (otra causa)' },
  { id: 'lg-aus', tool: 'ausente', label: 'Ausente' },
];

export default function LegendPanel() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-bold uppercase tracking-wider">K. Simbología del odontograma</h2>
      <p className="mt-1 text-xs text-muted-foreground">Rojo = patología actual / por realizar · Azul = tratamiento realizado</p>
      <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {items.map((i) => (
          <li key={i.id} className="flex items-center gap-2 text-xs font-medium">
            <span className="flex w-7 shrink-0 justify-center"><ToolGlyph id={i.tool} size={15} /></span>
            {i.label}
          </li>
        ))}
      </ul>
    </section>
  );
}