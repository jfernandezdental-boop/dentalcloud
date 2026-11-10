/** Módulo Estética facial: catálogo de tipos de procedimiento, zonas anatómicas y lista de seguridad. */

export type ProcedureType =
  | 'toxina_botulinica' | 'rellenos_ah' | 'bioestimuladores' | 'hilos_pdo'
  | 'skinboosters_pdrn' | 'peelings' | 'laser_rf_hifu' | 'armonizacion';

export type Side = 'central' | 'derecho' | 'izquierdo' | 'bilateral';
export type Unit = 'U' | 'ml';

export const PROCEDURE_TYPES: { code: ProcedureType; label: string; unit: Unit }[] = [
  { code: 'toxina_botulinica', label: 'Toxina botulínica', unit: 'U' },
  { code: 'rellenos_ah', label: 'Rellenos de ácido hialurónico', unit: 'ml' },
  { code: 'bioestimuladores', label: 'Bioestimuladores', unit: 'ml' },
  { code: 'hilos_pdo', label: 'Hilos tensores PDO', unit: 'ml' },
  { code: 'skinboosters_pdrn', label: 'Skinboosters · PDRN', unit: 'ml' },
  { code: 'peelings', label: 'Peelings médicos', unit: 'ml' },
  { code: 'laser_rf_hifu', label: 'Láser · RF · HIFU', unit: 'ml' },
  { code: 'armonizacion', label: 'Armonización facial', unit: 'ml' },
];

export const procedureLabel = (c: string) => PROCEDURE_TYPES.find((p) => p.code === c)?.label ?? c;

export type ZoneCode =
  | 'frente' | 'glabela' | 'patas_gallo' | 'lineas_nasales'
  | 'labio_superior' | 'menton' | 'maseteros' | 'platisma';

export type Shape = { cx: number; cy: number; rx: number; ry: number };
export type ZoneDef = {
  code: ZoneCode; n: number; label: string; muscle: string; defaultSide: Side;
  front: Shape[]; lateral: Shape[];
};

export const ZONES: ZoneDef[] = [
  { code: 'frente', n: 1, label: 'Frente', muscle: 'M. frontal', defaultSide: 'central',
    front: [{ cx: 180, cy: 110, rx: 66, ry: 24 }], lateral: [{ cx: 214, cy: 98, rx: 30, ry: 24 }] },
  { code: 'glabela', n: 2, label: 'Glabela (entrecejo)', muscle: 'Corrugador · prócer', defaultSide: 'central',
    front: [{ cx: 180, cy: 163, rx: 14, ry: 14 }], lateral: [{ cx: 240, cy: 160, rx: 10, ry: 10 }] },
  { code: 'patas_gallo', n: 3, label: 'Patas de gallo', muscle: 'Orbicular de los ojos', defaultSide: 'bilateral',
    front: [{ cx: 92, cy: 192, rx: 11, ry: 22 }, { cx: 268, cy: 192, rx: 11, ry: 22 }], lateral: [{ cx: 216, cy: 182, rx: 10, ry: 16 }] },
  { code: 'lineas_nasales', n: 4, label: 'Líneas nasales', muscle: 'M. nasal', defaultSide: 'bilateral',
    front: [{ cx: 160, cy: 216, rx: 9, ry: 12 }, { cx: 200, cy: 216, rx: 9, ry: 12 }], lateral: [] },
  { code: 'labio_superior', n: 5, label: 'Labio superior', muscle: 'Orbicular de la boca', defaultSide: 'central',
    front: [{ cx: 180, cy: 280, rx: 24, ry: 8 }], lateral: [] },
  { code: 'menton', n: 6, label: 'Mentón', muscle: 'M. mentoniano', defaultSide: 'central',
    front: [{ cx: 180, cy: 350, rx: 28, ry: 13 }], lateral: [{ cx: 253, cy: 340, rx: 12, ry: 14 }] },
  { code: 'maseteros', n: 7, label: 'Maseteros', muscle: 'M. masetero', defaultSide: 'bilateral',
    front: [{ cx: 100, cy: 300, rx: 17, ry: 30 }, { cx: 260, cy: 300, rx: 17, ry: 30 }], lateral: [{ cx: 196, cy: 296, rx: 24, ry: 34 }] },
  { code: 'platisma', n: 8, label: 'Bandas del platisma', muscle: 'Platisma', defaultSide: 'bilateral',
    front: [{ cx: 180, cy: 420, rx: 34, ry: 18 }], lateral: [{ cx: 206, cy: 400, rx: 28, ry: 26 }] },
];

export const zoneLabel = (c: string) => ZONES.find((z) => z.code === c)?.label ?? c;

export const SIDE_LABEL: Record<Side, string> = {
  central: 'Central', derecho: 'Derecho', izquierdo: 'Izquierdo', bilateral: 'Bilateral',
};

export const SAFETY_ITEMS: { key: string; label: string }[] = [
  { key: 'sin_embarazo_lactancia', label: 'Verificado: sin embarazo ni lactancia' },
  { key: 'sin_anticoagulantes', label: 'Verificado: sin anticoagulantes ni antiagregantes' },
  { key: 'sin_infeccion_zona', label: 'Verificado: sin infección activa en la zona' },
  { key: 'fotos_previas', label: 'Fotos pre-tratamiento tomadas' },
];
