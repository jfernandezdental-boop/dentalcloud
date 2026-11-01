'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

interface Xray {
  id: string;
  type: string;
  date: string;
  piece: string;
  note: string;
  src: string;
  alt: string;
}

const xrays: Xray[] = [
{ id: 'xr-001', type: 'Panorámica', date: '03/10/2026', piece: 'Todas', note: 'Ausencia de 38 (extraído). Sin lesiones periapicales evidentes.', src: "https://img.rocket.new/generatedImages/rocket_gen_img_1961db0d3-1768615199351.png", alt: 'Radiografía panorámica dental en blanco y negro mostrando ambas arcadas' },
{ id: 'xr-002', type: 'Periapical', date: '03/10/2026', piece: '46', note: 'Radiolucidez oclusal que compromete dentina. Ligamento periodontal íntegro.', src: "https://img.rocket.new/generatedImages/rocket_gen_img_199cf6225-1767735907425.png", alt: 'Radiografía periapical de molar inferior con zona de caries' },
{ id: 'xr-003', type: 'Aleta de mordida', date: '03/10/2026', piece: '25–27', note: 'Caries interproximal incipiente en distal de 26 (tratada 17/10).', src: "https://img.rocket.new/generatedImages/rocket_gen_img_1516cbbe5-1772982898768.png", alt: 'Radiografía de aleta de mordida de premolares y molares superiores' },
{ id: 'xr-004', type: 'Periapical', date: '12/06/2026', piece: '38', note: 'Cordal en posición mesioangular impactado, cercanía al conducto dentario.', src: "https://img.rocket.new/generatedImages/rocket_gen_img_4c238073b-1793443626589.png", alt: 'Radiografía periapical de tercer molar inferior impactado' }];


export default function XraysTab() {
  const [open, setOpen] = useState<Xray | null>(null);
  const [filter, setFilter] = useState('Todas');
  const types = ['Todas', 'Panorámica', 'Periapical', 'Aleta de mordida'];
  const list = xrays.filter((x) => filter === 'Todas' || x.type === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Radiografías e imágenes</h2>
          <p className="text-sm text-muted-foreground">{xrays.length} imágenes archivadas · almacenamiento seguro por clínica</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95">
          <Icon name="ArrowUpTrayIcon" size={16} />
          Subir imagen
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {types.map((t) =>
        <button key={`xf-${t}`} onClick={() => setFilter(t)} className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all active:scale-95 ${filter === t ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:bg-muted'}`}>
            {t}
          </button>
        )}
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {list.map((x) =>
        <li key={x.id}>
            <button onClick={() => setOpen(x)} className="group w-full overflow-hidden rounded-xl border border-border bg-background text-left transition-shadow hover:shadow-lg">
              <div className="relative aspect-[4/3] overflow-hidden bg-foreground">
                <AppImage src={x.src} alt={x.alt} fill className="object-cover opacity-90 transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 25vw" />
                <span className="absolute left-2 top-2"><Badge tone="info">{x.type}</Badge></span>
              </div>
              <div className="p-3">
                <p className="tabular text-sm font-semibold">{x.date} · Pieza {x.piece}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{x.note}</p>
              </div>
            </button>
          </li>
        )}
      </ul>

      <Modal open={!!open} onClose={() => setOpen(null)} size="xl" title={open ? `${open.type} — pieza ${open.piece}` : ''} subtitle={open ? `Tomada el ${open.date}` : ''}>
        {open &&
        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-foreground">
              <AppImage src={open.src} alt={open.alt} fill className="object-contain" sizes="70vw" />
            </div>
            <div className="space-y-3 text-sm">
              <p className="font-semibold">Hallazgos</p>
              <p className="text-muted-foreground">{open.note}</p>
              <div className="flex gap-2">
                <button className="flex-1 rounded-lg border border-input px-3 py-2 text-xs font-semibold transition-all hover:bg-muted active:scale-95">Descargar</button>
                <button className="flex-1 rounded-lg border border-input px-3 py-2 text-xs font-semibold transition-all hover:bg-muted active:scale-95">Comparar</button>
              </div>
            </div>
          </div>
        }
      </Modal>
    </div>);

}