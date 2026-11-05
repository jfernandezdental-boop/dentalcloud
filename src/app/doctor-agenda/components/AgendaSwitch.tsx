'use client';
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import AgendaWorkspace from './AgendaWorkspace';
import RealAgendaWorkspace from './RealAgendaWorkspace';

/** Clinica demo: maqueta. Clinica real: misma agenda visual conectada a la base (citas, pacientes y doctores reales). */
export default function AgendaSwitch() {
  const { user } = useAuth();
  return user?.clinicIsDemo ? <AgendaWorkspace /> : <RealAgendaWorkspace />;
}
