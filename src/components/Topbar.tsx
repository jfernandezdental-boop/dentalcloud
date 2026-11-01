'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface TopbarProps {
  onOpenMobile: () => void;
}

const notifications = [
  { id: 'ntf-001', text: 'Bot IA envió 14 recordatorios para mañana', time: 'hace 8 min', tone: 'text-primary' },
  { id: 'ntf-002', text: 'Laboratorio: corona 46 de Ricardo Benítez lista', time: 'hace 32 min', tone: 'text-success' },
  { id: 'ntf-003', text: 'Stock bajo: Anestesia lidocaína 2% (4 cajas)', time: 'hace 1 h', tone: 'text-warning' },
  { id: 'ntf-004', text: 'Mónica Altamirano no asistió a su cita de 15:00', time: 'hace 2 h', tone: 'text-destructive' },
];

export default function Topbar({ onOpenMobile }: TopbarProps) {
  const [openNotif, setOpenNotif] = useState(false);

  return (
    <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur lg:px-6 2xl:px-10">
      <button onClick={onOpenMobile} aria-label="Abrir menú" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted lg:hidden">
        <Icon name="Bars3Icon" size={22} />
      </button>

      <div className="relative hidden max-w-md flex-1 sm:block">
        <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Buscar paciente, cédula o proforma…"
          aria-label="Búsqueda global"
          className="w-full rounded-lg border border-input bg-muted/50 py-2 pl-10 pr-16 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-2 focus:ring-ring/20"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">Ctrl K</kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success md:inline-flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
          Bot IA activo
        </span>
        <Link
          href="/doctor-agenda"
          className="hidden items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-95 sm:inline-flex"
        >
          <Icon name="PlusIcon" size={16} />
          Nueva cita
        </Link>

        <div className="relative">
          <button
            onClick={() => setOpenNotif((v) => !v)}
            aria-label="Notificaciones"
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon name="BellIcon" size={22} />
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">4</span>
          </button>
          {openNotif && (
            <div className="absolute right-0 mt-2 w-80 animate-scale-in overflow-hidden rounded-xl border border-border bg-card shadow-xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-semibold">Notificaciones</p>
                <button onClick={() => setOpenNotif(false)} className="text-xs font-semibold text-primary hover:underline">Marcar leídas</button>
              </div>
              <ul className="max-h-80 divide-y divide-border overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id} className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full bg-current ${n.tone}`} />
                    <div>
                      <p className="text-sm">{n.text}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}