'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/ui/AppIcon';
import EmptyState from '@/components/ui/EmptyState';
import { listClinicStaffFromDb, type StaffMember } from '@/lib/supabase/clinicStaff';

/**
 * Pestaña RR.HH. del dashboard: vista profesional del equipo real de la clínica.
 * La gestión completa (crear, editar, activar, reset clave) está en /clinic-staff.
 */
export default function PayrollModule() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[] | null>(null);

  const load = useCallback(async () => {
    if (!user?.clinicId) {
      setStaff([]);
      return;
    }
    const rows = await listClinicStaffFromDb(user.clinicId);
    setStaff(rows);
  }, [user?.clinicId]);

  useEffect(() => {
    void load();
  }, [load]);

  const active = (staff || []).filter((s) => s.active).length;
  const doctors = (staff || []).filter((s) => s.role === 'doctor' && s.active).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="grid w-full gap-3 sm:grid-cols-3 sm:w-auto">
          <div className="rounded-xl border border-border px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Personal activo</p>
            <p className="text-lg font-bold tabular-nums">{staff ? active : '—'}</p>
          </div>
          <div className="rounded-xl border border-border px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Odontólogos</p>
            <p className="text-lg font-bold tabular-nums">{staff ? doctors : '—'}</p>
          </div>
          <div className="rounded-xl border border-border px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Total registros</p>
            <p className="text-lg font-bold tabular-nums">{staff ? staff.length : '—'}</p>
          </div>
        </div>
        <Link
          href="/clinic-staff"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
        >
          <Icon name="UserPlusIcon" size={14} /> Gestionar personal
        </Link>
      </div>

      {staff === null ? (
        <div className="h-28 animate-pulse rounded-xl bg-muted/40" />
      ) : staff.length === 0 ? (
        <EmptyState
          icon={<Icon name="UserGroupIcon" size={24} />}
          title="Sin personal registrado"
          description="Crea odontólogos, recepción y personal en Personal y roles. Los odontólogos aparecen en la agenda."
          actionLabel="Ir a Personal y roles"
          onAction={() => {
            if (typeof window !== 'undefined') window.location.href = '/clinic-staff';
          }}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                {['Nombre', 'Correo', 'Rol', 'Estado', 'Alta'].map((h) => (
                  <th key={h} className="px-3 py-2.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-muted/40">
                  <td className="px-3 py-2.5 font-medium">{s.fullName}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{s.email}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone={s.role === 'doctor' ? 'accent' : 'info'}>{s.roleLabel}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge tone={s.active ? 'success' : 'neutral'} dot>
                      {s.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{s.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Para editar, activar/desactivar o resetear claves usa{' '}
        <Link href="/clinic-staff" className="font-semibold text-primary underline-offset-2 hover:underline">
          Personal y roles
        </Link>
        .
      </p>
    </div>
  );
}
