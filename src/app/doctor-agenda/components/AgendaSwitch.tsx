'use client';
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import AgendaWorkspace from './AgendaWorkspace';
import RealAgenda from './RealAgenda';

/** Clinica demo: maqueta. Clinica real: agenda conectada a la base. */
export default function AgendaSwitch() {
  const { user } = useAuth();
  return user?.clinicIsDemo ? <AgendaWorkspace /> : <RealAgenda />;
}
