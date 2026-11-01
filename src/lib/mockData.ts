export type CitaStatus =
  | 'Pendiente' |'Confirmada' |'En sala' |'En atención' |'Atendida' |'No asistió' |'Cancelada';

export interface Cita {
  id: string;
  patientId: string;
  patient: string;
  doctorId: string;
  doctor: string;
  date: string; // yyyy-MM-dd
  start: string; // HH:mm
  duration: number; // minutes
  procedure: string;
  chair: string;
  status: CitaStatus;
  reminder: boolean;
}

export const doctors = [
  { id: 'doc-001', name: 'Dra. Camila Andrade', specialty: 'Odontología general' },
  { id: 'doc-002', name: 'Dr. Santiago Moscoso', specialty: 'Endodoncia' },
  { id: 'doc-003', name: 'Dra. Paola Villavicencio', specialty: 'Ortodoncia' },
];

export const statusStyles: Record<CitaStatus, string> = {
  Pendiente: 'bg-warning/15 text-warning border-warning/30',
  Confirmada: 'bg-primary/10 text-primary border-primary/30',
  'En sala': 'bg-accent/10 text-accent border-accent/30',
  'En atención': 'bg-success/15 text-success border-success/30',
  Atendida: 'bg-muted text-muted-foreground border-border',
  'No asistió': 'bg-destructive/10 text-destructive border-destructive/30',
  Cancelada: 'bg-muted text-muted-foreground border-border',
};

// Base date: 2026-10-31 (Saturday). Week: Mon 26 Oct → Sun 1 Nov.
export const citas: Cita[] = [
  { id: 'cita-001', patientId: 'pac-0412', patient: 'Andrea Villacís Toapanta', doctorId: 'doc-001', doctor: 'Dra. Camila Andrade', date: '2026-10-31', start: '08:00', duration: 45, procedure: 'Profilaxis y flúor', chair: 'Sillón 1', status: 'Atendida', reminder: true },
  { id: 'cita-002', patientId: 'pac-0388', patient: 'Marco Tulio Cevallos', doctorId: 'doc-002', doctor: 'Dr. Santiago Moscoso', date: '2026-10-31', start: '08:30', duration: 90, procedure: 'Endodoncia pieza 36', chair: 'Sillón 2', status: 'Atendida', reminder: true },
  { id: 'cita-003', patientId: 'pac-0501', patient: 'Valentina Carrión Paredes', doctorId: 'doc-003', doctor: 'Dra. Paola Villavicencio', date: '2026-10-31', start: '09:00', duration: 30, procedure: 'Control de ortodoncia', chair: 'Sillón 3', status: 'Atendida', reminder: true },
  { id: 'cita-004', patientId: 'pac-0277', patient: 'Jorge Luis Almeida', doctorId: 'doc-001', doctor: 'Dra. Camila Andrade', date: '2026-10-31', start: '09:30', duration: 60, procedure: 'Resina pieza 14 y 15', chair: 'Sillón 1', status: 'En atención', reminder: true },
  { id: 'cita-005', patientId: 'pac-0456', patient: 'Daniela EscobarRuiz', doctorId: 'doc-003', doctor: 'Dra. Paola Villavicencio', date: '2026-10-31', start: '10:00', duration: 45, procedure: 'Colocación de brackets', chair: 'Sillón 3', status: 'En sala', reminder: true },
  { id: 'cita-006', patientId: 'pac-0319', patient: 'Patricio Naranjo León', doctorId: 'doc-002', doctor: 'Dr. Santiago Moscoso', date: '2026-10-31', start: '10:30', duration: 60, procedure: 'Retratamiento de conducto', chair: 'Sillón 2', status: 'En sala', reminder: false },
  { id: 'cita-007', patientId: 'pac-0522', patient: 'Lucía Fernanda Mora', doctorId: 'doc-001', doctor: 'Dra. Camila Andrade', date: '2026-10-31', start: '11:00', duration: 30, procedure: 'Valoración y proforma', chair: 'Sillón 1', status: 'Confirmada', reminder: true },
  { id: 'cita-008', patientId: 'pac-0198', patient: 'Esteban Quishpe Yánez', doctorId: 'doc-001', doctor: 'Dra. Camila Andrade', date: '2026-10-31', start: '11:30', duration: 45, procedure: 'Extracción pieza 48', chair: 'Sillón 1', status: 'Confirmada', reminder: true },
  { id: 'cita-009', patientId: 'pac-0467', patient: 'Gabriela Salazar Pinto', doctorId: 'doc-003', doctor: 'Dra. Paola Villavicencio', date: '2026-10-31', start: '12:00', duration: 30, procedure: 'Control post alineadores', chair: 'Sillón 3', status: 'Pendiente', reminder: true },
  { id: 'cita-010', patientId: 'pac-0231', patient: 'Ricardo Benítez Sosa', doctorId: 'doc-002', doctor: 'Dr. Santiago Moscoso', date: '2026-10-31', start: '14:00', duration: 90, procedure: 'Corona sobre implante 46', chair: 'Sillón 2', status: 'Pendiente', reminder: false },
  { id: 'cita-011', patientId: 'pac-0345', patient: 'Mónica Altamirano', doctorId: 'doc-001', doctor: 'Dra. Camila Andrade', date: '2026-10-31', start: '15:00', duration: 45, procedure: 'Blanqueamiento sesión 2', chair: 'Sillón 1', status: 'No asistió', reminder: true },
  { id: 'cita-012', patientId: 'pac-0489', patient: 'Felipe Guamán Chicaiza', doctorId: 'doc-003', doctor: 'Dra. Paola Villavicencio', date: '2026-10-31', start: '16:00', duration: 30, procedure: 'Revisión retenedores', chair: 'Sillón 3', status: 'Confirmada', reminder: true },
  { id: 'cita-013', patientId: 'pac-0412', patient: 'Andrea Villacís Toapanta', doctorId: 'doc-001', doctor: 'Dra. Camila Andrade', date: '2026-10-27', start: '09:00', duration: 60, procedure: 'Resina pieza 26', chair: 'Sillón 1', status: 'Atendida', reminder: true },
  { id: 'cita-014', patientId: 'pac-0388', patient: 'Marco Tulio Cevallos', doctorId: 'doc-002', doctor: 'Dr. Santiago Moscoso', date: '2026-10-28', start: '10:00', duration: 60, procedure: 'Endodoncia pieza 36 (sesión 1)', chair: 'Sillón 2', status: 'Atendida', reminder: true },
  { id: 'cita-015', patientId: 'pac-0501', patient: 'Valentina Carrión Paredes', doctorId: 'doc-003', doctor: 'Dra. Paola Villavicencio', date: '2026-10-29', start: '15:00', duration: 30, procedure: 'Ajuste de arco', chair: 'Sillón 3', status: 'Atendida', reminder: true },
  { id: 'cita-016', patientId: 'pac-0277', patient: 'Jorge Luis Almeida', doctorId: 'doc-001', doctor: 'Dra. Camila Andrade', date: '2026-10-30', start: '11:00', duration: 45, procedure: 'Limpieza profunda', chair: 'Sillón 1', status: 'Cancelada', reminder: true },
  { id: 'cita-017', patientId: 'pac-0522', patient: 'Lucía Fernanda Mora', doctorId: 'doc-001', doctor: 'Dra. Camila Andrade', date: '2026-11-02', start: '08:30', duration: 60, procedure: 'Carillas — preparación', chair: 'Sillón 1', status: 'Confirmada', reminder: true },
  { id: 'cita-018', patientId: 'pac-0456', patient: 'Daniela Escobar Ruiz', doctorId: 'doc-003', doctor: 'Dra. Paola Villavicencio', date: '2026-11-03', start: '10:00', duration: 30, procedure: 'Control brackets', chair: 'Sillón 3', status: 'Pendiente', reminder: true },
  { id: 'cita-019', patientId: 'pac-0319', patient: 'Patricio Naranjo León', doctorId: 'doc-002', doctor: 'Dr. Santiago Moscoso', date: '2026-11-04', start: '09:00', duration: 90, procedure: 'Obturación de conducto 21', chair: 'Sillón 2', status: 'Confirmada', reminder: true },
  { id: 'cita-020', patientId: 'pac-0198', patient: 'Esteban Quishpe Yánez', doctorId: 'doc-001', doctor: 'Dra. Camila Andrade', date: '2026-11-05', start: '16:00', duration: 30, procedure: 'Control post extracción', chair: 'Sillón 1', status: 'Pendiente', reminder: true },
  { id: 'cita-021', patientId: 'pac-0231', patient: 'Ricardo Benítez Sosa', doctorId: 'doc-002', doctor: 'Dr. Santiago Moscoso', date: '2026-10-12', start: '09:00', duration: 60, procedure: 'Implante 46 — cirugía', chair: 'Sillón 2', status: 'Atendida', reminder: true },
  { id: 'cita-022', patientId: 'pac-0345', patient: 'Mónica Altamirano', doctorId: 'doc-001', doctor: 'Dra. Camila Andrade', date: '2026-10-19', start: '14:00', duration: 45, procedure: 'Blanqueamiento sesión 1', chair: 'Sillón 1', status: 'Atendida', reminder: true },
];

