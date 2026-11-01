import React from 'react';
import Badge from '@/components/ui/Badge';

export default function AdminHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Panel global de plataforma</h1>
          <Badge tone="accent">Super administrador</Badge>
        </div>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-success" />
          Datos al 31/10/2026 10:36 — 214 clínicas, 2 solicitudes de alta pendientes
        </p>
      </div>
    </div>
  );
}