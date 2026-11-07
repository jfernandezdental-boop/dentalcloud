export type ToolId =
  | 'caries' |'obturado' |'sellante-necesario' |'sellante-realizado' |'extraccion-indicada' |'perdida-caries' |'perdida-otra' |'endodoncia-por-realizar' |'endodoncia-realizada' |'protesis-fija-indicada' |'protesis-fija-realizada' |'protesis-removible-indicada' |'protesis-removible-realizada' |'protesis-total-indicada' |'protesis-total-realizada' |'corona-indicada' |'corona-realizada' |'ausente' |'borrar';

export type ToolKind = 'surface' | 'tooth';
export type ToolColor = 'red' | 'blue' | 'dark' | 'none';

export interface ToolDef {
  id: ToolId;
  label: string;
  kind: ToolKind;
  color: ToolColor;
  /** Precio referencial (USD) usado para generar la proforma desde los hallazgos pendientes */
  price?: number;
}

export const tools: ToolDef[] = [
  { id: 'caries', label: 'Caries (relleno rojo)', kind: 'surface', color: 'red', price: 35 },
  { id: 'obturado', label: 'Obturado (relleno azul)', kind: 'surface', color: 'blue' },
  { id: 'sellante-necesario', label: 'Sellante necesario', kind: 'tooth', color: 'red', price: 25 },
  { id: 'sellante-realizado', label: 'Sellante realizado', kind: 'tooth', color: 'blue' },
  { id: 'extraccion-indicada', label: 'Extracción indicada', kind: 'tooth', color: 'red', price: 45 },
  { id: 'perdida-caries', label: 'Pérdida por caries', kind: 'tooth', color: 'blue' },
  { id: 'perdida-otra', label: 'Pérdida (otra causa)', kind: 'tooth', color: 'dark' },
  { id: 'endodoncia-por-realizar', label: 'Endodoncia por realizar', kind: 'tooth', color: 'red', price: 180 },
  { id: 'endodoncia-realizada', label: 'Endodoncia realizada', kind: 'tooth', color: 'blue' },
  { id: 'protesis-fija-indicada', label: 'Prótesis fija indicada', kind: 'tooth', color: 'red', price: 320 },
  { id: 'protesis-fija-realizada', label: 'Prótesis fija realizada', kind: 'tooth', color: 'blue' },
  { id: 'protesis-removible-indicada', label: 'Prótesis removible indicada', kind: 'tooth', color: 'red', price: 280 },
  { id: 'protesis-removible-realizada', label: 'Prótesis removible realizada', kind: 'tooth', color: 'blue' },
  { id: 'protesis-total-indicada', label: 'Prótesis total indicada', kind: 'tooth', color: 'red', price: 450 },
  { id: 'protesis-total-realizada', label: 'Prótesis total realizada', kind: 'tooth', color: 'blue' },
  { id: 'corona-indicada', label: 'Corona indicada', kind: 'tooth', color: 'red', price: 260 },
  { id: 'corona-realizada', label: 'Corona realizada', kind: 'tooth', color: 'blue' },
  { id: 'ausente', label: 'Ausente', kind: 'tooth', color: 'dark' },
  { id: 'borrar', label: 'Borrar', kind: 'tooth', color: 'none' },
];

export const getTool = (id: ToolId): ToolDef => tools.find((t) => t.id === id) ?? tools[0];

export type Surface = 'V' | 'L' | 'M' | 'D' | 'O';
export type SurfaceMark = 'caries' | 'obturado';

export const surfaceNames: Record<Surface, string> = {
  V: 'Vestibular',
  L: 'Lingual',
  M: 'Mesial',
  D: 'Distal',
  O: 'Oclusal',
};

export interface ToothState {
  surfaces: Partial<Record<Surface, SurfaceMark>>;
  marks: ToolId[];
  note?: string;
}

export type ChartState = Record<string, ToothState>;
export type GradeMap = Record<string, string>;

export interface OdontogramData {
  chart: ChartState;
  recession: GradeMap;
  mobility: GradeMap;
}

export const upperPermanent = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const lowerPermanent = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
export const upperDeciduous = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
export const lowerDeciduous = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

const quadrantNames: Record<number, string> = {
  1: 'superior derecho',
  2: 'superior izquierdo',
  3: 'inferior izquierdo',
  4: 'inferior derecho',
  5: 'superior derecho temporal',
  6: 'superior izquierdo temporal',
  7: 'inferior izquierdo temporal',
  8: 'inferior derecho temporal',
};

export const toothLabel = (n: number): string => {
  const q = Math.floor(n / 10);
  const p = n % 10;
  return `Pieza ${n} (${quadrantNames[q] ?? ''}, posición ${p})`;
};

export const emptyTooth = (): ToothState => ({ surfaces: {}, marks: [] });

/** Odontograma limpio: paciente nuevo o sin revisiones. */
export const emptyData = (): OdontogramData => ({ chart: {}, recession: {}, mobility: {} });

export const cloneData = (d: OdontogramData): OdontogramData => ({
  chart: Object.fromEntries(
    Object.entries(d.chart).map(([k, v]) => [k, { surfaces: { ...v.surfaces }, marks: [...v.marks], note: v.note }])
  ),
  recession: { ...d.recession },
  mobility: { ...d.mobility },
});

