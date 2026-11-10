/** Módulo Estética facial: catálogo de tipos de procedimiento, zonas anatómicas y lista de seguridad. */

export type ProcedureType =
  | 'toxina_botulinica' | 'rellenos_ah' | 'bioestimuladores' | 'hilos' | 'peeling' | 'laser' | 'otro';

export type ZoneCode =
  | 'frente' | 'glabela' | 'periocular' | 'nariz' | 'mejillas' | 'surcos_nasogenianos'
  | 'labios' | 'menton' | 'mandibula' | 'cuello' | 'ojeras' | 'pomulos';

export type Shape = 'ellipse' | 'rect';

export const PROCEDURE_TYPES: { id: ProcedureType; label: string }[] = [
  { id: 'toxina_botulinica', label: 'Toxina botulínica' },
  { id: 'rellenos_ah', label: 'Rellenos AH' },
  { id: 'bioestimuladores', label: 'Bioestimuladores' },
  { id: 'hilos', label: 'Hilos' },
  { id: 'peeling', label: 'Peeling' },
  { id: 'laser', label: 'Láser' },
  { id: 'otro', label: 'Otro' },
];

export const ZONES: {
  code: ZoneCode;
  label: string;
  view: 'front' | 'lateral' | 'both';
  shape: Shape;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}[] = [
  { code: 'frente', label: 'Frente', view: 'front', shape: 'ellipse', cx: 50, cy: 18, rx: 28, ry: 10 },
  { code: 'glabela', label: 'Glabela', view: 'front', shape: 'ellipse', cx: 50, cy: 28, rx: 10, ry: 6 },
  { code: 'periocular', label: 'Periocular', view: 'front', shape: 'ellipse', cx: 35, cy: 36, rx: 10, ry: 6 },
  { code: 'ojeras', label: 'Ojeras', view: 'front', shape: 'ellipse', cx: 35, cy: 42, rx: 8, ry: 4 },
  { code: 'nariz', label: 'Nariz', view: 'front', shape: 'ellipse', cx: 50, cy: 48, rx: 6, ry: 12 },
  { code: 'mejillas', label: 'Mejillas', view: 'front', shape: 'ellipse', cx: 28, cy: 52, rx: 12, ry: 10 },
  { code: 'pomulos', label: 'Pómulos', view: 'front', shape: 'ellipse', cx: 30, cy: 46, rx: 10, ry: 7 },
  { code: 'surcos_nasogenianos', label: 'Surcos nasogenianos', view: 'front', shape: 'ellipse', cx: 42, cy: 56, rx: 8, ry: 10 },
  { code: 'labios', label: 'Labios', view: 'front', shape: 'ellipse', cx: 50, cy: 64, rx: 12, ry: 6 },
  { code: 'menton', label: 'Mentón', view: 'front', shape: 'ellipse', cx: 50, cy: 78, rx: 10, ry: 8 },
  { code: 'mandibula', label: 'Mandíbula', view: 'front', shape: 'ellipse', cx: 28, cy: 72, rx: 12, ry: 8 },
  { code: 'cuello', label: 'Cuello', view: 'front', shape: 'ellipse', cx: 50, cy: 90, rx: 16, ry: 8 },
];

export const SAFETY_CHECKLIST = [
  'Consentimiento informado firmado',
  'Alergias revisadas',
  'Medicación actual documentada',
  'Fotos pre-tratamiento tomadas',
  'Zonas marcadas y confirmadas con el paciente',
] as const;
