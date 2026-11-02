'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';

export type PatientListItem = {
  id: string;
  fullName: string;
  document: string;
  phone: string;
  email: string;
  sex: string;
  birth: string;
  city: string;
  address: string;
  insurance: string;
  allergies: string;
  bloodType: string;
  emergencyName: string;
  emergencyPhone: string;
  occupation: string;
  civil: string;
  firstName: string;
  lastName: string;
  raw: Record<string, unknown>;
};

interface Props {
  patients: PatientListItem[];
  selectedId: string | null;
  query: string;
  onQuery: (q: string) => void;
  onSelect: (id: string) => void;
  loading?: boolean;
}

export default function PatientListPanel({ patients, selectedId, query, onQuery, onSelect, loading }: Props) {
  return (
    <aside className="flex h-full min-h-[420px] flex-col rounded-2xl border border-border bg-card">
      <div className="border-b border-border p-3">
        <p className="mb-2 text-sm font-semibold">Pacientes de la clinica</p>
        <div className="relative">
          <Icon name="MagnifyingGlassIcon" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Buscar nombre o cedula..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">{patients.length} encontrado(s)</p>
      </div>
      <ul className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <li className="p-4 text-sm text-muted-foreground">Cargando pacientes...</li>
        ) : patients.length === 0 ? (
          <li className="p-4 text-sm text-muted-foreground">No hay pacientes. Usa "Nuevo paciente".</li>
        ) : (
          patients.map((p) => {
            const active = p.id === selectedId;
            const initials = p.fullName
              .split(/\s+/)
              .slice(0, 2)
              .map((w) => w[0]?.toUpperCase() || '')
              .join('');
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onSelect(p.id)}
                  className={`flex w-full items-start gap-3 border-b border-border px-3 py-3 text-left transition-colors ${
                    active ? 'bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      active ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                    }`}
                  >
                    {initials || '?'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{p.fullName}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {p.document || 'Sin documento'} {p.phone ? `· ${p.phone}` : ''}
                    </span>
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