export const patients = [
  { id: 'pac-0412', name: 'Andrea Villacís Toapanta', cedula: '1712345678', age: 34 },
  { id: 'pac-0388', name: 'Marco Tulio Cevallos', cedula: '1803456721', age: 52 },
  { id: 'pac-0501', name: 'Valentina Carrión Paredes', cedula: '1724567890', age: 16 },
  { id: 'pac-0277', name: 'Jorge Luis Almeida', cedula: '0912345671', age: 47 },
  { id: 'pac-0456', name: 'Daniela Escobar Ruiz', cedula: '1715678903', age: 14 },
  { id: 'pac-0319', name: 'Patricio Naranjo León', cedula: '1706789012', age: 61 },
  { id: 'pac-0522', name: 'Lucía Fernanda Mora', cedula: '1721234567', age: 28 },
  { id: 'pac-0198', name: 'Esteban Quishpe Yánez', cedula: '1750123456', age: 23 },
  { id: 'pac-0467', name: 'Gabriela Salazar Pinto', cedula: '1718765432', age: 31 },
  { id: 'pac-0231', name: 'Ricardo Benítez Sosa', cedula: '0102345678', age: 58 },
  { id: 'pac-0345', name: 'Mónica Altamirano', cedula: '1709876543', age: 39 },
  { id: 'pac-0489', name: 'Felipe Guamán Chicaiza', cedula: '1727654321', age: 19 },
];

export const procedures = [
  'Valoración y proforma',
  'Profilaxis y flúor',
  'Resina compuesta',
  'Extracción simple',
  'Extracción quirúrgica',
  'Endodoncia',
  'Retratamiento de conducto',
  'Corona sobre implante',
  'Colocación de brackets',
  'Control de ortodoncia',
  'Blanqueamiento dental',
  'Sellantes de fosas y fisuras',
];