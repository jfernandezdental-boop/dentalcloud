'use client';
import React from 'react';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/components/AuthProvider';

export default function AdminHeader() {
  const { user } = useAuth();
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">Panel global de plataforma</h1>
          <Badge tone="accent">Super administrador</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {user?.email || 'Admin global'} · Gestión multi-tenant (clínicas, altas, roles)
        </p>
      </div>
    </div>
  );
}