/** Solo para maquetas/demo. No usar en clínicas reales. */
export const initialChart: ChartState = {
  '16': { surfaces: { O: 'obturado', M: 'obturado' }, marks: [] },
  '26': { surfaces: { O: 'obturado', D: 'obturado' }, marks: [] },
  '36': { surfaces: {}, marks: ['corona-indicada', 'endodoncia-realizada'] },
  '46': { surfaces: { O: 'caries', M: 'caries', V: 'caries' }, marks: [], note: 'Sensibilidad al frío, valorar endodoncia' },
  '48': { surfaces: {}, marks: ['extraccion-indicada'] },
  '38': { surfaces: {}, marks: ['perdida-otra'] },
  '14': { surfaces: { D: 'caries' }, marks: [] },
  '24': { surfaces: { O: 'obturado' }, marks: ['sellante-realizado'] },
  '11': { surfaces: {}, marks: ['corona-realizada'] },
  '21': { surfaces: { V: 'obturado' }, marks: [] },
  '55': { surfaces: { O: 'caries' }, marks: [] },
  '75': { surfaces: {}, marks: ['sellante-necesario'] },
};

export const initialData: OdontogramData = {
  chart: initialChart,
  recession: { '16': '1', '26': '2' },
  mobility: { '31': '1', '41': '2', '36': '1' },
};

const exclusiveGroups: ToolId[][] = [
  ['sellante-necesario', 'sellante-realizado'],
  ['endodoncia-por-realizar', 'endodoncia-realizada'],
  ['corona-indicada', 'corona-realizada'],
  ['protesis-fija-indicada', 'protesis-fija-realizada'],
  ['protesis-removible-indicada', 'protesis-removible-realizada'],
  ['protesis-total-indicada', 'protesis-total-realizada'],
  ['extraccion-indicada', 'perdida-caries', 'perdida-otra', 'ausente'],
];

const isEmptyTooth = (t: ToothState) =>
  Object.keys(t.surfaces).length === 0 && t.marks.length === 0 && !t.note;

export function applyTool(chart: ChartState, tool: ToolId, tooth: number, surface?: Surface): ChartState {
  const key = String(tooth);
  const current = chart[key] ?? emptyTooth();
  const next: ToothState = { surfaces: { ...current.surfaces }, marks: [...current.marks], note: current.note };
  const def = getTool(tool);

  if (tool === 'borrar') {
    if (surface && current.surfaces[surface]) {
      delete next.surfaces[surface];
    } else {
      next.surfaces = {};
      next.marks = [];
    }
  } else if (def.kind === 'surface') {
    if (!surface) return chart;
    if (next.surfaces[surface] === tool) delete next.surfaces[surface];
    else next.surfaces[surface] = tool as SurfaceMark;
  } else {
    const idx = next.marks.indexOf(tool);
    if (idx >= 0) {
      next.marks.splice(idx, 1);
    } else {
      const group = exclusiveGroups.find((g) => g.includes(tool));
      if (group) next.marks = next.marks.filter((m) => !group.includes(m));
      next.marks.push(tool);
    }
  }

  const out = { ...chart };
  if (isEmptyTooth(next)) delete out[key];
  else out[key] = next;
  return out;
}

export function setToothNote(chart: ChartState, tooth: number, note: string): ChartState {
  const key = String(tooth);
  const current = chart[key] ?? emptyTooth();
  const next: ToothState = { ...current, surfaces: { ...current.surfaces }, marks: [...current.marks], note: note.trim() ? note : undefined };
  const out = { ...chart };
  if (isEmptyTooth(next)) delete out[key];
  else out[key] = next;
  return out;
}

export const countFindings = (chart: ChartState): number =>
  Object.values(chart).reduce((acc, t) => acc + Object.keys(t.surfaces).length + t.marks.length, 0);

export interface Finding {
  id: string;
  tooth: number;
  text: string;
  tone: 'danger' | 'info' | 'neutral';
  toolId: ToolId;
  surface?: Surface;
}

export function buildFindings(chart: ChartState): Finding[] {
  const rows: Finding[] = [];
  Object.entries(chart)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([tooth, st]) => {
      (Object.entries(st.surfaces) as [Surface, SurfaceMark][]).forEach(([sf, kind]) => {
        rows.push({
          id: `f-${tooth}-${sf}`,
          tooth: Number(tooth),
          text: `${kind === 'caries' ? 'Caries' : 'Obturado'} — ${surfaceNames[sf]}`,
          tone: kind === 'caries' ? 'danger' : 'info',
          toolId: kind,
          surface: sf,
        });
      });
      st.marks.forEach((m) => {
        const def = getTool(m);
        rows.push({
          id: `f-${tooth}-${m}`,
          tooth: Number(tooth),
          text: def.label,
          tone: def.color === 'red' ? 'danger' : def.color === 'blue' ? 'info' : 'neutral',
          toolId: m,
        });
      });
    });
  return rows;
}

export interface BudgetLine {
  id: string;
  tooth: number;
  description: string;
  price: number;
}

export function buildBudgetLines(chart: ChartState): BudgetLine[] {
  return buildFindings(chart)
    .filter((f) => f.tone === 'danger')
    .map((f) => {
      const def = getTool(f.toolId);
      return {
        id: `b-${f.id}`,
        tooth: f.tooth,
        description: f.surface ? `Restauración ${surfaceNames[f.surface].toLowerCase()}` : def.label.replace(/ \(.*\)/, ''),
        price: def.price ?? 0,
      };
    });
}

export const formatUsd = (n: number): string => `$${n.toFixed(2)}`;
